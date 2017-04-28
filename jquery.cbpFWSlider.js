/**
 * jquery.cbpFWSlider.js v2.0.0
 * http://tympanus.net/codrops/?p=13665
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
;( function($) {

	'use strict';

	var logError = function(message) {
		console.error(message);
	};

	$.fn.CBPFWSlider = function(options, element) {
		this.$el = $(element);
		this._init(options);
	};

	// the options
	$.fn.CBPFWSlider.defaults = {
		// default transition speed (ms)
		speed : 500,
		// default transition easing
		easing : 'ease',
		start: 0
	};

	$.fn.CBPFWSlider.prototype = {
		_init : function(options) {
			// options
			this.options = $.extend(true, {}, $.fn.CBPFWSlider.defaults, options);
			// cache some elements and initialize some variables
			this._config();
			// initialize/bind the events
			this._initEvents();
		},

		_config : function() {
			// the list of items
			this.$list = this.$el.children('ul:first');
			// the items (li elements)
			this.$items = this.$list.children('li');
			// total number of items
			this.itemsCount = this.$items.length;

			this.transEndEventName = 'transitionend.cbpFWSlider';
			this.transformName = 'transform';

			// current and old item´s index
			this.current = this.options.start < 0 ? 0 : this.options.start > (this.itemsCount-1) ? (this.itemsCount-1) : this.options.start;
			this.old = 0;
			// check if the list is currently moving
			this.isAnimating = false;
			// the list (ul) will have a width of 100% x itemsCount
			this.$list.css('width', 100 * this.itemsCount + '%');

			// apply the transition
			this.$list.css('transition', this.transformName + ' ' + this.options.speed + 'ms ' + this.options.easing);

			// each item will have a width of 100 / itemsCount
			this.$items.css('width', 100 / this.itemsCount + '%');
			// add navigation arrows and the navigation dots if there is more than 1 item
			if(this.itemsCount > 1) {
				// add navigation arrows (the previous arrow is not shown initially):
				this.$navPrev = $($.parseHTML('<span class="cbp-fwprev">&lsaquo;</span>').shift()).hide();
				this.$navNext = $($.parseHTML('<span class="cbp-fwnext">&rsaquo;</span>').shift());
				$($.parseHTML('<nav/>').shift()).append(this.$navPrev, this.$navNext).appendTo(this.$el);
				// add navigation dots
				var dots = '';
				for(var i = 0; i < this.itemsCount; ++i) {
					// current dot will have the class cbp-fwcurrent
					var dot = i === this.current ? '<span class="cbp-fwcurrent"></span>' : '<span></span>';
					dots += dot;
				}
				var navDots = $($.parseHTML('<div class="cbp-fwdots"/>').shift()).append($.parseHTML(dots)).appendTo(this.$el);
				this.$navDots = navDots.children('span');
			}
		},

		_initEvents : function() {
			var self = this;
			if(this.itemsCount > 1) {
				this.$navPrev.on('click.cbpFWSlider', $.proxy(this._navigate, this, 'previous'));
				this.$navNext.on('click.cbpFWSlider', $.proxy(this._navigate, this, 'next'));
				this.$navDots.on('click.cbpFWSlider', function() {
					self._jump($(this).index());
				});
			}
			this._slide();
		},

		_navigate : function(direction) {
			// do nothing if the list is currently moving
			if(this.isAnimating) return false;

			this.isAnimating = true;
			// update old and current values
			this.old = this.current;
			if(direction === 'next' && this.current < this.itemsCount - 1) {
				++this.current;
			} else if(direction === 'previous' && this.current > 0) {
				--this.current;
			}

			// slide
			this._slide();
		},

		_slide : function() {
			// check which navigation arrows should be shown
			this._toggleNavControls();
			// translate value
			var translateVal = -1 * this.current * 100 / this.itemsCount;
			this.$list.css('transform', 'translate3d(' + translateVal + '%,0,0)');

			var transitionendfn = $.proxy(function() {
				this.isAnimating = false;
			}, this);
			this.$list.on(this.transEndEventName, $.proxy(transitionendfn, this));
		},

		_toggleNavControls : function() {
			// if the current item is the first one in the list, the left arrow is not shown
			// if the current item is the last one in the list, the right arrow is not shown
			switch(this.current) {
				case 0 : this.$navNext.show(); this.$navPrev.hide(); break;
				case this.itemsCount - 1 : this.$navNext.hide(); this.$navPrev.show(); break;
				default : this.$navNext.show(); this.$navPrev.show(); break;
			}
			// highlight navigation dot
			this.$navDots.eq(this.old).removeClass('cbp-fwcurrent').end().eq(this.current).addClass('cbp-fwcurrent');
		},

		_jump : function(position) {
			// do nothing if clicking on the current dot, or if the list is currently moving
			if( position === this.current || this.isAnimating ) {
				return false;
			}
			this.isAnimating = true;
			// update old and current values
			this.old = this.current;
			this.current = position;
			// slide
			this._slide();
		},

		destroy : function() {
			if(this.itemsCount > 1) {
				this.$navPrev.parent().remove();
				this.$navDots.parent().remove();
			}
			this.$list.css('width', 'auto');
			this.$list.css('transition', 'none');
			this.$items.css('width', 'auto');
		}
	};

	$.fn.cbpFWSlider = function(options) {
		if (typeof options === 'string') {
			var args = Array.prototype.slice.call(arguments, 1);

			this.each(function() {
				var instance = $.data(this, 'cbpFWSlider');
				if (!instance) {
					logError("cannot call methods on cbpFWSlider prior to initialization; attempted to call method '" + options + "'");
					return;
				}

				if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
					logError("no such method '" + options + "' for cbpFWSlider instance");
					return;
				}

				instance[options].apply(instance, args);
			});

		} else {
			this.each(function() {	
				var instance = $.data(this, 'cbpFWSlider');
				if (instance) {
					instance._init();
				} else {
					instance = $.data(this, 'cbpFWSlider', new $.fn.CBPFWSlider(options, this));
				}
			});
		}
		return this;
	};

})(jQuery);
