import { Axes } from '../core/Axes.js'
import { Expression } from '../math/expressions/Expression.js';
import { Arrow3D } from '../plottable/Arrow3D.js';
import { Parametric3D } from '../plottable/Parametric3D.js';
import { Isoline3D } from '../plottable/Isoline3D.js';

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

    if(opts === undefined) opts = {};
    if(opts.zoom === undefined) opts.zoom = 1;

    // Initialize camera position
    this.camera.position.x = 4 / opts.zoom;
    this.camera.position.y = 3 / opts.zoom;
    this.camera.position.z = 2 / opts.zoom;
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
            var disp = _upUnit.clone().multiplyScalar((event.screenY - event.screenStartY)).addScaledVector(_rightUnit, -(event.screenX - event.screenStartX))
            var newCamPos = _cameraStartPos.clone().addScaledVector(disp, _cameraStartUp * 0.002 * r)
            var newOrPos = _cameraStartOr.clone().addScaledVector(disp, _cameraStartUp * 0.002 * r)
            _self.camera.position.copy(newCamPos);
            _self.corigin.copy(newOrPos);
            _self.camera.lookAt(_self.corigin);
        }
        if(event.leftButtonDown) {
            event.preventDefault();

            var r = _self.camera.position.distanceTo(_self.corigin);
            var az = _cameraStartAz -  _cameraStartUp * (event.screenX - event.screenStartX) / 100
            var pol = _cameraStartPol - _cameraStartUp * (event.screenY - event.screenStartY) / 100

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
    var directionalLight1 = new THREE.DirectionalLight(0xffe8d8, .4)
    var directionalLight2 = new THREE.DirectionalLight(0xffe8d8, .2)
    directionalLight2.position.y = -1

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
}

/**
 * Plot an expression
 */
Axes3D.prototype.plotExpression = function(expr, type, opts) {
    switch(type) {
        case 'arrow':            
            var figure = new Arrow3D(this.parent, expr, opts)
            this.expressions[expr] = figure;
            this.addFigure(figure)
            return figure;
        case 'parametric':           
            var par = new Parametric3D(this, expr, opts)
            this.expressions[expr] = par;
            this.addFigure(par);
            return par;
        case 'isoline':
            var iso = new Isoline3D(this, expr, opts)
            this.expressions[expr] = iso;
            this.addFigure(iso);
            return iso;
        default:
            console.log('Interactive.Axes3D: Invalid plot type');
            return null;
    }
}

export { Axes3D };