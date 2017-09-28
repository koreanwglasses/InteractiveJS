import { Expression } from '../math/expressions/Expression.js';
import { Plottable } from './Plottable.js';

function Point2D(plot, expr, opts) {
    Plottable.call(this, plot, expr, opts)

    if(opts === undefined) opts = {};
    this.opts = {}
    this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;
    this.opts.radius = opts.radius !== undefined ? opts.radius : 0.05;
}

Point2D.prototype = Object.create(Plottable.prototype);
Point2D.prototype.constructor = Point2D;

Point2D.prototype.getVariables = function() {
    return this.expr.getVariables();
}

Point2D.prototype.createSceneObject = function() {
    var _vector2 = this.expr.evaluate().toVector3();
    var _hex = this.opts.hex;
    var _radius = this.opts.radius;

    var geometry = new THREE.CircleBufferGeometry( _radius, 32 );
    var material = new THREE.MeshBasicMaterial( { color: _hex } );
    var circle = new THREE.Mesh( geometry, material );
    circle.position.copy(_vector2);
    return circle;
}

export { Point2D };