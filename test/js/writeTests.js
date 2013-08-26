(function() {

  describe("Tests write operations of Exif parser", function() {

  this.timeout(8000);

  it("should modify rotation flag", function(done) {
    var done = done;
    var imageDownloaded = function(error, fileBlob) {
      JPEG.writeExifMetaData(fileBlob,
        { "Orientation" : 6 },
        function(error, newFileBlob) {
          assert.isNull(error, "the parser shouldn't return an error");
          JPEG.readExifMetaData(newFileBlob, function(error, exifMetaData) {
            assert.isNull(error, "the parser shouldn't return an error");
            assert.propertyVal(exifMetaData, "Orientation", 6);
            done();
          });
      });
    };
    downloadImage("data/sample.jpg", imageDownloaded);
  });

  it("should modify valid exif tags and ignore non exif metadata", function(done) {
    var done = done;
    var imageDownloaded = function(error, fileBlob) {
      JPEG.writeExifMetaData(fileBlob,
        { "Orientation" : 1,
          "NonValidExif" : "XXX"
        },
        function(error, newFileBlob) {
          assert.isNull(error, "the parser shouldn't return an error");
          JPEG.readExifMetaData(newFileBlob, function(error, exifMetaData) {
            assert.isNull(error, "the parser shouldn't return an error");
            assert.propertyVal(exifMetaData, "Orientation", 1);
            assert.notProperty(exifMetaData, "NonValidExif");
            done();
          });
      });
    };
    downloadImage("data/sample2.jpg", imageDownloaded);
  });

  it("should modify indirect addressed flag", function(done) {
    var done = done;
    var imageDownloaded = function(error, fileBlob) {
      JPEG.writeExifMetaData(fileBlob,
        { "ImageDescription" : "Exif Parser Test"},
        function(error, newFileBlob) {
          assert.isNull(error, "the parser shouldn't return an error");
          JPEG.readExifMetaData(newFileBlob, function(error, exifMetaData) {
            assert.isNull(error, "the parser shouldn't return an error");
            expect(exifMetaData).to.include.keys("ImageDescription");
            assert.propertyVal(exifMetaData, "ImageDescription", "Exif Parser Test");
            done();
          });
      });
    };
    downloadImage("data/sample.jpg", imageDownloaded);
  });

  it("should add exif metadata on file with no previous exif meta data", function(done) {
    var done = done;
    var imageDownloaded = function(error, fileBlob) {
      JPEG.writeExifMetaData(fileBlob,
        { "Orientation" : 1 },
        function(error, newFileBlob) {
          assert.isNull(error, "the parser shouldn't return an error");
          JPEG.readExifMetaData(newFileBlob, function(error, exifMetaData) {
            assert.isNull(error, "the parser shouldn't return an error");
            assert.propertyVal(exifMetaData, "Orientation", 1);
            done();
          });
      });
    };
    downloadImage("data/sampleNoExif.jpg", imageDownloaded);
  });

});

}).call(this);