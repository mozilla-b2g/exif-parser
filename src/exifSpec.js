(function() {

var tagTypes = {
  BYTE: 1,
  ASCII: 2,
  SHORT: 3,
  LONG: 4,
  RATIONAL: 5,
  SBYTE: 6,
  UNDEFINED: 7,
  SSHORT: 8,
  SLONG: 9,
  SRATIONAL: 10,
  FLOAT: 11,
  DOUBLE: 12
};

var tagTypesString = {
  1: "BYTE",
  2: "ASCII",
  3: "SHORT",
  4: "LONG",
  5: "RATIONAL",
  6: "SBYTE",
  7: "UNDEFINED",
  8: "SSHORT",
  9: "SLONG",
  10: "SRATIONAL",
  11: "FLOAT",
  12: "DOUBLE"
};

var tagTypeSize = {
  1: 1, // BYTE
  3: 2, // SHORT
  4: 4, // LONG
  5: 8, // RATIONAL
  6: 1, // SBYTE
  7: 1, // UNDEFINED
  8: 2, // SSHORT
  9: 4, // SLONG
  10: 8, // SRATIONAL
  11: 4, // FLOAT
  12: 8  // DOUBLE
};

var IFDId = {
  Image: 1,
  Photo: 2,
  GPSInfo: 3,
  Iop: 4
};

var interOperabilityTags = {
  "1": { // Indicates the identification of the Interoperability rule. Use "R98" for stating ExifR98 Rules. Four bytes used including the termination code (NULL). see the separate volume of Recommended Exif Interoperability Rules (ExifR98) for other tags used for ExifR98.
    "IFD": 4,
    "key": "InteroperabilityIndex",
    "type": 2
  },
  "2": { // Interoperability version
    "IFD": 4,
    "key": "InteroperabilityVersion",
    "type": 7
  },
  "4096": { // File format of image file
    "IFD": 4,
    "key": "RelatedImageFileFormat",
    "type": 2
  },
  "4097": { // Image width
    "IFD": 4,
    "key": "RelatedImageWidth",
    "type": 4
  },
  "4098": { // Image height
    "IFD": 4,
    "key": "RelatedImageLength",
    "type": 4
  }
};

// Tags supported by the 2.2 Standard
var tags = {
  "0": { // Indicates the version of <GPSInfoIFD>. The version is given as 2.0.0.0. This tag is mandatory when <GPSInfo> tag is present. (Note: The <GPSVersionID> tag is given in byte s, unlike the <ersion> tag. When the version is 2.0.0.0, the tag value is 02000000.H).
    "IFD": 3,
    "key": "GPSVersionID",
    "type": 1
  },
  "1": { // Indicates whether the latitude is north or south latitude. The ASCII value 'N' indicates north latitude, and 'S' is south latitude.
    "IFD": 3,
    "key": "GPSLatitudeRef",
    "type": 2
  },
  "2": { // Indicates the latitude. The latitude is expressed as three,Rational values giving the degrees, minutes, and seconds, respectively. When degrees, minutes and seconds are expressed, the format is dd/1, mm/1, ss/1. When degrees and minutes are used and, for example, fractions of minutes are given up to two decimal places, the format is dd/1, mmmm/100, 0/1.
    "IFD": 3,
    "key": "GPSLatitude",
    "type": 5
  },
  "3": { // Indicates whether the LONGitude is east or west LONGitude.ASCII 'E' indicates east LONGitude, and 'W' is west LONGitude.
    "IFD": 3,
    "key": "GPSLongitudeRef",
    "type": 2
  },
  "4": { // Indicates the LONGitude. The LONGitude is expressed as three,Rational values giving the degrees, minutes, and seconds, respectively. When degrees, minutes and seconds are expressed, the format is ddd/1, mm/1, ss/1. When degrees and minutes are used and, for example, fractions of minutes are given up to two decimal places, the format is ddd/1, mmmm/100, 0/1.
    "IFD": 3,
    "key": "GPSLongitude",
    "type": 5
  },
  "5": { // Indicates the altitude used as the reference altitude. If the reference is sea level and the altitude is above sea level, 0 is given. If the altitude is below sea level, a value of 1 is given and the altitude is indicated as an absolute value in the GSPAltitude tag. The reference unit is meters. Note that this tag is Byte type, unlike other reference tags.
    "IFD": 3,
    "key": "GPSAltitudeRef",
    "type": 1
  },
  "6": { // Indicates the altitude based on the reference in GPSAltitudeRef. Altitude is expressed as one rational value. The reference unit is meters.
    "IFD": 3,
    "key": "GPSAltitude",
    "type": 5
  },
  "7": { // Indicates the time as UTC (Coordinated Universal Time). <TimeStamp> is expressed as three rational values giving the hour, minute, and second (atomic clock).
    "IFD": 3,
    "key": "GPSTimeStamp",
    "type": 5
  },
  "8": { // Indicates the GPS satellites used for measurements. This tag can be used to describe the number of satellites, their ID number, angle of elevation, azimuth, SNR and other information in ASCII notation. The format is not specified. If the GPS receiver is incapable of taking measurements, value of the tag is set to NULL.
    "IFD": 3,
    "key": "GPSSatellites",
    "type": 2
  },
  "9": { // Indicates the status of the GPS receiver when the image is recorded. 'A' means measurement is in progress, and 'V' means the measurement is Interoperability.
    "IFD": 3,
    "key": "GPSStatus",
    "type": 2
  },
  "10": { // Indicates the GPS measurement mode. '2' means two-dimensional measurement and '3' means three-dimensional measurement is in progress.

    "IFD": 3,
    "key": "GPSMeasureMode",
    "type": 2
  },
  "11": { // Indicates the GPS DOP (data degree of precision). An HDOP value is written during two-dimensional measurement, and PDOP during three-dimensional measurement.
    "IFD": 3,
    "key": "GPSDOP",
    "type": 5
  },
  "12": { // Indicates the unit used to express the GPS receiver speed of movement. 'K' 'M' and 'N' represents kilometers per hour, miles per hour, and knots.
    "IFD": 3,
    "key": "GPSSpeedRef",
    "type": 2
  },
  "13": { // Indicates the speed of GPS receiver movement.
    "IFD": 3,
    "key": "GPSSpeed",
    "type": 5
  },
  "14": { // Indicates the reference for giving the direction of GPS receiver movement. 'T' denotes true direction and 'M' is magnetic direction.
    "IFD": 3,
    "key": "GPSTrackRef",
    "type": 2
  },
  "15": { // Indicates the direction of GPS receiver movement. The range of values is from 0.00 to 359.99.
    "IFD": 3,
    "key": "GPSTrack",
    "type": 5
  },
  "16": { // Indicates the reference for giving the direction of the image when it is captured. 'T' denotes true direction and 'M' is magnetic direction.
    "IFD": 3,
    "key": "GPSImgDirectionRef",
    "type": 2
  },
  "17": { // Indicates the direction of the image when it was captured. The range of values is from 0.00 to 359.99.
    "IFD": 3,
    "key": "GPSImgDirection",
    "type": 5
  },
  "18": { // Indicates the geodetic survey data used by the GPS receiver. If the survey data is restricted to Japan, the value of this tag is 'TOKYO' or 'WGS-84'.
    "IFD": 3,
    "key": "GPSMapDatum",
    "type": 2
  },
  "19": { // Indicates whether the latitude of the destination point is north or south latitude. The ASCII  value 'N' indicates north latitude, and 'S' is south latitude.
    "IFD": 3,
    "key": "GPSDestLatitudeRef",
    "type": 2
  },
  "20": { // Indicates the latitude of the destination point. The latitude is expressed as three rational values giving the degrees, minutes, and seconds, respectively. If latitude is expressed as degrees, minutes and seconds, a typical format would be dd/1, mm/1, ss/1. When degrees and minutes are used and, for example, fractions of minutes are given up to two decimal places, the format would be dd/1, mmmm/100, 0/1.
    "IFD": 3,
    "key": "GPSDestLatitude",
    "type": 5
  },
  "21": { // Indicates whether the LONGitude of the destination point is east or west LONGitude. ASCII 'E' indicates east LONGitude, and 'W' is west LONGitude.
    "IFD": 3,
    "key": "GPSDestLONGitudeRef",
    "type": 2
  },
  "22": { // Indicates the LONGitude of the destination point. The LONGitude is expressed as three,Rational values giving the degrees, minutes, and seconds, respectively. If LONGitude is expressed as degrees, minutes and seconds, a typical format would be ddd/1, mm/1, ss/1. When degrees and minutes are used and, for example, fractions of minutes are given up to two decimal places, the format would be ddd/1, mmmm/100, 0/1.
    "IFD": 3,
    "key": "GPSDestLONGitude",
    "type": 5
  },
  "23": { // Indicates the reference used for giving the bearing to the destination point. 'T' denotes true direction and 'M' is magnetic direction.
    "IFD": 3,
    "key": "GPSDestBearingRef",
    "type": 2
  },
  "24": { // Indicates the bearing to the destination point. The range of values is from 0.00 to 359.99.
    "IFD": 3,
    "key": "GPSDestBearing",
    "type": 5
  },
  "25": { // Indicates the unit used to express the distance to the destination point. 'K'  'M' and 'N' represent kilometers, miles and knots.
    "IFD": 3,
    "key": "GPSDestDistanceRef",
    "type": 2
  },
  "26": { // Indicates the distance to the destination point.
    "IFD": 3,
    "key": "GPSDestDistance",
    "type": 5
  },
  "27": { // A character string recording the name of the method used for location finding. The first byte indicates the character code used, and this is followed by the name of the method.
    "IFD": 3,
    "key": "GPSProcessingMethod",
    "type": 7
  },
  "28": { // A character string recording the name of the GPS area. The first byte indicates the character code used, and this is followed by the name of the GPS area.
    "IFD": 3,
    "key": "GPSAreaInformation",
    "type": 7
  },
  "29": { // A character string recording date and time information relative to UTC (Coordinated Universal Time). The format is 'YYYY:MM:DD'.
    "IFD": 3,
    "key": "GPSDateStamp",
    "type": 2
  },
  "30": { // Indicates whether differential correction is applied to the GPS receiver.
    "IFD": 3,
    "key": "GPSDifferential",
    "type": 3
  },
  "254": { // A general indication of the kind of data contained in this subfile.
    "IFD": 1,
    "key": "NewSubfileType",
    "type": 4
  },
  "255": { // A general indication of the kind of data contained in this subfile. This field is deprecated. The NewSubfileType field should be used instead.
    "IFD": 1,
    "key": "SubfileType",
    "type": 3
  },
  "256": { // The number of columns of image data, equal to the number of pixels per row. In JPEG compressed data a JPEG marker is used instead of this tag.
    "IFD": 1,
    "key": "ImageWidth",
    "type": 4
  },
  "257": { // The number of rows of image data. In JPEG compressed data a JPEG marker is used instead of this tag.
    "": 1,
    "key": "ImageLength",
    "type": 4
  },
  "258": { // The number of bits per image component. In this standard each component of the image is 8 bits, so the value for this tag is 8. See also <SamplesPerPixel>. In JPEG compressed data a JPEG marker is used instead of this tag.
    "IFD": 1,
    "key": "BitsPerSample",
    "type": 3
  },
  "259": { // The compression scheme used for the image data. When a primary image is JPEG compressed, this designation is not necessary and is omitted. When thumbnails use JPEG compression, this tag value is set to 6.
    "IFD": 1,
    "key": "Compression",
    "type": 3
  },
  "262": { // The pixel composition. In JPEG compressed data a JPEG marker is used instead of this tag.
    "IFD": 1,
    "key": "PhotometricInterpretation",
    "type": 3
  },
  "263": { // For black and white TIFF files that represent shades of gray, the technique used to convert from gray to black and white pixels.
    "IFD": 1,
    "key": "Threshholding",
    "type": 3
  },
  "264": { // The width of the dithering or halftoning matrix used to create a dithered or halftoned bilevel file.
    "IFD": 1,
    "key": "CellWidth",
    "type": 3
  },
  "265": { // The length of the dithering or halftoning matrix used to create a dithered or halftoned bilevel file.
    "IFD": 1,
    "key": "CellLength",
    "type": 3
  },
  "266": { // The logical order of bits within a byte
    "IFD": 1,
    "key": "FillOrder",
    "type": 3
  },
  "269": { // The name of the document from which this image was scanned
    "IFD": 1,
    "key": "DocumentName",
    "type": 2
  },
  "270": { // A character string giving the title of the image. It may be a comment such as '1988 company picnic' or the like. Two-bytes character codes cannot be used. When a 2-bytes code is necessary, the Private tag <UserComment> is to be used.
    "IFD": 1,
    "key": "ImageDescription",
    "type": 2
  },
  "271": { // The manufacturer of the recording equipment. This is the manufacturer of the DSC, scanner, video digitizer or other equipment that generated the image. When the field is left blank, it is treated as unknown.
    "IFD": 1,
    "key": "Make",
    "type": 2
  },
  "272": { // The model name or model number of the equipment. This is the model name or number of the DSC, scanner, video digitizer or other equipment that generated the image. When the field is left blank, it is treated as unknown.
    "IFD": 1,
    "key": "Model",
    "type": 2
  },
  "273": { // For each strip, the byte offset of that strip. It is recommended that this be selected so the number of strip byte s does not exceed 64 Kbytes. With JPEG compressed data this designation is not needed and is omitted. See also <RowsPerStrip> and <StripByteCounts>.
    "IFD": 1,
    "key": "StripOffsets",
    "type": 4
  },
  "274": { // The image orientation viewed in terms of rows and columns.
    "IFD": 1,
    "key": "Orientation",
    "type": 3
  },
  "277": { // The number of components per pixel. Since this standard applies to RGB and YCbCr images, the value set for this tag is 3. In JPEG compressed data a JPEG marker is used instead of this tag.
    "IFD": 1,
    "key": "SamplesPerPixel",
    "type": 3
  },
  "278": { // The number of rows per strip. This is the number of rows in the image of one strip when an image is divided into strips. With JPEG compressed data this designation is not needed and is omitted. See also <StripOffsets> and <StripByteCounts>.
    "IFD": 1,
    "key": "RowsPerStrip",
    "type": 4
  },
  "279": { // The total number of byte s in each strip. With JPEG compressed data this designation is not needed and is omitted.
    "IFD": 1,
    "key": "StripByteCounts",
    "type": 4
  },
  "282": { // The number of pixels per <ResolutionUnit> in the <ImageWidth> direction. When the image resolution is unknown, 72 [dpi] is designated.
    "IFD": 1,
    "key": "XResolution",
    "type": 5
  },
  "283": { // The number of pixels per <ResolutionUnit> in the <ImageLength> direction. The same value as <XResolution> is designated.
    "IFD": 1,
    "key": "YResolution",
    "type": 5
  },
  "284": { // Indicates whether pixel components are recorded in a chunky or planar format. In JPEG compressed files a JPEG marker is used instead of this tag. If this field does not exist, the TIFF default of 1 (chunky) is assumed.
    "IFD": 1,
    "key": "PlanarConfiguration",
    "type": 3
  },
  "290": { // The precision of the information contained in the GrayResponseCurve.
    "IFD": 1,
    "key": "GrayResponseUnit",
    "type": 3
  },
  "291": { // For grayscale data, the optical density of each possible pixel value.
    "IFD": 1,
    "key": "GrayResponseCurve",
    "type": 3
  },
  "292": { // T.4-encoding options.
    "IFD": 1,
    "key": "T4Options",
    "type": 4
  },
  "293": { // T.6-encoding options.
    "IFD": 1,
    "key": "T6Options",
    "type": 4
  },
  "296": { // The unit for measuring <XResolution> and <YResolution>. The same unit is used for both <XResolution> and <YResolution>. If the image resolution is unknown, 2 (inches) is designated.
    "IFD": 1,
    "key": "ResolutionUnit",
    "type": 3
  },
  "301": { // A transfer function for the image, described in tabular style. Normally this tag is not necessary, since color space is specified in the color space information tag (<ColorSpace>).
    "IFD": 1,
    "key": "TransferFunction",
    "type": 3
  },
  "305": { // This tag records the name and version of the software or firmware of the camera or image input device used to generate the image. The detailed format is not specified, but it is recommended that the example shown below be followed. When the field is left blank, it is treated as unknown.
    "IFD": 1,
    "key": "Software",
    "type": 2
  },
  "306": { // The date and time of image creation. In standard, it is the date and time the file was changed.
    "IFD": 1,
    "key": "DateTime",
    "type": 2
  },
  "315": { // This tag records the name of the camera owner, photographer or image creator. The detailed format is not specified, but it is recommended that the information be written as in the example below for ease of Interoperability. When the field is left blank, it is treated as unknown. Ex.) 'Camera owner, John Smith; Photographer, Michael Brown; Image creator, Ken James
    "IFD": 1,
    "key": "Artist",
    "type": 2
  },
  "316": { // This tag records information about the host computer used to generate the image.
    "IFD": 1,
    "key": "HostComputer",
    "type": 2
  },
  "317": { // A predictor is a mathematical operator that is applied to the image data before an encoding scheme is applied.
    "IFD": 1,
    "key": "Predictor",
    "type": 3
  },
  "318": { // The chromaticity of the white point of the image. Normally this tag is not necessary, since color space is specified in the colorspace information tag (<ColorSpace>)."
    "IFD": 1,
    "key": "WhitePoint",
    "type": 5
  },
  "319": { // The chromaticity of the three primary colors of the image. Normally this tag is not necessary, since colorspace is specified in the colorspace information tag (<ColorSpace>)."
    "IFD": 1,
    "key": "PrimaryChromaticities",
    "type": 5
  },
  "320": { // A color map for palette color images. This field defines a Red-Green-Blue color map (often called a lookup table) for palette-color images. In a palette-color image, a pixel value is used to index into an RGB lookup table.
    "IFD": 1,
    "key": "ColorMap",
    "type": 3
  },
  "321": { // The purpose of the HalftoneHints field is to convey to the halftone function the range of gray levels within a colorimetrically-specified image that should retain tonal detail.
    "IFD": 1,
    "key": "HalftoneHints",
    "type": 3
  },
  "322": { // The tile width in pixels. This is the number of columns in each tile.
    "IFD": 1,
    "key": "TileWidth",
    "type": 3
  },
  "323": { // The tile length (height) in pixels. This is the number of rows in each tile.
    "IFD": 1,
    "key": "TileLength",
    "type": 3
  },
  "324": { // For each tile, the byte  offset of that tile, as compressed and stored on disk. The offset is specified with respect to the beginning of the TIFF file. Note that this implies that each tile has a location independent of the locations of other tiles.
    "IFD": 1,
    "key": "TileOffsets",
    "type": 3
  },
  "325": { // For each tile, the number of (compressed) byte s in that tile. See TileOffsets for a description of how the byte  counts are ordered.
    "IFD": 1,
    "key": "TileByteCounts",
    "type": 3
  },
  "330": { // Defined by Adobe Corporation to enable TIFF Trees within a TIFF file.
    "IFD": 1,
    "key": "SubIFDs",
    "type": 4
  },
  "332": { // The set of inks used in a separated (PhotometricInterpretation=5) image.
    "IFD": 1,
    "key": "InkSet",
    "type": 3
  },
  "333": { // The name of each ink used in a separated (PhotometricInterpretation=5) image.
    "IFD": 1,
    "key": "InkNames",
    "type": 2
  },
  "334": { // The number of inks. Usually equal to SamplesPerPixel, unless there are extra samples.
    "IFD": 1,
    "key": "NumberOfInks",
    "type": 3
  },
  "336": { // The component values that correspond to a 0% dot and 100% dot.
    "IFD": 1,
    "key": "DotRange",
    "type": 1
  },
  "337": { // A description of the printing environment for which this separation is intended.
    "IFD": 1,
    "key": "TargetPrinter",
    "type": 2
  },
  "338": { // Specifies that each pixel has m extra components whose interpretation is defined by one of the values listed below.
    "IFD": 1,
    "key": "ExtraSamples",
    "type": 3
  },
  "339": { // This field specifies how to interpret each data sample in a pixel.
    "IFD": 1,
    "key": "SampleFormat",
    "type": 3
  },
  "340": { // This field specifies the minimum sample value.
    "IFD": 1,
    "key": "SMinSampleValue",
    "type": 3
  },
  "341": { // This field specifies the maximum sample value.
    "IFD": 1,
    "key": "SMaxSampleValue",
    "type": 3
  },
  "342": { // Expands the range of the TransferFunction
    "IFD": 1,
    "key": "TransferRange",
    "type": 3
  },
  "343": { // A TIFF ClipPath is intended to mirror the essentials of PostScript's path creation functionality.
    "IFD": 1,
    "key": "ClipPath",
    "type": 1
  },
  "344": { // The number of units that span the width of the image, in terms of integer ClipPath coordinates.
    "IFD": 1,
    "key": "XClipPathUnits",
    "type": 8
  },
  "345": { // The number of units that span the height of the image, in terms of integer ClipPath coordinates.
    "IFD": 1,
    "key": "YClipPathUnits",
    "type": 8
  },
  "346": { // Indexed images are images where the 'pixels' do not represent color values, but rather an index (usually 8-bit) into a separate color table, the ColorMap.
    "IFD": 1,
    "key": "Indexed",
    "type": 3
  },
  "347": { // This optional tag may be used to encode the JPEG quantization andHuffman tables for subsequent use by the JPEG decompression process.
    "IFD": 1,
    "key": "JPEGTables",
    "type": 7
  },
  "351": { // OPIProxy gives information concerning whether this image is a low-resolution proxy of a high-resolution image (Adobe OPI).
    "IFD": 1,
    "key": "OPIProxy",
    "type": 3
  },
  "512": { // This field indicates the process used to produce the compressed data
    "IFD": 1,
    "key": "JPEGProc",
    "type": 4
  },
  "513": { // The offset to the start byte (SOI) of JPEG compressed thumbnail data. This is not used for primary image JPEG data.
    "IFD": 1,
    "key": "JPEGInterchangeFormat",
    "type": 4
  },
  "514": { // The number of byte s of JPEG compressed thumbnail data. This is not used for primary image JPEG data. JPEG thumbnails are not divided but are recorded as a continuous JPEG bitstream from SOI to EOI. Appn and COM markers should not be recorded. Compressed thumbnails must be recorded in no more than 64 Kbytes, including all other data to be recorded in APP1."
    "IFD": 1,
    "key": "JPEGInterchangeFormatLength",
    "type": 4
  },
  "515": { // This Field indicates the length of the restart interval used in the compressed image data.
    "IFD": 1,
    "key": "JPEGRestartInterval",
    "type": 3
  },
  "517": { // This Field points to a list of lossless predictor-selection values, one per component.
    "IFD": 1,
    "key": "JPEGLosslessPredictors",
    "type": 3
  },
  "518": { // This Field points to a list of point transform values, one per component.
    "IFD": 1,
    "key": "JPEGPointTransforms",
    "type": 3
  },
  "519": { // This Field points to a list of offsets to the quantization tables, one per component.
    "IFD": 1,
    "key": "JPEGQTables",
    "type": 4
  },
  "520": { // This Field points to a list of offsets to the DC Huffman tables or the lossless Huffman tables, one per component.
    "IFD": 1,
    "key": "JPEGDCTables",
    "type": 4
  },
  "521": { // This Field points to a list of offsets to the Huffman AC tables, one per component.
    "IFD": 1,
    "key": "JPEGACTables",
    "type": 4
  },
  "529": { // The matrix coefficients for transformation from RGB to YCbCr image data. No default is given in TIFF; but here the value given in Appendix E, 'Color Space Guidelines'  is used as the default. The color space is declared in a color space information tag, with the default being the value that gives the optimal image characteristics Interoperability this condition.
    "IFD": 1,
    "key": "YCbCrCoefficients",
    "type": 5
  },
  "530": { // The sampling ratio of chrominance components in relation to the luminance component. In JPEG compressed data a JPEG marker is used instead of this tag.
    "IFD": 1,
    "key": "YCbCrSubSampling",
    "type": 3
  },
  "531": { // The position of chrominance components in relation to the luminance component. This field is designated only for JPEG compressed data or uncompressed YCbCr data. The TIFF default is 1 (centered); but when Y:Cb:Cr = 4:2:2 it is recommended in this standard that 2 (co-sited) be used to record data, in order to improve the image quality when viewed on TV systems. When this field does not exist, the reader shall assume the TIFF default. In the case of Y:Cb:Cr = 4:2:0, the TIFF default (centered) is recommended. If the reader does not have the capability of supporting both kinds of <YCbCrPositioning>, it shall follow the TIFF default regardless of the value in this field. It is preferable that readers be able to support both centered and co-sited positioning.
    "IFD": 1,
    "key": "YCbCrPositioning",
    "type": 3
  },
  "532": { // The reference black point value and reference white point value. No defaults are given in TIFF, but the values below are given as defaults here. The color space is declared in a color space information tag, with the default being the value that gives the optimal image characteristics Interoperability these conditions.
    "IFD": 1,
    "key": "ReferenceBlackWhite",
    "type": 5
  },
  "700": { // XMP Metadata (Adobe technote 9-14-02)
    "IFD": 1,
    "key": "XMLPacket",
    "type": 1
  },
  "18246": { // Rating tag used by Windows
    "IFD": 1,
    "key": "Rating",
    "type": 3
  },
  "18249": { // Rating tag used by Windows, value in percent
    "IFD": 1,
    "key": "RatingPercent",
    "type": 3
  },
  "32781": { // ImageID is the full pathname of the original, high-resolution image, or any other identifying string that uniquely identifies the original image (Adobe OPI).
    "IFD": 1,
    "key": "ImageID",
    "type": 2
  },
  "33421": { // Contains two values representing the minimum rows and columns to define the repeating patterns of the color filter array
    "IFD": 1,
    "key": "CFARepeatPatternDim",
    "type": 3
  },
  "33422": { // Indicates the color filter array (CFA) geometric pattern of the image sensor when a one-chip color area sensor is used. It does not apply to all sensing methods
    "IFD": 1,
    "key": "CFAPattern",
    "type": 1
  },
  "33423": { // Contains a value of the battery level as a fraction or string
    "IFD": 1,
    "key": "BatteryLevel",
    "type": 5
  },
  "33432": { // Copyright information. In this standard the tag is used to indicate both the photographer and editor copyrights. It is the copyright notice of the person or organization claiming rights to the image. The Interoperability copyright statement including date and rights should be written in this field; e.g., 'Copyright, John Smith, 19xx. All rights reserved.'. In this standard the field records both the photographer and editor copyrights, with each recorded in a separate part of the statement. When there is a clear distinction between the photographer and editor copyrights, these are to be written in the order of photographer followed by editor copyright, separated by NULL (in this case since the statement also ends with a NULL, there are two NULL codes). When only the photographer copyright is given, it is terminated by one NULL code . When only the editor copyright is given, the photographer copyright part consists of one space followed by a terminating NULL code, then the editor copyright is given. When the field is left blank, it is treated as unknown.
    "IFD": 1,
    "key": "Copyright",
    "type": 2
  },
  "33434": { // Exposure time, given in seconds (sec).
    "IFD": 2,
    "key": "ExposureTime",
    "type": 5
  },
  "33437": { // The F number.
    "IFD": 2,
    "key": "FNumber",
    "type": 5
  },
  "33723": { // Contains an IPTC/NAA record
    "IFD": 1,
    "key": "IPTCNAA",
    "type": 4
  },
  "34377": { // Contains information embedded by the Adobe Photoshop application
    "IFD": 1,
    "key": "ImageResources",
    "type": 1
  },
  "34665": { // A pointer to the IFD. Interoperability, IFD has the same structure as that of the IFD specified in TIFF. ordinarily, however, it does not contain image data as in the case of TIFF.
    "IFD": 1,
    "key": "ExifTag",
    "type": 4
  },
  "34675": { // Contains an InterColor Consortium (ICC) format color space characterization/profile
    "IFD": 1,
    "key": "InterColorProfile",
    "type": 7
  },
  "34850": { // The class of the program used by the camera to set exposure when the picture is taken.
    "IFD": 2,
    "key": "ExposureProgram",
    "type": 3
  },
  "34852": { // Indicates the spectral sensitivity of each channel of the camera used. The tag value is an ASCII string compatible with the standard developed by the ASTM Technical Committee.
    "IFD": 2,
    "key": "SpectralSensitivity",
    "type": 2
  },
  "34853": { // A pointer to the GPS Info IFD. The Interoperability structure of the GPS Info IFD, like that of IFD, has no image data.
    "IFD": 1,
    "key": "GPSTag",
    "type": 4
  },
  "34855": { // Indicates the ISO Speed and ISO Latitude of the camera or input device as specified in ISO 12232.
    "IFD": 2,
    "key": "ISOSpeedRatings",
    "type": 3
  },
  "34856": { // Indicates the Opto-Electoric Conversion Function (OECF) specified in ISO 14524. <OECF> is the relationship between the camera optical input and the image values.
    "IFD": 2,
    "key": "OECF",
    "type": 7
  },
  "34857": { // Indicates the field number of multifield images.
    "IFD": 1,
    "key": "Interlace",
    "type": 3
  },
  "34858": { // This optional tag encodes the time zone of the camera clock (relativeto Greenwich Mean Time) used to create the DataTimeOriginal tag-valuewhen the picture was taken. It may also contain the time zone offsetof the clock used to create the DateTime tag-value when the image wasmodified.
    "IFD": 1,
    "key": "TimeZoneOffset",
    "type": 8
  },
  "34859": { // Number of seconds image capture was delayed from button press.
    "IFD": 1,
    "key": "SelfTimerMode",
    "type": 3
  },
  "34864": { // The SensitivityType tag indicates PhotographicSensitivity tag. which one of the parameters of ISO12232 is the Although it is an optional tag, it should be recorded when a PhotographicSensitivity tag is recorded. Value = 4, 5, 6, or 7 may be used in case that the values of plural parameters are the same.
    "IFD": 2,
    "key": "SensitivityType",
    "type": 3
  },
  "34865": { // This tag indicates the standard output sensitivity value of a camera or input device defined in ISO 12232. When recording this tag, the PhotographicSensitivity and SensitivityType tags shall also be recorded.
    "IFD": 2,
    "key": "StandardOutputSensitivity",
    "type": 4
  },
  "34866": { // This tag indicates the recommended exposure index value of a camera or input device defined in ISO 12232. When recording this tag, the PhotographicSensitivity and SensitivityType tags shall also be recorded.
    "IFD": 2,
    "key": "RecommendedExposureIndex",
    "type": 4
  },
  "34867": { // This tag indicates the ISO speed value of a camera or input device that is defined in ISO 12232. When recording this tag, the PhotographicSensitivity and SensitivityType tags shall also be recorded.
    "IFD": 2,
    "key": "ISOSpeed",
    "type": 4
  },
  "34868": { // This tag indicates the ISO speed latitude yyy value of a camera or input device that is defined in ISO 12232. However, this tag shall not be recorded without ISOSpeed and ISOSpeedLatitudezzz.
    "IFD": 2,
    "key": "ISOSpeedLatitudeyyy",
    "type": 4
  },
  "34869": { // This tag indicates the ISO speed latitude zzz value of a camera or input device that is defined in ISO 12232. However, this tag shall not be recorded without ISOSpeed and ISOSpeedLatitudeyyy.
    "IFD": 2,
    "key": "ISOSpeedLatitudezzz",
    "type": 4
  },
  "36864": { // The version of this standard supported. Nonexistence of this field is taken to mean nonconformance to the standard.
    "IFD": 2,
    "key": "ExifVersion",
    "type": 7
  },
  "36867": { // The date and time when the original image data was generated. For a digital still camera the date and time the picture was taken are recorded.
    "IFD": 2,
    "key": "DateTimeOriginal",
    "type": 2
  },
  "36868": { // The date and time when the image was stored as digital data.
    "IFD": 2,
    "key": "DateTimeDigitized",
    "type": 2
  },
  "37121": { // Information specific to compressed data. The channels of each component are arranged in order from the 1st component to the 4th. For uncompressed data the data arrangement is given in the <PhotometricInterpretation> tag. However, since <PhotometricInterpretation> can only express the order of Y, Cb and Cr, this tag is provided for cases when compressed data uses components other than Y, Cb, and Cr and to enable support of other sequences.
    "IFD": 2,
    "key": "ComponentsConfiguration",
    "type": 7
  },
  "37122": { // Information specific to compressed data. The compression mode used for a compressed image is indicated in unit bits per pixel.
    "IFD": 2,
    "key": "CompressedBitsPerPixel",
    "type": 5
  },
  "37377": { // Shutter speed. The unit is the APEX (Additive System of Photographic Exposure) setting.
    "IFD": 2,
    "key": "ShutterSpeedValue",
    "type": 10
  },
  "37378": { // The lens aperture. The unit is the APEX value.
    "IFD": 2,
    "key": "ApertureValue",
    "type": 5
  },
  "37379": { // The value of brightness. The unit is the APEX value. Ordinarily it is given in the range of -99.99 to 99.99.
    "IFD": 2,
    "key": "BrightnessValue",
    "type": 10
  },
  "37380": { // The exposure bias. The units is the APEX value. Ordinarily it is given in the range of -99.99 to 99.99.
    "IFD": 2,
    "key": "ExposureBiasValue",
    "type": 10
  },
  "37381": { // The smallest F number of the lens. The unit is the APEX value. Ordinarily it is given in the range of 00.00 to 99.99, but it is not limited to this range.
    "IFD": 2,
    "key": "MaxApertureValue",
    "type": 5
  },
  "37382": { // The distance to the subject, given in meters.
    "IFD": 2,
    "key": "SubjectDistance",
    "type": 5
  },
  "37383": { // The metering mode.
    "IFD": 2,
    "key": "MeteringMode",
    "type": 3
  },
  "37384": { // The kind of light source.
    "IFD": 2,
    "key": "LightSource",
    "type": 3
  },
  "37385": { // This tag is recorded when an image is taken using a strobe light (flash).
    "IFD": 2,
    "key": "Flash",
    "type": 3
  },
  "37386": { // The actual focal length of the lens, in mm. Conversion is not made to the focal length of a 35 mm film camera.
    "IFD": 2,
    "key": "FocalLength",
    "type": 5
  },
  "37387": { // Amount of flash energy (BCPS).
    "IFD": 1,
    "key": "FlashEnergy",
    "type": 5
  },
  "37388": { // SFR of the camera.
    "IFD": 1,
    "key": "SpatialFrequencyResponse",
    "type": 7
  },
  "37389": { // Noise measurement values.
    "IFD": 1,
    "key": "Noise",
    "type": 7
  },
  "37390": { // Number of pixels per FocalPlaneResolutionUnit (37392) in ImageWidth direction for main image.
    "IFD": 1,
    "key": "FocalPlaneXResolution",
    "type": 5
  },
  "37391": { // Number of pixels per FocalPlaneResolutionUnit (37392) in ImageLength direction for main image.
    "IFD": 1,
    "key": "FocalPlaneYResolution",
    "type": 5
  },
  "37392": { // Unit of measurement for FocalPlaneXResolution(37390) and FocalPlaneYResolution(37391).
    "IFD": 1,
    "key": "FocalPlaneResolutionUnit",
    "type": 3
  },
  "37393": { // Number assigned to an image, e.g., in a chained image burst.
    "IFD": 1,
    "key": "ImageNumber",
    "type": 4
  },
  "37394": { // Security classification assigned to the image.
    "IFD": 1,
    "key": "SecurityClassification",
    "type": 2
  },
  "37395": { // Record of what has been done to the image.
    "IFD": 1,
    "key": "ImageHistory",
    "type": 2
  },
  "37396": { // This tag indicates the location and area of the main subject in the overall scene.
    "IFD": 2,
    "key": "SubjectArea",
    "type": 3
  },
  "37397": { // Encodes the camera exposure index setting when image was captured.
    "IFD": 1,
    "key": "ExposureIndex",
    "type": 5
  },
  "37398": { // Contains four ASCII
    "IFD": 1,
    "key": "TIFFEPStandardID",
    "type": 1
  },
  "37399": { // Type of image sensor
    "IFD": 1,
    "key": "SensingMethod",
    "type": 3
  },
  "37500": { // A tag for manufacturers of writers to record any desired information. The contents are up to the manufacturer.
    "IFD": 2,
    "key": "MakerNote",
    "type": 7
  },
  "37510": { // A tag for users to write keywords or comments on the image besides those in <ImageDescription>, and without the character code limitations of the <ImageDescription> tag.
    "IFD": 2,
    "key": "UserComment",
    "type": 2
  },
  "37520": { // A tag used to record fractions of seconds for the <DateTime> tag.
    "IFD": 2,
    "key": "SubSecTime",
    "type": 2
  },
  "37521": { // A tag used to record fractions of seconds for the <DateTimeOriginal> tag.
    "IFD": 2,
    "key": "SubSecTimeOriginal",
    "type": 2,
  },
  "37522": { // A tag used to record fractions of seconds for the <DateTimeDigitized> tag.
    "IFD": 2,
    "key": "SubSecTimeDigitized",
    "type": 2
  },
  "40091": { // Title tag used by Windows, encoded in UCS2
    "IFD": 1,
    "key": "XPTitle",
    "type": 1
  },
  "40092": { // Comment tag used by Windows, encoded in UCS2
    "IFD": 1,
    "key": "XPComment",
    "type": 1
  },
  "40093": { // Author tag used by Windows, encoded in UCS2
    "IFD": 1,
    "key": "XPAuthor",
    "type": 1
  },
  "40094": { // Keywords tag used by Windows, encoded in UCS2
    "IFD": 1,
    "key": "XPKeywords",
    "type": 1
  },
  "40095": { // Subject tag used by Windows, encoded in UCS2
    "IFD": 1,
    "key": "XPSubject",
    "type": 1
  },
  "40960": { // The FlashPix format version supported by a FPXR file.
    "IFD": 2,
    "key": "FlashpixVersion",
    "type": 7
  },
  "40961": { // The color space information tag is always recorded as the color space specifier. Normally sRGB is used to define the color space based on the PC monitor conditions and environment. If a color space other than sRGB is used, Uncalibrated is set. Image data recorded as Uncalibrated can be treated as sRGB when it is converted to FlashPix.
    "IFD": 2,
    "key": "ColorSpace",
    "type": 3
  },
  "40962": { // Information specific to compressed data. When a compressed file is recorded, the valid width of the meaningful image must be recorded in this tag, whether or not there is padding data or a restart marker. This tag should not exist in an uncompressed file.
    "IFD": 2,
    "key": "PixelXDimension",
    "type": 4
  },
  "40963": { // Information specific to compressed data. When a compressed file is recorded, the valid height of the meaningful image must be recorded in this tag, whether or not there is padding data or a restart marker. This tag should not exist in an uncompressed file. Since data padding is unnecessary in the vertical direction, the number of lines recorded in this valid image height tag will in fact be the same as that recorded in the SOF.
    "IFD": 2,
    "key": "PixelYDimension",
    "type": 4
  },
  "40964": { // This tag is used to record the name of an audio file related to the image data. The only relational information recorded here is the audio file name and extension (an ASCII string consisting of 8 characters + '.' + 3 characters). The path is not recorded.
    "IFD": 2,
    "key": "RelatedSoundFile",
    "type": 2
  },
  "40965": { // Interoperability IFD is composed of tags which stores the information to ensure the Interoperability and pointed by the following tag located in IFD. The Interoperability structure of Interoperability IFD is the same as TIFF defined IFD structure but does not contain the image data characteristically compared with normal TIFF IFD.
    "IFD": 2,
    "key": "InteroperabilityTag",
    "type": 4
  },
  "41483": { // Indicates the strobe energy at the time the image is captured, as measured in Beam Candle Power Seconds (BCPS).
    "IFD": 2,
    "key": "FlashEnergy",
    "type": 5
  },
  "41484": { // This tag records the camera or input device spatial frequency table and SFR values in the direction of image width, image height, and diagonal direction, as specified in ISO 12233.
    "IFD": 2,
    "key": "SpatialFrequencyResponse",
    "type": 7
  },
  "41486": { // Indicates the number of pixels in the image width (X) direction per <FocalPlaneResolutionUnit> on the camera focal plane.
    "IFD": 2,
    "key": "FocalPlaneXResolution",
    "type": 5
  },
  "41487": { // Indicates the number of pixels in the image height (V) direction per <FocalPlaneResolutionUnit> on the camera focal plane."
    "IFD": 2,
    "key": "FocalPlaneYResolution",
    "type": 5
  },
  "41488": { // Indicates the unit for measuring <FocalPlaneXResolution> and <FocalPlaneYResolution>. This value is the same as the <ResolutionUnit>.
    "IFD": 2,
    "key": "FocalPlaneResolutionUnit",
    "type": 3
  },
  "41492": { // Indicates the location of the main subject in the scene. The value of this tag represents the pixel at the center of the main subject relative to the left edge, prior to rotation processing as per the <Rotation> tag. The first value indicates the X column number and second indicates the Y row number.
    "IFD": 2,
    "key": "SubjectLocation",
    "type": 3
  },
  "41493": { // Indicates the exposure index selected on the camera or input device at the time the image is captured.
    "IFD": 2,
    "key": "ExposureIndex",
    "type": 5
  },
  "41495": { // Indicates the image sensor type on the camera or input device.
    "IFD": 2,
    "key": "SensingMethod",
    "type": 3
  },
  "41728": { // Indicates the image source. If a DSC recorded the image, this tag value of this tag always be set to 3, indicating that the image was recorded on a DSC.
    "IFD": 2,
    "key": "FileSource",
    "type": 7
  },
  "41729": { // Indicates the type of scene. If a DSC recorded the image, this tag value must always be set to 1, indicating that the image was directly photographed.
    "IFD": 2,
    "key": "SceneType",
    "type": 7
  },
  "41730": { // Indicates the color filter array (CFA) geometric pattern of the image sensor when a one-chip color area sensor is used. It does not apply to all sensing methods.
    "IFD": 2,
    "key": "CFAPattern",
    "type": 7
  },
  "41985": { // This tag indicates the use of special processing on image data, such as rendering geared to output. When special processing is performed, the reader is expected to disable or minimize any further processing.
    "IFD": 2,
    "key": "CustomRendered",
    "type": 3
  },
  "41986": { // This tag indicates the exposure mode set when the image was shot. In auto-bracketing mode, the camera shoots a series of frames of the same scene at different exposure settings.
    "IFD": 2,
    "key": "ExposureMode",
    "type": 3
  },
  "41987": { // This tag indicates the white balance mode set when the image was shot.
    "IFD": 2,
    "key": "WhiteBalance",
    "type": 3
  },
  "41988": { // This tag indicates the digital zoom ratio when the image was shot. If the numerator of the recorded value is 0, this indicates that digital zoom was not used.
    "IFD": 2,
    "key": "DigitalZoomRatio",
    "type": 5
  },
  "41989": { // This tag indicates the equivalent focal length assuming a 35mm film camera, in mm. A value of 0 means the focal length is unknown. Note that this tag differs from the <FocalLength> tag."
    "IFD": 2,
    "key": "FocalLengthIn35mmFilm",
    "type": 3
  },
  "41990": { // This tag indicates the type of scene that was shot. It can also be used to record the mode in which the image was shot. Note that this differs from the <SceneType> tag.
    "IFD": 2,
    "key": "SceneCaptureType",
    "type": 3
  },
  "41991": { // This tag indicates the degree of overall image gain adjustment.
    "IFD": 2,
    "key": "GainControl",
    "type": 3
  },
  "41992": { // This tag indicates the direction of contrast processing applied by the camera when the image was shot.
    "IFD": 2,
    "key": "Contrast",
    "type": 3
  },
  "41993": { // This tag indicates the direction of saturation processing applied by the camera when the image was shot.
    "IFD": 2,
    "key": "Saturation",
    "type": 3
  },
  "41994": { // This tag indicates the direction of sharpness processing applied by the camera when the image was shot.
    "IFD": 2,
    "key": "Sharpness",
    "type": 3
  },
  "41995": { // This tag indicates information on the picture-taking conditions of a particular camera model. The tag is used only to indicate the picture-taking conditions in the reader."
    "IFD": 2,
    "key": "DeviceSettingDescription",
    "type": 7
  },
  "41996": { // This tag indicates the distance to the subject.
    "IFD": 2,
    "key": "SubjectDistanceRange",
    "type": 3
  },
  "42016": { // This tag indicates an identifier assigned uniquely to each image. It is recorded as an ASCII string equivalent to hexadecimal notation and 128-bit fixed length.
    "IFD": 2,
    "key": "ImageUniqueID",
    "type": 2
  },
  "42032": { // This tag records the owner of a camera used in photography as an ASCII string.
    "IFD": 2,
    "key": "CameraOwnerName",
    "type": 2
  },
  "42033": { // This tag records the serial number of the body of the camera that was used in photography as an ASCII string.
    "IFD": 2,
    "key": "BodySerialNumber",
    "type": 2
  },
  "42034": { // This tag notes minimum focal length, maximum focal length, minimum F number in the minimum focal length, and minimum F number in the maximum focal length, which are specification information for the lens that was used in photography. When the minimum F number is unknown, the notation is 0/0
    "IFD": 2,
    "key": "LensSpecification",
    "type": 5
  },
  "42035": { // This tag records the lens manufactor as an ASCII string.
    "IFD": 2,
    "key": "LensMake",
    "type": 2
  },
  "42036": { // This tag records the lens's model name and model number as an,ASCII string.
    "IFD": 2,
    "key": "LensModel",
    "type": 2
  },
  "42037": { // This tag records the serial number of the interchangeable lens that was used in photography as an ASCII string.
    "IFD": 2,
    "key": "LensSerialNumber",
    "type": 2
  },
  "50341": { // Print Image Matching, description needed.
    "IFD": 1,
    "key": "PrintImageMatching",
    "type": 7
  },
  "50706": { // This tag encodes the DNG four-tier version number. For files compliant with version 1.1.0.0 of the DNG specification, this tag should contain the Byte s: 1, 1, 0, 0.
    "IFD": 1,
    "key": "DNGVersion",
    "type": 1
  },
  "50707": { // This tag specifies the oldest version of the Digital Negative specification for which a file is compatible. Readers shouldnot attempt to read a file if this tag specifies a version number that is higher than the version number of the specification the reader was based on. In addition to checking the version tags, readers should, for all tags, check the types, counts, and values, to verify it is able to correctly read the file.
    "IFD": 1,
    "key": "DNGBackwardVersion",
    "type": 1
  },
  "50708": { // Defines a unique, non-localized name for the camera model that created the image in the raw file. This name should include the manufacturer's name to avoid conflicts, and should not be localized, even if the camera name itself is localized for different markets (see LocalizedCameraModel). This string may be used by reader software to index into per-model preferences and replacement profiles.
    "IFD": 1,
    "key": "UniqueCameraModel",
    "type": 2
  },
  "50709": { // Similar to the UniqueCameraModel field, except the name can be localized for different markets to match the localization of the camera name.
    "IFD": 1,
    "key": "LocalizedCameraModel",
    "type": 1
  },
  "50710": { // Provides a mapping between the values in the CFAPattern tag and the plane numbers in LinearRaw space. This is a required tag for non-RGB CFA images.
    "IFD": 1,
    "key": "CFAPlaneColor",
    "type": 1,
  },
  "50711": { // Describes the spatial layout of the CFA.
    "IFD": 1,
    "key": "CFALayout",
    "type": 3,
  },
  "50712": { // Describes a lookup table that maps stored values into linear values. This tag is typically used to increase compression ratios by storing the raw data in a non-linear, more visually uniform space with fewer total encoding levels. If SamplesPerPixel is not equal to one, this single table applies to all the samples for each pixel.
    "IFD": 1,
    "key": "LinearizationTable",
    "type": 3,
  },
  "50713": { // Specifies repeat pattern size for the BlackLevel tag.
    "IFD": 1,
    "key": "BlackLevelRepeatDim",
    "type": 3
  },
  "50714": { // Specifies the zero light (a.k.a. thermal black or black current) encoding level, as a repeating pattern. The origin of this pattern is the top-left corner of the ActiveArea rectangle. The values are stored in row-column-sample scan order.
    "IFD": 1,
    "key": "BlackLevel",
    "type": 5
  },
  "50715": { // If the zero light encoding level is a function of the image column, BlackLevelDeltaH specifies the difference between the zero light encoding level for each column and the baseline zero light encoding level. If SamplesPerPixel is not equal to one, this single table applies to all the samples for each pixel.
    "IFD": 1,
    "key": "BlackLevelDeltaH",
    "type": 10
  },
  "50716": { // If the zero light encoding level is a function of the image row, this tag specifies the difference between the zero light encoding level for each row and the baseline zero light encoding level. If SamplesPerPixel is not equal to one, this single table applies to all the samples for each pixel.
    "IFD": 1,
    "key": "BlackLevelDeltaV",
    "type": 10
  },
  "50717": { // This tag specifies the fully saturated encoding level for the raw sample values. Saturation is caused either by the sensor itself becoming highly non-linear in response, or by the camera's analog to digital converter clipping.
    "IFD": 1,
    "key": "WhiteLevel",
    "type": 3
  },
  "50718": { // DefaultScale is required for cameras with non-square pixels. It specifies the default scale factors for each direction to convert the image to square pixels. Typically these factors are selected to approximately preserve total pixel count. For CFA images that use CFALayout equal to 2, 3, 4, or 5, such as the Fujifilm SuperCCD, these two values should usually differ by a factor of 2.0.
    "IFD": 1,
    "key": "DefaultScale",
    "type": 5,
  },
  "50719": { // Raw images often store extra pixels around the edges of the final image. These extra pixels help prevent interpolation artifacts near the edges of the final image. DefaultCropOrigin specifies the origin of the final image area, in raw image coordinates (i.e., before the DefaultScale has been applied), relative to the top-left corner of the ActiveArea rectangle.
    "IFD": 1,
    "key": "DefaultCropOrigin",
    "type": 3
  },
  "50720": { // Raw images often store extra pixels around the edges of the final image. These extra pixels help prevent interpolation artifacts near the edges of the final image. DefaultCropSize specifies the size of the final image area, in raw image coordinates (i.e., before the DefaultScale has been applied).
    "IFD": 1,
    "key": "DefaultCropSize",
    "type": 3
  },
  "50721": { // ColorMatrix1 defines a transformation matrix that converts XYZ values to reference camera native color space values, under the first calibration illuminant. The matrix values are stored in row scan order. The ColorMatrix1 tag is required for all non-monochrome DNG files.
    "IFD": 1,
    "key": "ColorMatrix1",
    "type": 10
  },
  "50722": { // ColorMatrix2 defines a transformation matrix that converts XYZ values to reference camera native color space values, under the second calibration illuminant. The matrix values are stored in row scan order.
    "IFD": 1,
    "key": "ColorMatrix2",
    "type": 10
  },
  "50723": { // CameraClalibration1 defines a calibration matrix that transforms reference camera native space values to individual camera native space values under the first calibration illuminant. The matrix is stored in row scan order. This matrix is stored separately from the matrix specified by the ColorMatrix1 tag to allow raw converters to swap in replacement color matrices based on UniqueCameraModel tag, while still taking advantage of any per-individual camera calibration performed by the camera manufacturer.
    "IFD": 1,
    "key": "CameraCalibration1",
    "type": 10
  },
  "50724": { // CameraCalibration2 defines a calibration matrix that transforms reference camera native space values to individual camera native space values under the second calibration illuminant. The matrix is stored in row scan order. This matrix is stored separately from the matrix specified by the ColorMatrix2 tag to allow raw converters to swap in replacement color matrices based on UniqueCameraModel tag, while still taking advantage of any per-individual camera calibration performed by the camera manufacturer.
    "IFD": 1,
    "key": "CameraCalibration2",
    "type": 10
  },
  "50725": { // ReductionMatrix1 defines a dimensionality reduction matrix for use as the first stage in converting color camera native space values to XYZ values, under the first calibration illuminant. This tag may only be used if ColorPlanes is greater than 3. The matrix is stored in row scan order.

    "IFD": 1,
    "key": "ReductionMatrix1",
    "type": 10
  },
  "50726": { // ReductionMatrix2 defines a dimensionality reduction matrix for use as the first stage in converting color camera native space values to XYZ values, under the second calibration illuminant. This tag may only be used if ColorPlanes is greater than 3. The matrix is stored in row scan order.
    "IFD": 1,
    "key": "ReductionMatrix2",
    "type": 10
  },
  "50727": { // Normally the stored raw values are not white balanced, since any digital white balancing will reduce the dynamic range of the final image if the user decides to later adjust the white balance; however, if camera hardware is capable of white balancing the color channels before the signal is digitized, it can improve the dynamic range of the final image. AnalogBalance defines the gain, either analog (recommended) or digital (not recommended) that has been applied the stored raw values.
    "IFD": 1,
    "key": "AnalogBalance",
    "type": 5
  },
  "50728": { // Specifies the selected white balance at time of capture, encoded as the coordinates of a perfectly neutral color in linear reference space values. The inclusion of this tag precludes the inclusion of the AsShotWhiteXY tag.
    "IFD": 1,
    "key": "AsShotNeutral",
    "type": 3
  },
  "50729": { // Specifies the selected white balance at time of capture, encoded as x-y chromaticity coordinates. The inclusion of this tag precludes the inclusion of the AsShotNeutral tag.

    "IFD": 1,
    "key": "AsShotWhiteXY",
    "type": 5
  },
  "50730": { // Camera models vary in the trade-off they make between highlight headroom and shadow noise. Some leave a significant amount of highlight headroom during a normal exposure. This allows significant negative exposure compensation to be applied during raw conversion, but also means normal exposures will contain more shadow noise. Other models leave less headroom during normal exposures. This allows for less negative exposure compensation, but results in lower shadow noise for normal exposures. Because of these differences, a raw converter needs to vary the zero point of its exposure compensation control from model to model. BaselineExposure specifies by how much (in EV units) to move the zero point. Positive values result in brighter default results, while negative values result in darker default results."
    "IFD": 1,
    "key": "BaselineExposure",
    "type": 10
  },
  "50731": { // Specifies the relative noise level of the camera model at a baseline ISO value of 100, compared to a reference camera model. Since noise levels tend to vary approximately with the square root of the ISO value, a raw converter can use this value, combined with the current ISO, to estimate the relative noise level of the current image.
    "IFD": 1,
    "key": "BaselineNoise",
    "type": 5
  },
  "50732": { // Specifies the relative amount of sharpening required for this camera model, compared to a reference camera model. Camera models vary in the strengths of their anti-aliasing filters. Cameras with weak or no filters require less sharpening than cameras with strong anti-aliasing filters.

    "IFD": 1,
    "key": "BaselineSharpness",
    "type": 5
  },
  "50733": { // Only applies to CFA images using a Bayer pattern filter array. This tag specifies, in arbitrary units, how closely the values of the green pixels in the blue/green rows track the values of the green pixels in the red/green rows. A value of zero means the two kinds of green pixels track closely, while a non-zero value means they sometimes diverge. The useful range for this tag is from 0 (no divergence) to about 5000 (quite large divergence).
    "IFD": 1,
    "key": "BayerGreenSplit",
    "type": 4
  },
  "50734": { // Some sensors have an unpredictable non-linearity in their response as they near the upper limit of their encoding range. This non-linearity results in color shifts in the highlight areas of the resulting image unless the raw converter compensates for this effect. LinearResponseLimit specifies the fraction of the encoding range above which the response may become significantly non-linear.
    "IFD": 1,
    "key": "LinearResponseLimit",
    "type": 5
  },
  "50735": { // CameraSerialNumber contains the serial number of the camera or camera body that captured the image.
    "IFD": 1,
    "key": "CameraSerialNumber",
    "type": 2
  },
  "50736": { // Contains information about the lens that captured the image. If the minimum f-stops are unknown, they should be encoded as 0/0.
    "IFD": 1,
    "key": "LensInfo",
    "type": 5
  },
  "50737": { // ChromaBlurRadius provides a hint to the DNG reader about how much chroma blur should be applied to the image. If this tag is omitted, the reader will use its default amount of chroma blurring. Normally this tag is only included for non-CFA images, since the amount of chroma blur required for mosaic images is highly dependent on the de-mosaic algorithm, in which case the DNG reader's default value is likely optimized for its particular de-mosaic algorithm.
    "IFD": 1,
    "key": "ChromaBlurRadius",
    "type": 5
  },
  "50738": { // Provides a hint to the DNG reader about how strong the camera's anti-alias filter is. A value of 0.0 means no anti-alias filter (i.e., the camera is prone to aliasing artifacts with some subjects), while a value of 1.0 means a strong anti-alias filter (i.e., the camera almost never has aliasing artifacts).
    "IFD": 1,
    "key": "AntiAliasStrength",
    "type": 5
  },
  "50739": { // This tag is used by Adobe Camera Raw to control the sensitivity of its 'Shadows' slider.

    "IFD": 1,
    "key": "ShadowScale",
    "type": 10
  },
  "50740": { // Provides a way for camera manufacturers to store private data in the DNG file for use by their own raw converters, and to have that data preserved by programs that edit DNG files.
    "IFD": 1,
    "key": "DNGPrivateData",
    "type": 1
  },
  "50741": { // MakerNoteSafety lets the DNG reader know whether the MakerNote tag is safe to preserve aLONG with the rest of the data. File browsers and other image management software processing an image with a preserved MakerNote should be aware that any thumbnail image embedded in the MakerNote may be stale, and may not reflect the current state of the full size image."
    "IFD": 1,
    "key": "MakerNoteSafety",
    "type": 3
  },
  "50778": { // The illuminant used for the first set of color calibration tags (ColorMatrix1, CameraCalibration1, ReductionMatrix1). The legal values for this tag are the same as the legal values for the LightSource tag.
    "IFD": 1,
    "key": "CalibrationIlluminant1",
    "type": 3
  },
  "50779": { // The illuminant used for an optional second set of color calibration tags (ColorMatrix2, CameraCalibration2, ReductionMatrix2). The legal values for this tag are the same as the legal values for the CalibrationIlluminant1 tag; however, if both are included, neither is allowed to have a value of 0 (unknown).
    "IFD": 1,
    "key": "CalibrationIlluminant2",
    "type": 3
  },
  "50780": { // For some cameras, the best possible image quality is not achieved by preserving the total pixel count during conversion. For example, Fujifilm SuperCCD images have maximum detail when their total pixel count is doubled. This tag specifies the amount by which the values of the DefaultScale tag need to be multiplied to achieve the best quality image size.
    "IFD": 1,
    "key": "BestQualityScale",
    "type": 5
  },
  "50781": { // This tag contains a 16-byte unique identifier for the raw image data in the DNG file. DNG readers can use this tag to recognize a particular raw image, even if the file's name or the metadata contained in the file has been changed. If a DNG writer creates such an identifier, it should do so using an algorithm that will ensure that it is very unlikely two different images will end up having the same identifier.
    "IFD": 1,
    "key": "RawDataUniqueID",
    "type": 1
  },
  "50827": { // If the DNG file was converted from a non-DNG raw file, then this tag contains the file name of that original raw file.
    "IFD": 1,
    "key": "OriginalRawFileName",
    "type": 1
  },
  "50828": { // If the DNG file was converted from a non-DNG raw file, then this tag contains the compressed contents of that original raw file. The contents of this tag always use the big-endian byte  order. The tag contains a sequence of data blocks. Future versions of the DNG specification may define additional data blocks, so DNG readers should ignore extra byte s when parsing this tag. DNG readers should also detect the case where data blocks are missing from the end of the sequence, and should assume a default value for all the missing blocks. There are no padding or alignment byte s between data blocks.
    "IFD": 1,
    "key": "OriginalRawFileData",
    "type": 7
  },
  "50829": { // This rectangle defines the active (non-masked) pixels of the sensor. The order of the rectangle coordinates is: top, left, bottom, right.
    "IFD": 1,
    "key": "ActiveArea",
    "type": 3
  },
  "50830": { // This tag contains a list of non-overlapping rectangle coordinates of fully masked pixels, which can be optionally used by DNG readers to measure the black encoding level. The order of each rectangle's coordinates is: top, left, bottom, right. If the raw image data has already had its black encoding level subtracted, then this tag should not be used, since the masked pixels are no LONGer useful.
    "IFD": 1,
    "key": "MaskedAreas",
    "type": 3
  },
  "50831": { // This tag contains an ICC profile that, in conjunction with the AsShotPreProfileMatrix tag, provides the camera manufacturer with a way to specify a default color rendering from camera color space coordinates (linear reference values) into the ICC profile connection space. The ICC profile connection space is an output referred colorimetric space, whereas the other color calibration tags in DNG specify a conversion into a scene referred colorimetric space. This means that the rendering in this profile should include any desired tone and gamut mapping needed to convert between scene referred values and output referred values.
    "IFD": 1,
    "key": "AsShotICCProfile",
    "type": 7
  },
  "50832": { // This tag is used in conjunction with the AsShotICCProfile tag. It specifies a matrix that should be applied to the camera color space coordinates before processing the values through the ICC profile specified in the AsShotICCProfile tag. The matrix is stored in the row scan order. If ColorPlanes is greater than three, then this matrix can (but is not required to) reduce the dimensionality of the color data down to three components, in which case the AsShotICCProfile should have three rather than ColorPlanes input components.
    "IFD": 1,
    "key": "AsShotPreProfileMatrix",
    "type": 10
  },
  "50833": { // This tag is used in conjunction with the CurrentPreProfileMatrix tag. The CurrentICCProfile and CurrentPreProfileMatrix tags have the same purpose and usage as the AsShotICCProfile and AsShotPreProfileMatrix tag pair, except they are for use by raw file editors rather than camera manufacturers.
    "IFD": 1,
    "key": "CurrentICCProfile",
    "type": 7
  },
  "50834": { // This tag is used in conjunction with the CurrentICCProfile tag. The CurrentICCProfile and CurrentPreProfileMatrix tags have the same purpose and usage as the AsShotICCProfile and AsShotPreProfileMatrix tag pair, except they are for use by raw file editors rather than camera manufacturers.
    "IFD": 1,
    "key": "CurrentPreProfileMatrix",
    "type": 10
  },
  "50879": { // The DNG color model documents a transform between camera colors and CIE XYZ values. This tag describes the colorimetric reference for the CIE XYZ values. 0 = The XYZ values are scene-referred. 1 = The XYZ values are output-referred, using the ICC profile perceptual dynamic range. This tag allows output-referred data to be stored in DNG files and still processed correctly by DNG readers.
    "IFD": 1,
    "key": "ColorimetricReference",
    "type": 3
  },
  "50931": { // A UTF-8 encoded string associated with the CameraCalibration1 and CameraCalibration2 tags. The CameraCalibration1 and CameraCalibration2 tags should only be used in the DNG color transform if the string stored in the CameraCalibrationSignature tag exactly matches the string stored in the ProfileCalibrationSignature tag for the selected camera profile.
    "IFD": 1,
    "key": "CameraCalibrationSignature",
    "type": 1
  },
  "50932": { // A UTF-8 encoded string associated with the camera profile tags. The CameraCalibration1 and CameraCalibration2 tags should only be used in the DNG color transfer if the string stored in the CameraCalibrationSignature tag exactly matches the string stored in the ProfileCalibrationSignature tag for the selected camera profile.
    "IFD": 1,
    "key": "ProfileCalibrationSignature",
    "type": 1
  },
  "50934": { // A UTF-8 encoded string containing the name of the 'as shot' camera profile, if any."
    "IFD": 1,
    "key": "AsShotProfileName",
    "type": 1
  },
  "50935": { // This tag indicates how much noise reduction has been applied to the raw data on a scale of 0.0 to 1.0. A 0.0 value indicates that no noise reduction has been applied. A 1.0 value indicates that the 'ideal' amount of noise reduction has been applied, i.e. that the DNG reader should not apply additional noise reduction by default. A value of 0/0 indicates that this parameter is unknown.
    "IFD": 1,
    "key": "NoiseReductionApplied",
    "type": 5
  },
  "50936": { // A UTF-8 encoded string containing the name of the camera profile. This tag is optional if there is only a single camera profile stored in the file but is required for all camera profiles if there is more than one camera profile stored in the file.
    "IFD": 1,
    "key": "ProfileName",
    "type": 1
  },
  "50937": { // This tag specifies the number of input samples in each dimension of the hue/saturation/value mapping tables. The data for these tables are stored in ProfileHueSatMapData1 and ProfileHueSatMapData2 tags. The most common case has ValueDivisions equal to 1, so only hue and saturation are used as inputs to the mapping table.
    "IFD": 1,
    "key": "ProfileHueSatMapDims",
    "type": 4
  },
  "50938": { // This tag contains the data for the first hue/saturation/value mapping table. Each entry of the table contains three 32-bit IEEE floating-point values. The first entry is hue shift in degrees; the second entry is saturation scale factor; and the third entry is a value scale factor. The table entries are stored in the tag in nested loop order, with the value divisions in the outer loop, the hue divisions in the middle loop, and the saturation divisions in the inner loop. All zero input saturation entries are required to have a value scale factor of 1.0.
    "IFD": 1,
    "key": "ProfileHueSatMapData1",
    "type": 11
  },
  "50939": { // This tag contains the data for the second hue/saturation/value mapping table. Each entry of the table contains three 32-bit IEEE floating-point values. The first entry is hue shift in degrees; the second entry is a saturation scale factor; and the third entry is a value scale factor. The table entries are stored in the tag in nested loop order, with the value divisions in the outer loop, the hue divisions in the middle loop, and the saturation divisions in the inner loop. All zero input saturation entries are required to have a value scale factor of 1.0.
    "IFD": 1,
    "key": "ProfileHueSatMapData2",
    "type": 11
  },
  "50940": { // This tag contains a default tone curve that can be applied while processing the image as a starting point for user adjustments. The curve is specified as a list of 32-bit IEEE floating-point value pairs in linear gamma. Each sample has an input value in the range of 0.0 to 1.0, and an output value in the range of 0.0 to 1.0. The first sample is required to be (0.0, 0.0), and the last sample is required to be (1.0, 1.0). Interpolated the curve using a cubic spline.
    "IFD": 1,
    "key": "ProfileToneCurve",
    "type": 11
  },
  "50941": { // This tag contains information about the usage rules for the associated camera profile.
    "IFD": 1,
    "key": "ProfileEmbedPolicy",
    "type": 4
  },
  "50942": { // A UTF-8 encoded string containing the copyright information for the camera profile. This string always should be preserved aLONG with the other camera profile tags.
    "IFD": 1,
    "key": "ProfileCopyright",
    "type": 1
  },
  "50964": { // This tag defines a matrix that maps white balanced camera colors to XYZ D50 colors.
    "IFD": 1,
    "key": "ForwardMatrix1",
    "type": 10
  },
  "50965": { // This tag defines a matrix that maps white balanced camera colors to XYZ D50 colors.
    "IFD": 1,
    "key": "ForwardMatrix2",
    "type": 10
  },
  "50966": { // A UTF-8 encoded string containing the name of the application that created the preview stored in the IFD.
    "IFD": 1,
    "key": "PreviewApplicationName",
    "type": 1
  },
  "50967": { // A UTF-8 encoded string containing the version number of the application that created the preview stored in the IFD.

    "IFD": 1,
    "key": "PreviewApplicationVersion",
    "type": 1
  },
  "50968": { // A UTF-8 encoded string containing the name of the conversion settings (for example, snapshot name) used for the preview stored in the IFD.

    "IFD": 1,
    "key": "PreviewSettingsName",
    "type": 1
  },
  "50969": { // A unique ID of the conversion settings (for example, MD5 digest) used to render the preview stored in the IFD.
    "IFD": 1,
    "key": "PreviewSettingsDigest",
    "type": 1
  },
  "50970": { // This tag specifies the color space in which the rendered preview in this IFD is stored. The default value for this tag is sRGB for color previews and Gray Gamma 2.2 for monochrome previews.
    "IFD": 1,
    "key": "PreviewColorSpace",
    "type": 4
  },
  "50971": { // This tag is an ASCII string containing the name of the date/time at which the preview stored in the IFD was rendered. The date/time is encoded using ISO 8601 format.
    "IFD": 1,
    "key": "PreviewDateTime",
    "type": 2
  },
  "50972": { // This tag is an MD5 digest of the raw image data. All pixels in the image are processed in row-scan order. Each pixel is zero padded to 16 or 32 bits deep (16-bit for data less than or equal to 16 bits deep, 32-bit otherwise). The data for each pixel is processed in little-endian, byte order.
    "IFD": 1,
    "key": "RawImageDigest",
    "type": 7
  },
  "50973": { // This tag is an MD5 digest of the data stored in the OriginalRawFileData tag.
    "IFD": 1,
    "key": "OriginalRawFileDigest",
    "type": 7
  },
  "50974": { // Normally the pixels within a tile are stored in simple row-scan order. This tag specifies that the pixels within a tile should be grouped first into rectangular blocks of the specified size. These blocks are stored in row-scan order. Within each block, the pixels are stored in row-scan order. The use of a non-default value for this tag requires setting the DNGBackwardVersion tag to at least 1.2.0.0.
    "IFD": 1,
    "key": "SubTileBlockSize",
    "type": 4
  },
  "50975": { // This tag specifies that rows of the image are stored in interleaved order. The value of the tag specifies the number of interleaved fields. The use of a non-default value for this tag requires setting the DNGBackwardVersion tag to at least 1.2.0.0.
    "IFD": 1,
    "key": "RowInterleaveFactor",
    "type": 4
  },
  "50981": { // This tag specifies the number of input samples in each dimension of a default 'look' table. The data for this table is stored in the ProfileLookTableData tag.
    "IFD": 1,
    "key": "ProfileLookTableDims",
    "type": 4
  },
  "50982": { // This tag contains a default 'look' table that can be applied while processing the image as a starting point for user adjustment. This table uses the same format as the tables stored in the ProfileHueSatMapData1 and ProfileHueSatMapData2 tags, and is applied in the same color space. However, it should be applied later in the processing pipe, after any exposure compensation and/or fill light stages, but before any tone curve stage. Each entry of the table contains three 32-bit IEEE floating-point values. The first entry is hue shift in degrees, the second entry is a saturation scale factor, and the third entry is a value scale factor. The table entries are stored in the tag in nested loop order, with the value divisions in the outer loop, the hue divisions in the middle loop, and the saturation divisions in the inner loop. All zero input saturation entries are required to have a value scale factor of 1.0.
    "IFD": 1,
    "key": "ProfileLookTableData",
    "type": 11
  },
  "51008": { // Specifies the list of opcodes that should be applied to the raw image, as read directly from the file.
    "IFD": 1,
    "key": "OpcodeList1",
    "type": 7,
  },
  "51009": { // Specifies the list of opcodes that should be applied to the raw image, just after it has been mapped to linear reference values.
    "IFD": 1,
    "key": "OpcodeList2",
    "type": 7
  },
  "51022": { // Specifies the list of opcodes that should be applied to the raw image, just after it has been demosaiced.
    "IFD": 1,
    "key": "OpcodeList3",
    "type": 7
  },
  "51041": { // NoiseProfile describes the amount of noise in a raw image. Specifically, this tag models the amount of signal-dependent photon (shot) noise and signal-independent sensor readout noise, two common sources of noise in raw images. The model assumes that the noise is white and spatially independent, ignoring fixed pattern effects and other sources of noise (e.g., pixel response non-uniformity, spatially-dependent thermal effects, etc.).
    "IFD": 1,
    "key": "NoiseProfile",
    "type": 12
  }
};

// Text representation for the different tag values
var tagsStringValues = {
  "ExposureProgram" : {
    0 : "Not defined",
    1 : "Manual",
    2 : "Normal program",
    3 : "Aperture priority",
    4 : "Shutter priority",
    5 : "Creative program",
    6 : "Action program",
    7 : "Portrait mode",
    8 : "Landscape mode"
  },
  "MeteringMode" : {
    0 : "Unknown",
    1 : "Average",
    2 : "CenterWeightedAverage",
    3 : "Spot",
    4 : "MultiSpot",
    5 : "Pattern",
    6 : "Partial",
    255 : "Other"
  },
  "LightSource" : {
    0 : "Unknown",
    1 : "Daylight",
    2 : "Fluorescent",
    3 : "Tungsten (incandescent light)",
    4 : "Flash",
    9 : "Fine weather",
    10 : "Cloudy weather",
    11 : "Shade",
    12 : "Daylight fluorescent (D 5700 - 7100K)",
    13 : "Day white fluorescent (N 4600 - 5400K)",
    14 : "Cool white fluorescent (W 3900 - 4500K)",
    15 : "White fluorescent (WW 3200 - 3700K)",
    17 : "Standard light A",
    18 : "Standard light B",
    19 : "Standard light C",
    20 : "D55",
    21 : "D65",
    22 : "D75",
    23 : "D50",
    24 : "ISO studio tungsten",
    255 : "Other"
  },
  "Flash" : {
    0x0000 : "Flash did not fire",
    0x0001 : "Flash fired",
    0x0005 : "Strobe return light not detected",
    0x0007 : "Strobe return light detected",
    0x0009 : "Flash fired, compulsory flash mode",
    0x000D : "Flash fired, compulsory flash mode, return light not detected",
    0x000F : "Flash fired, compulsory flash mode, return light detected",
    0x0010 : "Flash did not fire, compulsory flash mode",
    0x0018 : "Flash did not fire, auto mode",
    0x0019 : "Flash fired, auto mode",
    0x001D : "Flash fired, auto mode, return light not detected",
    0x001F : "Flash fired, auto mode, return light detected",
    0x0020 : "No flash function",
    0x0041 : "Flash fired, red-eye reduction mode",
    0x0045 : "Flash fired, red-eye reduction mode, return light not detected",
    0x0047 : "Flash fired, red-eye reduction mode, return light detected",
    0x0049 : "Flash fired, compulsory flash mode, red-eye reduction mode",
    0x004D : "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
    0x004F : "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
    0x0059 : "Flash fired, auto mode, red-eye reduction mode",
    0x005D : "Flash fired, auto mode, return light not detected, red-eye reduction mode",
    0x005F : "Flash fired, auto mode, return light detected, red-eye reduction mode"
  },
  "SensingMethod" : {
    1 : "Not defined",
    2 : "One-chip color area sensor",
    3 : "Two-chip color area sensor",
    4 : "Three-chip color area sensor",
    5 : "Color sequential area sensor",
    7 : "Trilinear sensor",
    8 : "Color sequential linear sensor"
  },
  "SceneCaptureType" : {
    0 : "Standard",
    1 : "Landscape",
    2 : "Portrait",
    3 : "Night scene"
  },
  "SceneType" : {
    1 : "Directly photographed"
  },
  "CustomRendered" : {
    0 : "Normal process",
    1 : "Custom process"
  },
  "WhiteBalance" : {
    0 : "Auto white balance",
    1 : "Manual white balance"
  },
  "GainControl" : {
    0 : "None",
    1 : "Low gain up",
    2 : "High gain up",
    3 : "Low gain down",
    4 : "High gain down"
  },
  "Contrast" : {
    0 : "Normal",
    1 : "Soft",
    2 : "Hard"
  },
  "Saturation" : {
    0 : "Normal",
    1 : "Low saturation",
    2 : "High saturation"
  },
  "Sharpness" : {
    0 : "Normal",
    1 : "Soft",
    2 : "Hard"
  },
  "SubjectDistanceRange" : {
    0 : "Unknown",
    1 : "Macro",
    2 : "Close view",
    3 : "Distant view"
  },
  "FileSource" : {
    3 : "DSC"
  },
  "Components" : {
    0 : "",
    1 : "Y",
    2 : "Cb",
    3 : "Cr",
    4 : "R",
    5 : "G",
    6 : "B"
  }
};

var makerNotes = [
  {
    tagProfix: 'Reconyx',
    firstEntry: 0,
    // MakerNoteReconyx
    //   00e0: 01 f1  <-- Identifier
    test: function(value) {
      return value === 61697;
    },
    tags: {
      "1" : {
        "key": "FirmwareVersion",
        "type": 3,
        "count": 3,
        format: function(value) {
          return value.join('.');
        }
      },
      "4" : {
        "key": "FirmwareDate",
        "type": 3,
        "count": 2,
        format: function(value) {
          return sprintf('%.4x:%.2x:%.2x', value[0], value[1]>>8, value[1]&0xff);
        }
      },
      "6" : {
        "key": "TriggerMode",
        "type": 2,
        "count": 1,
        format: function(value) {
          return {
            'C': 'CodeLoc Not Entered',
            'E': 'External Sensor',
            'M': 'Motion Detection',
            'T': 'Time Lapse'
          }[value];
        }
      },
      "7" : {
        "key": "Sequence",
        "type": 3,
        "count": 2,
        format: function(value) {
          return value.join(' of ');
        }
      },
      "9" : {
        "key": "EventNumber",
        "type": 3,
        "count": 2,
        format: function(value) {
          return (value[0]<<16) + value[1];
        }
      },
      "11" : {
        "key": "DateTimeOriginal",
        "type": 3,
        "count": 6,
        format: function(value) {
          if (value[0] & 0xff00 && !(value[0] & 0xff)) {
            for(var i = 0; i < value.length; i++) {
              value[i] = (value[i] >> 8) | ((value[i] & 0xff) << 8);
            }
          }
          return vsprintf('%.4d:%.2d:%.2d %.2d:%.2d:%.2d', _.at(value, [5,3,4,2,1,0]));
        }
      },
      "18" : {
        "key": "MoonPhase",
        "type": 3,
        "count": 1,
        format: function(value) {
          return {
            0: 'New',
            1: 'New Crescent',
            2: 'First Quarter',
            3: 'Waxing Gibbous',
            4: 'Full',
            5: 'Waning Gibbous',
            6: 'Last Quarter',
            7: 'Old Crescent'
          }[value];
        }
      },
      "19" : {
        "key": "AmbientTemperatureFahrenheit",
        "type": 8,
        "count": 1,
        format: function(value) {
          return value + ' F';
        }
      },
      "20" : {
        "key": "AmbientTemperature",
        "type": 8,
        "count": 1,
        format: function(value) {
          return value + ' C';
        }
      },
      "36" : {
        "key": "Contrast",
        "type": 3,
        "count": 1
      },
      "37" : {
        "key": "Brightness",
        "type": 3,
        "count": 1
      },
      "38" : {
        "key": "Sharpness",
        "type": 3,
        "count": 1
      },
      "39" : {
        "key": "Saturation",
        "type": 3,
        "count": 1
      },
      "40" : {
        "key": "InfraredIlluminator",
        "type": 3,
        "count": 1,
        format: function(value) {
          return {
            0: 'Off',
            1: 'On'
          }[value];
        }
      },
      "41" : {
        "key": "MotionSensitivity",
        "type": 3,
        "count": 1
      },
      "42" : {
        "key": "BatteryVoltage",
        "type": 3,
        "count": 1,
        format: function(value) {
          return value / 1000 + ' V';
        }
      },
      "43" : {
        "key": "UserLabel",
        "type": 2,
        "count": 22
      },
    }
  }
];

// Mapping between orientation flag values and clockwise rotations in degrees
var orientationDegrees = {
  "1" : 0,
  "2" : 0,
  "3" : 180,
  "4" : 180,
  "5" : 90,
  "6" : 90,
  "7" : 270,
  "8" : 270
};

var rotateImage = function(orientation, degrees) {
  var clockWiseRotation = {
    1: 6, 2: 5,
    3: 8, 4: 7,
    5: 4, 6: 3,
    7: 2, 8: 1
  };
  var counterClockWiseRotation = {
    1: 8, 2: 7,
    3: 6, 4: 5,
    5: 2, 6: 1,
    7: 4, 8: 3
  };
  var steps = Math.abs(Math.ceil(degrees / 90));
  var clockWise = degrees > 0;
  while(steps > 0) {
    orientation = clockWise? clockWiseRotation[orientation] : counterClockWiseRotation[orientation];
    steps--;
  }
  return orientation;
};

var getTagId = function(key) {
  var id;
  Object.keys(tags).forEach(function(tagId) {
    if (tags[tagId].key === key) {
      id = tagId;
    }
  });
  return id;
};

this.JPEG = this.JPEG || {};
this.JPEG.exifSpec = {
  rotateImage: rotateImage,
  orientationDegrees: orientationDegrees,
  getTagId: getTagId,
  tags: tags,
  interOperabilityTags: interOperabilityTags,
  tagTypeSize: tagTypeSize,
  makerNotes: makerNotes
};

}).call(this);
