$(function() {
	'use strict';

	var $window = $(window),
		$body = $(document.body),

		viewportHeightManager = {

			_adjustableHeightElements: [],
			_started: false,

			_adjustElementsToViewportHeight: function () {
				var viewportHeight = $window.height();
				
				$.each(this._adjustableHeightElements, function (i, $el) {
					var initialHeight = $el.data('initialHeight');

					// set initial height
					if (!initialHeight) {
						initialHeight = $el.outerHeight();

						$el.data('initialHeight', initialHeight);
					}

					// update height
					if (!$el.hasClass('ignore-viewport-height') && initialHeight < viewportHeight) {
						$el.height(viewportHeight);
					}
				});
			},

			add: function (selector) {
				this._adjustableHeightElements.push($(selector));

				return this;
			},

			start: function () {
				if (this._started) {
					return this;
				}

				$window.on('resize', this._adjustElementsToViewportHeight.bind(this));
				this._adjustElementsToViewportHeight();
				this._started = true;

				return this;
			}
		},

		decentralizationNetwork = {
			_graph: null,
			_springy: null,
			_updateTimeout: null,

			props: {
				maxNodes: 8,
				updateTimeoutDelay: 128,
				updateTimeoutCompleteDelay: 2048
				/*width: 200,
				height: 200*/
			},

			init: function () {
				this._graph = new Springy.Graph();

				this._$canvas = $('.feature-image.decentralization');

				this._springy = this._$canvas.springy({
					graph: this._graph,
					stiffness: 300.0,
					repulsion: 300.0,
					damping: 0.25,
					nodeRadius: 6,
					canvasPaddingPercent: 0.2,
					nodeColor: '#fff',// '#f0f0f0',
					nodeStrokeColor: '#6B6B6B',// '#3C3C3C',
					nodeStrokeWeight: 1.5,
					edgeColor: '#6B6B6B'
				});

				this.randomizeGraph();
				this.createUpdateTimeout();

				this.setupOnResize();
				this.updateCanvasDimensions();
			},

			setupOnResize: function () {
				var _this = this;

				$window.on('resize', function () {
					_this.updateCanvasDimensions();
				});
			},

			updateCanvasDimensions: function () {
				var height = this._$canvas.closest('div.feature').outerHeight();

				this._$canvas
					.attr('height', height)
					.attr('width', height)
			},

			createUpdateTimeout: function () {
				var _this = this;

				this._updateTimeout = setTimeout(function () {
					_this.randomizeGraph();
					_this.createUpdateTimeout();
				}, this.props.updateTimeoutDelay);
			},

			addNode: function () {
				var edges = this.getEdges();
				var node = this._graph.newNode({
					label: this._graph.nodes.length + ''
				});
				
				if (edges.length) {
					for (var i = 0; i < edges.length; i++) {
						this._graph.newEdge(node, edges[i], {
							weight: 0.25
						});
					}
				}
			},

			getEdges: function () {
				if (!this._graph.nodes.length) {
					return [];
				}

				var edges = Math.min(this._graph.nodes.length, Math.ceil(Math.random() * 3));
				
				//+ Jonas Raoni Soares Silva
				//@ http://jsfromhell.com/array/shuffle [v1.0]
				var shuffle = function shuffle(o){ //v1.0
					for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
					return o;
				};

				return (shuffle(this._graph.nodes.slice())).splice(0, edges);
			},

			removeNode: function () {
				var node = this._graph.nodes.shift();
				var connectedNodeIds = [];

				this._graph.removeNode(node);
				
				// collect connected node ids
				for (var i = 0, l = this._graph.edges.length; i < l; i++) {
					var edge = this._graph.edges[i];
					
					if (connectedNodeIds.indexOf(edge.source.id) === -1) {
						connectedNodeIds.push(edge.source.id);
					}

					if (connectedNodeIds.indexOf(edge.target.id) === -1) {
						connectedNodeIds.push(edge.target.id);
					}
				}

				for (var j = 0, m = this._graph.nodes.length; j < m; j++) {
					var n = this._graph.nodes[j];

					if (n && connectedNodeIds.indexOf(n.id) === -1) {
						this._graph.removeNode(n);
					}
				}

			},

			randomizeGraph: function () {
				if (this._graph.nodes.length < this.props.maxNodes) {
					this.addNode();
				} 
				else {
					if (this.props.updateTimeoutDelay < this.props.updateTimeoutCompleteDelay) {
						this.props.updateTimeoutDelay += this.props.updateTimeoutDelay / 4;	
					}

					var rand = Math.random();
					if (this._graph.nodes.length < this.props.maxNodes && rand >= 0.5) {
						this.addNode();
					}
					else {
						this.removeNode();
					}
				}
			},
		},

		downloadManager = (function () {
			var _iframe = null,
				download = function (url) {
					if (_iframe === null) {
						_iframe = document.createElement('iframe');
						_iframe.style.display = 'none';

						document.body.appendChild(_iframe);
					}

					_iframe.src = url;
				};

				// download & success message handling
				$('#download-button').on('click', function (e) {
					var $downlodStarted = $('#download-started');
					e.preventDefault();

					download(e.target.href);

					$('.row', $downlodStarted).removeAttr('style').addClass('ignore-viewport-height', true);

					$downlodStarted.show();
					$('#download > .download').hide();

					return false;
				});
		}()),

		newsletterManager = {

			_$form: null,
			_$root: null,

			createPopover: function (message, className) {
				var _this = this;

				_this._$form
					.popover({
						html : true,
						content: message,
						placement: 'bottom',
						trigger: 'manual'
					}).popover('show')
						.data('bs.popover')
						.tip()
							.addClass('has-icon ' + className)
							.skOuterClick(function () {
								_this._$form.popover('hide');
							});
			},

			openPopover: function (message, className) {
				var _this = this;

				if (_this._$form.data('bs.popover')) {
					_this._$form.popover('hide').popover('destroy');
				}

				_this.createPopover(message, className);
			},

			init: function (mainSelector) {
				var _this = this;
				
				_this._$root = $(mainSelector),
				_this._$form = $('form', _this._$root).ajaxChimp({
					callback: function (response) {
						if (response.result === 'success') {
							_this._$form.find('input.email').val()
						}

						_this.openPopover(response.msg, response.result);
					}
				});
			}
		},

		scrollToTopManager = (function () {
			var offset = 220;
			var duration = 500;
			var $backToTop = $('.back-to-top');

			$window.on('scroll', function() {
				var $this = $(this);

				if ($this.scrollTop() > offset) {
					$backToTop.fadeIn(duration);
				} else {
					$backToTop.fadeOut(duration);
				}
			});
			
			$backToTop
				.on('click', function(event) {
					event.preventDefault();
					$('html, body').animate({ scrollTop: 0 }, duration);
					return false;
				});
		}()),

		initFeatureAni = function (selector) {
			$('.feature img.' + selector).waypoint({
				offset: 'bottom-in-view',
				handler: function(direction) {
					var src;

					if (direction !== 'down') {
						return;
					}

					src = this.src.split('?');
					this.src = src[0] + '?x=' + Date.now();
				}
			});
		};

	if ($body.hasClass('is-home')) {
		newsletterManager.init('#newsletter-form');

		viewportHeightManager
			.add('.main-section')
			.add('.download-section .row')
			.start();

		decentralizationNetwork.init();
	}
	else {
		$('.page-header a.logo-link').tooltip({
			delay: {
				show: 500,
				hide: 100
			}
		});
	}

	$.localScroll();

	$window.on('load', function () {
		var hash = window.location.hash;
		if (hash && hash.indexOf('#') === 0) {
			// reset default browser scroll position
			$(window).scrollTop(0);
			$.scrollTo($(hash));
		}
	});

	$('#main-download-button').on('click', function () {
		$(this).blur();
		$('#download-button').click();
	});

	$('.feature .anonymity-animation').waypoint({
		offset: 'bottom-in-view',
		handler: function(direction) {
			var $this = $(this).removeClass('up down').addClass(direction);
		}
	});

	initFeatureAni('search');

	// clean up title tags
	$('[title]').attr('title', '');

	// add target=_blank to all external links
	$window.on('load', function () {
		$('a[href^="http://"]').add('a[href^="https://"]').not('a[href*="' + window.location.host + '"]').attr('target','_blank');
	});
});