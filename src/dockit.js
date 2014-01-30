/**
 * DockIt v1.0.2
 * January 2014
 * Zepto and jQuery Plugin to dock (or stick) any content with advanced options
 * Copyright (c) 2014 Nicolas Escoffier
 * @OxyDesign
 */
(function($) {
	'use strict';

	var pluginName = 'dockIt';

	$[pluginName] = (function(w) {

		var $w = $(w);

		/**
		 * Plugin Constructor
		 * @param  {Object} DOM element
		 * @param  {Object} List of options to set the plugin
		 * @return {Object}
		 */
		$[pluginName] = function(elt, opts) {
			var self = this,
				defaults = {
					scrollDown: false, //           boolean                     |  Dock when the element goes out by top
					scrollUp: false, //             boolean                     |  Dock when the element goes out by bottom
					dockToTopFrom: false, //        number                      |  Dock to top when this value (in px) is reached by scroll
					dockToBottomFrom: false, //     number                      |  Dock to bottom when this value (in px) is reached by scroll
					stopDockFrom: false, //         number                      |  Stop docking when the scroll is equal to this value (in px) or more
					stopDockBefore: false, //       number                      |  Stop docking when the scroll is equal to this value (in px) or less
					marginT: 10, //                 number                      |  Margin to add on top before docking (on scrollDown)
					marginB: 10, //                 number                      |  Margin to add on bottom before docking (on scrollUp)
					dockedClass: 'docked', //       string                      |  Class name added to the element when is docked
					zIndex: 'auto', //              number or string 'auto'     |  Z-index added to the element when is docked
					onInit: false, //               function                    |  Function invoked when the Plugin is turned on
					onStop: false, //               function                    |  Function invoked when the Plugin is turned off
					onDock: false, //               function                    |  Function invoked when the element is docked
					onUndock: false //              function                    |  Function invoked when the element is undocked
				};

			self.opts = $.extend({}, defaults, opts);

			!self.opts.scrollDown && !self.opts.scrollUp && !self.opts.dockToTopFrom && !self.opts.dockToBottomFrom && (self.opts.scrollDown = true);

			self.touch = 'ontouchstart' in document.documentElement;

			/* Element to dock */
			self.dockElt = $(elt);

			/* Clone to keep the space when the element is docked */
			self.dockEltClone = self.dockElt.clone().css('visibility', 'hidden');

			/* Reduce the number of functions triggered on resize & scroll */
			self.timeWindow = 10;
			self.lastExecutionResize = new Date((new Date()).getTime() - self.timeWindow);
			self.lastExecutionScroll = new Date((new Date()).getTime() - self.timeWindow);

			return self.initDock();
		};

		/**
		 * Plugin Prototype
		 * @type {Object}
		 */
		$[pluginName].prototype = {
			/**
			 * Method to initialise / turn on the plugin
			 */
			initDock: function() {
				var self = this;

				if (self.dockElt.data(pluginName + 'Alive')) return;

				self.onResizeContext = function() {
					self.onResize();
				};
				self.onScrollContext = function() {
					self.onScroll();
				};

				self.dockElt.data(pluginName + 'Alive', true);
				self.dockElt.after(self.dockEltClone.hide());
				self.setConfig();
				self.onScroll();
				$w.on({
					'resize': self.onResizeContext,
					'scroll': self.onScrollContext
				});
				self.touch && $w.on('touchmove', self.onScrollContext);

				typeof self.opts.onInit === 'function' && self.opts.onInit();
			},
			/**
			 * Method to turn off the plugin
			 */
			stopDock: function() {
				var self = this;

				if (!self.dockElt.data(pluginName + 'Alive')) return;

				$w.off({
					'resize': self.onResizeContext,
					'scroll': self.onScrollContext
				});
				self.touch && $w.off('touchmove', self.onScrollContext);
				self.dockElt.data(pluginName + 'Alive', false).removeClass(self.opts.dockedClass);
				self.setConfig();
				self.dockCss();
				self.dockEltClone.remove();
				typeof self.opts.onStop === 'function' && self.opts.onStop();
			},

			/**
			 * Method to dock/undock the element
			 * @param  {String} Type of docking - 'scrollDown' to dock to top, 'scrollUp' to dock to bottom, empty to set default values
			 */
			dockCss: function(type) {
				var self = this,
					scrollDownType = type === 'scrollDown';

				if (type) {
					self.dockElt.css({
						'position': 'fixed',
						'top': scrollDownType ? self.opts.marginT : 'auto',
						'right': 'auto',
						'bottom': scrollDownType ? 'auto' : self.opts.marginB,
						'left': self.calcConfig.dockEltL,
						'height': self.calcConfig.dockEltH,
						'width': self.calcConfig.dockEltW,
						'margin': 0,
						'z-index': self.opts.zIndex
					}).addClass(self.opts.dockedClass);
					self.dockEltClone.show();
					typeof self.opts.onUndock === 'function' && self.opts.onUndock();
				} else {
					self.dockElt.css(self.cssConfig).removeClass(self.opts.dockedClass);
					self.dockEltClone.hide();
					typeof self.opts.onDock === 'function' && self.opts.onDock();
				}
			},
			/**
			 * Method to reset the values (position & size) - On init or resize
			 */
			setConfig: function() {
				var self = this,
					cloneHidden = self.dockEltClone.css('display') === 'none';

				if (cloneHidden) {
					self.dockEltClone.show();
					self.dockElt.hide();
				}

				self.windowHeight = $w.height();

				self.cssConfig = {
					'position': self.dockEltClone.css('position'),
					'top': self.dockEltClone.css('top'),
					'right': self.dockEltClone.css('right'),
					'bottom': self.dockEltClone.css('bottom'),
					'left': self.dockEltClone.css('left'),
					'height': self.dockEltClone.css('height'),
					'width': self.dockEltClone.css('width'),
					'margin': self.dockEltClone.css('margin'),
					'z-index': self.dockEltClone.css('z-index')
				};

				self.calcConfig = {
					dockEltL: self.dockEltClone.offset().left,
					dockEltT: self.dockEltClone.offset().top,
					dockEltH: self.dockEltClone.height(),
					dockEltW: self.dockEltClone.width(),
					dockEltB: self.dockEltClone.offset().top + self.dockEltClone.height()
				};

				if (cloneHidden) {
					self.dockEltClone.hide();
					self.dockElt.show();
				}
			},

			/**
			 * Method executed on scroll event
			 * @return {Object} - Self executed function
			 */
			onScroll: function() {
				var self = this;

				var onScroll = function() {
					var windowScroll = $w.scrollTop(),
						windowBottom = self.windowHeight + windowScroll;

					if ((self.opts.stopDockFrom !== false && windowScroll >= self.opts.stopDockFrom) || (self.opts.stopDockBefore !== false && windowScroll <= self.opts.stopDockBefore)) {
						self.dockCss();
					} else if ((self.opts.dockToTopFrom !== false && windowScroll >= self.opts.dockToTopFrom) || (self.opts.scrollDown && (windowScroll > (self.calcConfig.dockEltT - self.opts.marginT)))) {
						self.dockCss('scrollDown');
					} else if ((self.opts.dockToBottomFrom !== false && windowScroll >= self.opts.dockToBottomFrom) || (self.opts.scrollUp && (windowBottom < (self.calcConfig.dockEltB + self.opts.marginB)))) {
						self.dockCss('scrollUp');
					} else {
						self.dockCss();
					}
				};

				return {
					bind: (function() {
						if (!(self.lastExecutionScroll instanceof Date) || ((self.lastExecutionScroll.getTime() + self.timeWindow) <= (new Date()).getTime())) {
							self.lastExecutionScroll = new Date();
							return onScroll.apply(this, arguments);
						}
					}())
				};

			},
			/**
			 * Method executed on resize event
			 * @return {Object} - Self executed function
			 */
			onResize: function() {
				var self = this;

				var onResize = function() {
					self.setConfig();
					self.onScroll();
				};

				return {
					bind: (function() {
						if ((self.lastExecutionResize.getTime() + self.timeWindow) <= (new Date()).getTime()) {
							self.lastExecutionResize = new Date();
							self.lastExecutionScroll = false;
							return onResize.apply(this, arguments);
						}
					}())
				};

			}
		}

		return $[pluginName];

	}(window));


	$.fn[pluginName] = function(params) {
		return this.each(function() {
			if (!$(this).data(pluginName)) {
				$(this).data(pluginName, new $[pluginName](this, params));
			} else {
				var $plugin = $(this).data(pluginName);
				switch (params) {
					case 'initDock':
						$plugin.initDock();
						break;
					case 'stopDock':
						$plugin.stopDock();
						break;
					default:
						if (typeof params === 'object') $plugin.initDock();
				}
			}
		});
	};

})(window.Zepto || window.jQuery);
