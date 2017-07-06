import { Expression } from '../math/expressions/Expression.js';

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
    /**
     * (Read-only)
     */
    this.expr = new Expression(expr, plot.context);

    this.opts = {}
    this.opts.origin = opts.origin !== undefined ? new Expression(opts.origin, plot.context) : new Expression('(0,0,0)', plot.context);
    this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;

    this.sceneObject = null;
    this.validated = false;
}

Arrow3D.prototype.getVariables = function() {    
    if(this.opts.origin !== undefined) return this.expr.getVariables().concat(this.opts.origin.getVariables());
    else return this.expr.getVariables()
}

/**
 * Returns an object that can be added to a THREE.js scene.
 */
Arrow3D.prototype.getSceneObject = function() {
    if(this.validated === false) this.update();
    return this.sceneObject;
}

/**
 * Updates now
 */
Arrow3D.prototype.update = function() {
    var _vector3 = this.expr.evaluate().toVector3();
    var _dir = _vector3.clone().normalize();
    var _origin = this.opts.origin.evaluate().toVector3();
    var _length = _vector3.length();
    var _hex = this.opts.hex;
    var _headLength = this.opts.headLength !== undefined ? this.opts.headLength : 0.2 * _length;
    var _headWidth = this.opts.headWidth !== undefined ? this.opts.headWidth : 0.2 * _headLength;

    this.sceneObject = new THREE.ArrowHelper(_dir, _origin, _length, _hex, _headLength, _headWidth);
    this.validated = true;
}

/**
 * Updates on the next call to render
 */
Arrow3D.prototype.invalidate = function() {
    this.validated = false;
}

export { Arrow3D };