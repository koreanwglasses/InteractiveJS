import { Plottable } from './Plottable.js';

function Parallelogram2D(plot,plotInfo, opts) {
    Plottable.call(this, plot, opts)

    if(opts === undefined) opts = {};

    this.opts = {}
    this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;
    this.opts.opacity = opts.opacity !== undefined ? opts.opacity : 1;

    this.exprs = plotInfo.exprs;
}

Parallelogram2D.prototype = Object.create(Plottable.prototype);
Parallelogram2D.prototype.constructor = Parallelogram2D;

Parallelogram2D.prototype.createSceneObject = function() {
    var _vector1 = new THREE.Vector3(...this.plot.parser.eval(this.exprs.v1).toArray());
    var _vector2 = new THREE.Vector3(...this.plot.parser.eval(this.exprs.v2).toArray());
    var _origin = new THREE.Vector3(...this.plot.parser.eval(this.exprs.offset).toArray());
    
    var geom = new THREE.Geometry();
    geom.vertices.push(_origin);
    geom.vertices.push(_origin.clone().add(_vector1));
    geom.vertices.push(_origin.clone().add(_vector2));
    geom.vertices.push(_origin.clone().add(_vector1).add(_vector2));
    
    var f1 = new THREE.Face3(3, 1, 0);
    var f2 = new THREE.Face3(0, 2, 3);

    geom.faces.push(f1);                
    geom.faces.push(f2);

    var mat = new THREE.MeshBasicMaterial({color: this.opts.hex, side: THREE.DoubleSide, opacity: this.opts.opacity, transparent: true});

    return new THREE.Mesh( geom, mat );
}

export { Parallelogram2D };