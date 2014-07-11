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

  var parseASCIIString = function(blobView, offset) {
    var value = "";
    var character;
    while (true) {
      character = String.fromCharCode(blobView.getUint8(offset));
      if (character === "\0") {
        return value;
      }
      value += character;
      offset++;
    }
  };

  var parseTagValue = function(blobView, valueOffset, typeId) {
    var numerator;
    var denominator;
    switch (typeId) {
      case 1: // BYTE
        return blobView.getUint8(valueOffset);
      case 2: // ASCII
        return parseASCIIString(blobView, valueOffset);
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
    if (isIndirectAddressingTag(typeId, count)) {
      valueOffset = TIFFHeaderOffset + blobView.getUint32(valueOffset);
    }
    if (count === 1 || typeSize * count <= 4 || typeId === 2) { // typeId === ASCII
      return parseTagValue(blobView, valueOffset, typeId);
    }
    tagValues = [];
    for (var i=0; i<count; ++i) {
      tagValues.push(parseTagValue(blobView, valueOffset, typeId));
      valueOffset += typeSize;
    }
    return tagValues;
  };

  var isIndirectAddressingTag = function(typeId, count) {
    return count > 4 ||
           typeId === 5 || // RATIONAL
           typeId === 10 ||  // SRATIONAL
           typeId === 12; // DOUBLE
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
        "tag": tag,
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

  var readMakerNote = function(blobView, TIFFHeaderOffset, EntryValueOffset) {
    var offset = TIFFHeaderOffset + blobView.getUint32(EntryValueOffset);

    var makerNotes = _.find(exifSpec.makerNotes, function(makerNotes) {
      return makerNotes.test(blobView.getUint16(offset + makerNotes.firstEntry));
    });

    if (!makerNotes) {
      return;
    }

    function readMakerTagValue(blobView, TIFFHeaderOffset, valueOffset, typeId, count) {
      var tagValues;
      var typeSize = exifSpec.tagTypeSize[typeId];
      if (count === 1 || typeId === 2) { // typeId === ASCII
        return parseTagValue(blobView, valueOffset, typeId);
      }
      tagValues = [];
      for (var i=0; i<count; ++i) {
        tagValues.push(parseTagValue(blobView, valueOffset, typeId));
        valueOffset += typeSize;
      }
      return tagValues;
    }

    var entries = {};

    _.each(makerNotes.tags, function(tag, tagOffset) {
      var valueOffset = offset + _.parseInt(tagOffset, 10) * 2;
      entries[tagOffset] = {
        "tag": tag,
        "type" : tag.type,
        "count" : tag.count,
        "value" : readMakerTagValue(blobView, TIFFHeaderOffset, valueOffset, tag.type, tag.count),
        "valueOffset" : valueOffset
      };

    });

    return {
      tagProfix: makerNotes.tagProfix,
      entries: entries
    };
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

  var makeMakerNoteEntriesHumanReadable = function(tagProfix, entries) {
    var metaData = {},
      makerNotes = _.find(exifSpec.makerNotes, {tagProfix: tagProfix});

    if (!makerNotes) {
      return { };
    }

    _.each(entries, function(entry) {
      if (entry.tag.format) {
        metaData[entry.tag.key] = entry.tag.format(entry.value);
      } else {
        metaData[entry.tag.key] = entry.value;
      }
    });

    return metaData;
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
    var MakerNote;
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

    // Reads MakerNotes Block
    if(EXIFIFD.entries[exifSpec.getTagId("MakerNote")]) {
      MakerNote = readMakerNote(blobView, TIFFHeaderOffset, EXIFIFD.entries[exifSpec.getTagId("MakerNote")].valueOffset);
    }

    return {
      "IFD0" : IFD0.entries,
      "IFD1" : IFD1 && IFD1.entries,
      "EXIFIFD" : EXIFIFD && EXIFIFD.entries,
      "GPSIFD"  : GPSIFD && GPSIFD.entries,
      "interoperabilityIFD" : interoperabilityIFD && interoperabilityIFD.entries,
      "MakerNote" : MakerNote,
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

  var calculateTagValueCount = function(tagName, value) {
    var tagId = exifSpec.getTagId(tagName);
    var tagType = exifSpec.tags[tagId].type;
    if (Array.isArray(value)) {
      return value.length;
    }
    // RATIONAL || SRATIONAL
    if (tagType === 5 || tagType === 10) {
      return 2;
    }
    // ASCII && length > 4
    if (tagType === 2 && value.length > 4) {
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
        if (valueSize <= 4) {
          valueSize = 0;
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

  var calculateDataSectionLength = function(metaData, IFDType) {
    var valueSize = 0;
    var length = 0;
    Object.keys(metaData).forEach(function(key) {
      var tagId = exifSpec.getTagId(key);
      if (exifSpec.getTagId(key)) {
        if (IFDType && exifSpec.tags[tagId].IFD !== IFDType) {
          return;
        }
        valueSize = calculateTagValueSize(key, metaData[key]);
        // If value is 4 bytes or less is stored in the IFD and not in the data section
        if (valueSize > 4) {
          length += valueSize;
        }
      }
    });
    return length;
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

  var readSegment = function(blobView, segmentOffset) {
    var segmentMetaData = readExifMetaData(blobView, segmentOffset);
    var exifMetaData = segmentMetaData.IFD0;
    exifMetaData = mergeObjects(exifMetaData, segmentMetaData.EXIFIFD);
    exifMetaData = mergeObjects(exifMetaData, segmentMetaData.GPSIFD);

    var metaData = makeDirectoryEntriesHumanReadable(exifMetaData);

    if (segmentMetaData.MakerNote) {
      var makerMetadata = makeMakerNoteEntriesHumanReadable(segmentMetaData.MakerNote.tagProfix, segmentMetaData.MakerNote.entries);
      metaData = _.merge(metaData, makerMetadata);
    }

    return {
      "metaData" : metaData,
      "thumbnailMetaData" : segmentMetaData.IFD1 && makeDirectoryEntriesHumanReadable(segmentMetaData.IFD1),
      "thumbnailBlob" : segmentMetaData.thumbnailBlob
    };
  };

  this.JPEG = this.JPEG || {};
  this.JPEG.Exif = this.JPEG.Exif || {};
  this.JPEG.Exif.mergeObjects = mergeObjects;
  this.JPEG.Exif.readSegment = readSegment;
  this.JPEG.Exif.createSegment = createSegment;

}).call(this);
