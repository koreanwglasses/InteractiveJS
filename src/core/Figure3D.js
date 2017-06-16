function Figure3D(parent, container, opts) {
    this.type = 'Figure3D';

    // Keep track of the parent
    var _parent = parent;

    // Make sure the container is a dom element
    if(!container instanceof Element) {
        console.log('Interactive.Figure3D: Invalid container. Must be a DOM Element');
        return null;
    }

    // Make sure opts is defined
    if(opts === undefined) opts = {};

    // Define local vars and init renderer
    var _width = container.clientWidth;
    var _height = container.clientHeight;

    var _renderer = new THREE.WebGLRenderer();
    _renderer.setSize(_width, _height);
    container.innerHTML = '';
    container.appendChild(_renderer.domElement);

    var _scene = new THREE.Scene();
    var _camera = new THREE.PerspectiveCamera( 50, _width / _height, 1, 1000);
    _camera.position.y = 150;
    _camera.position.z = 500;
    _camera.lookAt(_scene.position);

    this.cameraGroup = opts.cameraGroup !== undefined ? opts.cameraGroup : 0;

    this.getWidth = function() {
        return _width;
    }

    this.getHeight = function() {
        return _height;
    }

    this.getRenderer = function() {
        return _renderer;
    }

    this.getScene = function() {
        return _scene;
    }

    this.getCamera = function() {
        return _camera;
    }

    // Some test code
    var mesh = new THREE.Mesh( 
        new THREE.BoxGeometry( 200, 200, 200, 1, 1, 1 ), 
        new THREE.MeshBasicMaterial( { color : 0xff0000, wireframe: true } 
    ));
    _scene.add( mesh );
}

Figure3D.prototype.render = function() {
    this.getRenderer().render( this.getScene(), this.getCamera());
}

export { Figure3D };