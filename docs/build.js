(function () {
    'use strict';

    function noop() { }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    /* docs/Controls.svelte generated by Svelte v3.44.3 */

    function create_fragment$2(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let button2;
    	let t5;
    	let button3;
    	let t7;
    	let button4;
    	let t9;
    	let button5;
    	let t10;
    	let t11_value = Math.round(/*currentWidth*/ ctx[0] * 10000) / 100 + "";
    	let t11;
    	let t12;
    	let t13;
    	let input;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			button0 = element("button");
    			button0.textContent = "Restart";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Complete";
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "Stop Auto-Increment";
    			t5 = space();
    			button3 = element("button");
    			button3.textContent = "Increment by 20%";
    			t7 = space();
    			button4 = element("button");
    			button4.textContent = "Continue Auto-Increment";
    			t9 = space();
    			button5 = element("button");
    			t10 = text("Set Width\n\t(Currently ");
    			t11 = text(t11_value);
    			t12 = text(")");
    			t13 = space();
    			input = element("input");
    			attr(button5, "class", "inline");
    			attr(input, "class", "inline");
    			attr(input, "type", "number");
    		},
    		m(target, anchor) {
    			insert(target, button0, anchor);
    			insert(target, t1, anchor);
    			insert(target, button1, anchor);
    			insert(target, t3, anchor);
    			insert(target, button2, anchor);
    			insert(target, t5, anchor);
    			insert(target, button3, anchor);
    			insert(target, t7, anchor);
    			insert(target, button4, anchor);
    			insert(target, t9, anchor);
    			insert(target, button5, anchor);
    			append(button5, t10);
    			append(button5, t11);
    			append(button5, t12);
    			insert(target, t13, anchor);
    			insert(target, input, anchor);
    			set_input_value(input, /*width*/ ctx[1]);

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*progressStart*/ ctx[2]),
    					listen(button1, "click", /*progressComplete*/ ctx[3]),
    					listen(button2, "click", /*progressStop*/ ctx[4]),
    					listen(button3, "click", /*click_handler*/ ctx[9]),
    					listen(button4, "click", /*progressContinue*/ ctx[6]),
    					listen(button5, "click", /*click_handler_1*/ ctx[10]),
    					listen(input, "input", /*input_input_handler*/ ctx[11])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*currentWidth*/ 1 && t11_value !== (t11_value = Math.round(/*currentWidth*/ ctx[0] * 10000) / 100 + "")) set_data(t11, t11_value);

    			if (dirty & /*width*/ 2 && to_number(input.value) !== /*width*/ ctx[1]) {
    				set_input_value(input, /*width*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(button0);
    			if (detaching) detach(t1);
    			if (detaching) detach(button1);
    			if (detaching) detach(t3);
    			if (detaching) detach(button2);
    			if (detaching) detach(t5);
    			if (detaching) detach(button3);
    			if (detaching) detach(t7);
    			if (detaching) detach(button4);
    			if (detaching) detach(t9);
    			if (detaching) detach(button5);
    			if (detaching) detach(t13);
    			if (detaching) detach(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { currentWidth } = $$props;
    	let { bar } = $$props;
    	let width = 10;

    	const progressStart = () => {
    		bar.start();
    	};

    	const progressComplete = () => {
    		bar.complete();
    	};

    	const progressStop = () => {
    		bar.stop();
    	};

    	const progressIncrement = size => {
    		const max = bar.getState().maximum;
    		let width = bar.getState().width + size;

    		if (width > max) {
    			width = max;
    		}

    		bar.$$set({ width });
    	};

    	const progressContinue = () => {
    		bar.animate();
    	};

    	const setWidthRatio = width => {
    		bar.setWidthRatio(width / 100);
    	};

    	const click_handler = () => progressIncrement(0.2);
    	const click_handler_1 = () => setWidthRatio(width);

    	function input_input_handler() {
    		width = to_number(this.value);
    		$$invalidate(1, width);
    	}

    	$$self.$$set = $$props => {
    		if ('currentWidth' in $$props) $$invalidate(0, currentWidth = $$props.currentWidth);
    		if ('bar' in $$props) $$invalidate(8, bar = $$props.bar);
    	};

    	return [
    		currentWidth,
    		width,
    		progressStart,
    		progressComplete,
    		progressStop,
    		progressIncrement,
    		progressContinue,
    		setWidthRatio,
    		bar,
    		click_handler,
    		click_handler_1,
    		input_input_handler
    	];
    }

    class Controls extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { currentWidth: 0, bar: 8 });
    	}
    }

    /* src/ProgressBar.svelte generated by Svelte v3.44.3 */

    function create_if_block(ctx) {
    	let div;
    	let if_block = /*running*/ ctx[3] && create_if_block_1(ctx);

    	return {
    		c() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr(div, "class", "svelte-progress-bar");
    			attr(div, "style", /*barStyle*/ ctx[1]);
    			toggle_class(div, "running", /*running*/ ctx[3]);
    			toggle_class(div, "svelte-progress-bar-hiding", /*completed*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p(ctx, dirty) {
    			if (/*running*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*barStyle*/ 2) {
    				attr(div, "style", /*barStyle*/ ctx[1]);
    			}

    			if (dirty & /*running*/ 8) {
    				toggle_class(div, "running", /*running*/ ctx[3]);
    			}

    			if (dirty & /*completed*/ 16) {
    				toggle_class(div, "svelte-progress-bar-hiding", /*completed*/ ctx[4]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block) if_block.d();
    		}
    	};
    }

    // (150:2) {#if running}
    function create_if_block_1(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");
    			attr(div, "class", "svelte-progress-bar-leader");
    			attr(div, "style", /*leaderColorStyle*/ ctx[2]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*leaderColorStyle*/ 4) {
    				attr(div, "style", /*leaderColorStyle*/ ctx[2]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	let style;
    	let t1;
    	let if_block_anchor;
    	let if_block = /*width*/ ctx[0] && create_if_block(ctx);

    	return {
    		c() {
    			style = element("style");
    			style.textContent = ".svelte-progress-bar {\n\t\t\tposition: fixed;\n\t\t\ttop: 0;\n\t\t\tleft: 0;\n\t\t\theight: 2px;\n\t\t\ttransition: width 0.21s ease-in-out;\n\t\t\tz-index: 1;\n\t\t}\n\n\t\t.svelte-progress-bar-hiding {\n\t\t\ttransition: top 0.8s ease;\n\t\t\ttop: -8px;\n\t\t}\n\n\t\t.svelte-progress-bar-leader {\n\t\t\tposition: absolute;\n\t\t\ttop: 0;\n\t\t\tright: 0;\n\t\t\theight: 3px;\n\t\t\twidth: 100px;\n\t\t\ttransform: rotate(2.5deg) translate(0px, -4px);\n\t\t\tbox-shadow: 0 0 8px;\n\t\t\tz-index: 2;\n\t\t}";
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			append(document.head, style);
    			insert(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (/*width*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			detach(style);
    			if (detaching) detach(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const getIncrement = number => {
    		if (number >= 0 && number < 0.2) return 0.1; else if (number >= 0.2 && number < 0.5) return 0.04; else if (number >= 0.5 && number < 0.8) return 0.02; else if (number >= 0.8 && number < 0.99) return 0.005;
    		return 0;
    	};

    	// Internal private state.
    	let running;

    	let updater;
    	let completed = false;
    	let { color } = $$props;
    	let { width } = $$props;
    	let { minimum = 0.08 } = $$props;
    	let { maximum = 0.994 } = $$props;
    	let { settleTime = 700 } = $$props;
    	let { intervalTime = 700 } = $$props;
    	let { stepSizes = [0, 0.005, 0.01, 0.02] } = $$props;

    	const reset = () => {
    		$$invalidate(0, width = minimum);
    		$$invalidate(3, running = true);
    	};

    	const animate = () => {
    		if (updater) {
    			// prevent multiple intervals by clearing before making
    			clearInterval(updater);
    		}

    		$$invalidate(3, running = true);

    		updater = setInterval(
    			() => {
    				const randomStep = stepSizes[Math.floor(Math.random() * stepSizes.length)];
    				const step = getIncrement(width) + randomStep;

    				if (width < maximum) {
    					$$invalidate(0, width = width + step);
    				}

    				if (width > maximum) {
    					$$invalidate(0, width = maximum);
    					stop();
    				}
    			},
    			intervalTime
    		);
    	};

    	const start = () => {
    		reset();
    		animate();
    	};

    	const stop = () => {
    		if (updater) {
    			clearInterval(updater);
    		}
    	};

    	const complete = () => {
    		clearInterval(updater);
    		$$invalidate(0, width = 1);
    		$$invalidate(3, running = false);

    		setTimeout(
    			() => {
    				// complete the bar first
    				$$invalidate(4, completed = true);

    				setTimeout(
    					() => {
    						// after some time (long enough to finish the hide animation) reset it back to 0
    						$$invalidate(4, completed = false);

    						$$invalidate(0, width = 0);
    					},
    					settleTime
    				);
    			},
    			settleTime
    		);
    	};

    	const setWidthRatio = widthRatio => {
    		stop();
    		$$invalidate(0, width = widthRatio);
    		$$invalidate(4, completed = false);
    		$$invalidate(3, running = true);
    	};

    	const getState = () => {
    		return {
    			width,
    			running,
    			completed,
    			color,
    			minimum,
    			maximum,
    			settleTime,
    			intervalTime,
    			stepSizes
    		};
    	};

    	let { barStyle } = $$props;
    	let { leaderColorStyle } = $$props;

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(5, color = $$props.color);
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    		if ('minimum' in $$props) $$invalidate(6, minimum = $$props.minimum);
    		if ('maximum' in $$props) $$invalidate(7, maximum = $$props.maximum);
    		if ('settleTime' in $$props) $$invalidate(8, settleTime = $$props.settleTime);
    		if ('intervalTime' in $$props) $$invalidate(9, intervalTime = $$props.intervalTime);
    		if ('stepSizes' in $$props) $$invalidate(10, stepSizes = $$props.stepSizes);
    		if ('barStyle' in $$props) $$invalidate(1, barStyle = $$props.barStyle);
    		if ('leaderColorStyle' in $$props) $$invalidate(2, leaderColorStyle = $$props.leaderColorStyle);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*color, width*/ 33) {
    			$$invalidate(1, barStyle = (color && `background-color: ${color};` || '') + (width && width * 100 && `width: ${width * 100}%;` || ''));
    		}

    		if ($$self.$$.dirty & /*color*/ 32) {
    			$$invalidate(2, leaderColorStyle = color && `background-color: ${color}; color: ${color};` || '');
    		}
    	};

    	return [
    		width,
    		barStyle,
    		leaderColorStyle,
    		running,
    		completed,
    		color,
    		minimum,
    		maximum,
    		settleTime,
    		intervalTime,
    		stepSizes,
    		reset,
    		animate,
    		start,
    		stop,
    		complete,
    		setWidthRatio,
    		getState
    	];
    }

    class ProgressBar extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			color: 5,
    			width: 0,
    			minimum: 6,
    			maximum: 7,
    			settleTime: 8,
    			intervalTime: 9,
    			stepSizes: 10,
    			reset: 11,
    			animate: 12,
    			start: 13,
    			stop: 14,
    			complete: 15,
    			setWidthRatio: 16,
    			getState: 17,
    			barStyle: 1,
    			leaderColorStyle: 2
    		});
    	}

    	get reset() {
    		return this.$$.ctx[11];
    	}

    	get animate() {
    		return this.$$.ctx[12];
    	}

    	get start() {
    		return this.$$.ctx[13];
    	}

    	get stop() {
    		return this.$$.ctx[14];
    	}

    	get complete() {
    		return this.$$.ctx[15];
    	}

    	get setWidthRatio() {
    		return this.$$.ctx[16];
    	}

    	get getState() {
    		return this.$$.ctx[17];
    	}
    }

    /* docs/App.svelte generated by Svelte v3.44.3 */

    function create_fragment(ctx) {
    	let progressbar;
    	let updating_width;
    	let t;
    	let controls;
    	let updating_bar;
    	let current;

    	function progressbar_width_binding(value) {
    		/*progressbar_width_binding*/ ctx[5](value);
    	}

    	let progressbar_props = { color: "blue" };

    	if (/*width*/ ctx[1] !== void 0) {
    		progressbar_props.width = /*width*/ ctx[1];
    	}

    	progressbar = new ProgressBar({ props: progressbar_props });
    	/*progressbar_binding*/ ctx[4](progressbar);
    	binding_callbacks.push(() => bind(progressbar, 'width', progressbar_width_binding));

    	function controls_bar_binding(value) {
    		/*controls_bar_binding*/ ctx[6](value);
    	}

    	let controls_props = { currentWidth: /*width*/ ctx[1] };

    	if (/*bar*/ ctx[0] !== void 0) {
    		controls_props.bar = /*bar*/ ctx[0];
    	}

    	controls = new Controls({ props: controls_props });
    	binding_callbacks.push(() => bind(controls, 'bar', controls_bar_binding));

    	return {
    		c() {
    			create_component(progressbar.$$.fragment);
    			t = space();
    			create_component(controls.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(progressbar, target, anchor);
    			insert(target, t, anchor);
    			mount_component(controls, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const progressbar_changes = {};

    			if (!updating_width && dirty & /*width*/ 2) {
    				updating_width = true;
    				progressbar_changes.width = /*width*/ ctx[1];
    				add_flush_callback(() => updating_width = false);
    			}

    			progressbar.$set(progressbar_changes);
    			const controls_changes = {};
    			if (dirty & /*width*/ 2) controls_changes.currentWidth = /*width*/ ctx[1];

    			if (!updating_bar && dirty & /*bar*/ 1) {
    				updating_bar = true;
    				controls_changes.bar = /*bar*/ ctx[0];
    				add_flush_callback(() => updating_bar = false);
    			}

    			controls.$set(controls_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(progressbar.$$.fragment, local);
    			transition_in(controls.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(progressbar.$$.fragment, local);
    			transition_out(controls.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			/*progressbar_binding*/ ctx[4](null);
    			destroy_component(progressbar, detaching);
    			if (detaching) detach(t);
    			destroy_component(controls, detaching);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let bar;
    	let width;
    	const start = () => bar.start();
    	const complete = () => bar.complete();

    	function progressbar_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			bar = $$value;
    			$$invalidate(0, bar);
    		});
    	}

    	function progressbar_width_binding(value) {
    		width = value;
    		$$invalidate(1, width);
    	}

    	function controls_bar_binding(value) {
    		bar = value;
    		$$invalidate(0, bar);
    	}

    	return [
    		bar,
    		width,
    		start,
    		complete,
    		progressbar_binding,
    		progressbar_width_binding,
    		controls_bar_binding
    	];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, { start: 2, complete: 3 });
    	}

    	get start() {
    		return this.$$.ctx[2];
    	}

    	get complete() {
    		return this.$$.ctx[3];
    	}
    }

    const app = new App({
    	target: document.querySelector('#controls'),
    });

    app.start();

    setTimeout(() => {
    	app.complete();
    }, 3000);

})();
