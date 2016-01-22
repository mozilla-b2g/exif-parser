(function() {

  'use strict';

  var offsets = {
    'SOIMarker' : 0,
    'segmentMarker' : 0,
    'segmentType' : 1,
    'segmentLength' : 2,
    'segmentFormat' : 4,
    'firstSegment' : 2
  };

  var metaDataTypes = {
    'Exif' : JPEG.Exif,
    'JFIF' : JPEG.JFIF
  };

  var showErrors = false;

  var turnErrorsOn = function() {
    showErrors = true;
  };
  var readSegmentMarker = function(blobView, offset) {
    return blobView.getUint8(offset + offsets.segmentMarker);
  };

  var readSegmentType = function(blobView, offset) {
    return blobView.getUint8(offset + offsets.segmentType);
  };

  var readSegmentLength = function(blobView, offset) {
    var segmentType = JPEG.jpegSpec.segmentTypes[readSegmentType(blobView, offset)];
    if (segmentType === 'SOS' || segmentType.indexOf('RST') === 0) {
      return findNextSegmentOffset(blobView, offset) - offset;
    }
    return blobView.getUint16(offset + 2, false) + 2;
  };

  var readSegmentFormat = function(blobView, offset) {
    return blobView.getNullTerminatedASCIIString(offset + offsets.segmentFormat);
  };

  var validateJPEGFile = function(blobView) {
    // It reads the SOI (Start Of Image) marker (first two bytes)
    if (blobView.byteLength < 2 ||
        blobView.getUint16(offsets.SOIMarker) !== 0xffd8) {
      return false;
    }
    return true;
  };

  var validateSegment = function(segmentMarker, segmentType) {
    return (segmentMarker === 0xff && segmentType > 0x00 && segmentType < 0xff);
  };

  var findNextSegmentOffset = function(blobView, offset) {
    offset += 2;
    var previousByte = 0x00;
    var currentByte;
    while (true) {
      if (offset >= blobView.sliceLength) {
        break;
      }
      currentByte = blobView.getUint8(offset);
      if (currentByte !== 0x00 && previousByte === 0xff) {
        break;
      }
      previousByte = currentByte;
      offset += 1;
    }
    return offset - 1;
  };

  var isSOFSegment = function(segmentType) {
    return ((segmentType >=0xc0 && segmentType <= 0xc3) ||
            (segmentType >=0xc5 && segmentType <= 0xc7) ||
            (segmentType >=0xc9 && segmentType <= 0xcb) ||
            (segmentType >=0xcd && segmentType <= 0xcf));
  };

  var isEOISegment = function(segmentType) {
    return (segmentType === 0xd9);
  };

  var isAPPSegment = function(segmentType) {
    return (segmentType >= 0xe0 && segmentType <= 0xef);
  };

  var parseAPPSegment = function(blobView, offset) {
    var segmentFormat = readSegmentFormat(blobView, offset);
    var segment;
    if (metaDataTypes[segmentFormat]) {
      segment = metaDataTypes[segmentFormat].readSegment(blobView, offset);
      return {
        'format' : segmentFormat,
        'offset' : offset,
        'metaData' : segment.metaData,
        'thumbnailMetaData' : segment.thumbnailMetaData,
        'thumbnailBlob' : segment.thumbnailBlob
      };
    } else {
      if(showErrors) console.log('Unkown APP segment format: ' + segmentFormat);
    }
  };

  var parseSegments = function(blobView) {
    var offset = 2;
    var segmentsMetaData = {};
    var APPSegment;
    var segmentLength;
    while (offset + 4 <= blobView.sliceLength) {
      var segmentMarker = readSegmentMarker(blobView, offset);
      var segmentType = readSegmentType(blobView, offset);
      if (!validateSegment(segmentMarker, segmentType)) {
        if(showErrors) console.log('Invalid JPEG Segment at offset ' + offset);
        break;
      }
      if (isEOISegment(segmentType)) {
        // end of image
        break;
      }
      if (isSOFSegment(segmentType)) {
        segmentsMetaData.height = blobView.getUint16(offset + 5, false);
        segmentsMetaData.width = blobView.getUint16(offset + 7, false);
        segmentsMetaData.progressive = (segmentType === 0xc2);
      }
      if (isAPPSegment(segmentType)) {
        APPSegment = parseAPPSegment(blobView, offset);
        if (APPSegment) {
          segmentsMetaData[APPSegment.format] = APPSegment.metaData;
          segmentsMetaData[APPSegment.format].segmentOffset = APPSegment.offset;
          segmentsMetaData[APPSegment.format].segmentLength = readSegmentLength(blobView, offset);
          segmentsMetaData.thumbnailBlob = segmentsMetaData.thumbnailBlob || APPSegment.thumbnailBlob;
          segmentsMetaData.thumbnailMetaData = segmentsMetaData.thumbnailBlob || APPSegment.thumbnailMetaData;
        }
      }
      segmentLength = readSegmentLength(blobView, offset);
      if (segmentLength <= 0) { // Corrupt segment with invalid length
        throw 'Invalid length in segement at offset: ' + offset;
      }
      offset += segmentLength;
    }
    return segmentsMetaData;
  };

  var validateExifSegment = function(blobView, offset) {
    var firstSegmentType = JPEG.jpegSpec.segmentTypes[readSegmentType(blobView, offset)];
    var firstSegmentFormat = readSegmentFormat(blobView, offset);
    if (firstSegmentType !== 'APP1' || firstSegmentFormat !== 'Exif') {
      return false;
    }
    return true;
  };

  var readJPEGSegments = function(blob, size, callback, validateFirstSegment) {
    JPEG.BlobView.get(blob, 0, size, function(blobView) {
      if (validateJPEGFile(blobView) === false) {
        callback('Not a valid JPEG file');
      } else {
        if (validateFirstSegment && !validateFirstSegment(blobView, 2)) {
          callback('First segment not valid');
        } else {
          callback(null, parseSegments(blobView), blobView);
        }
      }
    });
  };

  var insertSegment = function(segmentBlob, blob, metaDataType, callback) {
    JPEG.BlobView.get(blob, 0, blob.size, function(blobView) {
      var blobSegments;
      var blob;
      var blobBeforeSegment;
      var blobAfterSegment;
      var existingSegment;
      var fileSegments;
      if (validateJPEGFile(blobView) === false) {
        callback('Not a valid JPEG file');
      } else {
        fileSegments = parseSegments(blobView);
        // If the segment already exists we just replace it
        if (fileSegments[metaDataType]) {
          existingSegment = fileSegments[metaDataType];
          blobBeforeSegment = blobView.blob.slice(0, existingSegment.segmentOffset);
          blobAfterSegment = blobView.blob.slice(
            existingSegment.segmentOffset + existingSegment.segmentLength, blobView.sliceLength);
        } else { // If the segment doesn't exist we push it to the front of the file
          blobBeforeSegment = blobView.blob.slice(0, 2);
          blobAfterSegment = blobView.blob.slice(2, blobView.sliceLength);
        }
        blob = new Blob([blobBeforeSegment, segmentBlob, blobAfterSegment], {type: 'image/jpeg'});
        callback(null, blob);
      }
    });
  };

  var readMetaData = function(blob, callback, validateFirstSegment) {
    var processSegments = function(error, segmentsMetaData) {
      if (error) {
        callback(error);
      } else {
        segmentsMetaData.fileType = 'JPEG';
        segmentsMetaData.fileSize = blob.size;
        callback(null, segmentsMetaData);
      }
    };
    var size = Math.min((64 * 1024) + 2, blob.size);
    readJPEGSegments(blob, size, processSegments, validateFirstSegment);
  };

  var writeMetaData = function(blob, size, newMetaData, metaDataType, callback, createNewThumbnail) {
    var processSegments = function(error, segmentsMetaData, blobView) {
      var segmentCreated = function(error, segmentBlob) {
        insertSegment(segmentBlob, blob, metaDataType, callback);
      };
      var createSegment = function(thumbnailMetaData, thumbnailBlob) {
        metaDataTypes[metaDataType].createSegment(
            newMetaData, segmentCreated,
            thumbnailBlob, thumbnailMetaData);
      };
      var thumbnailCreated = function(error, thumbnailBlob) {
        createSegment({}, thumbnailBlob);
      };
      if (metaDataTypes[metaDataType]) {
        if (segmentsMetaData[metaDataType]) {
          newMetaData = JPEG.Exif.mergeObjects(segmentsMetaData[metaDataType], newMetaData);
        }
        if (createNewThumbnail) {
          metaDataTypes[metaDataType].createThumbnail(blob, thumbnailCreated, 16);
        } else {
          createSegment(segmentsMetaData.thumbnailMetaData, segmentsMetaData.thumbnailBlob);
        }
      } else {
        throw 'Writing MetaData: Unknown type of MetaData ' + metaDataType;
      }
    };
    readJPEGSegments(blob, size, processSegments);
  };

  var readExifMetaData = function(blob, callback) {
    var processMetaData = function(error, metaData) {
      metaData = metaData && metaData.Exif;
      callback(error, metaData);
    };
    // We only read Start Of Image (SOI, 2 bytes) + APP1 segment that contains EXIF metada (64 KB)
    // Pg. 11 of Exif Standard Version 2.2
    // "The size of APP1 shall not exceed the 64 Kbytes specified in the JPEG standard"
    readMetaData(blob, processMetaData);
  };

  var writeExifMetaData = function(blob, metaData, callback) {
    writeMetaData(blob, blob.size, metaData, 'Exif', callback);
  };

  this.JPEG = this.JPEG || {};
  this.showErrors = false;
  this.JPEG.turnErrorsOn = turnErrorsOn;
  this.JPEG.readMetaData = readMetaData;
  this.JPEG.readExifMetaData = readExifMetaData;
  this.JPEG.writeExifMetaData = writeExifMetaData;

}).call(this);
