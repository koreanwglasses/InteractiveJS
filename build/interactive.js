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
function Arrow3D(vector, opts) {
    if (vector.type !== 'Vector') {
        console.log('Interactive.Arrow3D: Parameter is not a vector.');
        return null;
    }

    if (vector.dimensions !== 3) {
        console.log('Interactive.Arrow3D: Vector dimension mismatch. 3D vector required.');
        return null;
    }

    this.opts = opts !== undefined ? opts : {};

    this.vector = vector;

    this.sceneObject = null;

    this.validated = false;
}

/**
 * Returns an object that can be added to a THREE.js scene.
 */
Arrow3D.prototype.getSceneObject = function() {
    if(this.validated === false) {
        var _vector3 = new THREE.Vector3(this.vector.q[0], this.vector.q[1], this.vector.q[2]);
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

    // Bind events
    var _self = this;

    // Bind Events: Panning and Orbiting
    var _cameraStartPol = 0;
    var _cameraStartAz = 0;
    var _cameraStartR = 1;
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
            var newCamPos = _cameraStartPos.clone().addScaledVector(disp, 0.002 * r);
            _self.camera.position.copy(newCamPos);
            var newOrPos = _cameraStartOr.clone().addScaledVector(disp, 0.002 * r);
            _self.corigin.copy(newOrPos);
            _self.camera.lookAt(_self.corigin);
        }
        if(event.leftButtonDown) {
            var r = _self.camera.position.distanceTo(_self.corigin);
            var az = _cameraStartAz - (event.screenX - event.screenStartX) / 100;
            var pol = _cameraStartPol - (event.screenY - event.screenStartY) / 100;

            _self.camera.position.setFromSpherical(new THREE.Spherical(r, pol, az)).add(_self.corigin);
            _self.camera.lookAt(_self.corigin);
        }
    };

    // Bind Events: Zooming
    this.frame.touchEventListener.onzoom = function(event) {
        event.suppressScrolling();
        var newPos = _self.corigin.clone().addScaledVector(_self.camera.position.clone().sub(_self.corigin), Math.pow(0.8, event.amount / 100));
        _self.camera.position.copy(newPos);
        _self.camera.lookAt(_self.corigin);
    };
}

/**
 * Render the axes
 */
Axes3D.prototype.render = function() {
    this.frame.render( this.camera );
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
 * Object that represents an arrow in 2d space.
 * @param {*} vector The vector which this object is based on
 * @param {*} opts Options to customize the appearance of the arrow. Includes:
 * origin -- Point at which the arrow starts. Default is (0, 0)
 * hex -- hexadecimal value to define color. Default is 0xffff00.
 * headLength -- The length of the head of the arrow. Default is 0.2.
 * headWidth -- The length of the width of the arrow. Default is 0.05.
 * (Derived from THREE.js)
 */
function Arrow2D(expr, opts) {
    // if (vector.type !== 'Vector') {
    //     console.log('Interactive.Arrow2D: Parameter is not a vector.');
    //     return null;
    // }

    // if (vector.dimensions !== 2) {
    //     console.log('Interactive.Arrow2D: Vector dimension mismatch. 2D vector required.')
    //     return null;
    // }

    this.opts = opts !== undefined ? opts : {};

    /**
     * (Read-only)
     */
    this.expr = expr;

    this.sceneObject = null;

    this.validated = false;
}

/**
 * Returns an object that can be added to a THREE.js scene.
 */
Arrow2D.prototype.getSceneObject = function() {
    if(this.validated === false) {
        var vector = this.expr.evaluate();
        var _vector2 = new THREE.Vector3(vector.q[0], vector.q[1]);
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

function Hotspot2D(position) {
    this.type = 'Hotspot2D';

    if (position.type !== 'Vector') {
        console.log('Interactive.Hotspot2D: position is not a vector.');
        return null;
    }

    if (position.dimensions !== 2) {
        console.log('Interactive.Hotspot2D: Vector dimension mismatch. 2D vector required.');
        return null;
    }

    this.position = position;
    this.size = 10;
    // this.onmouseenter = function() { return false; }
    // this.onmouseleave = function() { return false; }
    // this.onmousedown = function() { return false; }
    // this.onmouseup = function() { return false; }
    this.ondrag = function() { return false; };
}

/**
 * Represents a vector with an arbitrary number of dimensions, and of any type that supports adding and scaling. Operations create new instances
 */
function Vector() {
    this.type = 'Vector';

    // Support an arbitrary number of dimensions (Read-only)
    this.dimensions = arguments.length;

    // q is the general term for a coordinate
    this.q = Array.from(arguments);
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
        result.q[i] += v.q[i];
    }
    return result;
};

/**
 * Sets this vector's coordinates to the input vector's
 */
Vector.prototype.set = function(v) {
    this.q = v.q.slice();
    return this;
};

function Expression(string, context) {
    this.type = 'Expression';

    this.string = string;    
    this.validated = false;
    this.function = null;
    this.context = context;
}

Expression.typeOf = function(string) {
    var nestingLevel = 0;
    var isVector = false;
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
        if(str.charAt(i) === '(') {
            nestingLevel++;

            if(type === null) {
                type = 'expression';
            }
            if(type === 'operator') {
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
            if(/[0-9a-zA-z.]/.test(str.charAt(i)) === false) {
                parts.push({str: str.substring(start, i), type: type});
                start = i;
                type = 'operator';
            } else {
                if(type === null) {
                    type = 'constant';
                }
                if(type === 'operator') {
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
        if(parts[i].type === 'operator') {
            while(ops.length > 0 && precedence[ops[ops.length - 1].str] >= precedence[parts[i].str]) {
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
            if(parts[i].type === 'constant') {
                parts[i].value = parseFloat(parts[i].str);
            }
            post.push(parts[i]);
        }
    }
    while(ops.length > 0) {
        post.push(ops.pop());
    }
    return post;
};

Expression.splitVector = function(string) {
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

// Expression.toJSExpression = function(str) {
//     var parts = Expression.separate(str);
//     var func = '';
//     for(var i = 0; i < parts.length; i++) {
//         if(parts[i].type === 'variable') {
//             if(Math[parts[i].str] !== undefined) {
//                 func += 'Math.' + parts[i].str;
//             } else {
//                 func += 'context.' + parts[i].str;
//             }
//         } else if (parts[i].type === 'vector') {
//             var components = Expression.splitVector(parts[i].str);
//             func += 'new Vector(';
//             for(var j = 0; j < components.length; j++) {
//                 func += Expression.toJSExpression(components[j])
//                 func += ','
//             }
//             func = func.slice(0,func.length - 1)
//             func += ')'
//         } else {
//             func += parts[i].str;
//         }
//     }
//     return func;
// }

Expression.toJSFunction = function(string) {
    var str = string.trim();

    // Expression is an equation:
    if(str.match(/=/g) !== null && str.match(/=/g).length === 1) {
        var left, right;
        if(str.includes(':=')) {
            left = string.split(':=')[0];
            right = string.split(':=')[1];
        } else {
            left = string.split('=')[0];
            right = string.split('=')[1];
        }
        
        var leftParts = Expression.separate(left);

        // variable assignment
        if(leftParts.length === 1 && leftParts[0].type === 'variable') {
            var righteval = Expression.toJSFunction(right);
            var func;
            // Static assignment
            if(str.includes(':=')) {
                func = function(context) {
                    return context[leftParts[0].str] = righteval(context);
                };
            } else { // Dynamic Assignment
                func = function(context) {
                    Object.defineProperty(context, leftParts[0].str, {get: function() { return righteval(context); }} );
                    return context[leftParts[0].str]
                };
            }
            return func;
        } 
        
        var leftPost = Expression.toPostfix(leftParts);

        // function definition
        if(leftPost.length === 2 && leftPost[leftPost.length - 1].type === 'function') {
            var righteval = Expression.toJSFunction(right);
            if(leftPost[0].type === 'variable') {
                var func = function(context) {
                    return context[leftPost[leftPost.length - 1].str] = function(v) {
                        Object.assign({}, context);
                        context[leftPost[0].str] = v.q[0];
                        return righteval(context);
                    }
                };

                return func;
            }
            if(leftPost[0].type === 'vector') {
                var args = Expression.splitVector(leftPost[0].str);
                console.log(args);

                var func = function(context) {
                    return context[leftPost[leftPost.length - 1].str] = function(v) {
                        Object.assign({}, context);
                        for(var i = 0; i < args.length; i++) {
                            context[args[i]] = v.q[i];
                        }
                        return righteval(context);
                    }
                };

                return func;
            }
        }
    } else {
        var type = Expression.typeOf(str);

        if(type === 'expression') {
            var operations = Expression.toPostfix(Expression.separate(str));
            // var postfix = ''
            // for(var i = 0; i < operations.length; i++) {
            //     postfix += operations[i].str + ' '
            // }
            // console.log(postfix);

            for(var i = 0; i < operations.length; i++) {
                switch(operations[i].type) {
                    case 'vector':                        
                        operations[i].eval = Expression.toJSFunction(operations[i].str);
                        break;
                    case 'constant':
                        operations[i].value = parseFloat(operations[i].str);
                        break;
                }
            }
            
            var func = function(context) {
                var stack = [];
                for(var i = 0; i < operations.length; i++) {
                    switch(operations[i].type) {
                        case 'vector':
                            stack.push(operations[i].eval(context));
                            break;
                        case 'constant':
                            stack.push(operations[i].value);
                            break;
                        case 'variable':
                            stack.push(context[operations[i].str]);
                            break;
                        case 'function':
                            var v = stack.pop();
                            if(!(v instanceof Vector)) {
                                v = new Vector(v);
                            }

                            if(Math[operations[i].str] !== undefined) {
                                stack.push(Math[operations[i].str].apply(null, v.q));
                            } else {
                                stack.push(context[operations[i].str](v));
                            }
                            break;
                        case 'operator':
                            var b = stack.pop();
                            var a = stack.pop();
                            if(typeof a === 'number' && typeof b === 'number') {
                                switch(operations[i].str) {
                                    case '+':
                                        stack.push(a + b);
                                        break;
                                    case '-':
                                        stack.push(a - b);
                                        break;
                                    case '*':
                                        stack.push(a * b);
                                        break;
                                    case '/':
                                        stack.push(a / b);
                                        break;
                                    case '^':
                                        stack.push(Math.pow(a, b));
                                        break;                                                                    
                                }
                            } else if(typeof a === 'number') {
                                switch(operations[i].str) {
                                    case '+':
                                        stack.push(b.preAdd(a));
                                        break;
                                    case '-':
                                        stack.push(b.preSub(a));
                                        break;
                                    case '*':
                                        stack.push(b.preMul(a));
                                        break;
                                    case '/':
                                        stack.push(b.preDiv(a));
                                        break;
                                    case '^':
                                        stack.push(b.preExp(a));
                                        break;                                                                    
                                }
                            } else {
                                switch(operations[i].str) {
                                    case '+':
                                        stack.push(a.add(b));
                                        break;
                                    case '-':
                                        stack.push(a.sub(b));
                                        break;
                                    case '*':
                                        stack.push(a.mul(b));
                                        break;
                                    case '/':
                                        stack.push(a.div(b));
                                        break;
                                    case '^':
                                        stack.push(a.exp(b));
                                        break;                                                                    
                                }
                            }
                    }
                }
                return stack.pop();
            };

            return func;
        } else if (type === 'vector') {
            var components = Expression.splitVector(str);

            var compeval = [];
            for(var i = 0; i < components.length; i++) {
                compeval.push(Expression.toJSFunction(components[i]));
            }

            var func = function(context) {
                var vector = new Vector();
                vector.dimensions = compeval.length;
                for(var i = 0; i < compeval.length; i++) {
                    vector.q[i] = compeval[i](context);
                }
                return vector;
            };

            return func;
        }
    }
};

Expression.prototype.evaluate = function() {
    if(this.validated === false) {
        this.function = Expression.toJSFunction(this.string);
        this.validated = true;
    }
    return this.function(this.context);
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
        var vector2 = new THREE.Vector2(vector.q[0], vector.q[1]);
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
                var wc = _hotspotpos.add(new Vector(2 * (event.screenX - event.screenStartX) / _self.zoom, -2 * (event.screenY - event.screenStartY) / _self.zoom));
                var e = {
                    worldX: wc.q[0],
                    worldY: wc.q[1]
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
            var expression = new Expression(expr, this.parent.context);
            var figure = new Arrow2D(expression, opts);
            this.expressions[expr] = figure;
            this.addFigure(figure);
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
Axes2D.prototype.redrawAll = function(object) {
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
    var _figures = [];

    /**
     * Create a 3D axis in the context of this plot
     */
    this.createAxes3D = function(container, opts) {
        return new Axes3D(this, container, opts);
    };

    /**
     * Create a 2D axis in the context of this plot
     */
    this.createAxes2D = function(container, opts) {
        return new Axes2D(this, container, opts);
    };

    /**
     * The variables the expressions will reference
     */
    this.context = {};

    /**
     * Cached expressions
     */
    this.expressions = {};
}

Plot.prototype.execExpression = function(expr) {
    if(this.expressions[expr] === undefined) this.expressions[expr] = new Expression(expr, this.context);
    return this.expressions[expr].evaluate();
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
function BasisVectors2D(opts) {
    var _opts = opts !== undefined ? opts : {};

    this.xBasis = new Expression('(1,0)');
    this.yBasis = new Expression('(0,1)');

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

    this.xArrow = new Arrow2D(this.xBasis, _xOpts);   
    this.yArrow = new Arrow2D(this.yBasis, _yOpts);

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
function BasisVectors3D(opts) {
    var _opts = opts !== undefined ? opts : {};

    this.xBasis = new Vector(1, 0, 0);
    this.yBasis = new Vector(0, 1, 0);
    this.zBasis = new Vector(0, 0, 1);

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

    this.xArrow = new Arrow3D(this.xBasis, _xOpts);   
    this.yArrow = new Arrow3D(this.yBasis, _yOpts);
    this.zArrow = new Arrow3D(this.zBasis, _zOpts);

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
exports.Vector = Vector;
exports.Arrow2D = Arrow2D;
exports.Arrow3D = Arrow3D;
exports.BasisVectors2D = BasisVectors2D;
exports.BasisVectors3D = BasisVectors3D;
exports.Hotspot2D = Hotspot2D;
exports.Frame = Frame;

Object.defineProperty(exports, '__esModule', { value: true });

})));
