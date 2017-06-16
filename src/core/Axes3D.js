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
     * Camera which renders the axes. 
     */
    this.camera = new THREE.PerspectiveCamera( 50, this.frame.width / this.frame.height, .01, 10);

    // Initialize camera position
    this.camera.position.x = 4;
    this.camera.position.y = 3;
    this.camera.position.z = 2;
    this.camera.lookAt(this.frame.scene.position);

    /**
     * Objects to plot
     */
    this.objects = []

    // Some test code
    // var mesh = new THREE.Mesh( 
    //     new THREE.BoxGeometry( 200, 200, 200, 1, 1, 1 ), 
    //     new THREE.MeshBasicMaterial( { color : 0xff0000, wireframe: true } 
    // ));
    // this.frame.scene.add( mesh );
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