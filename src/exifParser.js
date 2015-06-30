(function() {

  'use strict';

  var offsets = {
    "segmentMarker" : 0,
    "APP1Marker" : 1,
    "APP1Length" : 2,
    "TIFFHeader" : 10,
    "TIFFByteOrder" : 10,
    "TIFFMagicNumber" : 12,
    "TIFFFirstIFD" : 14
  };

  var exifSpec = JPEG.exifSpec;

  var mergeObjects = function(object1, object2) {
    for (var tag in object2) {
      if (object2.hasOwnProperty(tag)) {
        object1[tag] = object2[tag];
      }
    }
    return object1;
  };

  var parseASCIIString = function(blobView, offset, count) {
    // EXIF encodes arrays of strings by writing them as one long string
    // with NUL separators. We're not going to interpret that here but
    // will return any such array with the NULs in it. When written back
    // out this will be in the correct format so everything should be okay.
    var value = "";
    count -= 1; // The count includes the terminating NUL character
    for(var i = 0; i < count; i++) {
      value += String.fromCharCode(blobView.getUint8(offset + i));
    }
    return value;
  };

  var writeTagValueArray = function(blobView, valueOffset, type, arrayOfValues, byteOrder) {
    var writtenBytes = 0;
    var i;
    if (Array.isArray(arrayOfValues)) {
      for (i=0; i < arrayOfValues.length; ++i) {
        writtenBytes += writeTagValue(
          blobView, valueOffset + writtenBytes,
          type, arrayOfValues[i] , byteOrder
        );
      }
    } else {
      throw "Error writting array, the value is not an array: " + arrayOfValues;
    }
    return writtenBytes;
  };

  var writeTagValue = function(blobView, valueOffset, typeId, newValue, byteOrder) {
    var writtenBytes;
    if (Array.isArray(newValue)) {
      writtenBytes = writeTagValueArray(blobView, valueOffset, typeId, newValue, byteOrder);
    } else {
      switch (typeId) {
        case 1: // BYTE
          blobView.setUint8(valueOffset, newValue);
          writtenBytes = 1;
          break;
        case 2: // ASCII
          writtenBytes = writeString(blobView, valueOffset, newValue);
          break;
        case 3: // SHORT
          blobView.setUint16(valueOffset, newValue, byteOrder);
          writtenBytes = 2;
          break;
        case 4: // LONG
          blobView.setUint32(valueOffset, newValue, byteOrder);
          writtenBytes = 4;
          break;
        case 6: // SBYTE
          blobView.setInt8(valueOffset, newValue);
          writtenBytes = 1;
          break;
        case 7: // UNDEFINED
          blobView.setUint8(valueOffset, newValue);
          writtenBytes = 1;
          break;
        case 8: // SSHORT
          blobView.setInt16(valueOffset, newValue, byteOrder);
          writtenBytes = 2;
          break;
        case 9: // SLONG
          blobView.setInt32(valueOffset, newValue, byteOrder);
          writtenBytes = 4;
          break;
        case 10: // SRATIONAL
        case 5: // RATIONAL
          writeRational(blobView, valueOffset, typeId, newValue, byteOrder);
          writtenBytes = 8;
          break;
        case 11: // FLOAT
          blobView.setFloat32(valueOffset, newValue, byteOrder);
          writtenBytes = 4;
          break;
        case 12: // DOUBLE
          blobView.setFloat64(valueOffset, newValue, byteOrder);
          writtenBytes = 8;
          break;
        default:
          throw "Writting Exif Tag Value: Unkown value type: " + valueType;
      }
    }
    return writtenBytes;
  };

  var parseTagValue = function(blobView, valueOffset, typeId, count) {
    var numerator;
    var denominator;
    switch (typeId) {
      case 1: // BYTE
        return blobView.getUint8(valueOffset);
      case 2: // ASCII
        return parseASCIIString(blobView, valueOffset, count);
      case 3: // SHORT
        return blobView.getUint16(valueOffset);
      case 4: // LONG
        return blobView.getUint32(valueOffset);
      case 5: //RATIONAL
        numerator = blobView.getUint32(valueOffset);
        denominator = blobView.getUint32(valueOffset + 4);
        return {
          "numerator" : numerator,
          "denominator" : denominator
        };
      case 6: // SBYTE
        return blobView.getInt8(valueOffset);
      case 7: // UNDEFINED
        return blobView.getUint8(valueOffset);
      case 8: // SSHORT
        return blobView.getInt16(valueOffset);
      case 9: // SLONG
        return blobView.getInt32(valueOffset);
      case 10: // SRATIONAL
        numerator = blobView.getInt32(valueOffset);
        denominator = blobView.getInt32(valueOffset + 4);
        return {
          "numerator" : numerator,
          "denominator" : denominator
        };
      case 11: // FLOAT
        return blobView.getFloat32(valueOffset);
      case 12: // DOUBLE
       return blobView.getFloat64(valueOffset);
      default:
        throw "Reading Exif Tag Value: Unkown value type: " + typeId;
    }
  };

  var readTagValue = function(blobView, TIFFHeaderOffset, valueOffset, typeId, count) {
    var tagValues;
    var typeSize = exifSpec.tagTypeSize[typeId];
    // If the value doesn't fit here, then read its address
    if (typeSize * count > 4) {
      valueOffset = TIFFHeaderOffset + blobView.getUint32(valueOffset);
    }
    if (count === 1 || typeId === 2) { // typeId === ASCII
      // If there is just one value, parse it
      return parseTagValue(blobView, valueOffset, typeId, count);
    } else {
      // Otherwise, parse an array of values
      tagValues = [];
      for (var i=0; i<count; ++i) {
        tagValues.push(parseTagValue(blobView, valueOffset, typeId, 1));
        valueOffset += typeSize;
      }
      return tagValues;
    }
  };

  var writeRational = function(blobView, valueOffset, typeId, newValue, byteOrder) {
    if (typeId === 10) { // SRATIONAL
      blobView.setInt32(valueOffset, newValue.numerator, byteOrder);
      blobView.setInt32(valueOffset + 4, newValue.denominator, byteOrder);
    }
    if (typeId === 5) { // RATIONAL
      blobView.setUint32(valueOffset, newValue.numerator, byteOrder);
      blobView.setUint32(valueOffset + 4, newValue.denominator, byteOrder);
    }
    return 8;
  };

  var writeString = function(blobView, offset, str) {
    var i;
    for (i = 0; i < str.length; ++i) {
      blobView.setUint8(offset + i, str.charCodeAt(i));
    }
    blobView.setUint8(offset + str.length, 0x0);
    return str.length + 1;
  };

  var readIFD = function(blobView, TIFFHeaderOffset, IFDOffset) {
    var offset = TIFFHeaderOffset + IFDOffset;
    var numberOfEntries = blobView.getUint16(offset);
    offset += 2;
    var i;
    var entries;
    var entry;
    var tag;
    var typeId;
    var count;
    var tagValueOffset;
    var nextIFDOffset;
    if (numberOfEntries > 0) {
      entries = {};
    }
    for (i=0; i<numberOfEntries;++i) {
      tag = blobView.getUint16(offset);
      typeId = blobView.getUint16(offset + 2);
      count = blobView.getUint32(offset + 4);
      entries[tag] = {
        "type" : typeId,
        "count" : count,
        "value" : readTagValue(blobView, TIFFHeaderOffset, offset + 8, typeId, count),
        "valueOffset" : offset + 8
      };
      offset += 12;
    }
    nextIFDOffset = blobView.getUint32(offset);
    return {
      "entries" : entries,
      "nextIFDOffset" : nextIFDOffset
    };
  };

  var writeIFD = function(blobView, TIFFHeaderOffset, IFDOffset, valuesOffset, IFDType, metaData, nextIFD) {
    var count;
    var bytesWritten = 0;
    var bytesWrittenValue;
    var numberOfEntries = 0;
    var offset = IFDOffset + 2;
    Object.keys(metaData).forEach(function(key){
      var tagId = exifSpec.getTagId(key);
      var tagInfo = exifSpec.tags[tagId];
      if (!tagInfo) {
        return;
      }
      var type = tagInfo.type;
      var typeSize = exifSpec.tagTypeSize[type];

      if (tagId && tagInfo.IFD === IFDType) {
        blobView.setUint16(offset, tagId, false); // Tag Id
        blobView.setUint16(offset + 2, type, false); // Tag type
        count = calculateTagValueCount(type, metaData[key]);
        blobView.setUint32(offset + 4, count, false); // Tag Count. Number of values

        if (count * typeSize <= 4) { // It fits in the 4 byte address field
          writeTagValue(blobView, offset + 8, type, metaData[key], false);
        } else {
          blobView.setUint32(offset + 8, valuesOffset - TIFFHeaderOffset, false);
          bytesWrittenValue = writeTagValue(blobView, valuesOffset, type, metaData[key], false);
          // The valuesOffset should always be on a word boundary, so
          // if we just wrote an odd number of bytes, (e.g. an even-length
          // string plus a NUL terminator) we need to skip one so the next
          // value is written at an even offset
          if (bytesWrittenValue % 2 === 1)
            bytesWrittenValue++;
          valuesOffset += bytesWrittenValue;
          bytesWritten += bytesWrittenValue;
        }
        bytesWritten += 12;
        offset += 12;
        numberOfEntries++;
      }
    });
    if (numberOfEntries ||
        (IFDType === 2 && metaData.ExifTag) ||
        (IFDType === 3 && metaData.GPSTag) ||
        (IFDType === 4 && metaData.InteroperabilityTag)) {

      blobView.setUint16(IFDOffset, numberOfEntries, false);
      bytesWritten += 2;
    }
    // IFDType Image (IFD0) holds pointer to IFD1 (Thumbnnail)
    if (IFDType === 1) { // Image
      bytesWritten += 4;
      if (nextIFD) {
        blobView.setUint32(offset, bytesWritten + 8, false);
      } else {
        blobView.setUint32(offset, 0, false);
      }
    }
    return bytesWritten;
  };

  var makeDirectoryEntriesHumanReadable = function(entries) {
    var tags = {};
    var tagInfo;
    Object.keys(entries).forEach(function(tag) {
      tagInfo = entries.IFD === 4? interOperabilityTags.tags[tag] : exifSpec.tags[tag];
      if (!tagInfo) {
        console.log("Error parsing IFD: Tag  " + tag + " is not valid");
        return;
      }
      tags[tagInfo.key] = entries[tag].value;
    });
    return tags;
  };

  var readTIFFByteOrder = function(blobView, TIFFOffset) {
    var byteOrder = blobView.getUint16(TIFFOffset + offsets.TIFFByteOrder);
    if (byteOrder !== 0x4949 && byteOrder !== 0x4D4D) {
      throw "TIFF Image parser failed: Invalid byte order in EXIF segment";
    }
    return byteOrder;
  };

  var isTIFFLittleEndian = function(byteOrder) {
    if (byteOrder === 0x4949) {
      return true;
    } else if (byteOrder === 0x4D4D) {
      return false;
    } else {
      throw "TIFF Image parser failed: Invalid byte order in EXIF segment";
    }
  };

  var isValidTIFFFile = function(blobView, TIFFOffset) {
    var TIFFMagicNumber = blobView.getUint16(TIFFOffset + offsets.TIFFMagicNumber);
    if (TIFFMagicNumber !== 42) {
      throw "TIFF Image parser failed: Wrong magic number in TIFF header";
    }
    return true;
  };

  var readExifMetaData = function(blobView, TIFFOffset) {
    var thumbnailBlob;
    var thumbnailIFDEntries;
    var IFD0;
    var IFD1;
    var EXIFIFD;
    var GPSIFD;
    var interoperabilityIFD;
    var JPEGInterchangeFormatLength;
    var JPEGInterchangeFormat;
    var TIFFHeaderOffset = TIFFOffset + offsets.TIFFHeader;
    var byteOrder = readTIFFByteOrder(blobView, TIFFOffset);

    blobView.littleEndian = isTIFFLittleEndian(byteOrder);
    // EXIF metadata is stored in TIFF header format
    if (!isValidTIFFFile(blobView, TIFFOffset)) {
      return;
    }

    // Reads 0th IFD
    offsets.firstIFD = blobView.getUint32(TIFFOffset + offsets.TIFFFirstIFD);
    IFD0 = readIFD(blobView, TIFFHeaderOffset, offsets.firstIFD);

    // Reads 1st IFD (Thumbnail Meta Data)
    if (IFD0.nextIFDOffset) {
      IFD1 = readIFD(blobView, TIFFHeaderOffset, IFD0.nextIFDOffset);
    }

    // Reads THUMBNAIL
    if (IFD1 && IFD1.entries[exifSpec.getTagId("JPEGInterchangeFormat")]) {
      JPEGInterchangeFormatLength = IFD1.entries[exifSpec.getTagId("JPEGInterchangeFormatLength")].value;
      JPEGInterchangeFormat = IFD1.entries[exifSpec.getTagId("JPEGInterchangeFormat")].value;
      thumbnailBlob = blobView.blob.slice(TIFFHeaderOffset + JPEGInterchangeFormat, TIFFHeaderOffset + JPEGInterchangeFormat + JPEGInterchangeFormatLength);
    }

    // Reads EXIF IFD
    if (IFD0.entries[exifSpec.getTagId("ExifTag")]) {
      EXIFIFD = readIFD(blobView, TIFFHeaderOffset, IFD0.entries[exifSpec.getTagId("ExifTag")].value);
    }

    // Reads GPS IFD
    if(IFD0.entries[exifSpec.getTagId("GPSTag")]) {
      GPSIFD = readIFD(blobView, TIFFHeaderOffset, IFD0.entries[exifSpec.getTagId("GPSTag")].value);
    }

    // Reads Interoperability IFD
    if(IFD0.entries[exifSpec.getTagId("InteroperabilityTag")]) {
      interoperabilityIFD = readIFD(blobView, TIFFHeaderOffset, IFD0.entries[exifSpec.getTagId("InteroperabilityTag")].value);
    }

    return {
      "IFD0" : IFD0.entries,
      "IFD1" : IFD1 && IFD1.entries,
      "EXIFIFD" : EXIFIFD && EXIFIFD.entries,
      "GPSIFD"  : GPSIFD && GPSIFD.entries,
      "interoperabilityIFD" : interoperabilityIFD && interoperabilityIFD.entries,
      "thumbnailBlob" : thumbnailBlob,
      "byteOrder" : byteOrder
    };

  };

  var calculateTagValueSize = function(tagName, value) {
    var tagId = exifSpec.getTagId(tagName);
    var tagTypeId = exifSpec.tags[tagId].type;
    var length = 0;

    switch (tagTypeId) {
      case 1: // BYTE
      case 6: // SBYTE
      case 7: // UNDEFINED
        length = 1;
        break;
      case 2: // ASCII
        length = value.length + 1;
        break;
      case 3: // SHORT
      case 8: // SSHORT
        length = 2;
        break;
      case 4: // LONG
      case 9: // SLONG
      case 11:// FLOAT
        length = 4;
        break;
      case 10:// SRATIONAL
      case 5: // RATIONAL
      case 12: // DOUBLE
        length = 8;
        break;
      default:
        throw "Calculating Exif Tag Value Size: Unkown value type: " + tagTypeId;
    }
    if (Array.isArray(value)) {
      length = value.length * length;
    }
    return length;
  };

  var calculateTagValueCount = function(tagType, value) {
    if (Array.isArray(value)) {
      return value.length;
    }
    // ASCII
    if (tagType === 2) {
      return value.length + 1;
    }
    return 1;
  };

  var calculateIFDLengths = function(metaData) {
    var ExifTags;
    var GPSTags;
    var interoperabilityTags;
    var IFD0Tags = false;
    var lengths = {
      IFD0Length: 0,
      IFD0LengthDataSection: 0,
      ExifIFDLength: 0,
      ExifIFDLengthDataSection: 0,
      GPSIFDLength: 0,
      GPSIFDLengthDataSection: 0,
      interoperabilityIFDLength: 0,
      interoperabilityLengthDataSection: 0
    };
    var exifTagAlreadyPresent = false;
    var gpsTagAlreadyPresent = false;
    var interoperabilityTagAlreadyPresent = false;
    var valueSize;
    // 12 bytes is the length of each tag record.
    // 2 bytes tagID + 2 bytes tag type + 4 bytes values count
    // 4 bytes value offset (for indirect addressed tags)
    var IFDSize = 12;
    Object.keys(metaData).forEach(function(key) {
      var tagId = exifSpec.getTagId(key);
      var tagInfo = tagId && exifSpec.tags[tagId];
      if (tagInfo) {
        valueSize = calculateTagValueSize(key, metaData[key]);
        // If value is 4 bytes or less is stored in the IFD and not in the data section
        // If it is greater than 4 bytes it must be an even value to retain
        // proper alignment
        if (valueSize <= 4) {
          valueSize = 0;
        }
        else {
          if (valueSize % 2 === 1)
            valueSize += 1;
        }

        if (tagInfo.IFD === 1) {
          lengths.IFD0Length += IFDSize;
          lengths.IFD0LengthDataSection += valueSize;
          IFD0Tags = true;
        }
        if (tagInfo.IFD === 2) { // Photo
          lengths.ExifIFDLength += IFDSize;
          lengths.ExifIFDLengthDataSection += valueSize;
          ExifTags = true;
        }
        if (tagInfo.IFD === 3) { // GPSInfo
          lengths.GPSIFDLength += IFDSize;
          lengths.GPSIFDLengthDataSection += valueSize;
          GPSTags = true;
        }
        if (tagInfo.IFD === 4) { // Iop
          lengths.interoperabilityIFDLength += IFDSize;
          lengths.interoperabilityLengthDataSection += valueSize;
          interoperabilityTags = true;
        }
      }
    });
    // Pointer to next IFD
    lengths.IFD0Length += 4;
    if (ExifTags && !metaData.ExifTag) {
      lengths.IFD0Length += 12;
    }
    if (GPSTags && !metaData.GPSTag) {
      lengths.IFD0Length += 12;
    }
    if (interoperabilityTags && !metaData.InteroperabilityTag) {
      lengths.IFD0Length += 12;
    }
    // Number of entries counter (2bytes)
    lengths.IFD0Length += 2;
    if (metaData.ExifTag) {
      lengths.ExifIFDLength += 2;
    }
    if (metaData.GPSTag) {
      lengths.GPSIFDLength += 2;
    }
    if (metaData.InteroperabilityTag) {
      lengths.interoperabilityIFDLength += 2;
    }
    return lengths;
  };

  var writeSegmentHeader = function(blobView, offset, length) {
    blobView.setUint16(offset, 0xFFE1, false); // Segment marker
    blobView.setUint16(offset + 2, length, false);
    blobView.setUint8(offset + 4, 0x45); // E
    blobView.setUint8(offset + 5, 0x78); // x
    blobView.setUint8(offset + 6, 0x69); // i
    blobView.setUint8(offset + 7, 0x66); // f
    blobView.setUint8(offset + 8, 0);    // \0
    blobView.setUint8(offset + 9, 0);    // \0
    return 10;
  };

  var writeTiffHeader = function(blobView, offset) {
    blobView.setUint16(offset + 0, 0x4D4D, false); // byte Order
    blobView.setUint16(offset + 2, 42, false); // Magic Number
    blobView.setUint32(offset + 4, 8, false); // Offset to the first tag
    return 8;
  };

  var createSegment = function(metaData, callback, thumbnailBlob, thumbnailMetaData) {
    var IFDBuffer;
    var blob;
    var valuesOffset;
    var offset = 0;
    thumbnailMetaData = thumbnailMetaData || {};
    if (thumbnailBlob) {
      thumbnailMetaData.JPEGInterchangeFormat = 0;
      thumbnailMetaData.JPEGInterchangeFormatLength = thumbnailBlob.size;
      thumbnailMetaData.Orientation = metaData.Orientation;
    }

    var IFD1Lengths = calculateIFDLengths(thumbnailMetaData);
    var IFD1Length = thumbnailBlob? IFD1Lengths.IFD0Length : 0; // Image
    var IFD1LengthDataSection = thumbnailBlob? IFD1Lengths.IFD0LengthDataSection : 0; // Image

    var IFDlengths = calculateIFDLengths(metaData);
    var IFD0Length = IFDlengths.IFD0Length;
    var IFD0LengthDataSection = IFDlengths.IFD0LengthDataSection;
    var ExifIFDLength = IFDlengths.ExifIFDLength;
    var ExifIFDLengthDataSection = IFDlengths.ExifIFDLengthDataSection;
    var GPSIFDLength = IFDlengths.GPSIFDLength;
    var GPSIFDLengthDataSection = IFDlengths.GPSIFDLengthDataSection;
    var interoperabilityIFDLength =  IFDlengths.interoperabilityIFDLength;
    var interoperabilityLengthDataSection = IFDlengths.interoperabilityLengthDataSection;

    var tiffHeaderOffset;
    var exifSegmentBlob;
    var segmentContent = [];
    // 2 bytes segment header + 2 bytes segment length
    // 6 bytes Exif\0\0 string + 2 bytes endiannes code
    // 2 bytes magic number (42) + 4 bytes 0th IFD offset
    // Section 4.5.2 of Exif standard Version 2.2
    var headerLength = 18;
    var IFDLengths = headerLength + IFD0Length + IFD1Length + ExifIFDLength + GPSIFDLength + interoperabilityIFDLength;
    var DataSectionsLength = IFD0LengthDataSection + IFD1LengthDataSection + ExifIFDLengthDataSection + GPSIFDLengthDataSection + interoperabilityLengthDataSection;
    var segmentLength = IFDLengths + DataSectionsLength;
    var segmentLengthWithThumbnail = thumbnailBlob? segmentLength + thumbnailBlob.size : segmentLength;
    var writtenBytesError = "Written bytes and segment length don't match. There was a problem creating the segment";
    IFDBuffer = new ArrayBuffer(segmentLength);
    blob = new Blob([IFDBuffer], {type: "image/jpeg"});
    JPEG.BlobView.get(blob, 0, blob.size, function(blobView) {
      offset += writeSegmentHeader(blobView, offset, segmentLengthWithThumbnail - 2);
      tiffHeaderOffset = offset;
      offset += writeTiffHeader(blobView, offset);

      if (ExifIFDLength) {
        metaData.ExifTag = 8 + IFD0Length + IFD0LengthDataSection +
                           IFD1Length + IFD1LengthDataSection;
      }
      if (GPSIFDLength) {
        metaData.GPSTag = 8 + IFD0Length + IFD0LengthDataSection +
                          IFD1Length + IFD1LengthDataSection +
                          ExifIFDLength + ExifIFDLengthDataSection;
      }
      if (interoperabilityIFDLength) {
        metaData.InteroperabilityTag = 8 + IFD0Length + IFD0LengthDataSection +
                                       IFD1Length + IFD1LengthDataSection +
                                       ExifIFDLength + ExifIFDLengthDataSection +
                                       GPSIFDLength + GPSIFDLengthDataSection;
      }

      // IFDid = 1 (Image)
      offset += writeIFD(blobView, tiffHeaderOffset, offset, offset + IFD0Length, 1, metaData, ExifIFDLength);
      if (IFD1Length) {
        thumbnailMetaData.JPEGInterchangeFormat = segmentLength - 10;
        // IFDid = 1 (Image)
        offset += writeIFD(blobView, tiffHeaderOffset, offset, offset + IFD1Length, 1, thumbnailMetaData, ExifIFDLength);
      }
      // IFDid = 2 (Photo)
      offset += writeIFD(blobView, tiffHeaderOffset, offset, offset + ExifIFDLength, 2, metaData);
      // IFDid = 3 (GPSInfo)
      offset += writeIFD(blobView, tiffHeaderOffset, offset, offset + GPSIFDLength, 3, metaData);
      // IFDid = 4 (InterOperability)
      offset += writeIFD(blobView, tiffHeaderOffset, offset, offset + interoperabilityIFDLength, 4, metaData);
      if (offset !== segmentLength) {
        console.log(writtenBytesError);
        callback(writtenBytesError);
        return;
      }
      segmentContent.push(blobView.buffer);
      if (thumbnailMetaData && thumbnailBlob) {
        segmentContent.push(thumbnailBlob);
      }
      exifSegmentBlob = new Blob(segmentContent);
      callback(null, exifSegmentBlob);
    });
  };

  var createThumbnail = function(file, callback, scaleFactor) {
    var image = new Image();
    var thumbnailCreated = function(thumbnailBlob) {
      callback(null, thumbnailBlob);
    };
    scaleFactor = scaleFactor || 8;
    image.onload = function() {
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      canvas.height = image.height / scaleFactor;
      canvas.width = image.width / scaleFactor;
      context.drawImage(image,
        0, 0, image.width, image.height,
        0, 0, canvas.width, canvas.height);
      canvas.toBlob(thumbnailCreated, 'image/jpeg');
      URL.revokeObjectURL(image.src);
      image.src = '';
    };
    image.src = URL.createObjectURL(file);
  };

  var readSegment = function(blobView, segmentOffset) {
    var segmentMetaData = readExifMetaData(blobView, segmentOffset);
    var exifMetaData = segmentMetaData.IFD0;
    exifMetaData = mergeObjects(exifMetaData, segmentMetaData.EXIFIFD);
    exifMetaData = mergeObjects(exifMetaData, segmentMetaData.GPSIFD);
    return {
      "metaData" : makeDirectoryEntriesHumanReadable(exifMetaData),
      "thumbnailMetaData" : segmentMetaData.IFD1 && makeDirectoryEntriesHumanReadable(segmentMetaData.IFD1),
      "thumbnailBlob" : segmentMetaData.thumbnailBlob
    };
  };

  this.JPEG = this.JPEG || {};
  this.JPEG.Exif = this.JPEG.Exif || {};
  this.JPEG.Exif.mergeObjects = mergeObjects;
  this.JPEG.Exif.readSegment = readSegment;
  this.JPEG.Exif.createSegment = createSegment;
  this.JPEG.Exif.createThumbnail = createThumbnail;

}).call(this);
