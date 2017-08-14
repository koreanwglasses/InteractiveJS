import { TouchEventListener } from '../environment/TouchEventListener.js';

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

    if(opts.antialias === undefined) opts.antialias = true;

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
}

export { Frame };