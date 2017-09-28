import { Expression } from '../math/expressions/Expression.js';
import { Plottable } from './Plottable.js';

/**
 * Object that represents an arrow in 2d space.
 * @param {*} vector The vector which this object is based on
 * @param {*} opts Options to customize the appearance of the arrow. Includes:
 * origin -- Point at which the arrow starts. Default is (0, 0)
 * hex -- hexadecimal value to define color. Default is 0xffff00.
 * headLength -- The length of the head of the arrow. Default is 0.2.
 * headWidth -- The length of the width of the arrow. Default is 0.05.
 * (Derived from THREE.js)
 */
function Arrow2D(plot, expr, opts) {
    Plottable.call(this, plot, expr, opts)

    if(opts === undefined) opts = {};
    this.opts = {}
    this.opts.origin = opts.origin !== undefined ? new Expression(opts.origin, plot.context) : new Expression('(0,0,0)', plot.context);
    this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;
    this.opts.headLength = opts.headLength !== undefined ? opts.headLength : 0.2;
    this.opts.headWidth = opts.headWidth !== undefined ? opts.headWidth : 0.05;
}

Arrow2D.prototype = Object.create(Plottable.prototype);
Arrow2D.prototype.constructor = Arrow2D;

Arrow2D.prototype.getVariables = function() {
    return Plottable.prototype.getVariables.call(this).concat(this.opts.origin.getVariables());
}

Arrow2D.prototype.createSceneObject = function() {
    var _vector2 = this.expr.evaluate().toVector3();
    var _dir = _vector2.clone().normalize();
    var _length = _vector2.length();
    var _origin = this.opts.origin.evaluate().toVector3();
    var _hex = this.opts.hex;
    var _headLength = this.opts.headLength;
    var _headWidth = this.opts.headWidth;

    return new THREE.ArrowHelper(_dir, _origin, _length, _hex, _headLength, _headWidth);
}

export { Arrow2D };