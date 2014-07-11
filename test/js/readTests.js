describe('Tests read operations of Exif parser', function() {

  it('should return error when reading an invalid jpeg file', function(done) {
    var fileBlob = new Blob(["non valid jpeg file"], {type: 'image/png'});
    JPEG.readExifMetaData(fileBlob, function(error, exifMetaData) {
      assert.isDefined(error, "the parser should return an error");
      assert.isUndefined(exifMetaData, "the parser shouldn't return any meta data");
      done();
    });
  });

  it('should return correct metadata from a valid jpeg file', function(done) {
    var done = done;
    var imageDownloaded = function(error, fileBlob) {
      JPEG.readExifMetaData(fileBlob, function(error, exifMetaData) {
        assert.isNull(error, "the parser shouldn't return an error");
        assert.deepEqual(exifMetaData, sampleExifMetaData);
        done();
      });
    };
    downloadImage('base/test/data/sample.jpg', imageDownloaded);
  });

});
