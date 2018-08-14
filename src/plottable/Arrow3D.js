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
function Arrow3D(plot, plotInfo, opts) {
    Plottable.call(this, plot, opts);
    
    this.exprs = plotInfo.exprs;
    
    if(opts === undefined) opts = {};
    this.opts = {};
    this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;
    this.opts.headLength = opts.headLength !== undefined ? opts.headLength : 0.2;
    this.opts.headWidth = opts.headWidth !== undefined ? opts.headWidth : 0.2;
}

Arrow3D.prototype = Object.create(Plottable.prototype);
Arrow3D.prototype.constructor = Arrow3D;

Arrow3D.prototype.getVariables = function() {    
    if(this.opts.origin !== undefined) return Plottable.prototype.getVariables.call(this).concat(this.opts.origin.getVariables());
    else return Plottable.prototype.getVariables.call(this).getVariables()
}

Arrow3D.prototype.createSceneObject = function() {
    var _end = this.plot.parser.eval(this.exprs.end);
    var _vector3 = new THREE.Vector3(..._end.toArray());
    var _start = this.plot.parser.eval(this.exprs.start);
    var _origin = new THREE.Vector3(..._start.toArray());
    var _dir = _vector3.clone().sub(_origin).normalize();
    var _length = _vector3.distanceTo(_origin);
    var _hex = this.opts.hex;
    var _headLength = this.opts.headLength * _length;
    var _headWidth = this.opts.headWidth * _headLength;
    
    return new THREE.ArrowHelper(_dir, _origin, _length, _hex, _headLength, _headWidth);
}

export { Arrow3D };