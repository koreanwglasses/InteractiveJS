(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Interactive = global.Interactive || {})));
}(this, (function (exports) { 'use strict';

/**
 * Creates several bindings and useful functions for mouse and touch interactions
 * @param {*} container 
 */
function TouchEventListener(container) {
    var _container = container;

    var _mouseInContainer = false;
    var _leftButtonDown = false;
    var _rightButtonDown = false;
    var _buttonsDown = 0;
    var _suppressContextMenu = false;

    var _screenStartX = 0;
    var _screenStartY = 0;

    var _clientStartX = 0;
    var _clientStartY = 0;

    var _self = this;

    _container.addEventListener('mouseenter', function() {
        _mouseInContainer = true;
    });

    _container.addEventListener('mouseleave', function() {
        _mouseInContainer = false;
    });

    _container.addEventListener('mousedown', function(event) {
        if(event.buttons & 2) _rightButtonDown = true;
        if(event.buttons & 1) _leftButtonDown = true;
        _buttonsDown |= event.buttons;

        _screenStartX = event.screenX;
        _screenStartY = event.screenY;

        var containerBounds = _container.getBoundingClientRect();
        _clientStartX = event.clientX - containerBounds.left;
        _clientStartY = event.clientY - containerBounds.top;
    });

    document.addEventListener('mouseup', function(event) {
        if(event.button === 2) {
            _rightButtonDown = false;
            _buttonsDown &= 11011;
        }
        if(event.button === 0) {
            _leftButtonDown = false;
            _buttonsDown &= 11110;
        }
    });

    _container.addEventListener('contextmenu', function(event) {
        if(_suppressContextMenu) {
            event.preventDefault();
            _suppressContextMenu = false;
        }
    });

    document.addEventListener('mousemove', function(event) {
        if(_leftButtonDown || _rightButtonDown) {
            var containerBounds = _container.getBoundingClientRect();
            var e = {
                screenStartX: _screenStartX,
                screenX: event.screenX,
                screenStartY: _screenStartY,
                screenY: event.screenY,
                clientStartX: _clientStartX,
                clientX: event.clientX - containerBounds.left,
                clientStartY: _clientStartY,
                clientY: event.clientY - containerBounds.top,
                leftButtonDown: _leftButtonDown,
                rightButtonDown: _rightButtonDown,
                buttons: _buttonsDown,
                suppressContextMenu: function() {
                    _suppressContextMenu = true;
                },
                preventDefault: function() {
                    event.preventDefault();
                }
            };
            _self.onpan(e);
        }
    });

    _container.addEventListener('wheel', function(event) {
        var e = {
            amount: event.deltaY,
            suppressScrolling: function() {
                event.preventDefault();
            }
        };
        _self.onzoom(e);
    });

    this.onpan = function() {
        return false;
    };

    this.onzoom = function() {
        return false;
    };
}

/**
 * Creates a scene and a renderer
 * @param {*} container 
 * @param {*} opts 
 */

function Frame(container, opts) {
    /**
     * The type of this object. (Read-only)
     */
    this.type = 'Frame';

    // Make sure the container is a dom element
    if(!container instanceof Element) {
        console.log('Interactive.Axes3D: Invalid container. Must be a DOM Element');
        return null;
    }

    // Avoid null pointer errors later on
    this.opts = opts === undefined ? {} : opts;

    /**
     * DOM Element which contains the frame
     */
    this.container = container;

    /**
     * Event Listener for touch and mouse events
     */
    this.touchEventListener = new TouchEventListener(this.container);

    /**
     * Width of the viewport derived from the width of the container. (Read-only)
     */
    this.width = container.clientWidth;

    /**
     * Height of the viewport derived from the width of the container. (Read-only)
     */
    this.height = container.clientHeight;

    if(this.opts.antialias === undefined) this.opts.antialias = true;

    this.isSleeping = true;

    /**
     * Scene from Three.js where all the elements lie.
     */    
    this.scene = new THREE.Scene();
}

Frame.prototype.sleep = function() {
    if(this.isSleeping === false) {
        this.renderer.forceContextLoss();
        this.renderer.context = null;
        this.renderer.domElement = null;        
        this.renderer = null;

        this.isSleeping = true;
    }
};

Frame.prototype.wake = function() {
    if(this.isSleeping === true) {
        this.renderer = new THREE.WebGLRenderer(this.opts);

        // Initialize renderer within container
        this.renderer.setSize(this.width, this.height);
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);
        
        this.isSleeping = false;
    }
};

/**
 * Render the frame
 */
Frame.prototype.render = function(camera) {
    this.renderer.render( this.scene, camera );
};

function Number(value) {
    this.value = value;
    this.isNumberInstance = true;
} 

Number.prototype.add = function(n) {
    return new Number(this.value + n.value);
};

Number.prototype.sub = function(n) {
    return new Number(this.value - n.value);
};

Number.prototype.mul = function(n) {
    if(n.isNumberInstance !== true) {
        return n.preMul(this);
    }
    return new Number(this.value * n.value);
};

Number.prototype.div = function(n) {
    if(n.isNumberInstance !== true) {
        return n.preMul(this);
    }
    return new Number(this.value / n.value);
};

Number.prototype.exp = function(n) {
    return new Number(Math.pow(this.value, n.value));
};

Number.prototype.abs = function() {
    return new Number(Math.abs(this.value));
};

Number.prototype.neg = function() {
    return new Number(-this.value);
};

Number.prototype.compareTo = function(n) {
    if(this.value > n.value) return 1;
    if(this.value < n.value) return -1;
    if(this.value === n.value) return 0;
    return null;
};

Number.prototype.toString = function() {
    return '' + this.value;
};

for(var i = 0; i < 10; i++) {
    Number[i] = new Number(i);
}

/**
 * Represents a vector with an arbitrary number of dimensions, and of any type that supports adding and scaling. Operations create new instances
 */
function Vector() {
    this.type = 'Vector';
    this.isVectorInstance = true;

    // Support an arbitrary number of dimensions (Read-only)
    this.dimensions = arguments.length;

    if(arguments[0] instanceof THREE.Vector3) {
        this.dimensions = 3;
        this.q = [new Number(arguments[0].x), new Number(arguments[0].y), new Number(arguments[0].z)];
    } else {
        // q is the general term for a coordinate
        this.q = Array.from(arguments);
    }

    this.expr = null;
}

/**
 * Creates a copy of this vector
 */
Vector.prototype.clone = function() {
    var newVec = new Vector();
    newVec.dimensions = this.dimensions;
    newVec.q = this.q.slice();
    return newVec;
};

/**
 * Adds the vector to this vector
 */
Vector.prototype.add = function(v) {
    if(v.dimensions !== this.dimensions) {
        console.log('Interactive.Vector: Dimensions mismatch');
        return null;
    }

    var result = this.clone();
    for(var i = 0; i < this.dimensions; i++) {
        result.q[i] = result.q[i].add(v.q[i]);
    }
    return result;
};

Vector.prototype.sub = function(v) {
    if(v.dimensions !== this.dimensions) {
        console.log('Interactive.Vector: Dimensions mismatch');
        return null;
    }

    var result = this.clone();
    for(var i = 0; i < this.dimensions; i++) {
        result.q[i] = result.q[i].sub(v.q[i]);
    }
    return result;
};

Vector.prototype.crs = function(v) {
    if(v.dimensions !== this.dimensions) {
        console.log('Interactive.Vector: Dimensions mismatch');
        return null;
    }

    if(this.dimensions === 3) {
        return new Vector(this.q[1].mul(v.q[2]).sub(this.q[2].mul(v.q[1])), this.q[2].mul(v.q[0]).sub(this.q[0].mul(v.q[2])), this.q[0].mul(v.q[1]).sub(this.q[1].mul(v.q[0])));
    }
};

Vector.prototype.mul = function(v) {
    if(v.isNumberInstance === true) {
        var result = this.clone();
        for(var i = 0; i < this.dimensions; i++) {
            result.q[i] = result.q[i].mul(v);
        }
        return result;
    } else if (v.isVectorInstance === true) {
        var result = this.clone();
        for(var i = 0; i < this.dimensions; i++) {
            result.q[i] = result.q[i].mul(v.q[i]);
        }
        return result;
    }
};

Vector.prototype.preMul = function(v) {
    return this.mul(v);
};

Vector.prototype.div = function(v) {
    var result = this.clone();
    for(var i = 0; i < this.dimensions; i++) {
        result.q[i] = result.q[i].div(v);
    }
    return result;
};

Vector.prototype.neg = function() {
    var result = this.clone();
    for(var i = 0; i < this.dimensions; i++) {
        result.q[i] = result.q[i].neg();
    }
    return result;
};

Vector.prototype.abs = function() {
    var ss = 0;
    for(var i = 0; i < this.dimensions; i++) {
        ss += this.q[i].value * this.q[i].value;
    }
    return new Number(Math.sqrt(ss))
};

Vector.prototype.norm = function() {
    if(this.abs().value === 0) return this.clone();
    return this.div(this.abs());
};

Vector.prototype.map = function(f) {
    var result = this.clone();
    for(var i = 0; i < this.dimensions; i++) {
        result.q[i] = f(result.q[i]);
    }
    return result;
};

/**
 * Sets this vector's coordinates to the input vector's
 */
Vector.prototype.set = function(v) {
    this.dimensions = v.dimensions;
    this.q = v.q.slice();
    return this;
};

/**
 * Convert this to a THREE vector2
 */
Vector.prototype.toVector2 = function() {
    return new THREE.Vector2(this.q[0], this.q[1]);
};

/**
 * Convert this to a THREE vector3
 */
Vector.prototype.toVector3 = function() {
    if(this.dimensions === 2) return new THREE.Vector3(this.q[0].value, this.q[1].value, 0);
    else return new THREE.Vector3(this.q[0].value, this.q[1].value, this.q[2].value);
};

/**
 * Sets an expression for this vector which can be evalulated with eval
 */
Vector.prototype.setExpression = function(expr) {
    this.expr = expr;
};

/**
 * Sets this vector to the result of the evaulation of expression, or if expression is null, returns self
 */
Vector.prototype.eval = function() {
    if(this.expr !== null) {
        this.set(this.expr.evaluate());
    }
    return this;
};

Vector.prototype.toString = function() {
    var str = '(' + this.q[0];
    for(var i = 1; i < this.dimensions; i++) {
        str += ',' + this.q[i];
    }
    return str + ')';
};

function Interval(varstr, start, end, steps) {
    this.varstr = varstr; 

    this.start = start;
    this.end = end;
    this.steps = steps;
    this.step = end.sub(start).div(steps);

    this.expr = null;

    this.arr = null;
}

/**
 * Creates an array of evenly distributed values based on start end (inclusive) and steps
 */
Interval.prototype.array = function() {
    if(this.arr === null) {
        var step = (this.end.value - this.start.value) / (this.steps.value - 1);
        var arr = [];
        for(var x = this.start.value; x < this.end.value + step / 2; x += step) {
            arr.push(new Number(x));
        }
        this.arr = arr;
    }
    return this.arr;
};

Interval.prototype.set = function(i) {
    this.start = i.start;
    this.end = i.end;
    this.steps = i.steps;
    this.arr = i.arr;
};

/**
 * Sets an expression for this vector which can be evalulated with eval
 */
Interval.prototype.setExpression = function(expr) {
    this.expr = expr;
};

/**
 * Sets this vector to the result of the evaulation of expression, or if expression is null, returns self
 */
Interval.prototype.eval = function() {
    if(this.expr !== null) {
        this.set(this.expr.evaluate());
    }
    return this;
};

var MathPlus = {};

MathPlus.epsilon = new Number(1e-7);
MathPlus.epsilonx2 = MathPlus.epsilon.mul(new Number(2));

MathPlus.optimalh = function(x) {
    if(x.abs().compareTo(Number[1]) > 0) {
        return MathPlus.epsilon.mul(x.abs());
    } else {
        return MathPlus.epsilon;
    }
};

MathPlus.singleton = function(x) {
    return new Vector(x);
};

MathPlus.derivative = function(X, t) {
    var h = MathPlus.optimalh(t);
    var tph = t.add(h);
    var tmh = t.sub(h);
    var dt = tph.sub(tmh);
    return X(tph).sub(X(tmh)).div(dt)
};

MathPlus.derivative2 = function(X, t) {
    var h = MathPlus.optimalh(t);
    var tph = t.add(h);
    var tmh = t.sub(h);
    var h2 = tph.sub(t).add(t.sub(tmh));
    return MathPlus.derivative(X, tph).sub(MathPlus.derivative(X, tmh)).div(h2)
};

MathPlus.binormal = function(X, t) {
    var h = MathPlus.optimalh(t);
    return MathPlus.derivative(X, t.add(h)).crs(MathPlus.derivative(X, t.sub(h))).norm();
};

MathPlus.normal = function(X,u,v) {
    if(v === undefined) {
        return MathPlus.binormal(X, u).crs(MathPlus.derivative(X, u)).norm();
    } else {
        var dxdu = X(u.add(MathPlus.epsilon), v).sub(X(u.sub(MathPlus.epsilon), v)).div(MathPlus.epsilonx2);
        var dxdv = X(u, v.add(MathPlus.epsilon)).sub(X(u, v.sub(MathPlus.epsilon))).div(MathPlus.epsilonx2);
        return dxdu.crs(dxdv).norm();
    }
};

MathPlus.perp = function(x) {
    if(x.dimensions === 2) {
        return new Vector(x.q[1], x.q[0].neg())
    }
};

MathPlus.interpolate = function(a, b, alpha) {
    return a.mul(alpha).add(b.mul(Number[1].sub(alpha)));
};

MathPlus.norm = function(x) {
    return x.norm();
};

MathPlus.component = function(v,i) {
    return v.q[i.value];
};

MathPlus.cos = function(x) {
    return new Number(Math.cos(x.value));
};

MathPlus.sin = function(x) {
    return new Number(Math.sin(x.value));
};

MathPlus.sign = function(x) {
    return new Number(Math.sign(x.value));
};

MathPlus.signclamp = function(x, lower, upper) {
    if(x.compareTo(Number[0]) < 0) return lower;
    else if(x.compareTo(Number[0]) > 0) return upper;
    else return Number[0]
};

MathPlus.quadrant = function(x) {
    // if(x.q[0].value === 0 && x.q[1].value === 0) return Number[0];
    if(x.q[0].value >= 0 && x.q[1].value >= 0) {
        return Number[1];
    }
    if(x.q[0].value <= 0 && x.q[1].value >= 0) {
        return Number[2];
    }
    if(x.q[0].value <= 0 && x.q[1].value <= 0) {
        return Number[3];
    }
    if(x.q[0].value >= 0 && x.q[1].value <= 0) {
        return Number[4];
    }
};

MathPlus.octant = function(x) {
    if(x.q[0].value >= 0 && x.q[1].value >= 0 && x.q[2].value >= 0) { // +++
        return Number[1];
    }
    if(x.q[0].value <= 0 && x.q[1].value >= 0 && x.q[2].value >= 0) { // -++
        return Number[2];
    }
    if(x.q[0].value <= 0 && x.q[1].value <= 0 && x.q[2].value >= 0) { // --+
        return Number[3];
    }
    if(x.q[0].value >= 0 && x.q[1].value <= 0 && x.q[2].value >= 0) { // +-+
        return Number[4];
    }
    if(x.q[0].value >= 0 && x.q[1].value >= 0 && x.q[2].value <= 0) { // ++-
        return Number[5];
    }
    if(x.q[0].value <= 0 && x.q[1].value >= 0 && x.q[2].value <= 0) { // -+-
        return Number[6];
    }
    if(x.q[0].value <= 0 && x.q[1].value <= 0 && x.q[2].value <= 0) { // ---
        return Number[7];
    }
    if(x.q[0].value >= 0 && x.q[1].value <= 0 && x.q[2].value <= 0) { // +--
        return Number[8];
    }
};

MathPlus.select = function(i) {
    return arguments[i.value];
};

MathPlus.spectrum = function(x) {
    var y = x.value % 1;
    if(y < 0) y += 1;

    var r,g,b;
    if(y < 1/6) {
        r = 1;
        g = y*6;
        b = 0;
    } else if (y < 2/6) {
        r = 2-y*6;
        g = 1;
        b = 0;
    } else if (y < 3/6) {
        r = 0;
        g = 1;
        b = y*6-2;
    } else if (y < 4/6) {
        r = 0;
        g = 4-y*6;
        b = 1;
    } else if (y < 5/6) {
        r = y*6-4;
        g = 0;
        b = 1;
    } else {
        r = 1;
        g = 0;
        b = 6-y*6;
    }

    return new Vector(new Number(r), new Number(g), new Number(b))
};

MathPlus.abs = function(x) {
    return new Number(Math.abs(x.value));
};

MathPlus.ssign = function(x) {
    return MathPlus.sign(x).mul(MathPlus.abs(x).exp(new Number(0.2)));
};

MathPlus.map= function(v, f) {
    return v.map(f);
};

MathPlus.log = function(x) {
    return new Number(Math.log(x.value))
};

MathPlus.PI = new Number(Math.PI);

function Expression(string, context) {
    this.type = 'Expression';

    this.string = string;

    this.context = context;

    this.variables = [];
    this.function = this.toJSFunction(this.string);
}

Expression.prototype.getVariables = function () {
    var variables = [];
    for (var i = 0; i < this.variables.length; i++) {
        var v = this.variables[i];
        if (this.context.functions[v] !== undefined && variables.includes(v) === false) {
            variables = variables.concat(this.context.functions[v].getVariables());
        } else {
            variables.push(v);
        }
    }
    return variables;
};

Expression.typeOf = function (string) {

    if (string === '()') return 'null';
    if (string.includes('|')) return 'isoline';
    if (string.includes('=')) return 'equation';

    var nestingLevel = 0;
    var isVector = false;
    if (string.charAt(string.length - 1) === '}') {
        if (string.charAt(0) === '{')
            return 'interval'
        else
            return 'parametric'
    }
    if (string.includes('(') === false && string.includes(')') === false) {
        if (/^[0-9.]+$/.test(string)) {
            return 'constant'
        } else if (string.includes('+') || string.includes('-') || string.includes('*') || string.includes('/') || string.includes('^')) {
            return 'expression'
        } else {
            return 'variable'
        }
    }
    for (var i = 0; i < string.length; i++) {
        if (string.charAt(i) === '(') {
            nestingLevel++;
        } else if (string.charAt(i) === ')') {
            nestingLevel--;
        } else
            if (string.charAt(i) === ',' && nestingLevel === 1) {
                isVector = true;
            }
        if (string.charAt(i) === ';' && nestingLevel === 1) {
            return 'matrix';
        }
        if (nestingLevel === 0 && i !== string.length - 1) {
            return 'expression';
        }
    }
    if (isVector) return 'vector';
    return 'expression';
};

Expression.separate = function (str) {
    // Separate into parts which alternate (expression/operator)
    var parts = [];
    var start = 0;
    var nestingLevel = 0;
    var type = null;
    for (var i = 0; i < str.length; i++) {
        if (type === 'interval') {
            if (str.charAt(i) === '}') {
                parts.push({ str: str.substring(start, i + 1), type: type });
                start = i + 1;
                type = null;
            }
        } else if (str.charAt(i) === '{') {
            type = 'interval';
        } else if (str.charAt(i) === '(') {
            nestingLevel++;

            if (type === null) {
                type = 'expression';
            }
            if (type === 'operator' || type === 'uoperator') {
                parts.push({ str: str.substring(start, i), type: type });
                start = i;
                type = 'expression';
            } else if (type === 'variable') {
                type = 'function';
                parts.push({ str: str.substring(start, i), type: type });
                start = i;
                type = 'expression';
            }
        } else if (str.charAt(i) === ')') {
            nestingLevel--;
        } else if (nestingLevel == 0) {
            if (str.charAt(i) === '-' && (type === null || type === 'operator')) {
                if (type === 'operator') {
                    parts.push({ str: str.substring(start, i), type: type });
                    start = i;
                }
                type = 'uoperator';
            } else if (/[0-9a-zA-Z.]/.test(str.charAt(i)) === false || str.charAt(i) === '^') {
                parts.push({ str: str.substring(start, i), type: type });
                start = i;
                type = 'operator';
            } else {
                if (type === null) {
                    type = 'constant';
                }
                if (type === 'operator' || type === 'uoperator') {
                    parts.push({ str: str.substring(start, i), type: type });
                    start = i;
                    type = 'constant';
                }
                if (/[0-9.]/.test(str.charAt(i)) === false)
                    type = 'variable';
            }
        }
    }
    if (start != str.length) {
        parts.push({ str: str.substring(start, str.length), type: type });
    }

    // Split the expressions if applicable
    for (var i = 0; i < parts.length; i++) {
        if (parts[i].type === 'expression') {
            parts[i].type = Expression.typeOf(parts[i].str);
            if (parts[i].type === 'expression') {
                var newstr = parts[i].str.slice(1, parts[i].str.length - 1);
                var newparts = [{ str: '(', type: '(' }].concat(Expression.separate(newstr));
                newparts.push({ str: ')', type: ')' });
                parts = parts.slice(0, i).concat(newparts).concat(parts.slice(i + 1, parts.length));
                i += newparts.length - 1;
            } else if (i > 0 && parts[i].type === 'vector' && parts[i - 1].type === 'function') {
                parts.splice(i, 0, { str: '(', type: '(' });
                parts.splice(i + 2, 0, { str: ')', type: ')' });
            } else if (parts[i].type === 'null') {
                parts[i].str = '';
                parts.splice(i, 0, { str: '(', type: '(' });
                parts.splice(i + 2, 0, { str: ')', type: ')' });
            }
        }
    }
    return parts;
};

Expression.toPostfix = function (parts) {
    var post = [];
    var ops = [];
    var funs = [];
    var precedence = { '+': 0, '-': 0, '*': 1, '/': 1, '^': 2, '(': -1, ')': -1 };
    for (var i = 0; i < parts.length; i++) {
        if (parts[i].type === 'operator' || parts[i].type === 'uoperator') {
            while (ops.length > 0 && (ops[ops.length - 1].type === 'uoperator' || precedence[ops[ops.length - 1].str] >= precedence[parts[i].str])) {
                post.push(ops.pop());
            }
            ops.push(parts[i]);
        } else if (parts[i].type === 'function') {
            funs.push(parts[i]);
        } else if (parts[i].type === '(') {
            ops.push(parts[i]);
        } else if (parts[i].type === ')') {
            while (ops[ops.length - 1].type !== '(') {
                post.push(ops.pop());
            }
            if (funs.length > 0) {
                post.push(funs.pop());
            }
            ops.pop();
        } else {
            post.push(parts[i]);
        }
    }
    while (ops.length > 0) {
        post.push(ops.pop());
    }
    return post;
};

Expression.splitTuple = function (string) {
    var str = string.substring(1, string.length - 1);
    var parts = [];
    var start = 0;
    var nestingLevel = 0;
    for (var i = 0; i < str.length; i++) {
        if (str.charAt(i) === '(') {
            nestingLevel++;
        } else if (str.charAt(i) === ')') {
            nestingLevel--;
        } else if (nestingLevel == 0) {
            if (str.charAt(i) === ',') {
                parts.push(str.substring(start, i));
                start = i + 1;
            }
        }
    }
    parts.push(str.substring(start, str.length));
    return parts;
};

Expression.splitParametric = function (string) {
    return string.split(/(?={)/);
};

Expression.prototype.toJSExpression = function (string, specials, isparam, variables) {
    var str = string.replace(/\s+/g, '');

    var type = Expression.typeOf(str);

    // Expression is an equation:
    if (type === 'equation') {
        var left, right;
        left = string.split('=')[0];
        right = string.split('=')[1];

        var leftParts = Expression.separate(left);

        // variable assignment
        if (leftParts.length === 1 && leftParts[0].type === 'variable') {
            var expr = 'context["' + left + '"]=' + this.toJSExpression(right);
            return expr;
        }

        // function definition
        if (leftParts[0].type === 'function') {
            if (leftParts[2].type === 'null') {
                var expr = 'context["' + leftParts[0].str + '"]=function(){ return ' + this.toJSExpression(right) + '; }';
            } else if (leftParts[2].type === 'vector') {
                var expr = 'context["' + leftParts[0].str + '"]=function' + leftParts[2].str + '{ return ' + this.toJSExpression(right, Expression.splitTuple(leftParts[2].str)) + '; }';
            } else if (leftParts[2].type === 'variable') {
                var expr = 'context["' + leftParts[0].str + '"]=function(' + leftParts[2].str + '){ return ' + this.toJSExpression(right, leftParts[2].str) + '; }';
            }
            this.context.functions[leftParts[0].str] = this;
            return expr;
        }
    } else if (type === 'expression') {
        var operations = Expression.toPostfix(Expression.separate(str));

        var stack = [];

        for (var i = 0; i < operations.length; i++) {
            switch (operations[i].type) {
                case 'null':
                    stack.push('');
                    break;
                case 'variable':
                    if (specials !== undefined && specials.includes(operations[i].str)) {
                        stack.push(operations[i].str);
                    } else {
                        stack.push('context["' + operations[i].str + '"]');
                        if (this.variables.includes(operations[i].str) === false) this.variables.push(operations[i].str);
                    }
                    break;
                case 'constant':
                    stack.push('new Interactive.Number(' + operations[i].str + ')');
                    break;
                case 'vector':
                    var param = operations[i + 1].type === 'function';
                    stack.push(this.toJSExpression(operations[i].str, specials, param));
                    break;
                case 'function':
                    var a = stack.pop();
                    stack.push('context["' + operations[i].str + '"](' + a + ')');
                    if (this.variables.includes(operations[i].str) === false) this.variables.push(operations[i].str);
                    break;
                case 'uoperator':
                    var a = stack.pop();
                    stack.push(a + '.neg()');
                    break;
                case 'operator':
                    var b = stack.pop();
                    var a = stack.pop();
                    switch (operations[i].str) {
                        case '+':
                            stack.push(a + '.add(' + b + ')');
                            break;
                        case '-':
                            stack.push(a + '.sub(' + b + ')');
                            break;
                        case '*':
                            stack.push(a + '.mul(' + b + ')');
                            break;
                        case '/':
                            stack.push(a + '.div(' + b + ')');
                            break;
                        case '^':
                            stack.push(a + '.exp(' + b + ')');
                            break;
                        default:
                            console.log('Interactive.Expression: Unknown symbol');
                    }
                    break;
                default:
                    console.log('Interactive.Expression: Unknown symbol');
            }
        }

        return stack[0];
    } else if (type === 'vector') {
        var components = Expression.splitTuple(str);
        if (isparam) {
            var expr = '';
            for (var i = 0; i < components.length; i++) {
                expr += this.toJSExpression(components[i], specials) + ',';
            }
            expr = expr.slice(0, expr.length - 1);
            return expr;
        } else {
            var expr = 'new Interactive.Vector(';
            for (var i = 0; i < components.length; i++) {
                expr += this.toJSExpression(components[i], specials) + ',';
            }
            expr = expr.slice(0, expr.length - 1) + ')';
            return expr;
        }
    } else if (type === 'interval') {
        var params = Expression.splitTuple(str);

        var expr = 'new Interactive.Interval("' + params[0] + '",';
        for (var i = 1; i < params.length; i++) {
            expr += this.toJSExpression(params[i], specials) + ',';
        }
        expr = expr.slice(0, expr.length - 1) + ')';
        return expr;
    } else if (type === 'variable') {
        if (specials !== undefined && specials.includes(str)) return str
        var expr = 'context["' + str + '"]';
        if (this.variables.includes(str) === false) this.variables.push(str);
        return expr;
    } else if (type === 'parametric') {
        var params = Expression.splitParametric(str);
        var func = 'function(';
        var intervals = '';

        if (specials === undefined) specials = [];

        for (var i = 1; i < params.length; i++) {
            var arg = Expression.splitTuple(params[i])[0];
            specials.push(arg);
            func += arg + ',';

            intervals += ',' + this.toJSExpression(params[i]);
        }

        func = func.slice(0, func.length - 1) + ') { return ' + this.toJSExpression(params[0], specials) + '; }';

        var expr = 'new Interactive.Parametric(' + func + intervals + ')';
        return expr;
    } else if (type === 'constant') {
        var expr = 'new Interactive.Number(' + str + ')';
        return expr;
    } else if (type === 'isoline') {
        var parts = str.split('|');
        var parametric = this.toJSExpression(parts[0]);
        var axis = parts[1].split('=')[0];
        var level = this.toJSExpression(parts[1].split('=')[1]);

        var expr = 'new Interactive.Isoline(' + parametric + ',"' + parts[0] + '","' + axis + '",' + level + ')';
        return expr;
    }
};

Expression.prototype.toJSFunction = function (string) {
    var expr = this.toJSExpression(string);
    return Function('context', 'return ' + expr + ';');
};

/**
 * Variables from given context will override variables from this context 
 */
Expression.prototype.evaluate = function () {
    return this.function(this.context);
};

Expression.getDefaultContext = function () {
    return Object.assign({ functions: {} }, MathPlus);
};

function Plottable(plot, expr, opts) {
    /**
     * (Read-only)
     */
    this.isPlottableInstance = true;

    this.plot = plot;
    
    if(expr) {
        this.expr = new Expression(expr, plot.context);
    }
    
    this.sceneObject = null;
    this.validated = false;
}

Plottable.prototype.getVariables = function() {
    if(!this.expr) {
        return []
    }
    return this.expr.getVariables();
};

/**
 * Returns an object that can be added to a THREE.js scene.
 */
Plottable.prototype.getSceneObject = function() {
    if(this.validated === false) {
        this.sceneObject = this.createSceneObject();
        this.validated = true;
    }
    return this.sceneObject;
};

/**
 * Creates the sceneObject
 */
Plottable.prototype.createSceneObject = function() {
    console.log('Interactive.' + this._proto_.constructor.name + ': Method not implemented');
    return null;
};


/**
 * Updates on the next call to render
 */
Plottable.prototype.invalidate = function() {
    this.validated = false;
};

/**
 * Object that represents an arrow in 3d space.
 * @param {*} vector The vector which this object is based on
 * @param {*} opts Options to customize the appearance of the arrow. Includes:
 * origin -- Point at which the arrow starts. Default is (0, 0, 0)
 * hex -- hexadecimal value to define color. Default is 0xffff00.
 * headLength -- The length of the head of the arrow. Default is 0.2 * length.
 * headWidth -- The length of the width of the arrow. Default is 0.2 * headLength.
 * (Derived from THREE.js)
 */
function Arrow3D(plot, expr, opts) {
    Plottable.call(this, plot, expr, opts);
    
    this.opts = {};
    this.opts.origin = opts.origin !== undefined ? new Expression(opts.origin, plot.context) : new Expression('(0,0,0)', plot.context);
    this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;
}

Arrow3D.prototype = Object.create(Plottable.prototype);
Arrow3D.prototype.constructor = Arrow3D;

Arrow3D.prototype.getVariables = function() {    
    if(this.opts.origin !== undefined) return this.expr.getVariables().concat(this.opts.origin.getVariables());
    else return this.expr.getVariables()
};

Arrow3D.prototype.createSceneObject = function() {
    var _vector3 = this.expr.evaluate().toVector3();
    var _dir = _vector3.clone().normalize();
    var _origin = this.opts.origin.evaluate().toVector3();
    var _length = _vector3.length();
    var _hex = this.opts.hex;
    var _headLength = this.opts.headLength !== undefined ? this.opts.headLength : 0.2 * _length;
    var _headWidth = this.opts.headWidth !== undefined ? this.opts.headWidth : 0.2 * _headLength;

    return new THREE.ArrowHelper(_dir, _origin, _length, _hex, _headLength, _headWidth);
};

var vert = 'attribute float direction; \nattribute vec3 position;\nattribute vec3 next;\nattribute vec3 previous;\nattribute vec4 color;\nuniform mat4 projectionMatrix;\nuniform mat4 modelMatrix;\nuniform mat4 viewMatrix;\nuniform float aspect;\n\nuniform float thickness;\nuniform int miter;\n\nvarying vec4 vColor;\n\nvoid main() {\n  vColor = color;\n    \n  vec2 aspectVec = vec2(aspect, 1.0);\n  mat4 projViewModel = projectionMatrix * viewMatrix * modelMatrix;\n  vec4 previousProjected = projViewModel * vec4(previous, 1.0);\n  vec4 currentProjected = projViewModel * vec4(position, 1.0);\n  vec4 nextProjected = projViewModel * vec4(next, 1.0);\n\n  \/\/get 2D screen space with W divide and aspect correction\n  vec2 currentScreen = currentProjected.xy \/ currentProjected.w * aspectVec;\n  vec2 previousScreen = previousProjected.xy \/ previousProjected.w * aspectVec;\n  vec2 nextScreen = nextProjected.xy \/ nextProjected.w * aspectVec;\n\n  float len = thickness;\n  float orientation = direction;\n\n  \/\/starting point uses (next - current)\n  vec2 dir = vec2(0.0);\n  if (currentScreen == previousScreen) {\n    dir = normalize(nextScreen - currentScreen);\n  } \n  \/\/ending point uses (current - previous)\n  else if (currentScreen == nextScreen) {\n    dir = normalize(currentScreen - previousScreen);\n  }\n  \/\/somewhere in middle, needs a join\n  else {\n    \/\/get directions from (C - B) and (B - A)\n    vec2 dirA = normalize((currentScreen - previousScreen));\n    if (miter == 1) {\n      vec2 dirB = normalize((nextScreen - currentScreen));\n      \/\/now compute the miter join normal and length\n      vec2 tangent = normalize(dirA + dirB);\n      vec2 perp = vec2(-dirA.y, dirA.x);\n      vec2 miter = vec2(-tangent.y, tangent.x);\n      dir = tangent;\n      len = thickness \/ dot(miter, perp);\n    } else {\n      dir = dirA;\n    }\n  }\n  vec2 normal = vec2(-dir.y, dir.x);\n  normal *= len\/2.0;\n  normal.x \/= aspect;\n\n  vec4 offset = vec4(normal * orientation, 0.0, 0.0);\n  gl_Position = currentProjected + offset;\n  gl_PointSize = 1.0;\n}';
var frag = '#ifdef GL_ES\nprecision mediump float;\n#endif\n\nvarying vec4 vColor;\n\nvoid main() {\n  gl_FragColor = vec4(vColor);\n}';

function LineMaterialCreator(thickness, vwidth, vheight) {
    this.getMaterial = function () {
        return new THREE.RawShaderMaterial({
            uniforms: {
                thickness: { value: thickness / vwidth },
                miter: { value: 0 },
                aspect: { value: vwidth / vheight }
            },
            vertexShader: vert,
            fragmentShader: frag
        });
    };
}

function Parametric3D(parent, expr, opts) {
    Plottable.call(this, parent.parent, expr, opts);

    this.parent = parent;
    this.opts = opts !== undefined? opts: {};

    if(this.opts.color !== undefined) {
        this.color = new Expression(this.opts.color, this.plot.context);
        this.colorf = this.color.evaluate();
    }
    if(this.opts.wireframe === undefined) this.opts.wireframe = false;
    if(this.opts.flat === undefined) this.opts.flat = false;
    if(this.opts.smooth === undefined) this.opts.smooth = true;
    if(this.opts.thick === undefined) this.opts.thick = false;
}

Parametric3D.prototype = Object.create(Plottable.prototype);
Parametric3D.prototype.constructor = Parametric3D;

Parametric3D.prototype.getVariables = function() {
    if(this.opts.color !== undefined) return this.expr.getVariables().concat(this.color.getVariables());
    else return this.expr.getVariables();
};

Parametric3D.prototype.createLine = function(par) {
 var geom = new THREE.BufferGeometry();
    var int = par.intervals[0];
    var tarr = int.array();

    var direction = new Float32Array(tarr.length * 2);
    var vertices = new Float32Array(tarr.length * 3 * 2);
    var previous = new Float32Array(tarr.length * 3 * 2);
    var next = new Float32Array(tarr.length * 3 * 2);

    var colors = new Uint8Array(tarr.length * 4 * 2);

    for(var i = 0; i < tarr.length; i++) {
        var t = tarr[i];

        direction[i*2] = 1;
        direction[i*2+1] = -1;

        // geom.vertices.push(par.func(t).toVector3());
        var v = par.func(t).toVector3();
        vertices[i*6] = v.x;
        vertices[i*6+1] = v.y;
        vertices[i*6+2] = v.z;

        vertices[i*6+3] = v.x;
        vertices[i*6+4] = v.y;
        vertices[i*6+5] = v.z;

        if(i > 0) {
            previous[i*6] = vertices[i*6-6];
            previous[i*6+1] = vertices[i*6-5];
            previous[i*6+2] = vertices[i*6-4];
            previous[i*6+3] = vertices[i*6-3];
            previous[i*6+4] = vertices[i*6-2];
            previous[i*6+5] = vertices[i*6-1];

            next[i*6-6] = vertices[i*6];
            next[i*6-5] = vertices[i*6+1];
            next[i*6-4] = vertices[i*6+2];
            next[i*6-3] = vertices[i*6+3];
            next[i*6-2] = vertices[i*6+4];
            next[i*6-1] = vertices[i*6+5];
        }

        if(this.color !== undefined) {
            var color = this.colorf(t);
            // geom.colors[i] = new THREE.Color(color.q[0].value, color.q[1].value, color.q[2].value)
            colors[i*8] = color.q[0].value * 255;
            colors[i*8 + 1] = color.q[1].value * 255;
            colors[i*8 + 2] = color.q[2].value * 255;
            colors[i*8 + 3] = 255;
            colors[i*8 + 4] = color.q[0].value * 255;
            colors[i*8 + 5] = color.q[1].value * 255;
            colors[i*8 + 6] = color.q[2].value * 255;
            colors[i*8 + 7] = 255;
        } else {
            colors[i*8] = 255;
            colors[i*8 + 1] = 255;
            colors[i*8 + 2] = 255;
            colors[i*8 + 3] = 255;
            colors[i*8 + 4] = 255;
            colors[i*8 + 5] = 255;
            colors[i*8 + 6] = 255;
            colors[i*8 + 7] = 255;
        }
    }

    previous[0] = vertices[0];
    previous[1] = vertices[1];
    previous[2] = vertices[2];
    previous[3] = vertices[3];
    previous[4] = vertices[4];
    previous[5] = vertices[5];
    next[tarr.length*6-6] = vertices[tarr.length*6-6];
    next[tarr.length*6-5] = vertices[tarr.length*6-5];
    next[tarr.length*6-4] = vertices[tarr.length*6-4];
    next[tarr.length*6-3] = vertices[tarr.length*6-3];
    next[tarr.length*6-2] = vertices[tarr.length*6-2];
    next[tarr.length*6-1] = vertices[tarr.length*6-1];

    geom.addAttribute('direction', new THREE.BufferAttribute(direction, 1));
    geom.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.addAttribute('previous', new THREE.BufferAttribute(previous, 3));
    geom.addAttribute('next', new THREE.BufferAttribute(next, 3));
    geom.addAttribute('color', new THREE.BufferAttribute(colors, 4, true));

    var mat = new LineMaterialCreator(this.opts.thick === true ? 30 : 15, this.parent.frame.width, this.parent.frame.height).getMaterial();
    var mesh = new THREE.Mesh(geom, mat);
    mesh.drawMode = THREE.TriangleStripDrawMode;
    return mesh
};

Parametric3D.prototype.createSurface = function(par) {
    var geom = new THREE.Geometry();
    var uint = par.intervals[0];
    var vint = par.intervals[1];
    var uarr = uint.array();
    var varr = vint.array();
    var colors = [];

    for(var i = 0; i < uarr.length; i++) {
        var u = uarr[i];
        for(var j = 0; j < varr.length; j++) {
            var v = varr[j];

            var vert = par.func(u,v).toVector3();
            geom.vertices.push(vert);

            if(this.color !== undefined) {
                var color = this.colorf(u,v);
                colors.push(new THREE.Color(color.q[0].value, color.q[1].value, color.q[2].value));
            }

            if(i > 0 && j > 0) {
                var v1 = i * varr.length + j;
                var v2 = i * varr.length + j - 1;
                var v3 = (i - 1) * varr.length + j;
                var v4 = (i - 1) * varr.length + j - 1;

                var f1 = new THREE.Face3(v1, v2, v4);
                var f2 = new THREE.Face3(v1, v4, v3);

                if(this.color !== undefined) {
                    f1.vertexColors[0] = colors[v1];
                    f1.vertexColors[1] = colors[v2];
                    f1.vertexColors[2] = colors[v4];

                    f2.vertexColors[0] = colors[v1];
                    f2.vertexColors[1] = colors[v4];
                    f2.vertexColors[2] = colors[v3];
                }

                geom.faces.push(f1);                
                geom.faces.push(f2);
            }
        }
    }
    geom.mergeVertices();
    geom.computeVertexNormals();

    var opts = {};
    if(this.color !== undefined) {
        opts['vertexColors'] = THREE.VertexColors;
    }
    if(this.opts.smooth === false) {
        opts['shading'] = THREE.FlatShading;
    }

    if(this.opts.wireframe === true || this.opts.flat === true) {
        var mat = new THREE.MeshBasicMaterial(opts);
        if(this.opts.wireframe) mat.wireframe = true;
    } else {
        var mat = new THREE.MeshLambertMaterial(opts);
    }
    mat.side = THREE.DoubleSide;
    return new THREE.Mesh( geom, mat );
};

Parametric3D.prototype.createSceneObject = function() {
    var par = this.expr.evaluate();
    if(par.intervals.length === 1) {
        return this.createLine(par);
    } else {
        return this.createSurface(par);
    }
};

function Line(vertices, colors, mat) {

    var geom = new THREE.BufferGeometry();

    var direction = new Float32Array(vertices.length * 2);
    var vertbuff = new Float32Array(vertices.length * 3 * 2);
    var previous = new Float32Array(vertices.length * 3 * 2);
    var next = new Float32Array(vertices.length * 3 * 2);

    var colorbuff = new Uint8Array(vertices.length * 4 * 2);

    for(var i = 0; i < vertices.length; i++) {
        direction[i*2] = 1;
        direction[i*2+1] = -1;

        var v = vertices[i];
        vertbuff[i*6] = v.x;
        vertbuff[i*6+1] = v.y;
        vertbuff[i*6+2] = v.z;

        vertbuff[i*6+3] = v.x;
        vertbuff[i*6+4] = v.y;
        vertbuff[i*6+5] = v.z;

        if(i > 0) {
            previous[i*6] = vertbuff[i*6-6];
            previous[i*6+1] = vertbuff[i*6-5];
            previous[i*6+2] = vertbuff[i*6-4];
            previous[i*6+3] = vertbuff[i*6-3];
            previous[i*6+4] = vertbuff[i*6-2];
            previous[i*6+5] = vertbuff[i*6-1];

            next[i*6-6] = vertbuff[i*6];
            next[i*6-5] = vertbuff[i*6+1];
            next[i*6-4] = vertbuff[i*6+2];
            next[i*6-3] = vertbuff[i*6+3];
            next[i*6-2] = vertbuff[i*6+4];
            next[i*6-1] = vertbuff[i*6+5];
        }

        if(colors !== undefined) {
            var color = colors[i];
            colorbuff[i*8] = color.r * 255;
            colorbuff[i*8 + 1] = color.g * 255;
            colorbuff[i*8 + 2] = color.b * 255;
            colorbuff[i*8 + 3] = 255;
            colorbuff[i*8 + 4] = color.r * 255;
            colorbuff[i*8 + 5]  =color.g * 255;
            colorbuff[i*8 + 6] = color.b * 255;
            colorbuff[i*8 + 7] = 255;
        } else {
            colorbuff[i*8] = 255;
            colorbuff[i*8 + 1] = 255;
            colorbuff[i*8 + 2] = 255;
            colorbuff[i*8 + 3] = 255;
            colorbuff[i*8 + 4] = 255;
            colorbuff[i*8 + 5] = 255;
            colorbuff[i*8 + 6] = 255;
            colorbuff[i*8 + 7] = 255;
        }
    }

    previous[0] = vertbuff[0];
    previous[1] = vertbuff[1];
    previous[2] = vertbuff[2];
    previous[3] = vertbuff[3];
    previous[4] = vertbuff[4];
    previous[5] = vertbuff[5];
    next[vertices.length*6-6] = vertbuff[vertices.length*6-6];
    next[vertices.length*6-5] = vertbuff[vertices.length*6-5];
    next[vertices.length*6-4] = vertbuff[vertices.length*6-4];
    next[vertices.length*6-3] = vertbuff[vertices.length*6-3];
    next[vertices.length*6-2] = vertbuff[vertices.length*6-2];
    next[vertices.length*6-1] = vertbuff[vertices.length*6-1];

    geom.addAttribute('direction', new THREE.BufferAttribute(direction, 1));
    geom.addAttribute('position', new THREE.BufferAttribute(vertbuff, 3));
    geom.addAttribute('previous', new THREE.BufferAttribute(previous, 3));
    geom.addAttribute('next', new THREE.BufferAttribute(next, 3));
    geom.addAttribute('color', new THREE.BufferAttribute(colorbuff, 4, true));

    var mesh = new THREE.Mesh(geom, mat);
    mesh.drawMode = THREE.TriangleStripDrawMode;
    return mesh
}

function Isoline3D(parent, expr, opts) {
    Plottable.call(this, parent.parent, expr, opts);

    this.parent = parent;
    this.isoline = this.expr.evaluate();
    this.parExpr = new Expression(this.isoline.parametricExpr, this.plot.context);

    this.opts = opts !== undefined ? opts : {};

    this.sfld = [];

    this.sfldValidated = false;

    if (this.opts.color !== undefined) {
        this.color = new Expression(this.opts.color, this.plot.context);
        this.colorf = this.color.evaluate();
    }
    // if(this.opts.axis === undefined) this.opts.axis = 'y';
    this.lineWidth = this.opts.thick === true ? 40 : 15;
}

Isoline3D.prototype = Object.create(Plottable.prototype);
Isoline3D.prototype.constructor = Isoline3D;

Isoline3D.prototype.getVariables = function () {
    if (this.opts.color !== undefined) return this.expr.getVariables().concat(this.color.getVariables());
    else return this.expr.getVariables();
};

Isoline3D.prototype.createScalarField = function (par) {
    var uint = par.intervals[0];
    var vint = par.intervals[1];

    var uarr = uint.array();
    var varr = vint.array();

    var func = par.func;
    var sfld = [];
    for (var i = 0; i < uarr.length; i++) {
        var u = uarr[i];
        sfld.push([]);
        for (var j = 0; j < varr.length; j++) {
            var v = varr[j];

            var vert = func(u, v);

            sfld[sfld.length - 1].push(vert);
        }
    }
    this.sfld = sfld;
};

Isoline3D.prototype.lerp = function (a, b, az, z, bz) {
        var alpha = z.sub(az).div(bz.sub(az));
        var result = a.mul(Number[1].sub(alpha)).add(b.mul(alpha));
        result.q[1] = z;
        return result.toVector3();
};

Isoline3D.prototype.createIsoline = function (isoline) {
    var par = isoline.parametric;

    var uint = par.intervals[0];
    var vint = par.intervals[1];

    var uarr = uint.array();
    var varr = vint.array();

    var lvl = isoline.level;

    if (this.sfldValidated === false) this.createScalarField(par);

    var edges = [];

    for (var i = 0; i < uarr.length - 1; i++) {
        for (var j = 0; j < varr.length - 1; j++) {
            var a = this.sfld[i][j + 1];
            var b = this.sfld[i + 1][j + 1];
            var c = this.sfld[i + 1][j];
            var d = this.sfld[i][j];

            var cse = (d.q[1].compareTo(lvl) > 0);
            cse = cse * 2 + (c.q[1].compareTo(lvl) > 0);
            cse = cse * 2 + (b.q[1].compareTo(lvl) > 0);
            cse = cse * 2 + (a.q[1].compareTo(lvl) > 0);

            switch (cse) {
                case 0:
                case 15:
                    break;
                case 1:
                case 14:
                    var v1 = this.lerp(a, d, a.q[1], lvl, d.q[1]);
                    var v2 = this.lerp(a, b, a.q[1], lvl, b.q[1]);
                    edges.push([v1, v2]);
                    break;
                case 2:
                case 13:
                    var v1 = this.lerp(a, b, a.q[1], lvl, b.q[1]);
                    var v2 = this.lerp(b, c, b.q[1], lvl, c.q[1]);
                    edges.push([v1, v2]);
                    break;
                case 3:
                case 12:
                    var v1 = this.lerp(a, d, a.q[1], lvl, d.q[1]);
                    var v2 = this.lerp(b, c, b.q[1], lvl, c.q[1]);
                    edges.push([v1, v2]);
                    break;
                case 4:
                case 11:
                    var v1 = this.lerp(b, c, b.q[1], lvl, c.q[1]);
                    var v2 = this.lerp(c, d, c.q[1], lvl, d.q[1]);
                    edges.push([v1, v2]);
                    break;
                case 5:
                case 10:
                    if ((cse === 10) ^ (a.q[i].add(b.q[i]).add(c.q[i]).add(d.q[i]).compareTo(lvl.mul(4)) > 0)) {
                        var v1 = this.lerp(a, d, a.q[1], lvl, d.q[1]);
                        var v2 = this.lerp(c, d, c.q[1], lvl, d.q[1]);
                        var v3 = this.lerp(a, b, a.q[1], lvl, b.q[1]);
                        var v4 = this.lerp(b, c, b.q[1], lvl, c.q[1]);
                        edges.push([v1, v2]);
                        edges.push([v3, v4]);
                    } else {
                        var v1 = this.lerp(a, b, a.q[1], lvl, b.q[1]);
                        var v2 = this.lerp(a, d, a.q[1], lvl, d.q[1]);
                        var v3 = this.lerp(b, c, b.q[1], lvl, c.q[1]);
                        var v4 = this.lerp(c, d, c.q[1], lvl, d.q[1]);
                        edges.push([v1, v2]);
                        edges.push([v3, v4]);
                    }
                    break;
                case 6:
                case 9:
                    var v1 = this.lerp(a, b, a.q[1], lvl, b.q[1]);
                    var v2 = this.lerp(c, d, c.q[1], lvl, d.q[1]);
                    edges.push([v1, v2]);
                    break;
                case 7:
                case 8:
                    var v1 = this.lerp(a, d, a.q[1], lvl, d.q[1]);
                    var v2 = this.lerp(c, d, c.q[1], lvl, d.q[1]);
                    edges.push([v1, v2]);
                    break;
            }
        }
    }

    // merge vertices

    var equiv = function(a,b) {
        return a.distanceTo(b) < 0.000005;
    };

    var curves = [];
    while(edges.length > 0) {
        var e = edges.pop();
        (function() {
            for(var i = 0; i < edges.length; i++) {
                var edge = edges[i];
                if (equiv(edge[0], e[0])) {
                    e.reverse();
                    edges[i] = e.concat(edge.slice(1));
                    return;
                } else if (equiv(edge[0], e[e.length - 1])) {
                    edges[i] = e.concat(edge.slice(1));
                    return;
                } else if (equiv(edge[edge.length - 1], e[0])) {
                    edges[i] = edge.concat(e.slice(1));
                    return;
                } else if (equiv(edge[edge.length - 1], e[e.length - 1])) {
                    e.reverse();
                    edges[i] = edge.concat(e.slice(1));
                    return;
                }
            }
            curves.push(e);
            return;
        })();
    }

    var objct = new THREE.Group();

    var mat = new LineMaterialCreator(this.lineWidth, this.parent.frame.width, this.parent.frame.height).getMaterial();
    for(var i = 0; i < curves.length; i++) {
        var colors = undefined;
        if(this.opts.color !== undefined) {
            colors = [];
            for(var j = 0; j < curves[i].length; j++) {
                var v = new Vector(curves[i][j]);
                var color = this.colorf(v);
                colors.push(new THREE.Color(color.q[0].value, color.q[1].value, color.q[2].value));
            }
        }
        objct.add(Line(curves[i],colors,mat));
    }
    return objct
};

Isoline3D.prototype.createSceneObject = function() {
    this.isoline = this.expr.evaluate();
    return this.createIsoline(this.isoline);
};

Isoline3D.prototype.invalidate = function (expr) {
    if (this.parExpr.getVariables().includes(expr)) this.sfldValidated = false;
    this.validated = false;
};

function Axes3D(parent, container, opts) {
    Axes.call(this, parent, container, opts);

    /**
     * Used internally for optimization (Read-only)
     */
    this.isAxes3DInstance = true;

    /**
     * The point which the camera will orbit around
     */
    this.corigin = this.frame.scene.position.clone();

    /**
     * Camera which renders the axes. 
     */
    this.camera = new THREE.PerspectiveCamera( 50, this.frame.width / this.frame.height, .01, 50);

    // Initialize camera position
    this.camera.position.x = 4;
    this.camera.position.y = 3;
    this.camera.position.z = 2;
    this.camera.lookAt(this.corigin);

    // Bind events
    var _self = this;

    // Bind Events: Panning and Orbiting
    var _cameraStartPol = 0;
    var _cameraStartAz = 0;
    var _cameraStartR = 1;
    var _cameraStartUp = 1;
    var _cameraStartOr = null;
    var _cameraStartPos = null;
    var _upUnit = null;
    var _rightUnit = null;
    var _self = this;

    this.frame.container.addEventListener('mousedown', function(event) {
        if(event.buttons & 1) {
            var sc = new THREE.Spherical();
            sc.setFromVector3(_self.camera.position.clone().sub(_self.corigin));
            _cameraStartPol = sc.phi;
            _cameraStartAz = sc.theta;
            _cameraStartR = sc.r;
        }
        if(event.buttons & 2) {
            _cameraStartOr = _self.corigin.clone();
            _cameraStartPos = _self.camera.position.clone();
            var nor = _self.camera.getWorldDirection();
            _rightUnit = nor.clone().cross(new THREE.Vector3(0,1,0));
            _upUnit = nor.clone().applyAxisAngle(_rightUnit, Math.PI / 2);
        }
        _cameraStartUp = _self.camera.up.y;
    });

    this.frame.touchEventListener.onpan = function(event) {
        if(event.rightButtonDown) {
            // Prevent default if mouse moved significantly
            if((event.screenX - event.screenStartX) * (event.screenX - event.screenStartX) + (event.screenY - event.screenStartY) * (event.screenY - event.screenStartY) > 25) {
                event.suppressContextMenu();
            }
        
            // Pan camera            
            var r = _self.camera.position.distanceTo(_self.corigin);
            var disp = _upUnit.clone().multiplyScalar((event.screenY - event.screenStartY)).addScaledVector(_rightUnit, -(event.screenX - event.screenStartX));
            var newCamPos = _cameraStartPos.clone().addScaledVector(disp, _cameraStartUp * 0.002 * r);
            var newOrPos = _cameraStartOr.clone().addScaledVector(disp, _cameraStartUp * 0.002 * r);
            _self.camera.position.copy(newCamPos);
            _self.corigin.copy(newOrPos);
            _self.camera.lookAt(_self.corigin);
        }
        if(event.leftButtonDown) {
            event.preventDefault();

            var r = _self.camera.position.distanceTo(_self.corigin);
            var az = _cameraStartAz -  _cameraStartUp * (event.screenX - event.screenStartX) / 100;
            var pol = _cameraStartPol - _cameraStartUp * (event.screenY - event.screenStartY) / 100;

            while(pol > Math.PI) {
                pol -= 2 * Math.PI;
            } 
            while(pol <= -Math.PI) {
                pol += 2 * Math.PI;
            }

            if(pol * _cameraStartUp < 0) {
                _self.camera.up.y = -1;
            }
            if(pol * _cameraStartUp> 0) {
                _self.camera.up.y = 1;
            }

            _self.camera.position.setFromSpherical(new THREE.Spherical(r, pol, az)).add(_self.corigin);
            _self.camera.lookAt(_self.corigin);
        }
    };

    // Bind Events: Zooming
    this.frame.touchEventListener.onzoom = function(event) {
        if(_self.fixedZoom === false) {
            event.suppressScrolling();
            var newPos = _self.corigin.clone().addScaledVector(_self.camera.position.clone().sub(_self.corigin), Math.pow(1.25, event.amount / 100));
            _self.camera.position.copy(newPos);
            _self.camera.lookAt(_self.corigin);
        }
    };

    // Setup some 3d scene stuff
    var ambientLight = new THREE.AmbientLight(0x303040);
    var directionalLight1 = new THREE.DirectionalLight(0xffe8d8, .4);
    var directionalLight2 = new THREE.DirectionalLight(0xffe8d8, .2);
    directionalLight2.position.y = -1;

    this.camLight = new THREE.PointLight(0xffffff, .5);

    this.frame.scene.add(ambientLight);
    this.frame.scene.add(directionalLight1);
    this.frame.scene.add(directionalLight2);
}

Axes3D.prototype = Object.create(Axes.prototype);
Axes3D.prototype.constructor = Axes3D;

/**
 * Render the axes
 */
Axes3D.prototype.render = function() {
    this.frame.scene.remove(this.camLight);
    this.camLight.position.copy(this.camera.position);
    this.frame.scene.add(this.camLight);

    Axes.prototype.render.call(this);
};

/**
 * Plot an expression
 */
Axes3D.prototype.plotExpression = function(expr, type, opts) {
    switch(type) {
        case 'arrow':            
            var figure = new Arrow3D(this.parent, expr, opts);
            this.expressions[expr] = figure;
            this.addFigure(figure);
            return figure;
        case 'parametric':           
            var par = new Parametric3D(this, expr, opts);
            this.expressions[expr] = par;
            this.addFigure(par);
            return par;
        case 'isoline':
            var iso = new Isoline3D(this, expr, opts);
            this.expressions[expr] = iso;
            this.addFigure(iso);
            return iso;
        default:
            console.log('Interactive.Axes3D: Invalid plot type');
            return null;
    }
};

/**
 * Object that represents an arrow in 2d space.
 * @param {*} vector The vector which this object is based on
 * @param {*} opts Options to customize the appearance of the arrow. Includes:
 * origin -- Point at which the arrow starts. Default is (0, 0)
 * hex -- hexadecimal value to define color. Default is 0xffff00.
 * headLength -- The length of the head of the arrow. Default is 0.2.
 * headWidth -- The length of the width of the arrow. Default is 0.05.
 * (Derived from THREE.js)
 */
function Arrow2D(plot, expr, opts) {
    Plottable.call(this, plot, expr, opts);

    this.opts = {};
    this.opts.origin = opts.origin !== undefined ? new Expression(opts.origin, plot.context) : new Expression('(0,0,0)', plot.context);
    this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;
    this.opts.headLength = opts.headLength !== undefined ? opts.headLength : 0.2;
    this.opts.headWidth = opts.headWidth !== undefined ? opts.headWidth : 0.05;
}

Arrow2D.prototype = Object.create(Plottable.prototype);
Arrow2D.prototype.constructor = Arrow2D;

Arrow2D.prototype.getVariables = function() {
    return this.expr.getVariables().concat(this.opts.origin.getVariables());
};

Arrow2D.prototype.createSceneObject = function() {
    var _vector2 = this.expr.evaluate().toVector3();
    var _dir = _vector2.clone().normalize();
    var _length = _vector2.length();
    var _origin = this.opts.origin.evaluate().toVector3();
    var _hex = this.opts.hex;
    var _headLength = this.opts.headLength;
    var _headWidth = this.opts.headWidth;

    return new THREE.ArrowHelper(_dir, _origin, _length, _hex, _headLength, _headWidth);
};

function Hotspot2D(plot, expr) {
    this.isHotspot2DInstance = true;
    
    this.plot = plot;
    this.expr = new Expression(expr, plot.context);
    this.position = this.expr.evaluate().clone();
    this.size = 10;
}

Hotspot2D.prototype.ondrag = function(event) {
    this.position.q[0] = event.worldX;
    this.position.q[1] = event.worldY;

    this.plot.context[this.expr.string].q[0] = event.worldX;
    this.plot.context[this.expr.string].q[1] = event.worldY;

    this.plot.refresh(this.expr.string);
};

function Parametric2D(parent, expr, opts) {
    Plottable.call(this, parent.parent, expr, opts);

    this.parent = parent;
    this.opts = opts !== undefined? opts: {};

    if(this.opts.color !== undefined) {
        this.color = new Expression(this.opts.color, this.plot.context);
        this.colorf = this.color.evaluate();
    }
    if(this.opts.thick === undefined) this.opts.thick = false;
}

Parametric2D.prototype = Object.create(Plottable.prototype);
Parametric2D.prototype.constructor = Parametric2D;

Parametric2D.prototype.getVariables = function() {
    if(this.opts.color !== undefined) return this.expr.getVariables().concat(this.color.getVariables());
    else return this.expr.getVariables();
};

Parametric2D.prototype.createLine = function(par) {
    var geom = new THREE.BufferGeometry();
    var int = par.intervals[0];
    var tarr = int.array();

    var direction = new Float32Array(tarr.length * 2);
    var vertices = new Float32Array(tarr.length * 3 * 2);
    var previous = new Float32Array(tarr.length * 3 * 2);
    var next = new Float32Array(tarr.length * 3 * 2);

    var colors = new Uint8Array(tarr.length * 4 * 2);

    for(var i = 0; i < tarr.length; i++) {
        var t = tarr[i];

        direction[i*2] = 1;
        direction[i*2+1] = -1;

        // geom.vertices.push(par.func(t).toVector3());
        var v = par.func(t).toVector3();
        vertices[i*6] = v.x;
        vertices[i*6+1] = v.y;
        vertices[i*6+2] = v.z;

        vertices[i*6+3] = v.x;
        vertices[i*6+4] = v.y;
        vertices[i*6+5] = v.z;

        if(i > 0) {
            previous[i*6] = vertices[i*6-6];
            previous[i*6+1] = vertices[i*6-5];
            previous[i*6+2] = vertices[i*6-4];
            previous[i*6+3] = vertices[i*6-3];
            previous[i*6+4] = vertices[i*6-2];
            previous[i*6+5] = vertices[i*6-1];

            next[i*6-6] = vertices[i*6];
            next[i*6-5] = vertices[i*6+1];
            next[i*6-4] = vertices[i*6+2];
            next[i*6-3] = vertices[i*6+3];
            next[i*6-2] = vertices[i*6+4];
            next[i*6-1] = vertices[i*6+5];
        }

        if(this.color !== undefined) {
            var color = this.colorf(t);
            // geom.colors[i] = new THREE.Color(color.q[0].value, color.q[1].value, color.q[2].value)
            colors[i*8] = color.q[0].value * 255;
            colors[i*8 + 1] = color.q[1].value * 255;
            colors[i*8 + 2] = color.q[2].value * 255;
            colors[i*8 + 3] = 255;
            colors[i*8 + 4] = color.q[0].value * 255;
            colors[i*8 + 5] = color.q[1].value * 255;
            colors[i*8 + 6] = color.q[2].value * 255;
            colors[i*8 + 7] = 255;
        } else {
            colors[i*8] = 255;
            colors[i*8 + 1] = 255;
            colors[i*8 + 2] = 255;
            colors[i*8 + 3] = 255;
            colors[i*8 + 4] = 255;
            colors[i*8 + 5] = 255;
            colors[i*8 + 6] = 255;
            colors[i*8 + 7] = 255;
        }
    }

    previous[0] = vertices[0];
    previous[1] = vertices[1];
    previous[2] = vertices[2];
    previous[3] = vertices[3];
    previous[4] = vertices[4];
    previous[5] = vertices[5];
    next[tarr.length*6-6] = vertices[tarr.length*6-6];
    next[tarr.length*6-5] = vertices[tarr.length*6-5];
    next[tarr.length*6-4] = vertices[tarr.length*6-4];
    next[tarr.length*6-3] = vertices[tarr.length*6-3];
    next[tarr.length*6-2] = vertices[tarr.length*6-2];
    next[tarr.length*6-1] = vertices[tarr.length*6-1];

    geom.addAttribute('direction', new THREE.BufferAttribute(direction, 1));
    geom.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.addAttribute('previous', new THREE.BufferAttribute(previous, 3));
    geom.addAttribute('next', new THREE.BufferAttribute(next, 3));
    geom.addAttribute('color', new THREE.BufferAttribute(colors, 4, true));

    var mat = new LineMaterialCreator(this.opts.thick === true ? 10 : 5, this.parent.frame.width, this.parent.frame.height).getMaterial();
    var mesh = new THREE.Mesh(geom, mat);
    mesh.drawMode = THREE.TriangleStripDrawMode;
    return mesh
};

Parametric2D.prototype.createSceneObject = function() {
    var par = this.expr.evaluate();
    return this.createLine(par);
};

function Isoline2D(parent, expr, opts) {
    Isoline3D.call(this, parent, expr, opts);
    
    this.lineWidth = this.opts.thick === true ? 10 : 5;
}

Isoline2D.prototype = Object.create(Isoline3D.prototype);
Isoline2D.prototype.constructor = Isoline2D;

Isoline2D.prototype.lerp = function(a, b, az, z, bz) {
    var alpha = z.sub(az).div(bz.sub(az));
    var result = a.mul(Number[1].sub(alpha)).add(b.mul(alpha));
    var temp = result.q[1];
    result.q[1] = result.q[2];
    // result.q[2] = Number[0];
    result.q[2] = temp;
    return result.toVector3();
};

function Axes2D(parent, container, opts) {
    Axes.call(this, parent, container, opts);

    /**
     * Used internally for optimization (Read-only)
     */
    this.isAxes2DInstance = true;

    if(opts === undefined) opts = {};

    /**
     * The zoom level of the camera. Denotes how many pixels should be one unit
     */
    this.zoom = opts.zoom !== undefined? opts.zoom : 200;

    /**
     * Camera which renders the axes. 
     */
    this.camera = new THREE.OrthographicCamera(-this.frame.width / this.zoom, this.frame.width / this.zoom, this.frame.height / this.zoom, -this.frame.height / this.zoom, .01, 50);

    // Initialize camera position
    this.camera.position.z = 10;
    this.camera.lookAt(this.frame.scene.position);

    if(opts.position !== undefined) {
        this.camera.position.add(opts.position);
    }

    // For closures
    var _self = this;

    if(opts.showAxes !== false) {
        var arr = new Interactive.BasisVectors2D(this.parent);
        this.addFigure(arr);
    }

    /**
     * Hotspots are draggable points
     */
    this.hotspots = [];

    // Projects from world to client coords
    var project = function(vector) {
        var vector2 = new THREE.Vector2(vector.q[0].value, vector.q[1].value);
        var projected = vector2.clone().sub(_self.camera.position).multiplyScalar(_self.zoom / 2).add(new THREE.Vector2(_self.frame.width / 2, _self.frame.height / 2));
        projected.y = _self.frame.height - projected.y;
        return projected;
    };

    var intersectsHotspot = function(clientX, clientY) {
        var hotspot = null;
        var leastDistance = 1000; // Arbitrarily large number

        var containerBounds = _self.frame.container.getBoundingClientRect();
        var clientCoords = new THREE.Vector2(clientX - containerBounds.left, clientY - containerBounds.top);

        for (var i = 0; i < _self.hotspots.length; i++) {
            var dist2 = project(_self.hotspots[i].position).distanceToSquared(clientCoords);
            if (dist2 <= _self.hotspots[i].size * _self.hotspots[i].size && dist2 < leastDistance * leastDistance) {
                hotspot = _self.hotspots[i];
            }
        }
        return hotspot;
    };

    // Bind events: Panning
    var _cameraOriginX = 0;
    var _cameraOriginY = 0;

    var _hotspot = null;
    var _hotspotpos = null;

    this.frame.container.addEventListener('mousedown', function(event) {
        if (event.button === 0) {
            _hotspot = intersectsHotspot(event.clientX, event.clientY);
            if (_hotspot) {
                _hotspotpos = _hotspot.position.clone();
            }
        }
        if (event.button === 2) {
            _cameraOriginX = _self.camera.position.x;
            _cameraOriginY = _self.camera.position.y;
        }
    });

    this.frame.touchEventListener.onpan = function(event) {
        if (event.leftButtonDown) {
            if (_hotspot !== null) {
                var containerBounds = _self.frame.container.getBoundingClientRect();
                var e = {
                    worldX: _hotspotpos.q[0].add(new Number(2 * (event.screenX - event.screenStartX) / _self.zoom)),
                    worldY: _hotspotpos.q[1].add(new Number(-2 * (event.screenY - event.screenStartY) / _self.zoom))
                };
                _hotspot.ondrag(e);
            }
        }
        if (event.rightButtonDown) {
            // Prevent default if mouse moved significantly
            if ((event.screenX - event.screenStartX) * (event.screenX - event.screenStartX) + (event.screenY - event.screenStartY) * (event.screenY - event.screenStartY) > 25) {
                event.suppressContextMenu();
            }

            // Pan camera
            _self.camera.position.x = -2 * (event.screenX - event.screenStartX) / _self.zoom + _cameraOriginX;
            _self.camera.position.y = 2 * (event.screenY - event.screenStartY) / _self.zoom + _cameraOriginY;
        }
    };

    // Bind Events: Zooming
    this.frame.touchEventListener.onzoom = function(event) {
        if(this.fixedZoom === false) {
            event.suppressScrolling();
            _self.zoom *= Math.pow(0.8, event.amount / 100);
            _self.updateCamera();
        }
    };
}

Axes2D.prototype = Object.create(Axes.prototype);
Axes2D.prototype.constructor = Axes2D;

Axes2D.prototype.plotExpression = function(expr, type, opts) {
    switch(type) {
        case 'arrow':            
            var figure = new Arrow2D(this.parent, expr, opts);
            this.expressions[expr] = figure;
            this.addFigure(figure);
            return figure;
        case 'hotspot':
            var hotspot = new Hotspot2D(this.parent, expr);
            this.addHotspot(hotspot);
            return hotspot;
        case 'parametric':           
            var par = new Parametric2D(this, expr, opts);
            this.expressions[expr] = par;
            this.addFigure(par);
            return par;
        case 'isoline':           
            var iso = new Isoline2D(this, expr, opts);
            this.expressions[expr] = iso;
            this.addFigure(iso);
            return iso;
        default:
            console.log('Interactive.Axes2D: Invalid plot type');
            return null;
    }
};

/**
 * Apply changes to camera
 */
Axes2D.prototype.updateCamera = function() {
    this.camera.left = -this.frame.width / this.zoom;
    this.camera.right = this.frame.width / this.zoom;
    this.camera.top = this.frame.height / this.zoom;
    this.camera.bottom = -this.frame.height / this.zoom;
    this.camera.updateProjectionMatrix();
};
 
/**
 * Special function to add a hotspot
 * @param {Hotspot2D} hotspot Hotspot to add
 */
Axes2D.prototype.addHotspot = function(hotspot) {
    if (hotspot.isHotspot2DInstance !== true) {
        console.log('Interactive.Axes2D: Parameter is not a Hotspot2D.');
        return null;
    }

    this.hotspots.push(hotspot);
};

function Panel (parent, container) {
    this.parent = parent;

    this.container = container;
}

Panel.prototype.addSlider = function(expr, opts) {
    if(opts === undefined) opts = {};

    var interval = new Expression(expr, this.parent.context).evaluate();

    var slider = document.createElement('input');
    slider.setAttribute('type', 'range');
    slider.min = interval.start.value;
    slider.max = interval.end.value;
    slider.step = interval.step.value;

    if(this.parent.context[interval.varstr] !== undefined) {
        slider.value = this.parent.context[interval.varstr].value;
    }

    var _self = this;
    if(opts.continuous === undefined || opts.continuous === false) {
        slider.onchange = function() {            
            _self.parent.context[interval.varstr] = new Number(parseFloat(slider.value));
            _self.parent.refresh(interval.varstr);
        };
    } else if(opts.continuous === true) {
        slider.oninput = function() {
            _self.parent.context[interval.varstr] = new Number(parseFloat(slider.value));
            _self.parent.refresh(interval.varstr);
        };
    }

    var label = document.createTextNode(interval.varstr + ' = ');
    this.container.appendChild(label);
    this.container.appendChild(slider);
};

function Plot() {
    /**
     * The type of this object. (Read-only)
     */
    this.type = 'Plot';
    this.axes = [];
    this.panels = [];

    /**
     * The variables the expressions will reference
     */
    this.context = Expression.getDefaultContext();

    /**
     * Cached expressions
     */
    this.expressions = {};
}

Plot.prototype.execExpression = function(expr) {
    if(this.expressions[expr] === undefined) this.expressions[expr] = new Expression(expr, this.context);
    return this.expressions[expr].evaluate();
};

Plot.prototype.refresh = function(expr) {
    for(var i = 0; i < this.axes.length; i++) {
        this.axes[i].refresh(expr);
    }
};

Plot.prototype.linkCameras = function(from) {
    for(var i = 1; i < arguments.length; i++) {
        arguments[i].camera = from.camera;
    }
};

/**
 * Create a 3D axis in the context of this plot
 */
Plot.prototype.createAxes3D = function(container, opts) {
    var ax = new Axes3D(this, container, opts);
    this.axes.push(ax);
    return ax;
};

/**
 * Create a 2D axis in the context of this plot
 */
Plot.prototype.createAxes2D = function(container, opts) {
    var ax = new Axes2D(this, container, opts);
    this.axes.push(ax);
    return ax;
};

Plot.prototype.createPanel = function(container, opts) {
    var panel = new Panel(this, container, opts);
    this.panels.push(panel);
    return panel;
};

Plot.prototype.resetContext = function() {
    this.context = Expression.getDefaultContext();
    this.expressions = {};
};

Plot.prototype.render = function() {
    function checkVisible(el) {
        var elemTop = el.getBoundingClientRect().top;
        var elemBottom = el.getBoundingClientRect().bottom;

        var isVisible = (elemBottom >= 0) && (elemTop <= window.innerHeight);
        return isVisible;
    }

    this.axes.forEach(function(ax) {
        if(checkVisible(ax.frame.container)) {
            if(ax.frame.isSleeping) ax.wake();
            ax.render();
        } else if(!ax.frame.isSleeping) ax.sleep();
    });
};

/**
 * The base for rendering plots
 * @param {Plot} parent 
 * @param {Element} container 
 * @param {*} opts 
 */

function Axes(parent, container, opts) {
    /**
     * Used internally for optimization (Read-only)
     */
    this.isAxesInstance = true;

    /**
     * The plot that generated this figure. (Read-only)
     */
    this.parent = parent;

    /**
     * The frame which will render the axes
     */
    this.frame = new Frame(container, opts);

    // avoid null pointer errors
    if(opts === undefined) opts = {};

    this.fixedZoom = opts.fixedZoom !== undefined? opts.fixedZoom : false;

    /**
     * Objects to plot
     */
    this.objects = [];

    // Keeps a roll of sceneobjects to faciliate removal
    this.sceneObjects = [];

    /**
     * Expressions to plot
     */
    this.expressions = {};
}

Axes.prototype.sleep = function() {
    this.frame.sleep();
};

Axes.prototype.wake = function() {
    this.frame.wake();
};

/**
 * Render all plots contained in this axes
 */
Axes.prototype.render = function() {
    if(this.frame.isSleeping) return;

    for(var i = 0; i < this.objects.length; i++ ) {
        var object = this.objects[i];
        if(object.validated === false) {
            var sceneObject = object.getSceneObject();
            if(this.sceneObjects[i] !== undefined) {
                this.frame.scene.remove(this.sceneObjects[i]);
            }
            this.frame.scene.add(sceneObject);
            this.sceneObjects[i] = sceneObject;
        }
    }

    this.frame.render(this.camera);
};

/**
 * Plot an expression
 * @param {Expression} expr Expression to plot
 * @param {String} type Type of plot
 * @param {*} opts Options
 */
Axes.prototype.plotExpression = function(expr, type, opts) {
    console.log('Interactive.' + this._proto_.constructor.name + ': Method not implemented');
    return null;
};

/**
 * Add an object to plot
 * @param {Plottable} object Object to plot
 */
Axes.prototype.addFigure = function(object) {
    if(object.isPlottableInstance !== true) {
        console.log('Interactive.' + this._proto_.constructor.name + ': Object is not a Plottable');
        return;
    }

    this.objects.push(object);
};

/**
 * Remove a plotted object
 * @param {Plottable} object Object to remove
 */
Axes.prototype.removeFigure = function(object) {
    var index = this.objects.indexOf(object);
    if (index === -1) {
        console.log('Interactive.' + this._proto_.constructor.name + ': Figure not in axes');
        return null;
    }
    this.objects.splice(index, 1);
    this.frame.scene.remove(sceneObjects[index]);
    this.sceneObjects.splice(index, 1);
};

/**
 * Force the object to update
 * @param {Plottable} object Object to redraw
 */
Axes.prototype.redrawFigure = function(object) {
    var index = this.objects.indexOf(object);
    if (index === -1) {
        console.log('Interactive.' + this._proto_.constructor.name + ': Figure not in axes');
        return null;
    }
    object.invalidate();
};

/**
 * Redraw an existing expression
 * @param {Expression} expr Expression to redraw
 */
Axes.prototype.redrawExpression = function(expr) {
    this.redrawFigure(this.expressions[expr]);
};

/**
 * Redraw all objects
 * @param {Expression} expr Optional: only redraw expressions which contain the variables in given expression
 */
Axes.prototype.refresh = function(expr) {
    for(var i = 0; i < this.objects.length; i++) {
        if(this.objects[i].invalidate !== undefined && (expr === undefined || this.objects[i].getVariables().includes(expr))) {
            this.objects[i].invalidate(expr);
        }
    }
};

function Isoline(parametric, parametricExpr, axis, level) {
    this.parametric = parametric;
    this.parametricExpr = parametricExpr;
    this.axis = axis; 
    this.level = level;
}

function Parametric(func, intervals) {
    this.func = func;
    this.intervals = Array.from(arguments).slice(1);
}

/**
 * Object that represents basis axes in 2d space.
 * @param {*} opts Options to customize the appearance of the arrows. Includes:
 * origin -- Point of the origin. Default is (0, 0, 0)
 * hex -- hexadecimal value to define color. Default is 0xffff00.
 * headLength -- The length of the head of the arrow. Default is 0.2.
 * headWidth -- The length of the width of the arrow. Default is 0.04.
 * (Derived from THREE.js)
 */
function BasisVectors2D(plot, opts) {
    Plottable.call(this, plot, null, opts);

    var _opts = opts !== undefined ? opts : {};

    this.xBasis = '(1,0)';
    this.yBasis = '(0,1)';

    var _xOpts = Object.assign({},_opts);
    var _yOpts = Object.assign({},_opts);

    if( _opts.headWidth === undefined ) {
        _xOpts.headWidth = 0.04;
        _yOpts.headWidth = 0.04;
    }
    if( _opts.xHex === undefined) {
        _xOpts.hex = 0x880000;
    }
    if( _opts.yHex === undefined) {
        _yOpts.hex = 0x008800;
    }

    this.xArrow = new Arrow2D(plot, this.xBasis, _xOpts);   
    this.yArrow = new Arrow2D(plot, this.yBasis, _yOpts);
}

BasisVectors2D.prototype = Object.create(Plottable.prototype);
BasisVectors2D.prototype.constructor = BasisVectors2D;

BasisVectors2D.prototype.createSceneObject = function() {
    var sceneObject = new THREE.Group();
    sceneObject.add(this.xArrow.getSceneObject());
    sceneObject.add(this.yArrow.getSceneObject());
    return sceneObject;
};

/**
 * Object that represents basis axes in 3d space.
 * @param {*} opts Options to customize the appearance of the arrows. Includes:
 * origin -- Point of the origin. Default is (0, 0, 0)
 * hex -- hexadecimal value to define color. Default is 0xffff00.
 * headLength -- The length of the head of the arrow. Default is 0.2 * length.
 * headWidth -- The length of the width of the arrow. Default is 0.2 * headLength.
 * (Derived from THREE.js)
 */
function BasisVectors3D(plot, opts) {
    Plottable.call(this, plot, null, opts);

    var _opts = opts !== undefined ? opts : {};

    this.xBasis = '(1,0,0)';
    this.yBasis = '(0,1,0)';
    this.zBasis = '(0,0,1)';

    var _xOpts = Object.assign({},_opts);
    var _yOpts = Object.assign({},_opts);
    var _zOpts = Object.assign({},_opts);

    if( _opts.xHex === undefined) {
        _xOpts.hex = 0x880000;
    }
    if( _opts.yHex === undefined) {
        _yOpts.hex = 0x008800;
    }
    if( _opts.zHex === undefined) {
        _zOpts.hex = 0x4444ff;
    }

    this.xArrow = new Arrow3D(plot, this.xBasis, _xOpts);   
    this.yArrow = new Arrow3D(plot, this.yBasis, _yOpts);
    this.zArrow = new Arrow3D(plot, this.zBasis, _zOpts);
}

BasisVectors3D.prototype = Object.create(Plottable.prototype);
BasisVectors3D.prototype.constructor = BasisVectors3D;

BasisVectors3D.prototype.createSceneObject = function() {
    var sceneObject = new THREE.Group();
    sceneObject.add(this.xArrow.getSceneObject());
    sceneObject.add(this.yArrow.getSceneObject());
    sceneObject.add(this.zArrow.getSceneObject());
    return sceneObject;
};

exports.Axes = Axes;
exports.Axes2D = Axes2D;
exports.Axes3D = Axes3D;
exports.Frame = Frame;
exports.Panel = Panel;
exports.Plot = Plot;
exports.TouchEventListener = TouchEventListener;
exports.Expression = Expression;
exports.MathPlus = MathPlus;
exports.Interval = Interval;
exports.Isoline = Isoline;
exports.Number = Number;
exports.Parametric = Parametric;
exports.Vector = Vector;
exports.Arrow2D = Arrow2D;
exports.Arrow3D = Arrow3D;
exports.BasisVectors2D = BasisVectors2D;
exports.BasisVectors3D = BasisVectors3D;
exports.Hotspot2D = Hotspot2D;
exports.Isoline2D = Isoline2D;
exports.Isoline3D = Isoline3D;
exports.Parametric2D = Parametric2D;
exports.Parametric3D = Parametric3D;
exports.Plottable = Plottable;

Object.defineProperty(exports, '__esModule', { value: true });

})));
