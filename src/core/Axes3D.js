import { Frame } from '../render/Frame.js';

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
    this.camera = new THREE.PerspectiveCamera( 50, this.frame.width / this.frame.height, 1, 1000);

    // Initialize camera position
    this.camera.position.y = 150;
    this.camera.position.z = 500;
    this.camera.lookAt(this.frame.scene.position);

    // Some test code
    var mesh = new THREE.Mesh( 
        new THREE.BoxGeometry( 200, 200, 200, 1, 1, 1 ), 
        new THREE.MeshBasicMaterial( { color : 0xff0000, wireframe: true } 
    ));
    this.frame.scene.add( mesh );
}

/**
 * Render the axes
 */
Axes3D.prototype.render = function() {
    this.frame.render( this.camera );
}

export { Axes3D };