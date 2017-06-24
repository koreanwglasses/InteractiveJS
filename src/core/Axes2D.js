import { Frame } from '../render/Frame.js';
import { Arrow2D } from '../plottable/Arrow2D.js';
import { Hotspot2D } from '../plottable/Hotspot2D.js';
import { Parametric2D } from '../plottable/Parametric2D.js';
import { Vector } from '../math/Vector.js';
import { Number } from '../math/Number.js';
import { Expression } from '../math/expressions/Expression.js';

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

    // avoid null pointer errors
    if(opts === undefined) opts = {};

    /**
     * The zoom level of the camera. Denotes how many pixels should be one unit
     */
    this.zoom = opts.zoom !== undefined? opts.zoom : 200;

    this.fixedZoom = opts.fixedZoom !== undefined? opts.fixedZoom : false;

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
    this.objects = []

    /**
     * Expressions to plot
     */
    this.expressions = {}

    if(opts.showAxes !== false) {
        var arr = new Interactive.BasisVectors2D(this.parent)
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
    }

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
    }

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
                }
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
    }

    // Bind Events: Zooming
    this.frame.touchEventListener.onzoom = function(event) {
        if(this.fixedZoom === false) {
            event.suppressScrolling();
            _self.zoom *= Math.pow(0.8, event.amount / 100);
            _self.updateCamera();
        }
    }
}

/**
 * Render the axes
 */
Axes2D.prototype.render = function() {
    this.frame.render(this.camera);
}

/**
 * Plot an expression
 */
Axes2D.prototype.plotExpression = function(expr, type, opts) {
    switch(type) {
        case 'arrow':            
            var figure = new Arrow2D(this.parent, expr, opts)
            this.expressions[expr] = figure;
            this.addFigure(figure)
            return figure;
        case 'hotspot':
            var hotspot = new Hotspot2D(this.parent, expr);
            this.addHotspot(hotspot);
            return hotspot;
        case 'parametric':           
            var par = new Parametric2D(this, expr, opts)
            this.expressions[expr] = par;
            this.addFigure(par);
            return par;
        default:
            console.log('Interactive.Axes2D: Invalid plot type');
            return null;
    }
}

/**
 * Add an object to plot
 * @param {*} object Must be plottable
 */
Axes2D.prototype.addFigure = function(object) {
    this.objects.push(object);
    this.frame.scene.add(object.getSceneObject());
}

/**
 * Remove a plotted object
 */
Axes2D.prototype.removeFigure = function(object) {
    var index = this.objects.indexOf(object);
    if (index === -1) {
        console.log('Interactive.Axes2D: Figure not in axes')
        return null;
    }
    this.objects.splice(index, 1);
    this.frame.scene.remove(object.getSceneObject());
}

/**
 * Force the object to update
 */
Axes2D.prototype.redrawFigure = function(object) {
    var index = this.objects.indexOf(object);
    if (index === -1) {
        console.log('Interactive.Axes2D: Figure not in axes')
        return null;
    }
    this.frame.scene.remove(object.getSceneObject());
    object.invalidate();
    this.frame.scene.add(object.getSceneObject());
}

Axes2D.prototype.redrawExpression = function(expr) {
    this.redrawFigure(this.expressions[expr]);
}

/**
 * Redraw all objects
 */
Axes2D.prototype.refresh = function(expr) {
    for(var i = 0; i < this.objects.length; i++) {
        if(this.objects[i].invalidate !== undefined && (expr === undefined || this.objects[i].getVariables().includes(expr))) {
            this.frame.scene.remove(this.objects[i].getSceneObject());
            this.objects[i].invalidate(expr);
            this.frame.scene.add(this.objects[i].getSceneObject());
        }
    }
}

/**
 * Apply changes to camera
 */
Axes2D.prototype.updateCamera = function() {
    this.camera.left = -this.frame.width / this.zoom
    this.camera.right = this.frame.width / this.zoom
    this.camera.top = this.frame.height / this.zoom
    this.camera.bottom = -this.frame.height / this.zoom
    this.camera.updateProjectionMatrix();
}

Axes2D.prototype.addHotspot = function(hotspot) {
    if (hotspot.type !== 'Hotspot2D') {
        console.log('Interactive.Axes2D: Parameter is not a Hotspot2D.');
        return null;
    }

    this.hotspots.push(hotspot);
}

export { Axes2D };