module.exports = function(config) {
  config.set({

    frameworks: ['jasmine', 'chai'],

    files: [

      // Deps
      {
        pattern: 'dependencies/lodash/dist/lodash.js',
        watched: false,
        included: true,
        served: true
      },

      // Src
      'jpeg.js',

      // Tests
      'test/js/**/*.js',

      // Test Data
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
