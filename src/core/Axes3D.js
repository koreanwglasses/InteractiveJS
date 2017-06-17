import { Frame } from '../render/Frame.js';
import { Arrow3D } from '../plottable/Arrow3D.js';

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
    this.objects = []

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
            var disp = _upUnit.clone().multiplyScalar((event.screenY - event.screenStartY)).addScaledVector(_rightUnit, -(event.screenX - event.screenStartX))
            var newCamPos = _cameraStartPos.clone().addScaledVector(disp, 0.002 * r)
            _self.camera.position.copy(newCamPos);
            var newOrPos = _cameraStartOr.clone().addScaledVector(disp, 0.002 * r)
            _self.corigin.copy(newOrPos);
            _self.camera.lookAt(_self.corigin);
        }
        if(event.leftButtonDown) {
            var r = _self.camera.position.distanceTo(_self.corigin);
            var az = _cameraStartAz - (event.screenX - event.screenStartX) / 100
            var pol = _cameraStartPol - (event.screenY - event.screenStartY) / 100

            _self.camera.position.setFromSpherical(new THREE.Spherical(r, pol, az)).add(_self.corigin);
            _self.camera.lookAt(_self.corigin);
        }
    };

    // Bind Events: Zooming
    this.frame.touchEventListener.onzoom = function(event) {
        event.suppressScrolling();
        if(event.amount > 0) {
            var newPos = _self.corigin.clone().addScaledVector(_self.camera.position.clone().sub(_self.corigin), 1.25);
            _self.camera.position.copy(newPos);
        }
        else {
            var newPos = _self.corigin.clone().addScaledVector(_self.camera.position.clone().sub(_self.corigin), 0.8);
            _self.camera.position.copy(newPos);
        }
        _self.camera.lookAt(_self.corigin);
    };
}

/**
 * Render the axes
 */
Axes3D.prototype.render = function() {
    this.frame.render( this.camera );
}

/**
 * Add an object to plot
 * @param {*} object Must be plottable
 */
Axes3D.prototype.addPlot = function(object) {
    this.objects.push(object);
    this.frame.scene.add(object.getSceneObject());
}

export { Axes3D };