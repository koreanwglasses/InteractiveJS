import { Axes } from '../core/Axes.js'
import { Arrow2D } from '../plottable/Arrow2D.js';
import { Hotspot2D } from '../plottable/Hotspot2D.js';
import { Parametric2D } from '../plottable/Parametric2D.js';
import { Isoline2D } from '../plottable/Isoline2D.js';
import { Vector } from '../math/Vector.js';
import { Number } from '../math/Number.js';
import { Expression } from '../math/expressions/Expression.js';

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

Axes2D.prototype = Object.create(Axes.prototype);
Axes2D.prototype.constructor = Axes2D;

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
        case 'isoline':           
            var iso = new Isoline2D(this, expr, opts)
            this.expressions[expr] = iso;
            this.addFigure(iso);
            return iso;
        default:
            console.log('Interactive.Axes2D: Invalid plot type');
            return null;
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
}

export { Axes2D };