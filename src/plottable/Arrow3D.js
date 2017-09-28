import { Expression } from '../math/expressions/Expression.js';
import { Plottable } from './Plottable.js';

/**
 * Object that represents an arrow in 3d space.
 * @param {*} vector The vector which this object is based on
 * @param {*} opts Options to customize the appearance of the arrow. Includes:
 * origin -- Point at which the arrow starts. Default is (0, 0, 0)
 * hex -- hexadecimal value to define color. Default is 0xffff00.
 * headLength -- The length of the head of the arrow. Default is 0.2 * length.
 * headWidth -- The length of the width of the arrow. Default is 0.2 * headLength.
 * (Derived from THREE.js)
 */
function Arrow3D(plot, expr, opts) {
    Plottable.call(this, plot, expr, opts);
    
    this.opts = {}
    this.opts.origin = opts.origin !== undefined ? new Expression(opts.origin, plot.context) : new Expression('(0,0,0)', plot.context);
    this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;
}

Arrow3D.prototype = Object.create(Plottable.prototype);
Arrow3D.prototype.constructor = Arrow3D;

Arrow3D.prototype.getVariables = function() {    
    if(this.opts.origin !== undefined) return Plottable.prototype.getVariables.call(this).concat(this.opts.origin.getVariables());
    else return Plottable.prototype.getVariables.call(this).getVariables()
}

Arrow3D.prototype.createSceneObject = function() {
    var _vector3 = this.expr.evaluate().toVector3();
    var _dir = _vector3.clone().normalize();
    var _origin = this.opts.origin.evaluate().toVector3();
    var _length = _vector3.length();
    var _hex = this.opts.hex;
    var _headLength = this.opts.headLength !== undefined ? this.opts.headLength : 0.2 * _length;
    var _headWidth = this.opts.headWidth !== undefined ? this.opts.headWidth : 0.2 * _headLength;

    return new THREE.ArrowHelper(_dir, _origin, _length, _hex, _headLength, _headWidth);
}

export { Arrow3D };