/**
 * Renders plots in 2D (not to be confused with the Plot class)
 * TODO: Add functionality to link cameras between figures
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

    // Make sure the container is a dom element
    if(!container instanceof Element) {
        console.log('Interactive.Axes2D: Invalid container. Must be a DOM Element');
        return null;
    }

    // Avoid null pointer errors later on
    if(opts === undefined) opts = {};

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
    this.renderer = new THREE.WebGLRenderer();

    // Initialize renderer within container
    this.renderer.setSize(this.width, this.height);
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    /**
     * Scene from Three.js where all the elements lie. (Private)
     */    
    this.scene = new THREE.Scene();

    /**
     * Camera which renders the axes. 
     */
    this.camera = new THREE.OrthographicCamera(-this.width / 2, this.width / 2, this.height / 2, -this.height / 2, 1, 1000);

    // Initialize camera position
    this.camera.position.z = 500;
    this.camera.lookAt(this.scene.position);

    // Some test code
    var mesh = new THREE.Mesh( 
        new THREE.BoxGeometry( 200, 200, 200, 1, 1, 1 ), 
        new THREE.MeshBasicMaterial( { color : 0xff0000, wireframe: true } 
    ));
    this.scene.add( mesh );
}

/**
 * Render the axes
 */
Axes2D.prototype.render = function() {
    this.renderer.render( this.scene, this.camera );
}

export { Axes2D };