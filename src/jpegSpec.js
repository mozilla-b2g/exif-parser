 (function() {

  'use strict';

  // Segment types identified by their markers
  var segmentTypes = {  // Start Of Frame
    0x01 : "TEM",  // TEMporary
    0x02 : "RES",  // REServed ... (2-191) 0x02-0xbf
    0xc0 : "SOF0", 0xc1 : "SOF1", 0xc2 : "SOF2",
    0xc3 : "SOF3", 0xc5 : "SOF5", 0xc6 : "SOF6",
    0xc7 : "SOF7", 0xc9 : "SOF8", 0xca : "SOF10",
    0xcb : "SOF11", 0xcd : "SOF13", 0xce : "SOF14",
    0xcf : "SOF15",
    0xcc : "DAC",  // Define Arithmetic Coding
    0xc4 : "DHT",  // Define Huffman Table
    0xd0 : "RST0", 0xd1 : "RST1", 0xd2 : "RST2",
    0xd3 : "RST3", 0xd4 : "RST4", 0xd5 : "RST5",
    0xd6 : "RST6", 0xd7 : "RST7", // ReSTart Marker
    0xd8 : "SOI",  // Start Of Image
    0xd9 : "EOI",  // End Of Image
    0xda : "SOS",  // Start Of Scan
    0xdb : "DQT",  // Define Quantization Table
    0xdc : "DNL",  // Define Number of Lines
    0xdd : "DRI",  // Define Restart Interval
    0xde : "DHP",  // Define Hierarichal Progression
    0xdf : "EXP",  // EXPand reference compnent
    0xe0 : "APP0", // APPlication segments
    0xe1 : "APP1",
    0xe2 : "APP2",
    0xe3 : "APP3",
    0xe4 : "APP4",
    0xe5 : "APP5",
    0xe6 : "APP6",
    0xe7 : "APP7",
    0xe8 : "APP8",
    0xe9 : "APP9",
    0xea : "APP10",
    0xeb : "APP11",
    0xec : "APP12",
    0xed : "APP13",
    0xee : "APP14",
    0xef : "APP15",
    0xf0 : "JPG0", 0xf1 : "JPG1", 0xf2 : "JPG2", // Jpeg extensions
    0xf3 : "JPG3", 0xf4 : "JPG4", 0xf5 : "JPG5",
    0xf6 : "JPG6", 0xf7 : "JPG7", 0xf8 : "JPG8",
    0xf9 : "JPG9", 0xfa : "JPG10", 0xfb : "JPG11",
    0xfc : "JPG12", 0xfd : "JPG13",
    0xfe : "COM",   // COMment
  };

  var APPSegmentFormats = {
    "JFIF" : { // JPEG File Interchange Format
      "segmentType" : "APP1"
    },
    "JFXX" : { // JPEG File Interchange Format Extension segment
      "segmentType" : "APP1"
    },
    "Exif" : { // Exchangeable image file format
      "segmentType" : "APP0",
    }
  };

  this.JPEG = this.JPEG || {};
  this.JPEG.jpegSpec = {};
  this.JPEG.jpegSpec.segmentTypes = segmentTypes;
  this.JPEG.jpegSpec.APPSegmentFormats = APPSegmentFormats;

}).call(this);