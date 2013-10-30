(function() {

  'use strict';

  this.downloadImage = function(url, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.onload = function (event) {
      var arrayBuffer = request.response;
      var fileBlob = new Blob([arrayBuffer],{type: "image/jpeg"});
      callback(null, fileBlob);
    };
    request.send(null);
  };

}).call(this);