import { Frame } from '../render/Frame.js';

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
    this.objects = []

    // Bind events: Panning
    var _mouseInContainer = false;
    var _mouseDown = false;
    var _screenOriginX = 0;
    var _screenOriginY = 0;
    var _cameraOriginX = 0;
    var _cameraOriginY = 0;
    var _self = this;

    this.frame.container.onmouseenter = function() {
        _mouseInContainer = true;
    }

    this.frame.container.onmouseleave = function() {
        _mouseInContainer = false;
    }

    this.frame.container.onmousedown = function(event) {
        if(event.button & 2) {
            _mouseDown = true;
            _screenOriginX = event.screenX;
            _screenOriginY = event.screenY;
            _cameraOriginX = _self.camera.position.x;
            _cameraOriginY = _self.camera.position.y;
        }
    };
    
    this.frame.container.onmouseup = function(event) {
        if(event.button & 2) _mouseDown = false;
    }

    this.frame.container.oncontextmenu = function(event) {
        // Prevent default if mouse moved significantly
        if((event.screenX - _screenOriginX) * (event.screenX - _screenOriginX) + (event.screenY - _screenOriginY) * (event.screenY - _screenOriginY) > 25) {
            event.preventDefault();
        }
    }

    document.onmousemove = function(event) {
        if(_mouseDown) {
            _self.camera.position.x = -2 * (event.screenX - _screenOriginX) / _self.zoom + _cameraOriginX;
            _self.camera.position.y = 2 * (event.screenY - _screenOriginY) / _self.zoom + _cameraOriginY;
        }
    }

    // Bind Events: Zooming
}

/**
 * Render the axes
 */
Axes2D.prototype.render = function() {
    this.frame.render( this.camera );
}

/**
 * Add an object to plot
 * @param {*} object Must be plottable
 */
Axes2D.prototype.addPlot = function(object) {
    this.objects.push(object);
    this.frame.scene.add(object.getSceneObject());
}

export { Axes2D };