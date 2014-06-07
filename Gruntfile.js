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
      src: [ './src/**/*.js', '!./src/web/public/**/*.js', '!./src/web/client/js/app/lib/**/*.js' ]
    },
    env: {
      test: {
        NODE_ENV: 'test'
      }
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
    clean: {
      doc: [ "./doc/" ],
      client: [ './src/web/public/' ]
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
        src: [ './bower_components/cryptojslib/rollups/sha256.js',
               './bower_components/jquery/dist/jquery.js',
               './src/web/client/js/index/index.js' ],

        dest: './src/web/public/js/index.js'
      },
      app: {
        src: [ './bower_components/jquery/dist/jquery.js',
               './bower_components/bootstrap/dist/js/bootstrap.js',
               './bower_components/angular/angular.js',
               './bower_components/angular-route/angular-route.js',
               './bower_components/angular-animate/angular-animate.js',
               './bower_components/angular-resource/angular-resource.js',
               './src/web/client/js/app/**/*.js' ],

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
      },
      templates: {
        files: {
          './src/web/public/js/templates.js': [ './src/web/public/js/templates.js' ]
        }
      }
    },
    /* CSS */
    sass: {
      src: {
        files: {
          './src/web/public/css/style.css': [ './src/web/client/sass/style.scss' ]
        }
      }
    },
    autoprefixer: {
      src: {
        src: './src/web/public/css/style.css',
        dest: './src/web/public/css/style.css'
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
    copy: {
      angularViews: {
        expand: true,
        cwd: './src/web/client/html/',
        src: '*.html',
        dest: './src/web/public/views/'
      }
    },
    /* Watch */
    watch: {
      options: {
        livereload: true
      },
      htmlViews: {
        files: [ './src/web/client/html/**/*.html' ],
        tasks: [ 'build-dev-html' ]
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
        tasks: [ 'build-dev-css' ]
      },
      i18n: {
        files: [ './src/web/client/translations/**/*.js' ],
        tasks: [ 'build-dev-js-i18n' ]
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
  grunt.registerTask('build-dev', [ 'clean', 'build-dev-html', 'build-dev-js', 'build-dev-css' ]);
  grunt.registerTask('build-dev-html', [ 'copy:angularViews' ]);
  grunt.registerTask('build-dev-js', [ 'build-dev-js-app', 'build-dev-js-index' ]);
  grunt.registerTask('build-dev-js-index', [ 'concat:index' ]);
  grunt.registerTask('build-dev-js-app', [ 'concat:app' ]);
  grunt.registerTask('build-dev-css', [ 'sass', 'autoprefixer', 'cssmin' ]);
  
  grunt.registerTask('build', [ 'clean', 'build-html', 'build-js', 'build-css' ]);
  grunt.registerTask('build-html', [ 'build-dev-html' ]);
  grunt.registerTask('build-js', [ 'build-js-app', 'build-js-index' ]);
  grunt.registerTask('build-js-index', [ 'build-dev-js-index', 'uglify:index' ]);
  grunt.registerTask('build-js-app', [ 'build-dev-js-app', 'uglify:app' ]);
  grunt.registerTask('build-css', [ 'build-dev-css' ]);
  
  grunt.registerTask('lint', [ 'jshint' ]);
  grunt.registerTask('test', [ 'env', 'lint', 'build', 'test-pure' ]);
  grunt.registerTask('test-pure', [ 'env', 'mochaTest' ]);
  grunt.registerTask('doc', [ 'jsdoc' ]);
  
};
