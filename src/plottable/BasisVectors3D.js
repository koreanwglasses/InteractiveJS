import { Vector } from '../math/Vector.js';
import { Arrow3D } from './Arrow3D.js';

/**
 * Object that represents basis axes in 3d space.
 * @param {*} opts Options to customize the appearance of the arrows. Includes:
 * origin -- Point of the origin. Default is (0, 0, 0)
 * hex -- hexadecimal value to define color. Default is 0xffff00.
 * headLength -- The length of the head of the arrow. Default is 0.2 * length.
 * headWidth -- The length of the width of the arrow. Default is 0.2 * headLength.
 * (Derived from THREE.js)
 */
function BasisVectors3D(opts) {
    opts = opts !== undefined ? opts : {};

    this.xBasis = new Vector(1, 0, 0);
    this.yBasis = new Vector(0, 1, 0);
    this.zBasis = new Vector(0, 0, 1);

    this.xArrow = new Arrow3D(this.xBasis, opts);   
    this.yArrow = new Arrow3D(this.yBasis, {hex: 0xff00});
    this.zArrow = new Arrow3D(this.zBasis, opts);

    this.sceneObject = null;
}

/**
 * Returns an object that can be added to a THREE.js scene.
 */
BasisVectors3D.prototype.getSceneObject = function() {
    if(this.sceneObject === null) {
        this.sceneObject = new THREE.Group();
        this.sceneObject.add(this.xArrow.getSceneObject());
        this.sceneObject.add(this.yArrow.getSceneObject());
        this.sceneObject.add(this.zArrow.getSceneObject());
    }
    return this.sceneObject;
}

export { BasisVectors3D };