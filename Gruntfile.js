module.exports = function(grunt) {
  
  // track time spent doing specific tasks
  require('time-grunt')(grunt);
  // load all grunt modules
  require('load-grunt-tasks')(grunt);
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    /*
     * ==========
     * Test
     * ==========
     * */
    jshint: {
      self: [ './*.js', './*.json' ],
      src: [ './src/**/*.js', '!./src/web/public/**/*.js' ]
    },
    
    /*
     * ==========
     * Documentation
     * ==========
     * */
    jsdoc: {
      src: {
        src: [ './src/**/*.js' ],
        dest: 'doc'
      }
    },
    
    /*
     * ==========
     * Webserver
     * ==========
     * */
    /* Build */
    uglify: {
      src: {
        options: {
          sourceMap: true
        },
        files: {
          './src/web/public/js/index.js': [ './bower_components/jquery/dist/jquery.js', './src/web/src/js/index/index.js' ],
          './src/web/public/js/app.js': [ './bower_components/jquery/dist/jquery.js', './bower_components/handlebars/handlebars.js', './bower_components/ember/ember.js', /* './bower_components/ember-data/ember-data.js', */'./src/web/src/js/app/**/*.js' ]
        }
      }
    },
    sass: {
      src: {
        files: {
          './src/web/public/css/style.css': [ './src/web/src/sass/style.scss' ]
        }
      }
    },
    cssmin: {
      src: {
        options: {
          
        },
        files: {
          './src/web/public/css/style.css': [ './bower_components/bootstrap/dist/css/bootstrap.css', './bower_components/bootflatv2/bootflat/css/bootflat.css', './src/web/public/css/style.css' ]
        }
      }
    },
    /* Watch */
    watch: {
      options: {
        livereload: true
      },
      
      js: {
        files: [ './src/web/src/js/**/*.js' ],
        tasks: [ 'build-js' ]
      },
      css: {
        files: [ './src/web/src/sass/**/*.scss' ],
        tasks: [ 'build-css' ]
      }
    }
  });
  
  grunt.registerTask('default', [ 'test', 'build' ]);
  grunt.registerTask('dev', [ 'default', 'watch' ]);
  /* Single purpose tasks */
  grunt.registerTask('test', [ 'jshint' ]);
  grunt.registerTask('build', [ 'build-js', 'build-css' ]);
  grunt.registerTask('build-js', [ 'uglify' ]);
  grunt.registerTask('doc', [ 'jsdoc' ]);
  grunt.registerTask('build-css', [ 'sass', 'cssmin' ]);
  
};
