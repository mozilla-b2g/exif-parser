describe('Tests read operations of Exif parser on various trail cams', function() {

  it('should return correct metadata from Truth Cam 35', function(done) {
    var imageDownloaded = function(error, fileBlob) {
      JPEG.readExifMetaData(fileBlob, function(error, exifMetaData) {
        expect(error).toBe.null;
        expect(exifMetaData).toBe.exist;
        expect(exifMetaData['DateTime']).toBe.exist;
        expect(exifMetaData['DateTimeOriginal']).toBe.exist;
        expect(exifMetaData['DateTimeDigitized']).toBe.exist;
        done();
      });
    };
    downloadImage('base/test/data/huntforce/truthcam35/PRMS0001.jpg', imageDownloaded);
  });

  it('should return correct metadata from Reconyx', function(done) {
    var imageDownloaded = function(error, fileBlob) {
      JPEG.readExifMetaData(fileBlob, function(error, exifMetaData) {
        expect(error).toBe.null;
        expect(exifMetaData).toBe.exist;
        // expect(exifMetaData['DateTime']).toBe.exist;
        // expect(exifMetaData['DateTimeOriginal']).toBe.exist;
        // expect(exifMetaData['DateTimeDigitized']).toBe.exist;
        done();
      });
    };
    downloadImage('base/test/data/huntforce/reconyx/IMG_0164.jpg', imageDownloaded);
  });

});
