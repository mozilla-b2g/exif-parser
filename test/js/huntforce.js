describe('Tests read operations of Exif parser on various trail cams', function() {

  it('should return correct metadata from Truth Cam 35', function(done) {
    var imageDownloaded = function(error, fileBlob) {
      JPEG.readExifMetaData(fileBlob, function(error, exifMetaData) {
        assert.isNull(error, "the parser shouldn't return an error");
        assert.isDefined(exifMetaData);
        assert.isDefined(exifMetaData['DateTime']);
        assert.isDefined(exifMetaData['DateTimeOriginal']);
        assert.isDefined(exifMetaData['DateTimeDigitized']);
        done();
      });
    };
    downloadImage('base/test/data/huntforce/truthcam35/PRMS0001.jpg', imageDownloaded);
  });

  it('should return correct metadata from Reconyx', function(done) {
    var imageDownloaded = function(error, fileBlob) {
      JPEG.readExifMetaData(fileBlob, function(error, exifMetaData) {
        assert.isNull(error, "the parser shouldn't return an error");
        assert.isDefined(exifMetaData);
        assert.isDefined(exifMetaData['DateTimeOriginal']);
        done();
      });
    };
    downloadImage('base/test/data/huntforce/reconyx/IMG_0164.jpg', imageDownloaded);
  });

});
