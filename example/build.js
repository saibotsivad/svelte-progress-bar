(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function recompute(state, newState, oldState, isInitial) {
	if (isInitial || 'width' in newState && differs(state.width, oldState.width) || 'height' in newState && differs(state.height, oldState.height) || 'color' in newState && differs(state.color, oldState.color)) {
		state.styleMap = newState.styleMap = template.computed.styleMap(state.width, state.height, state.color);
	}

	if (isInitial || 'styleMap' in newState && differs(state.styleMap, oldState.styleMap)) {
		state.style = newState.style = template.computed.style(state.styleMap);
	}
}

var template = function () {
	var defaults = {
		color: 'red',
		minimum: 0.08,
		maximum: 0.994,
		speed: 200,
		height: 2,
		settleTime: 700,
		intervalTime: 800,
		stepSizes: [0, 0.05, 0.07, 0.1]
	};
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

				updater = setInterval(function () {
					var stepSizes = _this.get('stepSizes') || defaults.stepSizes;
					var step = stepSizes[Math.floor(Math.random() * stepSizes.length)];
					var value = _this.get('width');
					if (value < maximumWidth) {
						value = value + step;
					}
					if (value > maximumWidth) {
						value = maximumWidth;
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
			styleMap: function styleMap(width, height, color) {
				return {
					'z-index': 1,
					width: width * 100 + '%',
					height: (height || defaults.height) + 'px',
					'background-color': color || defaults.color
				};
			},
			style: function style(styleMap) {
				return Object.keys(styleMap).map(function (key) {
					return key + ':' + styleMap[key] + ';';
				}).join('');
			}
		}
	};
}();

var addedCss = false;
function addCss() {
	var style = createElement('style');
	style.textContent = "\ndiv[svelte-2532152854], [svelte-2532152854] div {\n\tposition: absolute;\n\ttop: 0;\n\tleft: 0;\n}\n";
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
	setAttribute(div, 'svelte-2532152854', '');
	var last_div_style = root.style;
	div.style.cssText = last_div_style;

	return {
		mount: function mount(target, anchor) {
			insertNode(div, target, anchor);
		},

		update: function update(changed, root) {
			var __tmp;

			if ((__tmp = root.style) !== last_div_style) {
				last_div_style = __tmp;
				div.style.cssText = last_div_style;
			}
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

function appendNode(node, target) {
	target.appendChild(node);
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

// setTimeout(() => {
// 	progress.complete()
// }, 8000)

},{"../ProgressBar.html":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJQcm9ncmVzc0Jhci5odG1sIiwiZXhhbXBsZS9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7OzsyQkNJUTtBQUNSLEtBQU0sQUFBUTtBQUNiLEFBQUssU0FBRSxBQUFLO0FBQ1osQUFBTyxXQUFFLEFBQUk7QUFDYixBQUFPLFdBQUUsQUFBSztBQUNkLEFBQUssU0FBRSxBQUFHO0FBQ1YsQUFBTSxVQUFFLEFBQUM7QUFDVCxBQUFVLGNBQUUsQUFBRztBQUNmLEFBQVksZ0JBQUUsQUFBRztBQUNqQixBQUFTLGFBQUUsQ0FBRSxBQUFDLEdBQUUsQUFBSSxNQUFFLEFBQUksTUFBRSxBQUFHLEFBQUUsQUFDakM7QUFUZ0I7QUFVakIsS0FBSSxBQUFPOztBQUVYO0FBQ0MsQUFBTztBQUNOLEFBQUssMkJBQUc7QUFDUCxBQUFJLFNBQUMsQUFBSyxBQUFFO0FBQ1osQUFBSSxTQUFDLEFBQVEsQUFBRTtBQUNmO0FBQ0QsQUFBSywyQkFBRztBQUNQLFFBQU0sQUFBYSxnQkFBRyxBQUFJLEtBQUMsQUFBRyxJQUFDLEFBQVMsQUFBQyxjQUFJLEFBQVEsU0FBQyxBQUFPO0FBQzdELEFBQUksU0FBQyxBQUFHLElBQUMsRUFBRSxBQUFLLE9BQUUsQUFBYSxBQUFFLEFBQUM7QUFDbEM7QUFDRCxBQUFRO0FBQUc7O0FBQ1YsUUFBTSxBQUFZLGVBQUcsQUFBSSxLQUFDLEFBQUcsSUFBQyxBQUFTLEFBQUMsY0FBSSxBQUFRLFNBQUMsQUFBTztBQUM1RCxRQUFNLEFBQVksZUFBRyxBQUFJLEtBQUMsQUFBRyxJQUFDLEFBQWMsQUFBQyxtQkFBSSxBQUFRLFNBQUMsQUFBWTs7QUFFdEUsQUFBTywwQkFBZSxZQUFNO0FBQzNCLFNBQU0sQUFBUyxZQUFHLEFBQUksTUFBQyxBQUFHLElBQUMsQUFBVyxBQUFDLGdCQUFJLEFBQVEsU0FBQyxBQUFTO0FBQzdELFNBQU0sQUFBSSxPQUFHLEFBQVMsVUFBQyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQUksS0FBQyxBQUFNLEFBQUUsV0FBRyxBQUFTLFVBQUMsQUFBTSxBQUFDLEFBQUM7QUFDcEUsU0FBSSxBQUFLLFFBQUcsQUFBSSxNQUFDLEFBQUcsSUFBQyxBQUFPLEFBQUM7QUFDN0IsU0FBSSxBQUFLLFFBQUcsQUFBWSxjQUFFO0FBQ3pCLEFBQUssY0FBRyxBQUFLLFFBQUcsQUFBSTtBQUNwQjtBQUNELFNBQUksQUFBSyxRQUFHLEFBQVksY0FBRTtBQUN6QixBQUFLLGNBQUcsQUFBWTtBQUNwQjtBQUNELEFBQUksV0FBQyxBQUFHLElBQUMsRUFBRSxBQUFLLE9BQUUsQUFBSyxBQUFFLEFBQUM7QUFDMUIsS0FYUyxBQUFXLEVBV2xCLEFBQVksQUFBQztBQUNoQjtBQUNELEFBQUkseUJBQUc7QUFDTixRQUFJLEFBQU8sU0FBRTtBQUNaLEFBQWEsbUJBQUMsQUFBTyxBQUFDO0FBQ3RCO0FBQ0Q7QUFDRCxBQUFRO0FBQUc7O0FBQ1YsQUFBYSxrQkFBQyxBQUFPLEFBQUM7QUFDdEIsQUFBSSxTQUFDLEFBQUcsSUFBQyxFQUFFLEFBQUssT0FBRSxBQUFDLEFBQUUsQUFBQztBQUN0QixRQUFNLEFBQVUsYUFBRyxBQUFJLEtBQUMsQUFBRyxJQUFDLEFBQVksQUFBQyxpQkFBSSxBQUFRLFNBQUMsQUFBVTtBQUNoRSxBQUFVLGVBQUMsWUFBTTtBQUNoQixBQUFJLFlBQUMsQUFBRyxJQUFDLEVBQUUsQUFBSyxPQUFFLEFBQUMsQUFBRSxBQUFDO0FBQ3RCLE9BQUUsQUFBVSxBQUFDO0FBQ2QsQUFDRDtBQXZDUTtBQXdDVCxBQUFRO0FBQ1AsQUFBUSwrQkFBQyxBQUFLLE9BQUUsQUFBTSxRQUFFLEFBQUssT0FBRTtBQUM5QjtBQUNDLEFBQVMsZ0JBQUUsQUFBQztBQUNaLEFBQUssWUFBRyxBQUFLLFFBQUcsQUFBRyxHQUFaLEdBQWdCLEFBQUc7QUFDMUIsQUFBTSxhQUFFLENBQUMsQUFBTSxVQUFJLEFBQVEsU0FBQyxBQUFNLFVBQUksQUFBSTtBQUMxQyxBQUFrQix5QkFBRSxBQUFLLFNBQUksQUFBUSxTQUFDLEFBQUssQUFDM0M7QUFMTTtBQU1QO0FBQ0QsQUFBSyx5QkFBQyxBQUFRLFVBQUU7QUFDZixrQkFBYyxBQUFJLEtBQUMsQUFBUSxBQUFDLFVBQzFCLEFBQUc7QUFBQyxBQUFHLEFBQUksQUFBQyxZQUFFLEFBQUcsQUFBQyxBQUFDLFlBQUUsQUFBUSxTQUFDLEFBQUcsQUFBQyxBQUFDLEFBQUMsQUFBQyxBQUFDO0tBRGpDLEFBQU0sRUFFWCxBQUFJLEtBQUMsQUFBRSxBQUFDO0FBQ1YsQUFDRCxBQUNELEFBQ0Q7QUFoQlc7QUF6Q0k7Ozs7Ozs7Ozs7Ozs7Ozs7V0FqQlQsQUFBSzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsyQkFDRyxBQUFLOzs7Ozs7Ozs7OztxQkFBTCxBQUFLOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDRG5CLElBQU0sY0FBYyxRQUFRLHFCQUFSLENBQXBCOztBQUVBLElBQU0sV0FBVyxJQUFJLFdBQUosQ0FBZ0I7QUFDaEMsU0FBUSxTQUFTLGFBQVQsQ0FBdUIsZUFBdkI7QUFEd0IsQ0FBaEIsQ0FBakI7O0FBSUEsU0FBUyxLQUFUOztBQUVBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ7eyNpZiB3aWR0aH19XG48ZGl2IHN0eWxlPVwie3tzdHlsZX19XCI+PC9kaXY+XG57ey9pZn19XG5cbjxzY3JpcHQ+XG5jb25zdCBkZWZhdWx0cyA9IHtcblx0Y29sb3I6ICdyZWQnLFxuXHRtaW5pbXVtOiAwLjA4LFxuXHRtYXhpbXVtOiAwLjk5NCxcblx0c3BlZWQ6IDIwMCxcblx0aGVpZ2h0OiAyLFxuXHRzZXR0bGVUaW1lOiA3MDAsXG5cdGludGVydmFsVGltZTogODAwLFxuXHRzdGVwU2l6ZXM6IFsgMCwgMC4wNSwgMC4wNywgMC4xIF1cbn1cbmxldCB1cGRhdGVyXG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0bWV0aG9kczoge1xuXHRcdHN0YXJ0KCkge1xuXHRcdFx0dGhpcy5yZXNldCgpXG5cdFx0XHR0aGlzLmNvbnRpbnVlKClcblx0XHR9LFxuXHRcdHJlc2V0KCkge1xuXHRcdFx0Y29uc3Qgc3RhcnRpbmdXaWR0aCA9IHRoaXMuZ2V0KCdtaW5pbXVtJykgfHwgZGVmYXVsdHMubWluaW11bVxuXHRcdFx0dGhpcy5zZXQoeyB3aWR0aDogc3RhcnRpbmdXaWR0aCB9KVxuXHRcdH0sXG5cdFx0Y29udGludWUoKSB7XG5cdFx0XHRjb25zdCBtYXhpbXVtV2lkdGggPSB0aGlzLmdldCgnbWF4aW11bScpIHx8IGRlZmF1bHRzLm1heGltdW1cblx0XHRcdGNvbnN0IGludGVydmFsVGltZSA9IHRoaXMuZ2V0KCdpbnRlcnZhbFRpbWUnKSB8fCBkZWZhdWx0cy5pbnRlcnZhbFRpbWVcblxuXHRcdFx0dXBkYXRlciA9IHNldEludGVydmFsKCgpID0+IHtcblx0XHRcdFx0Y29uc3Qgc3RlcFNpemVzID0gdGhpcy5nZXQoJ3N0ZXBTaXplcycpIHx8IGRlZmF1bHRzLnN0ZXBTaXplc1xuXHRcdFx0XHRjb25zdCBzdGVwID0gc3RlcFNpemVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHN0ZXBTaXplcy5sZW5ndGgpXVxuXHRcdFx0XHRsZXQgdmFsdWUgPSB0aGlzLmdldCgnd2lkdGgnKVxuXHRcdFx0XHRpZiAodmFsdWUgPCBtYXhpbXVtV2lkdGgpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IHZhbHVlICsgc3RlcFxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh2YWx1ZSA+IG1heGltdW1XaWR0aCkge1xuXHRcdFx0XHRcdHZhbHVlID0gbWF4aW11bVdpZHRoXG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5zZXQoeyB3aWR0aDogdmFsdWUgfSlcblx0XHRcdH0sIGludGVydmFsVGltZSlcblx0XHR9LFxuXHRcdHN0b3AoKSB7XG5cdFx0XHRpZiAodXBkYXRlcikge1xuXHRcdFx0XHRjbGVhckludGVydmFsKHVwZGF0ZXIpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRjb21wbGV0ZSgpIHtcblx0XHRcdGNsZWFySW50ZXJ2YWwodXBkYXRlcilcblx0XHRcdHRoaXMuc2V0KHsgd2lkdGg6IDEgfSlcblx0XHRcdGNvbnN0IHNldHRsZVRpbWUgPSB0aGlzLmdldCgnc2V0dGxlVGltZScpIHx8IGRlZmF1bHRzLnNldHRsZVRpbWVcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHR0aGlzLnNldCh7IHdpZHRoOiAwIH0pXG5cdFx0XHR9LCBzZXR0bGVUaW1lKVxuXHRcdH1cblx0fSxcblx0Y29tcHV0ZWQ6IHtcblx0XHRzdHlsZU1hcCh3aWR0aCwgaGVpZ2h0LCBjb2xvcikge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0J3otaW5kZXgnOiAxLFxuXHRcdFx0XHR3aWR0aDogKHdpZHRoICogMTAwKSArICclJyxcblx0XHRcdFx0aGVpZ2h0OiAoaGVpZ2h0IHx8IGRlZmF1bHRzLmhlaWdodCkgKyAncHgnLFxuXHRcdFx0XHQnYmFja2dyb3VuZC1jb2xvcic6IGNvbG9yIHx8IGRlZmF1bHRzLmNvbG9yXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRzdHlsZShzdHlsZU1hcCkge1xuXHRcdFx0cmV0dXJuIE9iamVjdC5rZXlzKHN0eWxlTWFwKVxuXHRcdFx0XHQubWFwKGtleSA9PiBgJHtrZXl9OiR7c3R5bGVNYXBba2V5XX07YClcblx0XHRcdFx0LmpvaW4oJycpXG5cdFx0fVxuXHR9XG59XG48L3NjcmlwdD5cblxuPHN0eWxlPlxuZGl2IHtcblx0cG9zaXRpb246IGFic29sdXRlO1xuXHR0b3A6IDA7XG5cdGxlZnQ6IDA7XG59XG48L3N0eWxlPlxuIiwiY29uc3QgUHJvZ3Jlc3NCYXIgPSByZXF1aXJlKCcuLi9Qcm9ncmVzc0Jhci5odG1sJylcblxuY29uc3QgcHJvZ3Jlc3MgPSBuZXcgUHJvZ3Jlc3NCYXIoe1xuXHR0YXJnZXQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwcm9ncmVzcy1iYXInKVxufSlcblxucHJvZ3Jlc3Muc3RhcnQoKVxuXG4vLyBzZXRUaW1lb3V0KCgpID0+IHtcbi8vIFx0cHJvZ3Jlc3MuY29tcGxldGUoKVxuLy8gfSwgODAwMClcbiJdfQ==
