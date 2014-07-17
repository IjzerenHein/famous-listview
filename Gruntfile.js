/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Task configuration.
    eslint: {
      options: {
        config: '.eslintrc'
      }
      //target: ['<%= config.app %>/src/**/**.js']
    },
    jscs: {
        //src: ['<%= config.app %>/src/**/**.js', 'Gruntfile.js'],
        options: {
            config: '.jscsrc'
        }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    jsdoc2md: {
      separateOutputFilePerInput: {
        options: {
          index: true
        },
        files: [
            { src: 'ListView.js', dest: 'docs/ListView.md' }
        ]
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-eslint');
  grunt.loadNpmTasks('grunt-contrib-jscs');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-jsdoc-to-markdown');

  // Default task.
  grunt.registerTask('default', ['eslint', 'jscs', 'jsdoc2md', 'qunit']);
};
