# exif-parser

It provides an API to read and write EXIF metadata from jpeg images.

## Try it

* [Demo](http://dmarcos.github.io/exif-parser/examples).

## Use it

Download the [library](https://raw.github.com/dmarcos/exif-parser/master/jpeg.js) and include it in your html.

```html
<script src="js/jpeg.js"></script>
```

The following code loads a file, reads the exif metadata, modifies the rotation tag and creates a new blob with the new metadata.

```html
<script>

  var readMetaData = function(fileBlob) {
    JPEG.readExifMetaData(fileBlob, function(error, metaData) {
      console.log(JSON.stringify(metaData))
    });
  };

  var writeMetaData = function(fileBlob) {
    JPEG.writeExifMetaData(
      fileBlob,
      {"Orientation" : 1},
      function(error, modifiedBlob) {
        // Process modified file
      });
  };

  var processImage = function() {
    var request = new XMLHttpRequest();
    request.open("GET", "/exif-parser/examples/images/sample.jpg", true);
    request.responseType = "arraybuffer";
    request.onload = function (event) {
      var arrayBuffer = request.response; // Note: not request.responseText
      var blob = new Blob([arrayBuffer],{type: "image/jpeg"});
      readMetaData(blob);
      writeMetaData(blob);
    };
    request.send(null);
  };

  processImage();

</script>
```

## Test it

* [Tests](http://dmarcos.github.io/exif-parser/test/).

