import { Vector } from '../math/Vector.js';
import { Arrow2D } from './Arrow2D.js';

/**
 * Object that represents basis axes in 2d space.
 * @param {*} opts Options to customize the appearance of the arrows. Includes:
 * origin -- Point of the origin. Default is (0, 0, 0)
 * hex -- hexadecimal value to define color. Default is 0xffff00.
 * headLength -- The length of the head of the arrow. Default is 0.2.
 * headWidth -- The length of the width of the arrow. Default is 0.04.
 * (Derived from THREE.js)
 */
function BasisVectors2D(opts) {
    opts = opts !== undefined ? opts : {};

    this.xBasis = new Vector(1, 0);
    this.yBasis = new Vector(0, 1);

    this.xArrow = new Arrow2D(this.xBasis, {hex: 0x880000, headWidth: 0.04});   
    this.yArrow = new Arrow2D(this.yBasis, {hex: 0x008800, headWidth: 0.04});

    this.sceneObject = null;
}

/**
 * Returns an object that can be added to a THREE.js scene.
 */
BasisVectors2D.prototype.getSceneObject = function() {
    if(this.sceneObject === null) {
        this.sceneObject = new THREE.Group();
        this.sceneObject.add(this.xArrow.getSceneObject());
        this.sceneObject.add(this.yArrow.getSceneObject());
    }
    return this.sceneObject;
}

export { BasisVectors2D };