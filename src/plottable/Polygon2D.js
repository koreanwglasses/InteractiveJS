import { Expression } from '../math/expressions/Expression.js';
import { Plottable } from './Plottable.js';

function Polygon2D(plot, expr, opts) {
    Plottable.call(this, plot, expr, opts)

    if(opts === undefined) opts = {};

    this.opts = {}
    this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;
    this.opts.opacity = opts.opacity !== undefined ? opts.opacity : 1;
}

Polygon2D.prototype = Object.create(Plottable.prototype);
Polygon2D.prototype.constructor = Polygon2D;

Polygon2D.prototype.createSceneObject = function() {
    var _vectors = this.expr.evaluate()
    
    var geom = new THREE.Geometry();
    for(var i = 0; i < _vectors.dimensions; i++) {
        geom.vertices.push(_vectors.q[i].toVector3());
        if(i > 1) {
            var f = new THREE.Face3(0,i,i-1);
            geom.faces.push(f);
        }
    }

    var mat = new THREE.MeshBasicMaterial({color: this.opts.hex, side: THREE.DoubleSide, opacity: this.opts.opacity, transparent: true});

    return new THREE.Mesh( geom, mat );
}

export { Polygon2D };