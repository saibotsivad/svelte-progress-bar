(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function recompute(state, newState, oldState, isInitial) {
	if (isInitial || 'width' in newState && differs(state.width, oldState.width)) {
		state.widthPercent = newState.widthPercent = template.computed.widthPercent(state.width);
	}
}

var template = function () {
	var defaults = {
		minimum: 0.08,
		maximum: 0.994,
		settleTime: 700,
		intervalTime: 800
	};
	var stepSizes = [0, 0, 0.005, 0.01, 0.02];

	function getIncrement(number) {
		if (number >= 0 && number < 0.2) return 0.1;else if (number >= 0.2 && number < 0.5) return 0.04;else if (number >= 0.5 && number < 0.8) return 0.02;else if (number >= 0.8 && number < 0.99) return 0.005;
		return 0;
	}

	var updater = void 0;

	return {
		methods: {
			start: function start() {
				this.reset();
				this.continue();
			},
			reset: function reset() {
				var startingWidth = this.get('minimum') || defaults.minimum;
				this.set({ width: startingWidth });
			},
			continue: function _continue() {
				var _this = this;

				var maximumWidth = this.get('maximum') || defaults.maximum;
				var intervalTime = this.get('intervalTime') || defaults.intervalTime;

				this.stop(); // prevent multiple intervals by clearing before making
				updater = setInterval(function () {
					var value = _this.get('width');

					var randomStep = stepSizes[Math.floor(Math.random() * stepSizes.length)];
					var step = getIncrement(value) + randomStep;
					if (value < maximumWidth) {
						value = value + step;
					}
					if (value > maximumWidth) {
						value = maximumWidth;
						_this.stop();
					}
					_this.set({ width: value });
				}, intervalTime);
			},
			stop: function stop() {
				if (updater) {
					clearInterval(updater);
				}
			},
			complete: function complete() {
				var _this2 = this;

				clearInterval(updater);
				this.set({ width: 1 });
				var settleTime = this.get('settleTime') || defaults.settleTime;
				setTimeout(function () {
					_this2.set({ width: 0 });
				}, settleTime);
			}
		},
		computed: {
			widthPercent: function widthPercent(width) {
				return width * 100;
			}
		}
	};
}();

var addedCss = false;
function addCss() {
	var style = createElement('style');
	style.textContent = "\n[svelte-802552333].svelte-progress-bar, [svelte-802552333] .svelte-progress-bar {\n\tposition: absolute;\n\ttop: 0;\n\tleft: 0;\n\theight: 2px;\n\tz-index: 1;\n\tbackground-color: red;\n\ttransition: width 0.16s ease-in-out;\n}\n[svelte-802552333].svelte-progress-bar-leader, [svelte-802552333] .svelte-progress-bar-leader {\n\tposition: absolute;\n\ttop: 0;\n\tright: 0;\n\theight: 2px;\n\twidth: 100px;\n\tz-index: 2;\n\tbackground-color: red;\n\ttransform: rotate(2.5deg) translate(0px, -4px);\n\tbox-shadow: 0 0 8px red, 0 0 8px red;\n}\n";
	appendNode(style, document.head);

	addedCss = true;
}

function renderMainFragment(root, component) {
	var ifBlock_anchor = createComment();

	function getBlock(root) {
		if (root.width) return renderIfBlock_0;
		return null;
	}

	var currentBlock = getBlock(root);
	var ifBlock = currentBlock && currentBlock(root, component);

	return {
		mount: function mount(target, anchor) {
			insertNode(ifBlock_anchor, target, anchor);
			if (ifBlock) ifBlock.mount(ifBlock_anchor.parentNode, ifBlock_anchor);
		},

		update: function update(changed, root) {
			var __tmp;

			var _currentBlock = currentBlock;
			currentBlock = getBlock(root);
			if (_currentBlock === currentBlock && ifBlock) {
				ifBlock.update(changed, root);
			} else {
				if (ifBlock) ifBlock.teardown(true);
				ifBlock = currentBlock && currentBlock(root, component);
				if (ifBlock) ifBlock.mount(ifBlock_anchor.parentNode, ifBlock_anchor);
			}
		},

		teardown: function teardown(detach) {
			if (ifBlock) ifBlock.teardown(detach);

			if (detach) {
				detachNode(ifBlock_anchor);
			}
		}
	};
}

function renderIfBlock_0(root, component) {
	var div = createElement('div');
	setAttribute(div, 'svelte-802552333', '');
	div.className = "svelte-progress-bar";
	div.style.cssText = "width: " + root.widthPercent + "%";

	var div$1 = createElement('div');
	setAttribute(div$1, 'svelte-802552333', '');
	div$1.className = "svelte-progress-bar-leader";

	appendNode(div$1, div);

	return {
		mount: function mount(target, anchor) {
			insertNode(div, target, anchor);
		},

		update: function update(changed, root) {
			var __tmp;

			div.style.cssText = "width: " + root.widthPercent + "%";
		},

		teardown: function teardown(detach) {
			if (detach) {
				detachNode(div);
			}
		}
	};
}

function ProgressBar(options) {
	options = options || {};
	this._state = options.data || {};
	recompute(this._state, this._state, {}, true);

	this._observers = {
		pre: Object.create(null),
		post: Object.create(null)
	};

	this._handlers = Object.create(null);

	this._root = options._root;
	this._yield = options._yield;

	this._torndown = false;
	if (!addedCss) addCss();

	this._fragment = renderMainFragment(this._state, this);
	if (options.target) this._fragment.mount(options.target, null);
}

ProgressBar.prototype = template.methods;

ProgressBar.prototype.get = get;
ProgressBar.prototype.fire = fire;
ProgressBar.prototype.observe = observe;
ProgressBar.prototype.on = on;
ProgressBar.prototype.set = set;
ProgressBar.prototype._flush = _flush;

ProgressBar.prototype._set = function _set(newState) {
	var oldState = this._state;
	this._state = Object.assign({}, oldState, newState);
	recompute(this._state, newState, oldState, false);

	dispatchObservers(this, this._observers.pre, newState, oldState);
	if (this._fragment) this._fragment.update(newState, this._state);
	dispatchObservers(this, this._observers.post, newState, oldState);
};

ProgressBar.prototype.teardown = ProgressBar.prototype.destroy = function destroy(detach) {
	this.fire('destroy');

	this._fragment.teardown(detach !== false);
	this._fragment = null;

	this._state = {};
	this._torndown = true;
};

function createElement(name) {
	return document.createElement(name);
}

function setAttribute(node, attribute, value) {
	node.setAttribute(attribute, value);
}

function detachNode(node) {
	node.parentNode.removeChild(node);
}

function insertNode(node, target, anchor) {
	target.insertBefore(node, anchor);
}

function appendNode(node, target) {
	target.appendChild(node);
}

function createComment() {
	return document.createComment('');
}

function differs(a, b) {
	return a !== b || a && (typeof a === 'undefined' ? 'undefined' : _typeof(a)) === 'object' || typeof a === 'function';
}

function dispatchObservers(component, group, newState, oldState) {
	for (var key in group) {
		if (!(key in newState)) continue;

		var newValue = newState[key];
		var oldValue = oldState[key];

		if (newValue === oldValue && (typeof newValue === 'undefined' ? 'undefined' : _typeof(newValue)) !== 'object') continue;

		var callbacks = group[key];
		if (!callbacks) continue;

		for (var i = 0; i < callbacks.length; i += 1) {
			var callback = callbacks[i];
			if (callback.__calling) continue;

			callback.__calling = true;
			callback.call(component, newValue, oldValue);
			callback.__calling = false;
		}
	}
}

function get(key) {
	return key ? this._state[key] : this._state;
}

function fire(eventName, data) {
	var handlers = eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) return;

	for (var i = 0; i < handlers.length; i += 1) {
		handlers[i].call(this, data);
	}
}

function observe(key, callback, options) {
	var group = options && options.defer ? this._observers.pre : this._observers.post;

	(group[key] || (group[key] = [])).push(callback);

	if (!options || options.init !== false) {
		callback.__calling = true;
		callback.call(this, this._state[key]);
		callback.__calling = false;
	}

	return {
		cancel: function cancel() {
			var index = group[key].indexOf(callback);
			if (~index) group[key].splice(index, 1);
		}
	};
}

function on(eventName, handler) {
	if (eventName === 'teardown') return this.on('destroy', handler);

	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function cancel() {
			var index = handlers.indexOf(handler);
			if (~index) handlers.splice(index, 1);
		}
	};
}

function set(newState) {
	this._set(newState);
	(this._root || this)._flush();
}

function _flush() {
	if (!this._renderHooks) return;

	while (this._renderHooks.length) {
		var hook = this._renderHooks.pop();
		hook.fn.call(hook.context);
	}
}

module.exports = ProgressBar;

},{}],2:[function(require,module,exports){
'use strict';

var ProgressBar = require('../ProgressBar.html');

var progress = new ProgressBar({
	target: document.querySelector('#progress-bar')
});

progress.start();

// progress.set({ width: 0.5 })

// setTimeout(() => {
// 	progress.complete()
// }, 8000)

},{"../ProgressBar.html":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJQcm9ncmVzc0Jhci5odG1sIiwiZXhhbXBsZS9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7OzJCQ01RO0FBQ1IsS0FBTSxBQUFRO0FBQ2IsQUFBTyxXQUFFLEFBQUk7QUFDYixBQUFPLFdBQUUsQUFBSztBQUNkLEFBQVUsY0FBRSxBQUFHO0FBQ2YsQUFBWSxnQkFBRSxBQUFHLEFBQ2pCO0FBTGdCO0FBTWpCLEtBQU0sQUFBUyxZQUFHLENBQUUsQUFBQyxHQUFFLEFBQUMsR0FBRSxBQUFLLE9BQUUsQUFBSSxNQUFFLEFBQUksQUFBRTs7QUFFN0MsVUFBUyxBQUFZLGFBQUMsQUFBTSxRQUFFO0FBQzdCLE1BQUksQUFBTSxVQUFJLEFBQUMsS0FBSSxBQUFNLFNBQUcsQUFBRyxLQUFFLE9BQU8sQUFBRyxTQUN0QyxJQUFJLEFBQU0sVUFBSSxBQUFHLE9BQUksQUFBTSxTQUFHLEFBQUcsS0FBRSxPQUFPLEFBQUksVUFDOUMsSUFBSSxBQUFNLFVBQUksQUFBRyxPQUFJLEFBQU0sU0FBRyxBQUFHLEtBQUUsT0FBTyxBQUFJLFVBQzlDLElBQUksQUFBTSxVQUFJLEFBQUcsT0FBSSxBQUFNLFNBQUcsQUFBSSxNQUFFLE9BQU8sQUFBSztBQUNyRCxTQUFPLEFBQUM7QUFDUjs7QUFFRCxLQUFJLEFBQU87O0FBRVg7QUFDQyxBQUFPO0FBQ04sQUFBSywyQkFBRztBQUNQLEFBQUksU0FBQyxBQUFLLEFBQUU7QUFDWixBQUFJLFNBQUMsQUFBUSxBQUFFO0FBQ2Y7QUFDRCxBQUFLLDJCQUFHO0FBQ1AsUUFBTSxBQUFhLGdCQUFHLEFBQUksS0FBQyxBQUFHLElBQUMsQUFBUyxBQUFDLGNBQUksQUFBUSxTQUFDLEFBQU87QUFDN0QsQUFBSSxTQUFDLEFBQUcsSUFBQyxFQUFFLEFBQUssT0FBRSxBQUFhLEFBQUUsQUFBQztBQUNsQztBQUNELEFBQVE7QUFBRzs7QUFDVixRQUFNLEFBQVksZUFBRyxBQUFJLEtBQUMsQUFBRyxJQUFDLEFBQVMsQUFBQyxjQUFJLEFBQVEsU0FBQyxBQUFPO0FBQzVELFFBQU0sQUFBWSxlQUFHLEFBQUksS0FBQyxBQUFHLElBQUMsQUFBYyxBQUFDLG1CQUFJLEFBQVEsU0FBQyxBQUFZOztBQUV0RSxBQUFJLFNBQUMsQUFBSSxBQUFFO0FBQ1gsQUFBTywwQkFBZSxZQUFNO0FBQzNCLFNBQUksQUFBSyxRQUFHLEFBQUksTUFBQyxBQUFHLElBQUMsQUFBTyxBQUFDOztBQUU3QixTQUFNLEFBQVUsYUFBRyxBQUFTLFVBQUMsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFJLEtBQUMsQUFBTSxBQUFFLFdBQUcsQUFBUyxVQUFDLEFBQU0sQUFBQyxBQUFDO0FBQzFFLFNBQU0sQUFBSSxPQUFHLEFBQVksYUFBQyxBQUFLLEFBQUMsU0FBRyxBQUFVO0FBQzdDLFNBQUksQUFBSyxRQUFHLEFBQVksY0FBRTtBQUN6QixBQUFLLGNBQUcsQUFBSyxRQUFHLEFBQUk7QUFDcEI7QUFDRCxTQUFJLEFBQUssUUFBRyxBQUFZLGNBQUU7QUFDekIsQUFBSyxjQUFHLEFBQVk7QUFDcEIsQUFBSSxZQUFDLEFBQUksQUFBRTtBQUNYO0FBQ0QsQUFBSSxXQUFDLEFBQUcsSUFBQyxFQUFFLEFBQUssT0FBRSxBQUFLLEFBQUUsQUFBQztBQUMxQixLQWJTLEFBQVcsRUFhbEIsQUFBWSxBQUFDO0FBQ2hCO0FBQ0QsQUFBSSx5QkFBRztBQUNOLFFBQUksQUFBTyxTQUFFO0FBQ1osQUFBYSxtQkFBQyxBQUFPLEFBQUM7QUFDdEI7QUFDRDtBQUNELEFBQVE7QUFBRzs7QUFDVixBQUFhLGtCQUFDLEFBQU8sQUFBQztBQUN0QixBQUFJLFNBQUMsQUFBRyxJQUFDLEVBQUUsQUFBSyxPQUFFLEFBQUMsQUFBRSxBQUFDO0FBQ3RCLFFBQU0sQUFBVSxhQUFHLEFBQUksS0FBQyxBQUFHLElBQUMsQUFBWSxBQUFDLGlCQUFJLEFBQVEsU0FBQyxBQUFVO0FBQ2hFLEFBQVUsZUFBQyxZQUFNO0FBQ2hCLEFBQUksWUFBQyxBQUFHLElBQUMsRUFBRSxBQUFLLE9BQUUsQUFBQyxBQUFFLEFBQUM7QUFDdEIsT0FBRSxBQUFVLEFBQUM7QUFDZCxBQUNEO0FBMUNRO0FBMkNULEFBQVE7QUFDUCxBQUFZLHVDQUFDLEFBQUssT0FBRTtBQUNuQixXQUFPLEFBQUssUUFBRyxBQUFHO0FBQ2xCLEFBQ0QsQUFDRCxBQUNEO0FBTlc7QUE1Q0k7Ozs7Ozs7Ozs7Ozs7Ozs7V0F6QlQsQUFBSzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0NBQ3NDLEFBQVk7Ozs7Ozs7Ozs7Ozs7Ozs7d0NBQVosQUFBWTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0Q3RCxJQUFNLGNBQWMsUUFBUSxxQkFBUixDQUFwQjs7QUFFQSxJQUFNLFdBQVcsSUFBSSxXQUFKLENBQWdCO0FBQ2hDLFNBQVEsU0FBUyxhQUFULENBQXVCLGVBQXZCO0FBRHdCLENBQWhCLENBQWpCOztBQUlBLFNBQVMsS0FBVDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwie3sjaWYgd2lkdGh9fVxuPGRpdiBjbGFzcz1cInN2ZWx0ZS1wcm9ncmVzcy1iYXJcIiBzdHlsZT1cIndpZHRoOiB7e3dpZHRoUGVyY2VudH19JVwiPlxuXHQ8ZGl2IGNsYXNzPVwic3ZlbHRlLXByb2dyZXNzLWJhci1sZWFkZXJcIj48L2Rpdj5cbjwvZGl2Plxue3svaWZ9fVxuXG48c2NyaXB0PlxuY29uc3QgZGVmYXVsdHMgPSB7XG5cdG1pbmltdW06IDAuMDgsXG5cdG1heGltdW06IDAuOTk0LFxuXHRzZXR0bGVUaW1lOiA3MDAsXG5cdGludGVydmFsVGltZTogODAwXG59XG5jb25zdCBzdGVwU2l6ZXMgPSBbIDAsIDAsIDAuMDA1LCAwLjAxLCAwLjAyIF1cblxuZnVuY3Rpb24gZ2V0SW5jcmVtZW50KG51bWJlcikge1xuXHRpZiAobnVtYmVyID49IDAgJiYgbnVtYmVyIDwgMC4yKSByZXR1cm4gMC4xXG5cdGVsc2UgaWYgKG51bWJlciA+PSAwLjIgJiYgbnVtYmVyIDwgMC41KSByZXR1cm4gMC4wNFxuXHRlbHNlIGlmIChudW1iZXIgPj0gMC41ICYmIG51bWJlciA8IDAuOCkgcmV0dXJuIDAuMDJcblx0ZWxzZSBpZiAobnVtYmVyID49IDAuOCAmJiBudW1iZXIgPCAwLjk5KSByZXR1cm4gMC4wMDVcblx0cmV0dXJuIDBcbn1cblxubGV0IHVwZGF0ZXJcblxuZXhwb3J0IGRlZmF1bHQge1xuXHRtZXRob2RzOiB7XG5cdFx0c3RhcnQoKSB7XG5cdFx0XHR0aGlzLnJlc2V0KClcblx0XHRcdHRoaXMuY29udGludWUoKVxuXHRcdH0sXG5cdFx0cmVzZXQoKSB7XG5cdFx0XHRjb25zdCBzdGFydGluZ1dpZHRoID0gdGhpcy5nZXQoJ21pbmltdW0nKSB8fCBkZWZhdWx0cy5taW5pbXVtXG5cdFx0XHR0aGlzLnNldCh7IHdpZHRoOiBzdGFydGluZ1dpZHRoIH0pXG5cdFx0fSxcblx0XHRjb250aW51ZSgpIHtcblx0XHRcdGNvbnN0IG1heGltdW1XaWR0aCA9IHRoaXMuZ2V0KCdtYXhpbXVtJykgfHwgZGVmYXVsdHMubWF4aW11bVxuXHRcdFx0Y29uc3QgaW50ZXJ2YWxUaW1lID0gdGhpcy5nZXQoJ2ludGVydmFsVGltZScpIHx8IGRlZmF1bHRzLmludGVydmFsVGltZVxuXG5cdFx0XHR0aGlzLnN0b3AoKSAvLyBwcmV2ZW50IG11bHRpcGxlIGludGVydmFscyBieSBjbGVhcmluZyBiZWZvcmUgbWFraW5nXG5cdFx0XHR1cGRhdGVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuXHRcdFx0XHRsZXQgdmFsdWUgPSB0aGlzLmdldCgnd2lkdGgnKVxuXG5cdFx0XHRcdGNvbnN0IHJhbmRvbVN0ZXAgPSBzdGVwU2l6ZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogc3RlcFNpemVzLmxlbmd0aCldXG5cdFx0XHRcdGNvbnN0IHN0ZXAgPSBnZXRJbmNyZW1lbnQodmFsdWUpICsgcmFuZG9tU3RlcFxuXHRcdFx0XHRpZiAodmFsdWUgPCBtYXhpbXVtV2lkdGgpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IHZhbHVlICsgc3RlcFxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh2YWx1ZSA+IG1heGltdW1XaWR0aCkge1xuXHRcdFx0XHRcdHZhbHVlID0gbWF4aW11bVdpZHRoXG5cdFx0XHRcdFx0dGhpcy5zdG9wKClcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnNldCh7IHdpZHRoOiB2YWx1ZSB9KVxuXHRcdFx0fSwgaW50ZXJ2YWxUaW1lKVxuXHRcdH0sXG5cdFx0c3RvcCgpIHtcblx0XHRcdGlmICh1cGRhdGVyKSB7XG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwodXBkYXRlcilcblx0XHRcdH1cblx0XHR9LFxuXHRcdGNvbXBsZXRlKCkge1xuXHRcdFx0Y2xlYXJJbnRlcnZhbCh1cGRhdGVyKVxuXHRcdFx0dGhpcy5zZXQoeyB3aWR0aDogMSB9KVxuXHRcdFx0Y29uc3Qgc2V0dGxlVGltZSA9IHRoaXMuZ2V0KCdzZXR0bGVUaW1lJykgfHwgZGVmYXVsdHMuc2V0dGxlVGltZVxuXHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdHRoaXMuc2V0KHsgd2lkdGg6IDAgfSlcblx0XHRcdH0sIHNldHRsZVRpbWUpXG5cdFx0fVxuXHR9LFxuXHRjb21wdXRlZDoge1xuXHRcdHdpZHRoUGVyY2VudCh3aWR0aCkge1xuXHRcdFx0cmV0dXJuIHdpZHRoICogMTAwXG5cdFx0fVxuXHR9XG59XG48L3NjcmlwdD5cblxuPHN0eWxlPlxuLnN2ZWx0ZS1wcm9ncmVzcy1iYXIge1xuXHRwb3NpdGlvbjogYWJzb2x1dGU7XG5cdHRvcDogMDtcblx0bGVmdDogMDtcblx0aGVpZ2h0OiAycHg7XG5cdHotaW5kZXg6IDE7XG5cdGJhY2tncm91bmQtY29sb3I6IHJlZDtcblx0dHJhbnNpdGlvbjogd2lkdGggMC4xNnMgZWFzZS1pbi1vdXQ7XG59XG4uc3ZlbHRlLXByb2dyZXNzLWJhci1sZWFkZXIge1xuXHRwb3NpdGlvbjogYWJzb2x1dGU7XG5cdHRvcDogMDtcblx0cmlnaHQ6IDA7XG5cdGhlaWdodDogMnB4O1xuXHR3aWR0aDogMTAwcHg7XG5cdHotaW5kZXg6IDI7XG5cdGJhY2tncm91bmQtY29sb3I6IHJlZDtcblx0dHJhbnNmb3JtOiByb3RhdGUoMi41ZGVnKSB0cmFuc2xhdGUoMHB4LCAtNHB4KTtcblx0Ym94LXNoYWRvdzogMCAwIDhweCByZWQsIDAgMCA4cHggcmVkO1xufVxuPC9zdHlsZT5cbiIsImNvbnN0IFByb2dyZXNzQmFyID0gcmVxdWlyZSgnLi4vUHJvZ3Jlc3NCYXIuaHRtbCcpXG5cbmNvbnN0IHByb2dyZXNzID0gbmV3IFByb2dyZXNzQmFyKHtcblx0dGFyZ2V0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcHJvZ3Jlc3MtYmFyJylcbn0pXG5cbnByb2dyZXNzLnN0YXJ0KClcblxuLy8gcHJvZ3Jlc3Muc2V0KHsgd2lkdGg6IDAuNSB9KVxuXG4vLyBzZXRUaW1lb3V0KCgpID0+IHtcbi8vIFx0cHJvZ3Jlc3MuY29tcGxldGUoKVxuLy8gfSwgODAwMClcbiJdfQ==
