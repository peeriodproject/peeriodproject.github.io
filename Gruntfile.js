module.exports = function (grunt) {

	grunt.initConfig({
		uglify: {
			dist: {
				files: {
					'assets/javascripts/dist.min.js': [
						'./bower_components/jquery/dist/jquery.min.js',
						'./bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tooltip.js',
						'./bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/popover.js',
						'./bower_components/retina.js/dist/retina.min.js',
						'./bower_components/springy/springy.js',
						'./bower_components/jquery.scrollTo/jquery.scrollTo.min.js',
						'./bower_components/jquery.localScroll/jquery.localScroll.min.js',
						'./bower_components/jquery-waypoints/waypoints.min.js',
						'./bower_components/ajaxchimp/jquery.ajaxchimp.min.js',
						'./assets/javascripts/springyui.js',
						'./assets/javascripts/jquery.skOuterClick.js',
						'./assets/javascripts/main.js'
					]
				}
			}
		},
		compass: {
			dist: {
				options: {
					sassDir: '_sass',
					cssDir: 'assets/stylesheets',
					specify: '_sass/main.scss',
					environment: 'production',
					outputStyle: 'compressed'
				}
			},
			dev: {
				options: {
					sassDir: '_sass',
					cssDir: 'assets/stylesheets',
					specify: '_sass/main.scss',
				}
			}
		},
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-compass');

	grunt.registerTask('default', [
		'uglify:dist',
		'compass:dist'
	]);
};