/**
 * DockIt
 *
 * Zepto and jQuery Plugin to dock / stick any content with advanced options.
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
					scrollDown: false,				// boolean						|	Dock when the element goes out by top
					scrollUp: false,				// boolean						|	Dock when the element goes out by bottom
					dockToTopFrom: false,			// number						|	Dock to top when this value (in px) is reached by scroll
					dockToBottomFrom: false,		// number						|	Dock to bottom when this value (in px) is reached by scroll
					stopDockFrom: false,			// number						|	Stop docking when the scroll is equal to this value (in px) or more
					stopDockBefore: false,			// number						|	Stop docking when the scroll is equal to this value (in px) or less
					marginT: 10,					// number						|	Margin to add on top before docking (on scrollDown)
					marginB: 10,					// number						|	Margin to add on bottom before docking (on scrollUp)
					dockedClass: 'docked',			// string						|	Class name added to the element when is docked
					zIndex: 'auto',					// number or string 'auto'		|	Z-index added to the element when is docked
					onInit: false,					// function						|	Function invoked when the Plugin is turned on
					onStop: false,					// function						|	Function invoked when the Plugin is turned off
					onDock: false,					// function						|	Function invoked when the element is docked
					onUndock: false					// function						|	Function invoked when the element is undocked
				};

			self.opts = $.extend(defaults, opts);

			!self.opts.scrollDown && !self.opts.scrollUp && !self.opts.dockToTopFrom && !self.opts.dockToBottomFrom && (self.opts.scrollDown = true);

			self.touch = 'ontouchstart' in document.documentElement;

			/* Element to dock */
			self.stElt = $(elt);

			/* Clone to keep the space when the element is docked */
			self.stEltClone = self.stElt.clone().css('visibility', 'hidden').hide();

			/* Initial values to reinitialise the element when is undocked */
			self.initialConfig = {
				'position': self.stElt.css('position'),
				'top': self.stElt.css('top'),
				'right': self.stElt.css('right'),
				'bottom': self.stElt.css('bottom'),
				'left': self.stElt.css('left'),
				'margin': self.stElt.css('margin'),
				'z-index': self.stElt.css('z-index')
			};

			/* Reduce the number of functions triggered on resize & scroll */
			self.timeWindow = 40;
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

				if (self.stElt.data('dockAlive')) return;

				self.onResizeContext = function() {
					self.onResize();
				};
				self.onScrollContext = function() {
					self.onScroll();
				};

				self.setDC();

				self.windowHeight = $w.height();

				self.stElt.data('dockAlive', true);
				self.stElt.after(self.stEltClone);
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

				if (!self.stElt.data('dockAlive')) return;

				self.stElt.data('dockAlive', false).removeClass(self.opts.dockedClass);
				self.stEltClone.remove();
				self.dockCss();
				$w.off({
					'resize': self.onResizeContext,
					'scroll': self.onScrollContext
				});
				self.touch && $w.off('touchmove', self.onScrollContext);
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
					self.stElt.css({
						'position': 'fixed',
						'left': self.dynamicConfig.stEltL,
						'right': 'auto',
						'top': scrollDownType ? self.opts.marginT : 'auto',
						'bottom': scrollDownType ? 'auto' : self.opts.marginB,
						'margin': 0,
						'z-index': self.opts.zIndex
					}).addClass(self.opts.dockedClass);
					self.stEltClone.show();
					typeof self.opts.onUndock === 'function' && self.opts.onUndock();
				} else {
					self.stElt.css(self.initialConfig).removeClass(self.opts.dockedClass);
					self.stEltClone.hide();
					typeof self.opts.onDock === 'function' && self.opts.onDock();
				}
			},
			/**
			 * Method to reset the values (position & size) - On init or resize
			 */
			setDC: function() {
				var self = this;
				self.dynamicConfig = {
					stEltL: self.stElt.offset().left,
					stEltT: self.stElt.offset().top,
					stEltH: self.stElt.height(),
					stEltW: self.stElt.width(),
					stEltB: self.stElt.offset().top + self.stElt.height()
				};
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
					} else if ((self.opts.dockToTopFrom !== false && windowScroll >= self.opts.dockToTopFrom) || (self.opts.scrollDown && (windowScroll > (self.dynamicConfig.stEltT - self.opts.marginT)))) {
						self.dockCss('scrollDown');
					} else if ((self.opts.dockToBottomFrom !== false && windowScroll >= self.opts.dockToBottomFrom) || (self.opts.scrollUp && (windowBottom < (self.dynamicConfig.stEltB + self.opts.marginB)))) {
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
					self.windowHeight = $w.height();
					self.dockCss();
					self.setDC();
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
