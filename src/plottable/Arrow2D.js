/**
 * Object that represents an arrow in 2d space.
 * @param {*} vector The vector which this object is based on
 * @param {*} opts Options to customize the appearance of the arrow. Includes:
 * origin -- Point at which the arrow starts. Default is (0, 0)
 * hex -- hexadecimal value to define color. Default is 0xffff00.
 * headLength -- The length of the head of the arrow. Default is 0.2 * length.
 * headWidth -- The length of the width of the arrow. Default is 0.2 * headLength.
 * (Derived from THREE.js)
 */
function Arrow2D(vector, opts) {
    if (vector.type !== 'Vector') {
        console.log('Interactive.Arrow2D: Parameter is not a vector.');
        return null;
    }

    if (vector.dimensions !== 2) {
        console.log('Interactive.Arrow2D: Vector dimension mismatch. 2D vector required.')
        return null;
    }

    this.opts = opts !== undefined ? opts : {};

    this.vector = vector;

    this.sceneObject = null;
}

/**
 * Returns an object that can be added to a THREE.js scene.
 */
Arrow2D.prototype.getSceneObject = function() {
    if(this.sceneObject === null) {
        var _vector2 = new THREE.Vector3(this.vector.q[0], this.vector.q[1]);
        var _dir = _vector2.clone().normalize();
        var _origin = this.opts.origin !== undefined ? this.opts.origin : new THREE.Vector3(0,0,0);
        var _length = _vector2.length();
        var _hex = this.opts.hex !== undefined ? this.opts.hex : 0xffffff;
        var _headLength = this.opts.headLength !== undefined ? this.opts.headLength : 0.2 * _length;
        var _headWidth = this.opts.headWidth !== undefined ? this.opts.headWidth : 0.2 * _headLength;

        this.sceneObject = new THREE.ArrowHelper(_dir, _origin, _length, _hex, _headLength, _headWidth);
    }
    return this.sceneObject;
}

export { Arrow2D };