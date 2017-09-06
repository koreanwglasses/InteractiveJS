import { Expression } from '../math/expressions/Expression.js';
import { Plottable } from './Plottable.js';

function Parallelogram2D(plot, expr, opts) {
    Plottable.call(this, plot, expr, opts)

    if(opts === undefined) opts = {};

    this.opts = {}
    this.opts.origin = opts.origin !== undefined ? new Expression(opts.origin, plot.context) : new Expression('(0,0)', plot.context);
    this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;
    this.opts.opacity = opts.opacity !== undefined ? opts.opacity : 1;
}

Parallelogram2D.prototype = Object.create(Plottable.prototype);
Parallelogram2D.prototype.constructor = Parallelogram2D;

Parallelogram2D.prototype.getVariables = function() {
    return this.expr.getVariables().concat(this.opts.origin.getVariables());
}

Parallelogram2D.prototype.createSceneObject = function() {
    var _vector1 = this.expr.evaluate().q[0];
    var _vector2 = this.expr.evaluate().q[1];
    var _origin = this.opts.origin.evaluate();
    
    var geom = new THREE.Geometry();
    geom.vertices.push(_origin.toVector3());
    geom.vertices.push(_origin.add(_vector1).toVector3());
    geom.vertices.push(_origin.add(_vector2).toVector3());
    geom.vertices.push(_origin.add(_vector1).add(_vector2).toVector3());
    
    var f1 = new THREE.Face3(3, 1, 0);
    var f2 = new THREE.Face3(0, 2, 3);

    geom.faces.push(f1);                
    geom.faces.push(f2);

    var mat = new THREE.MeshBasicMaterial({color: this.opts.hex, side: THREE.DoubleSide, opacity: this.opts.opacity, transparent: true});

    return new THREE.Mesh( geom, mat );
}

export { Parallelogram2D };