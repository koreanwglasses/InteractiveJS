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
     * Camera which renders the axes. 
     */
    this.camera = new THREE.OrthographicCamera(-this.frame.width / 2, this.frame.width / 2, this.frame.height / 2, -this.frame.height / 2, 1, 1000);

    // Initialize camera position
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
Axes2D.prototype.render = function() {
    this.frame.render( this.camera );
}

export { Axes2D };