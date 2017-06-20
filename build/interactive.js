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
    if(opts === undefined) opts = {};

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

    /**
     * Renderer from Three.js. (Private)
     */
    this.renderer = new THREE.WebGLRenderer(opts);

    // Initialize renderer within container
    this.renderer.setSize(this.width, this.height);
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    /**
     * Scene from Three.js where all the elements lie.
     */    
    this.scene = new THREE.Scene();
}

/**
 * Render the frame
 */
Frame.prototype.render = function(camera) {
    this.renderer.render( this.scene, camera );
};

function Number(value) {
    this.value = value;
} 

Number.prototype.add = function(n) {
    return new Number(this.value + n.value);
};

Number.prototype.sub = function(n) {
    return new Number(this.value - n.value);
};

Number.prototype.mul = function(n) {
    return new Number(this.value * n.value);
};

Number.prototype.div = function(n) {
    return new Number(this.value / n.value);
};

Number.prototype.exp = function(n) {
    return new Number(Math.pow(this.value, n.value));
};

Number.prototype.neg = function() {
    return new Number(-this.value);
};

/**
 * Represents a vector with an arbitrary number of dimensions, and of any type that supports adding and scaling. Operations create new instances
 */
function Vector() {
    this.type = 'Vector';

    // Support an arbitrary number of dimensions (Read-only)
    this.dimensions = arguments.length;

    // q is the general term for a coordinate
    this.q = Array.from(arguments);

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

Vector.prototype.div = function(v) {
    var result = this.clone();
    for(var i = 0; i < this.dimensions; i++) {
        result.q[i] = result.q[i].div(v);
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

function Interval(varstr, start, end, steps) {
    this.varstr = varstr; 

    this.start = start;
    this.end = end;
    this.steps = steps;

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

MathPlus.epsilon = new Number(1e-10);

MathPlus.singleton = function(x) {
    return new Vector(x);
};

MathPlus.normal = function(X,u,v) {
    var dxdu = X(u.add(MathPlus.epsilon), v).sub(X(u.sub(MathPlus.epsilon), v)).div(MathPlus.epsilon.mul(new Number(2)));
    var dxdv = X(u, v.add(MathPlus.epsilon)).sub(X(u, v.sub(MathPlus.epsilon))).div(MathPlus.epsilon.mul(new Number(2)));
    return dxdu.crs(dxdv)
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

MathPlus.abs = function(x) {
    return new Number(Math.abs(x.value));
};

MathPlus.ssign = function(x) {
    return MathPlus.sign(x).mul(MathPlus.abs(x).exp(new Number(0.2)));
};

MathPlus.PI = new Number(Math.PI);

function Expression(string, context) {
    this.type = 'Expression';

    this.string = string;    
    this.validated = false;
    this.function = null;
    this.context = context;
}

Expression.typeOf = function(string) {

    if(string === '()') return 'null';

    var nestingLevel = 0;
    var isVector = false;
    if(string.charAt(string.length - 1) === '}') {
        if(string.charAt(0) === '{')
            return 'interval'
        else    
            return 'parametric'
    }
    if(string.includes('(') === false && string.includes(')') === false && !/[0-9]+/.test(string)) {
        return 'variable'
    }
    for(var i = 0; i < string.length; i++) {
        if(string.charAt(i) === '(') {
            nestingLevel++;
        } else if (string.charAt(i) === ')') {
            nestingLevel--;
        } else
        if(string.charAt(i) === ',' && nestingLevel === 1) {
            isVector = true;
        }
        if(string.charAt(i) === ';' && nestingLevel === 1) {
            return 'matrix';
        }
        if(nestingLevel === 0 && i !== string.length - 1) {
            return 'expression';
        }
    }
    if(isVector) return 'vector';
    return 'expression';
};

Expression.separate = function(str) {
    // Separate into parts which alternate (expression/operator)
    var parts = [];
    var start = 0;
    var nestingLevel = 0;
    var type = null;
    for(var i = 0; i < str.length; i++) {
        if(type === 'interval') {
            if(str.charAt(i) === '}') {
                parts.push({str: str.substring(start, i + 1), type: type});
                start = i + 1;
                type = null;
            }
        } else if(str.charAt(i) === '{') {
            type = 'interval';
        } else if(str.charAt(i) === '(') {
            nestingLevel++;

            if(type === null) {
                type = 'expression';
            }
            if(type === 'operator' || type === 'uoperator') {
                parts.push({str: str.substring(start, i), type: type});
                start = i;
                type = 'expression';
            } else if (type === 'variable') {
                type = 'function';
                parts.push({str: str.substring(start, i), type: type});
                start = i;
                type = 'expression';
            }
        } else if(str.charAt(i) === ')') {
            nestingLevel--;
        } else if(nestingLevel == 0) {         
            if(str.charAt(i) === '-' && (type === null || type === 'operator')) {
                if(type === 'operator') {
                    parts.push({str: str.substring(start, i), type: type});
                    start = i;
                }
                type = 'uoperator';
            } else if(/[0-9a-zA-Z.]/.test(str.charAt(i)) === false || str.charAt(i) === '^') {
                parts.push({str: str.substring(start, i), type: type});
                start = i;
                type = 'operator';
            } else {
                if(type === null) {
                    type = 'constant';
                }
                if(type === 'operator' || type === 'uoperator') {
                    parts.push({str: str.substring(start, i), type: type});
                    start = i;
                    type = 'constant';
                }
                if(/[0-9.]/.test(str.charAt(i)) === false)
                    type = 'variable';
            }
        }
    }
    if(start != str.length) {
        parts.push({str: str.substring(start, str.length), type:type});
    }

    // Split the expressions if applicable
    for(var i = 0; i < parts.length; i++) {
        if(parts[i].type === 'expression') {
            parts[i].type = Expression.typeOf(parts[i].str);
            if(parts[i].type === 'expression') {
                var newstr = parts[i].str.slice(1,parts[i].str.length-1);
                var newparts = [{str:'(',type:'('}].concat(Expression.separate(newstr));
                newparts.push({str:')',type:')'});
                parts = parts.slice(0,i).concat(newparts).concat(parts.slice(i+1,parts.length));
                i += newparts.length - 1;
            } else if (i > 0 && parts[i].type === 'vector' && parts[i - 1].type === 'function') {
                parts.splice(i ,0,{str:'(',type:'('});
                parts.splice(i+2, 0, {str:')',type:')'});
            } else if(parts[i].type === 'null') {
                parts[i].str='';
                parts.splice(i ,0,{str:'(',type:'('});
                parts.splice(i+2, 0, {str:')',type:')'});
            }
        }
    }
    return parts;
};

Expression.toPostfix = function(parts) {
    var post = [];
    var ops = [];
    var funs = [];
    var precedence = {'+': 0, '-': 0, '*': 1, '/': 1, '^': 2, '(': -1, ')': -1};
    for(var i = 0; i < parts.length; i++) {
        if(parts[i].type === 'operator' || parts[i].type === 'uoperator') {
            while(ops.length > 0 && (ops[ops.length - 1].type === 'uoperator' || precedence[ops[ops.length - 1].str] >= precedence[parts[i].str])) {
                post.push(ops.pop());
            }
            ops.push(parts[i]);
        } else if (parts[i].type === 'function') {
            funs.push(parts[i]);
        } else if (parts[i].type === '(') {
            ops.push(parts[i]);
        } else if (parts[i].type === ')') {
            while(ops[ops.length - 1].type !== '(') {
                post.push(ops.pop());
            }
            if(funs.length > 0) {
                post.push(funs.pop());
            }
            ops.pop();
        } else {
            post.push(parts[i]);
        }
    }
    while(ops.length > 0) {
        post.push(ops.pop());
    }
    return post;
};

Expression.splitTuple = function(string) {
    var str = string.substring(1,string.length - 1);
    var parts = [];
    var start = 0;
    var nestingLevel = 0;
    for(var i = 0; i < str.length; i++) {
        if(str.charAt(i) === '(') {
            nestingLevel++;
        } else if(str.charAt(i) === ')') {
            nestingLevel--;
        } else if(nestingLevel == 0) {                    
            if(str.charAt(i) === ',') {
                parts.push(str.substring(start,i));
                start = i + 1;
            }
        }
    }
    parts.push(str.substring(start, str.length));
    return parts;
};

Expression.splitParametric = function(string) {
    return string.split(/(?={)/);
};

Expression.toJSExpression = function(string, specials, isparam) {
    var str = string.replace(/\s+/g,'');

    // Expression is an equation:
    if(str.match(/=/g) !== null && str.match(/=/g).length === 1) {
        var left, right;
        left = string.split('=')[0];
        right = string.split('=')[1];
        
        var leftParts = Expression.separate(left);

        // variable assignment
        if(leftParts.length === 1 && leftParts[0].type === 'variable') {
            var expr = 'context["'+ left + '"]='+Expression.toJSExpression(right);
            return expr;
        }

        // function definition
        if(leftParts[0].type === 'function') {
            if (leftParts[2].type === 'null') {
                var expr = 'context["'+leftParts[0].str+'"]=function(){ return '+Expression.toJSExpression(right)+'; }';
            } else if(leftParts[2].type === 'vector') {
                var expr = 'context["'+leftParts[0].str+'"]=function' + leftParts[2].str + '{ return '+Expression.toJSExpression(right, Expression.splitTuple(leftParts[2].str))+'; }';
            } else if (leftParts[2].type === 'variable') {
                var expr = 'context["'+leftParts[0].str+'"]=function(' + leftParts[2].str + '){ return '+Expression.toJSExpression(right, leftParts[2].str)+'; }';
            } 
            return expr;
        }
    } else {
        var type = Expression.typeOf(str);

        if(type === 'expression') {
            var operations = Expression.toPostfix(Expression.separate(str));

            var stack = [];

            for(var i = 0; i < operations.length; i++) {
                switch(operations[i].type) {
                    case 'null':
                        stack.push('');
                        break;
                    case 'variable':
                        if(specials !== undefined && specials.includes(operations[i].str)) {
                            stack.push(operations[i].str);
                        } else {
                            stack.push('context["'+operations[i].str+'"]');
                        }
                        break;
                    case 'constant':
                        stack.push('new Interactive.Number('+operations[i].str+')');
                        break;     
                    case 'vector':
                        var param = operations[i+1].type === 'function';
                        stack.push(Expression.toJSExpression(operations[i].str, specials, param));
                        break;                       
                    case 'function':
                        var a = stack.pop();
                        stack.push('context["'+operations[i].str+'"]('+a+')');
                        break;
                    case 'uoperator':
                        var a = stack.pop();
                        stack.push(a+'.neg()');
                        break;
                    case 'operator':
                        var b = stack.pop();
                        var a = stack.pop();
                        switch(operations[i].str) {
                            case '+':
                                stack.push(a+'.add('+b+')');
                                break;
                            case '-':
                                stack.push(a+'.sub('+b+')');
                                break;
                            case '*':
                                stack.push(a+'.mul('+b+')');
                                break;
                            case '/':
                                stack.push(a+'.div('+b+')');
                                break;
                            case '^':
                                stack.push(a+'.exp('+b+')');
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
            if(isparam) {
                var expr = '';
                for(var i = 0; i < components.length; i++) {
                    expr += Expression.toJSExpression(components[i], specials) + ',';
                }
                expr = expr.slice(0, expr.length - 1);
                return expr;
            } else {
                var expr = 'new Interactive.Vector(';
                for(var i = 0; i < components.length; i++) {
                    expr += Expression.toJSExpression(components[i], specials) + ',';
                }
                expr = expr.slice(0, expr.length - 1) + ')';
                return expr;
            }
        } else if (type === 'interval') {
            var params = Expression.splitTuple(str);

            var expr = 'new Interactive.Interval("'+params[0]+'",';
            for(var i = 1; i < params.length; i++) {
                expr += Expression.toJSExpression(params[i], specials) + ',';
            }
            expr = expr.slice(0, expr.length - 1) + ')';            
            return expr;
        } else if (type === 'variable') {
            if(specials !== undefined && specials.includes(str)) return str
            var expr = 'context["'+str+'"]';
            return expr;
        }
    }
};

Expression.toJSFunction = function(string) {
    var expr = Expression.toJSExpression(string);
    return Function('context', 'return '+expr+';');
};

/**
 * Variables from given context will override variables from this context 
 */
Expression.prototype.evaluate = function(context) {
    if(this.validated === false) {
        this.function = Expression.toJSFunction(this.string);
        this.validated = true;
    }
    if(context !== undefined) {
        var temp = Object.assign({}, this.context);
        Object.assign(temp, context);
        return this.function(temp);
    } else {
        return this.function(this.context);
    }
};

Expression.getDefaultContext = function() {
    return Object.assign({}, MathPlus);
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
    this.opts = opts !== undefined ? opts : {};

    /**
     * (Read-only)
     */
    this.expr = new Expression(expr, plot.context);

    this.sceneObject = null;

    this.validated = false;
}

/**
 * Returns an object that can be added to a THREE.js scene.
 */
Arrow3D.prototype.getSceneObject = function() {
    if(this.validated === false) {
        var vector = this.expr.evaluate();
        var _vector3 = new THREE.Vector3(vector.q[0].value, vector.q[1].value, vector.q[2].value);
        var _dir = _vector3.clone().normalize();
        var _origin = this.opts.origin !== undefined ? this.opts.origin : new THREE.Vector3(0,0,0);
        var _length = _vector3.length();
        var _hex = this.opts.hex !== undefined ? this.opts.hex : 0xffffff;
        var _headLength = this.opts.headLength !== undefined ? this.opts.headLength : 0.2 * _length;
        var _headWidth = this.opts.headWidth !== undefined ? this.opts.headWidth : 0.2 * _headLength;

        this.sceneObject = new THREE.ArrowHelper(_dir, _origin, _length, _hex, _headLength, _headWidth);
        this.validated = true;
    }
    return this.sceneObject;
};

/**
 * Updates on the next call to render
 */
Arrow3D.prototype.invalidate = function() {
    this.validated = false;
};

function Parametric3D(plot, expr, opts) {
    this.plot = plot;

    var parts = Expression.splitParametric(expr);
    this.func = new Expression(parts[0], this.plot.context);
    this.intervals = [];

    for(var i = 1; i < parts.length; i++) {
        this.intervals.push(new Expression(parts[i], this.plot.context));
    }

    this.opts = opts !== undefined? opts: {};

    this.validated = false;
    this.sceneObject = null;

    if(this.opts.color !== undefined) {
        this.color = new Expression(this.opts.color, this.plot.context);
    }
    if(this.opts.wireframe === undefined) this.opts.wireframe = false;
    if(this.opts.flat === undefined) this.opts.flat = this.opts.color !== undefined;
}

Parametric3D.prototype.createLine = function() {
    var geom = new THREE.Geometry();
    var int = this.intervals[0].evaluate();
    var tarr = int.array();
    var context = {};
    for(var i = 0; i < tarr.length; i++) {
        context[int.varstr] = tarr[i];

        geom.vertices.push(this.func.evaluate(context).toVector3());

        if(this.color !== undefined) {
            var color = this.color.evaluate(context);
            geom.colors[i] = new THREE.Color(color.q[0], color.q[1], color.q[2]);
        }
    } 
    if(this.color !== undefined) {
        return new THREE.Line(geom, new THREE.LineBasicMaterial({color: 0xffffff, vertexColors: THREE.VertexColors}));
    } else {
        return new THREE.Line(geom, new THREE.LineBasicMaterial());
    }
};

Parametric3D.prototype.createSurface = function() {
    var geom = new THREE.Geometry();
    var uint = this.intervals[0].evaluate();
    var vint = this.intervals[1].evaluate();
    var uarr = uint.array();
    var varr = vint.array();
    var context = {};
    var colors = [];

    for(var i = 0; i < uarr.length; i++) {
        context[uint.varstr] = uarr[i];
        for(var j = 0; j < varr.length; j++) {
            context[vint.varstr] = varr[j];

            var v = this.func.evaluate(context).toVector3();
            geom.vertices.push(v);

            if(this.color !== undefined) {
                var color = this.color.evaluate(context);
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
    geom.computeFaceNormals();

    if(this.opts.wireframe === true || this.opts.flat === true) {
        if(this.color !== undefined) {
            var mat = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});
        } else {
            var mat = new THREE.MeshBasicMaterial();
        }
        if(this.wireframe) mat.wireframe = true;
    } else {
        if(this.color !== undefined) {
            var mat = new THREE.MeshPhongMaterial({vertexColors: THREE.VertexColors});
        } else {            
            var mat = new THREE.MeshPhongMaterial();
        }
    }
    mat.side = THREE.DoubleSide;
    return new THREE.Mesh( geom, mat );
};

Parametric3D.prototype.getSceneObject = function() {
    if(this.validated === false) {
        if(this.intervals.length === 1) {
            this.sceneObject = this.createLine();
        } else {
            this.sceneObject = this.createSurface();
        }
        this.validated = true;
    }
    return this.sceneObject;
};

Parametric3D.prototype.invalidate = function() {
    this.validated = false;
};

/**
 * Renders plots (not to be confused with the Figure class)
 * TODO: Add functionality to link cameras between figures
 * @param {*} parent 
 * @param {*} container 
 * @param {*} opts 
 */

function Axes3D(parent, container, opts) {
    /**
     * The type of this object. (Read-only)
     */
    this.type = 'Axes3D';

    /**
     * The plot that generated this figure. (Read-only)
     */
    this.parent = parent;

    /**
     * The frame which will render the axes
     */
    this.frame = new Frame(container, opts);

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

    /**
     * Objects to plot
     */
    this.objects = [];

    /**
     * Expressions to plot
     */
    this.expressions = {};

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
        event.suppressScrolling();
        var newPos = _self.corigin.clone().addScaledVector(_self.camera.position.clone().sub(_self.corigin), Math.pow(1.25, event.amount / 100));
        _self.camera.position.copy(newPos);
        _self.camera.lookAt(_self.corigin);
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

/**
 * Render the axes
 */
Axes3D.prototype.render = function() {
    this.frame.scene.remove(this.camLight);
    this.camLight.position.copy(this.camera.position);
    this.frame.scene.add(this.camLight);

    this.frame.render( this.camera );
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
            var par = new Parametric3D(this.parent, expr, opts);
            this.expressions[expr] = par;
            this.addFigure(par);
            return par;
        default:
            console.log('Interactive.Axes3D: Invalid plot type');
            return null;
    }
};

/**
 * Add an object to plot
 * @param {*} object Must be plottable
 */
Axes3D.prototype.addFigure = function(object) {
    this.objects.push(object);
    this.frame.scene.add(object.getSceneObject());
};

/**
 * Remove a plotted object
 */
Axes3D.prototype.removeFigure = function(object) {
    var index = this.objects.indexOf(object);
    if(index === -1) {
        console.log('Interactive.Axes3D: Figure not in axes');
        return null;
    }
    this.objects.splice(index, 1);
    this.frame.scene.remove(object.getSceneObject());
};

/**
 * Force the object to update
 */
Axes3D.prototype.redrawFigure = function(object) {
    var index = this.objects.indexOf(object);
    if(index === -1) {
        console.log('Interactive.Axes3D: Figure not in axes');
        return null;
    }
    this.frame.scene.remove(object.getSceneObject());
    object.invalidate();
    this.frame.scene.add(object.getSceneObject());    
};

/**
 * Redraw all objects
 */
Axes3D.prototype.refresh = function(object) {
    for(var i = 0; i < this.objects.length; i++) {
        if(this.objects[i].invalidate !== undefined) {
            this.frame.scene.remove(this.objects[i].getSceneObject());
            this.objects[i].invalidate();
            this.frame.scene.add(this.objects[i].getSceneObject());
        }
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
    this.opts = opts !== undefined ? opts : {};

    /**
     * (Read-only)
     */
    this.expr = new Expression(expr, plot.context);

    this.sceneObject = null;

    this.validated = false;
}

/**
 * Returns an object that can be added to a THREE.js scene.
 */
Arrow2D.prototype.getSceneObject = function() {
    if(this.validated === false) {
        var vector = this.expr.evaluate();
        var _vector2 = new THREE.Vector3(vector.q[0].value, vector.q[1].value);
        var _dir = _vector2.clone().normalize();
        var _origin = this.opts.origin !== undefined ? this.opts.origin : new THREE.Vector3(0,0,0);
        var _length = _vector2.length();
        var _hex = this.opts.hex !== undefined ? this.opts.hex : 0xffffff;
        var _headLength = this.opts.headLength !== undefined ? this.opts.headLength : 0.2;
        var _headWidth = this.opts.headWidth !== undefined ? this.opts.headWidth : 0.05;

        this.sceneObject = new THREE.ArrowHelper(_dir, _origin, _length, _hex, _headLength, _headWidth);
        this.validated = true;
    }
    return this.sceneObject;
};

/**
 * Updates on the next call to render
 */
Arrow2D.prototype.invalidate = function() {
    this.validated = false;
};

function Hotspot2D(plot, expr) {
    this.type = 'Hotspot2D';
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

    this.plot.refresh();
};

function Parametric2D(plot, expr, opts) {
    this.plot = plot;

    var parts = Expression.splitParametric(expr);
    this.func = new Expression(parts[0], this.plot.context);
    this.interval = new Expression(parts[1], this.plot.context);
    this.opts = opts !== undefined? opts: {};

    this.validated = false;
    this.sceneObject = null;

    if(this.opts.color !== undefined) {
        this.color = new Expression(this.opts.color, this.plot.context);
    }
}

Parametric2D.prototype.createLine = function() {
    var geom = new THREE.Geometry();
    var int = this.interval.evaluate();
    var tarr = int.array();
    var context = {};
    for(var i = 0; i < tarr.length; i++) {
        context[int.varstr] = tarr[i];

        geom.vertices.push(this.func.evaluate(context).toVector3());

        if(this.color !== undefined) {
            var color = this.color.evaluate(context);
            geom.colors[i] = new THREE.Color(color.q[0], color.q[1], color.q[2]);
        }
    } 
    if(this.color !== undefined) {
        return new THREE.Line(geom, new THREE.LineBasicMaterial({color: 0xffffff, vertexColors: THREE.VertexColors}));
    } else {
        return new THREE.Line(geom, new THREE.LineBasicMaterial());
    }
};

Parametric2D.prototype.getSceneObject = function() {
    if(this.validated === false) {
        this.sceneObject = this.createLine();
        this.validated = true;
    }
    return this.sceneObject;
};

Parametric2D.prototype.invalidate = function() {
    this.validated = false;
};

/**
 * Renders plots in 2D (not to be confused with the Figure class)
 * TODO: Add functionality to link cameras between figures
 * TODO: Add better control of the viewport
 * @param {*} parent 
 * @param {*} container 
 * @param {*} opts 
 */

function Axes2D(parent, container, opts) {
    /**
     * The type of this object. (Read-only)
     */
    this.type = 'Axes2D';

    /**
     * The plot that generated this figure. (Read-only)
     */
    this.parent = parent;

    /**
     * The frame which will render the axes
     */
    this.frame = new Frame(container, opts);

    /**
     * The zoom level of the camera. Denotes how many pixels should be one unit
     */
    this.zoom = 200;

    /**
     * Camera which renders the axes. 
     */
    this.camera = new THREE.OrthographicCamera(-this.frame.width / this.zoom, this.frame.width / this.zoom, this.frame.height / this.zoom, -this.frame.height / this.zoom, .01, 50);

    // Initialize camera position
    this.camera.position.z = 10;
    this.camera.lookAt(this.frame.scene.position);

    // Some test code
    // var mesh = new THREE.Mesh( 
    //     new THREE.BoxGeometry( 1, 1, 1, 1, 1, 1 ), 
    //     new THREE.MeshBasicMaterial( { color : 0xff0000, wireframe: true } 
    // ));
    // this.frame.scene.add( mesh );

    // For closures
    var _self = this;

    /**
     * Objects to plot
     */
    this.objects = [];

    /**
     * Expressions to plot
     */
    this.expressions = {};

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
        event.suppressScrolling();
        _self.zoom *= Math.pow(0.8, event.amount / 100);
        _self.updateCamera();
    };
}

/**
 * Render the axes
 */
Axes2D.prototype.render = function() {
    this.frame.render(this.camera);
};

/**
 * Plot an expression
 */
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
            var par = new Parametric2D(this.parent, expr, opts);
            this.expressions[expr] = par;
            this.addFigure(par);
            return par;
        default:
            console.log('Interactive.Axes2D: Invalid plot type');
            return null;
    }
};

/**
 * Add an object to plot
 * @param {*} object Must be plottable
 */
Axes2D.prototype.addFigure = function(object) {
    this.objects.push(object);
    this.frame.scene.add(object.getSceneObject());
};

/**
 * Remove a plotted object
 */
Axes2D.prototype.removeFigure = function(object) {
    var index = this.objects.indexOf(object);
    if (index === -1) {
        console.log('Interactive.Axes2D: Figure not in axes');
        return null;
    }
    this.objects.splice(index, 1);
    this.frame.scene.remove(object.getSceneObject());
};

/**
 * Force the object to update
 */
Axes2D.prototype.redrawFigure = function(object) {
    var index = this.objects.indexOf(object);
    if (index === -1) {
        console.log('Interactive.Axes2D: Figure not in axes');
        return null;
    }
    this.frame.scene.remove(object.getSceneObject());
    object.invalidate();
    this.frame.scene.add(object.getSceneObject());
};

/**
 * Redraw all objects
 */
Axes2D.prototype.refresh = function(object) {
    for(var i = 0; i < this.objects.length; i++) {
        if(this.objects[i].invalidate !== undefined) {
            this.frame.scene.remove(this.objects[i].getSceneObject());
            this.objects[i].invalidate();
            this.frame.scene.add(this.objects[i].getSceneObject());
        }
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

Axes2D.prototype.addHotspot = function(hotspot) {
    if (hotspot.type !== 'Hotspot2D') {
        console.log('Interactive.Axes2D: Parameter is not a Hotspot2D.');
        return null;
    }

    this.hotspots.push(hotspot);
};

function Plot() {
    /**
     * The type of this object. (Read-only)
     */
    this.type = 'Plot';
    this.axes = [];

    /**
     * Create a 3D axis in the context of this plot
     */
    this.createAxes3D = function(container, opts) {
        var ax = new Axes3D(this, container, opts);
        this.axes.push(ax);
        return ax;
    };

    /**
     * Create a 2D axis in the context of this plot
     */
    this.createAxes2D = function(container, opts) {
        var ax = new Axes2D(this, container, opts);
        this.axes.push(ax);
        return ax;
    };

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

Plot.prototype.refresh = function() {
    for(var i = 0; i < this.axes.length; i++) {
        this.axes[i].refresh();
    }
};

Plot.prototype.linkCameras = function(from) {
    for(var i = 1; i < arguments.length; i++) {
        arguments[i].camera = from.camera;
    }
};

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

    this.sceneObject = null;
}

/**
 * Returns an object that can be added to a THREE.js scene.
 */
BasisVectors2D.prototype.getSceneObject = function() {
    if(this.sceneObject === null) {
        this.sceneObject = new THREE.Group();
        this.sceneObject.add(this.xArrow.getSceneObject());
        this.sceneObject.add(this.yArrow.getSceneObject());
    }
    return this.sceneObject;
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

    this.sceneObject = null;
}

/**
 * Returns an object that can be added to a THREE.js scene.
 */
BasisVectors3D.prototype.getSceneObject = function() {
    if(this.sceneObject === null) {
        this.sceneObject = new THREE.Group();
        this.sceneObject.add(this.xArrow.getSceneObject());
        this.sceneObject.add(this.yArrow.getSceneObject());
        this.sceneObject.add(this.zArrow.getSceneObject());
    }
    return this.sceneObject;
};

exports.Plot = Plot;
exports.Axes2D = Axes2D;
exports.Axes3D = Axes3D;
exports.TouchEventListener = TouchEventListener;
exports.Expression = Expression;
exports.Interval = Interval;
exports.MathPlus = MathPlus;
exports.Number = Number;
exports.Vector = Vector;
exports.Arrow2D = Arrow2D;
exports.Arrow3D = Arrow3D;
exports.BasisVectors2D = BasisVectors2D;
exports.BasisVectors3D = BasisVectors3D;
exports.Hotspot2D = Hotspot2D;
exports.Parametric2D = Parametric2D;
exports.Parametric3D = Parametric3D;
exports.Frame = Frame;

Object.defineProperty(exports, '__esModule', { value: true });

})));
