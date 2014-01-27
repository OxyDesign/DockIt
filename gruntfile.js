module.exports = function(grunt) {

  grunt.initConfig({
    project: {
      name: "dockit"
    },
    uglify: {
      def : {
        files:
          {
            '<%= project.name %>.min.js' : 'src/<%= project.name %>.js'
          }
        }
    },
    watch: {
      def: {
        files: [
          'src/*.js'
        ]
      , tasks: [
          'uglify'
        ]
      , options : {
          spawn : false,
          livereload: {
            port: 9000
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-newer');

  grunt.registerTask('default', ['watch:def']);
  grunt.registerTask('js-task', ['uglify']);
};