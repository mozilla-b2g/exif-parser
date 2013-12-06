// JPEG File Interchange Format Parser
(function() {

  'use strict';

  var readSegment = function(blobView, offset) {
    var metaData = {};
    var thumbnailBlob;
    metaData.version = blobView.getUint8(offset+9).toString();
    metaData.version += ".0" + blobView.getUint8(offset+10);
    metaData.units = blobView.getUint8(offset+11);
    metaData.XDensity = blobView.getUint16(offset+12);
    metaData.YDensity = blobView.getUint16(offset+14);
    metaData.XThumbnail = blobView.getUint8(offset+16);
    metaData.YThumbnail = blobView.getUint8(offset+17);
    if (metaData.XThumbnail !== 0 && metaData.YThumbnail !== 0) {
      thumbnailBlob = blobView.blob.slice(offset + 18, 3 * metaData.XThumbnail * metaData.YThumbnail);
    }
    return {
      "metaData" : metaData,
      "thumbnailBlob" : thumbnailBlob
    };
  };

  this.JPEG = this.JPEG || {};
  this.JPEG.JFIF = this.JPEG.JFIF || {};
  this.JPEG.JFIF.readSegment = readSegment;

}).call(this);