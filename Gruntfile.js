module.exports = function(grunt) {
  
  // track time spent doing specific tasks
  require('time-grunt')(grunt);
  // load all grunt modules
  require('load-grunt-tasks')(grunt);
  
  var BANNER = "/*! <%= pkg.name %> v<%= pkg.version %> - Copyright (c) 2014 Sören Gade - see <%= pkg.repository.url %> */";
  
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
        src: [ './Readme.md', './src/**/*.js', '!./src/web/public/**/*.js' ],
        dest: 'doc'
      }
    },
    
    /*
     * ==========
     * Webserver
     * ==========
     * */
    /* Dev */
    concat: {
      options: {
        banner: BANNER
      },
      index: {
        src: [ './bower_components/cryptojslib/rollups/sha256.js', './bower_components/jquery/dist/jquery.js', './src/web/client/js/index/index.js' ],
        dest: './src/web/public/js/index.js'
      },
      app: {
        src: [ './bower_components/jquery/dist/jquery.js', './bower_components/bootstrap/dist/js/bootstrap.js', './bower_components/handlebars/handlebars.js', './bower_components/ember/ember.js', './bower_components/ember-data/ember-data.js', './src/web/client/js/app/**/*.js' ],
        dest: './src/web/public/js/app.js'
      }
    },
    /* Build */
    uglify: {
      options: {
        sourceMap: true,
        banner: BANNER
      },
      index: {
        files: {
          './src/web/public/js/index.js': [ './src/web/public/js/index.js' ]
        }
      },
      app: {
        files: {
          './src/web/public/js/app.js': [ './src/web/public/js/app.js' ]
        }
      }
    },
    sass: {
      src: {
        files: {
          './src/web/public/css/style.css': [ './src/web/client/sass/style.scss' ]
        }
      }
    },
    cssmin: {
      src: {
        options: {
          banner: BANNER
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
      
      jsIndex: {
        files: [ './src/web/client/js/index/**/*.js' ],
        tasks: [ 'build-dev-js-index' ]
      },
      jsapp: {
        files: [ './src/web/client/js/app/**/*.js' ],
        tasks: [ 'build-dev-js-app' ]
      },
      
      css: {
        files: [ './src/web/client/sass/**/*.scss' ],
        tasks: [ 'build-css' ]
      }
    },
    /* Serverside Tests */
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['src/web/test/**/*.js']
      }
    }
  });
  
  grunt.registerTask('default', [ 'lint', 'build' ]);
  grunt.registerTask('dev', [ 'build-dev', 'watch' ]);
  /* Single purpose tasks */
  grunt.registerTask('build-dev', [ 'build-dev-js', 'build-css' ]);
  grunt.registerTask('build-dev-js', [ 'build-dev-js-app', 'build-dev-js-index' ]);
  grunt.registerTask('build-dev-js-index', [ 'concat:index' ]);
  grunt.registerTask('build-dev-js-app', [ 'concat:app' ]);
  
  grunt.registerTask('build', [ 'build-js' ]);
  grunt.registerTask('build-js', [ 'build-js-app', 'build-js-index' ]);
  grunt.registerTask('build-js-index', [ 'build-dev-js-index', 'uglify:index' ]);
  grunt.registerTask('build-js-app', [ 'build-dev-js-app', 'uglify:app' ]);
  grunt.registerTask('build-css', [ 'sass', 'cssmin' ]);
  
  grunt.registerTask('lint', [ 'jshint' ]);
  grunt.registerTask('test', [ 'lint', 'mochaTest' ]);  
  grunt.registerTask('doc', [ 'jsdoc' ]);
  
};
