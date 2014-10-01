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
      src: [ './lib/**/*.js', '!./lib/web/public/**/*.js', '!./lib/web/client/js/app/lib/**/*.js' ]
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
        src: [ './Readme.md', './lib/**/*.js', '!./lib/web/public/**/*.js' ],
        dest: 'doc'
      }
    },
    clean: {
      doc: [ "./doc/" ],
      client: [ './lib/web/public/' ]
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
               './lib/web/client/js/index/index.js' ],

        dest: './lib/web/public/js/index.js'
      },
      app: {
               // libs
        src: [ './bower_components/jquery/dist/jquery.js',
               './bower_components/bootstrap/dist/js/bootstrap.js',
               './bower_components/bootstrap-material-design/scripts/ripples.js',
               './bower_components/bootstrap-material-design/scripts/material.js',
               // angular
               './bower_components/angular/angular.js',
               './bower_components/angular-route/angular-route.js',
               './bower_components/angular-animate/angular-animate.js',
               './bower_components/angular-resource/angular-resource.js',
               // 3rd party angular
               './bower_components/angular-loading-bar/build/loading-bar.js',
               './bower_components/ngActivityIndicator/ngActivityIndicator.js',
               './bower_components/angular-translate/angular-translate.js',
               './bower_components/angular-ui-router/release/angular-ui-router.js',
               // own code
               './lib/web/client/js/app/**/*.js' ],

        dest: './lib/web/public/js/app.js'
      },
      setup: {
        src: [ './bower_components/jquery/dist/jquery.js', './lib/web/client/js/setup/**/*.js' ],
        dest: './lib/web/public/js/setup.js'
      }
    },
    /* Build */
    uglify: {
      options: {
        banner: BANNER
      },
      index: {
        files: {
          './lib/web/public/js/index.js': [ './lib/web/public/js/index.js' ]
        }
      },
      app: {
        files: {
          './lib/web/public/js/app.js': [ './lib/web/public/js/app.js' ]
        }
      },
      setup: {
        files: {
          './lib/web/public/js/setup.js': [ './lib/web/public/js/setup.js' ]
        }
      }
    },
    /* CSS */
    sass: {
      src: {
        files: {
          './lib/web/public/css/style.css': [ './lib/web/client/sass/style.scss' ]
        }
      }
    },
    autoprefixer: {
      src: {
        src: './lib/web/public/css/style.css',
        dest: './lib/web/public/css/style.css'
      }
    },
    cssmin: {
      src: {
        options: {
          banner: BANNER
        },
        files: {
          './lib/web/public/css/style.css': [ './bower_components/bootstrap/dist/css/bootstrap.css',
                                              './bower_components/bootstrap-material-design/css-compiled/material.css',
                                              './bower_components/bootstrap-material-design/css-compiled/ripples.css',
                                              './bower_components/octicons/octicons/octicons.css',
                                              './bower_components/angular/angular-csp.css',
                                              './bower_components/angular-loading-bar/build/loading-bar.css',
                                              './bower_components/ngActivityIndicator/css/ngActivityIndicator.css',
                                              './lib/web/public/css/style.css' ]
        }
      }
    },
    copy: {
      angularViews: {
        expand: true,
        cwd: './lib/web/client/html/',
        src: '*.html',
        dest: './lib/web/public/views/'
      },
      octiconsFont: {
        expand: true,
        cwd: './bower_components/octicons/octicons/',
        src: [ '*.eot', '*.woff', '*.ttf', '*.svg' ],
        dest: './lib/web/public/css/'
      }
    },
    /* Watch */
    watch: {
      options: {
        livereload: true
      },
      htmlViews: {
        files: [ './lib/web/client/html/**/*.html' ],
        tasks: [ 'build-dev-html' ]
      },
      jsIndex: {
        files: [ './lib/web/client/js/index/**/*.js' ],
        tasks: [ 'build-dev-js-index' ]
      },
      jsapp: {
        files: [ './lib/web/client/js/app/**/*.js' ],
        tasks: [ 'build-dev-js-app' ]
      },
      jsSetup: {
        files: [ './lib/web/client/js/setup/**/*.js' ],
        tasks: [ 'build-dev-js-setup' ]
      },

      css: {
        files: [ './lib/web/client/sass/**/*.scss' ],
        tasks: [ 'build-dev-css' ]
      },
      i18n: {
        files: [ './lib/web/client/translations/**/*.js' ],
        tasks: [ 'build-dev-js-i18n' ]
      }
    },
    
    /* Serverside Tests */
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: [ './lib/web/test/**/*.js' ]
      }
    }
  });
  
  grunt.registerTask('default', [ 'lint', 'build' ]);
  grunt.registerTask('dev', [ 'build-dev', 'watch' ]);
  /* Single purpose tasks */
  grunt.registerTask('build-dev', [ 'clean', 'build-dev-html', 'build-dev-js', 'build-dev-css', 'build-once' ]);
  grunt.registerTask('build-dev-html', [ 'copy:angularViews' ]);
  grunt.registerTask('build-dev-js', [ 'build-dev-js-app', 'build-dev-js-index', 'build-dev-js-setup' ]);
  grunt.registerTask('build-dev-js-index', [ 'concat:index' ]);
  grunt.registerTask('build-dev-js-app', [ 'concat:app' ]);
  grunt.registerTask('build-dev-js-setup', [ 'concat:setup' ]);
  grunt.registerTask('build-dev-css', [ 'sass', 'autoprefixer', 'cssmin' ]);
  grunt.registerTask('build-once', [ 'copy:octiconsFont' ]);
  
  grunt.registerTask('build', [ 'clean', 'build-html', 'build-js', 'build-css', 'build-once' ]);
  grunt.registerTask('build-html', [ 'build-dev-html' ]);
  grunt.registerTask('build-js', [ 'build-js-app', 'build-js-index', 'build-js-setup' ]);
  grunt.registerTask('build-js-index', [ 'build-dev-js-index', 'uglify:index' ]);
  grunt.registerTask('build-js-app', [ 'build-dev-js-app', 'uglify:app' ]);
  grunt.registerTask('build-js-setup', [ 'build-dev-js-setup', 'uglify:setup' ]);
  grunt.registerTask('build-css', [ 'build-dev-css' ]);
  
  grunt.registerTask('lint', [ 'jshint' ]);
  grunt.registerTask('test', [ 'env', 'lint', 'build', 'test-pure' ]);
  grunt.registerTask('test-pure', [ 'env', 'mochaTest' ]);
  grunt.registerTask('doc', [ 'jsdoc' ]);
  
};
