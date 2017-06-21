import { Expression } from '../math/expressions/Expression.js';

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
    this.opts = opts !== undefined ? opts : {};

    /**
     * (Read-only)
     */
    this.expr = new Expression(expr, plot.context);

    if(this.opts.origin !== undefined) {
        this.opts.origin = new Expression(this.opts.origin, plot.context);
    }

    this.sceneObject = null;

    this.validated = false;
}

/**
 * Returns an object that can be added to a THREE.js scene.
 */
Arrow2D.prototype.getSceneObject = function() {
    if(this.validated === false) {
        var vector = this.expr.evaluate();
        var _vector2 = new THREE.Vector3(vector.q[0].value, vector.q[1].value);
        var _dir = _vector2.clone().normalize();
        var _origin = this.opts.origin !== undefined ? this.opts.origin.evaluate().toVector3() : new THREE.Vector3(0,0,0);
        var _length = _vector2.length();
        var _hex = this.opts.hex !== undefined ? this.opts.hex : 0xffffff;
        var _headLength = this.opts.headLength !== undefined ? this.opts.headLength : 0.2;
        var _headWidth = this.opts.headWidth !== undefined ? this.opts.headWidth : 0.05;

        this.sceneObject = new THREE.ArrowHelper(_dir, _origin, _length, _hex, _headLength, _headWidth);
        this.validated = true;
    }
    return this.sceneObject;
}

/**
 * Updates on the next call to render
 */
Arrow2D.prototype.invalidate = function() {
    this.validated = false;
}

export { Arrow2D };