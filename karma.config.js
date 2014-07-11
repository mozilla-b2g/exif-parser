module.exports = function(config) {
  config.set({

    frameworks: ['jasmine', 'chai'],

    files: [
      'jpeg.js',
      'test/js/**/*.js',

      {
        pattern: 'test/data/*.js',
        watched: true,
        included: true,
        served: true
      },

      {
        pattern: 'test/data/**/*.{jpg,jpeg,JPG,JPEG}',
        watched: true,
        included: false,
        served: true
      }


    ],

		// generate js files from html templates
		preprocessors : {
      'assets/templates/**/*.html': ['ng-html2js']
    },

    browsers: ['Chrome'],

    plugins: [
      'karma-jasmine',
      'karma-chai',
      'karma-chrome-launcher'
    ]
  });
};
