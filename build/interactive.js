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
    var _rightMouseDown = false;
    var _suppressContextMenu = false;

    var _screenStartX = 0;
    var _screenStartY = 0;

    _container.addEventListener('mouseenter', function() {
        _mouseInContainer = true;
    });

    _container.addEventListener('mouseleave', function() {
        _mouseInContainer = false;
    });

    _container.addEventListener('mousedown', function(event) {
        if(event.button & 2) _rightMouseDown = true;
        
        _screenStartX = event.screenX;
        _screenStartY = event.screenY;
    });

    _container.addEventListener('mouseup', function(event) {
        if(event.button & 2) _rightMouseDown = false;
    });

    _container.addEventListener('contextmenu', function(event) {
        if(_suppressContextMenu) {
            event.preventDefault();
            _suppressContextMenu = false;
        }
    });

    document.addEventListener('mousemove', function(event) {
        if(_rightMouseDown) {
            var e = new CustomEvent('pan', { 
                detail: {
                    screenStartX: _screenStartX,
                    screenX: event.screenX,
                    screenStartY: _screenStartY,
                    screenY: event.screenY,
                    suppressContextMenu: function() {
                        _suppressContextMenu = true;
                    }
                }
            });
            _container.dispatchEvent(e);
        }
    });

    _container.addEventListener('wheel', function(event) {
        var e = new CustomEvent('zoom', {
            detail: {
                amount: event.deltaY,
                suppressScrolling: function() {
                    event.preventDefault();
                }
            }
        });

        _container.dispatchEvent(e);
    });

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
}

/**
 * Returns an object that can be added to a THREE.js scene.
 */
Arrow3D.prototype.getSceneObject = function() {
    if(this.sceneObject === null) {
        var _vector3 = new THREE.Vector3(this.vector.q[0], this.vector.q[1], this.vector.q[2]);
        var _dir = _vector3.clone().normalize();
        var _origin = this.opts.origin !== undefined ? this.opts.origin : new THREE.Vector3(0,0,0);
        var _length = _vector3.length();
        var _hex = this.opts.hex !== undefined ? this.opts.hex : 0xffffff;
        var _headLength = this.opts.headLength !== undefined ? this.opts.headLength : 0.2 * _length;
        var _headWidth = this.opts.headWidth !== undefined ? this.opts.headWidth : 0.2 * _headLength;

        this.sceneObject = new THREE.ArrowHelper(_dir, _origin, _length, _hex, _headLength, _headWidth);
    }
    return this.sceneObject;
};

/**
 * Renders plots (not to be confused with the Plot class)
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
     * Camera which renders the axes. 
     */
    this.camera = new THREE.PerspectiveCamera( 50, this.frame.width / this.frame.height, .01, 50);

    // Initialize camera position
    this.camera.position.x = 4;
    this.camera.position.y = 3;
    this.camera.position.z = 2;
    this.camera.lookAt(this.frame.scene.position);

    /**
     * Objects to plot
     */
    this.objects = [];
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
Axes3D.prototype.addPlot = function(object) {
    this.objects.push(object);
    this.frame.scene.add(object.getSceneObject());
};

/**
 * Renders plots in 2D (not to be confused with the Plot class)
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

    /**
     * Objects to plot
     */
    this.objects = [];

    // Bind events: Panning
    var _cameraOriginX = 0;
    var _cameraOriginY = 0;
    var _self = this;

    this.frame.container.addEventListener('mousedown', function(event) {
        if(event.button & 2) {
            _cameraOriginX = _self.camera.position.x;
            _cameraOriginY = _self.camera.position.y;
        }
    });

    this.frame.container.addEventListener('pan', function(event) {
        // Prevent default if mouse moved significantly
        if((event.detail.screenX - event.detail.screenStartX) * (event.detail.screenX - event.detail.screenStartX) + (event.detail.screenY - event.detail.screenStartY) * (event.detail.screenY - event.detail.screenStartY) > 25) {
            event.detail.suppressContextMenu();
        }
    
        // Pan camera
        _self.camera.position.x = -2 * (event.detail.screenX - event.detail.screenStartX) / _self.zoom + _cameraOriginX;
        _self.camera.position.y = 2 * (event.detail.screenY - event.detail.screenStartY) / _self.zoom + _cameraOriginY;
    });

    // Bind Events: Zooming
    this.frame.container.addEventListener('zoom', function(event) {
        event.detail.suppressScrolling();
        if(event.detail.amount > 0) _self.zoom *= 0.8;
        else _self.zoom *= 1.25;
        _self.updateCamera();
    });
}

/**
 * Render the axes
 */
Axes2D.prototype.render = function() {
    this.frame.render( this.camera );
};

/**
 * Add an object to plot
 * @param {*} object Must be plottable
 */
Axes2D.prototype.addPlot = function(object) {
    this.objects.push(object);
    this.frame.scene.add(object.getSceneObject());
};

Axes2D.prototype.updateCamera = function() {
    this.camera.left = -this.frame.width / this.zoom;
    this.camera.right = this.frame.width / this.zoom;
    this.camera.top = this.frame.height / this.zoom;
    this.camera.bottom = -this.frame.height / this.zoom;
    this.camera.updateProjectionMatrix();
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
}

/**
 * Represents a vector with an arbitrary number of dimensions, and of any type that supports adding and scaling. Operations are done in place where appropriate.
 */
function Vector() {
    this.type = 'Vector';

    // Support an arbitrary number of dimensions (Read-only)
    this.dimensions = arguments.length;

    // q is the general term for a coordinate
    this.q = Array.from(arguments);
}

/**
 * Object that represents an arrow in 2d space.
 * @param {*} vector The vector which this object is based on
 * @param {*} opts Options to customize the appearance of the arrow. Includes:
 * origin -- Point at which the arrow starts. Default is (0, 0)
 * hex -- hexadecimal value to define color. Default is 0xffff00.
 * headLength -- The length of the head of the arrow. Default is 0.2 * length.
 * headWidth -- The length of the width of the arrow. Default is 0.2 * headLength.
 * (Derived from THREE.js)
 */
function Arrow2D(vector, opts) {
    if (vector.type !== 'Vector') {
        console.log('Interactive.Arrow2D: Parameter is not a vector.');
        return null;
    }

    if (vector.dimensions !== 2) {
        console.log('Interactive.Arrow2D: Vector dimension mismatch. 2D vector required.');
        return null;
    }

    this.opts = opts !== undefined ? opts : {};

    this.vector = vector;

    this.sceneObject = null;
}

/**
 * Returns an object that can be added to a THREE.js scene.
 */
Arrow2D.prototype.getSceneObject = function() {
    if(this.sceneObject === null) {
        var _vector2 = new THREE.Vector3(this.vector.q[0], this.vector.q[1]);
        var _dir = _vector2.clone().normalize();
        var _origin = this.opts.origin !== undefined ? this.opts.origin : new THREE.Vector3(0,0,0);
        var _length = _vector2.length();
        var _hex = this.opts.hex !== undefined ? this.opts.hex : 0xffffff;
        var _headLength = this.opts.headLength !== undefined ? this.opts.headLength : 0.2 * _length;
        var _headWidth = this.opts.headWidth !== undefined ? this.opts.headWidth : 0.2 * _headLength;

        this.sceneObject = new THREE.ArrowHelper(_dir, _origin, _length, _hex, _headLength, _headWidth);
    }
    return this.sceneObject;
};

/**
 * Object that represents basis axes in 2d space.
 * @param {*} opts Options to customize the appearance of the arrows. Includes:
 * origin -- Point of the origin. Default is (0, 0, 0)
 * hex -- hexadecimal value to define color. Default is 0xffff00.
 * headLength -- The length of the head of the arrow. Default is 0.2 * length.
 * headWidth -- The length of the width of the arrow. Default is 0.2 * headLength.
 * (Derived from THREE.js)
 */
function BasisVectors2D(opts) {
    opts = opts !== undefined ? opts : {};

    this.xBasis = new Vector(1, 0);
    this.yBasis = new Vector(0, 1);

    this.xArrow = new Arrow2D(this.xBasis, opts);   
    this.yArrow = new Arrow2D(this.yBasis, opts);

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
    opts = opts !== undefined ? opts : {};

    this.xBasis = new Vector(1, 0, 0);
    this.yBasis = new Vector(0, 1, 0);
    this.zBasis = new Vector(0, 0, 1);

    this.xArrow = new Arrow3D(this.xBasis, opts);   
    this.yArrow = new Arrow3D(this.yBasis, opts);
    this.zArrow = new Arrow3D(this.zBasis, opts);

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
exports.Vector = Vector;
exports.Arrow2D = Arrow2D;
exports.Arrow3D = Arrow3D;
exports.BasisVectors2D = BasisVectors2D;
exports.BasisVectors3D = BasisVectors3D;
exports.Frame = Frame;

Object.defineProperty(exports, '__esModule', { value: true });

})));
