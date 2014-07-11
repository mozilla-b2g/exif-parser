  module.exports = function(grunt) {
    "use strict";

    // Project configuration.
    grunt.initConfig({
      watch: {
        options : {
          atBegin: true
        },
        test: {
          files: [
            'src/**/*.js',
            'lib/**/*.js'
          ],
          tasks: ['default']
        },
      },
      jshint: {
        options: {
          jshintrc: 'src/.jshintrc'
        },
        gruntfile: {
          src: 'Gruntfile.js'
        },
        src: {
          src: ['src/*.js']
        }
      },
      pkg: grunt.file.readJSON('package.json'),
      banner: '/**\n' +
              '* <%= pkg.name %>.js v<%= pkg.version %> by @dmarcos \n' +
              '* Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
              '* <%= _.pluck(pkg.licenses, "url").join(", ") %>\n' +
              '*/\n',
      uglify: {
        options: {
          report: 'gzip'
        },
        jpegjs: {
          files: {
            'jpeg.min.js': [
              'lib/blob_view.js',
              'src/canvasToBlob.js',
              'src/exifSpec.js',
              'src/jpegSpec.js',
              'src/jfifParser.js',
              'src/exifParser.js',
              'src/jpegParser.js'
            ]
          }
        }
      },
      concat: {
        options: {
          banner: '<%= banner %><%= jqueryCheck %>',
          stripBanners: false
        },
        jpegjs: {
          src: [
            'dependencies/sprintf/src/sprintf.js',
            'lib/blob_view.js',
            'src/canvasToBlob.js',
            'src/exifSpec.js',
            'src/jpegSpec.js',
            'src/jfifParser.js',
            'src/exifParser.js',
            'src/jpegParser.js'
          ],
          dest: 'jpeg.js'
        }
      },
      karma: {
        unit: {
          configFile: 'karma.config.js'
        }
      }


    });

    // Load NPM Grunt Tasks
    require('load-grunt-tasks')(grunt);

    // Default task.
    grunt.registerTask('default', ['jshint', 'concat']);
    grunt.registerTask('test', ['karma']);
    grunt.registerTask('dist', ['default', 'uglify']);

  };
