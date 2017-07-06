import { Vector } from '../math/Vector.js';
import { Expression } from '../math/expressions/Expression.js'
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
function BasisVectors2D(plot, opts) {
    var _opts = opts !== undefined ? opts : {};

    this.xBasis = '(1,0)'
    this.yBasis = '(0,1)'

    var _xOpts = Object.assign({},_opts);
    var _yOpts = Object.assign({},_opts);

    if( _opts.headWidth === undefined ) {
        _xOpts.headWidth = 0.04;
        _yOpts.headWidth = 0.04;
    }
    if( _opts.xHex === undefined) {
        _xOpts.hex = 0x880000;
    }
    if( _opts.yHex === undefined) {
        _yOpts.hex = 0x008800;
    }

    this.xArrow = new Arrow2D(plot, this.xBasis, _xOpts);   
    this.yArrow = new Arrow2D(plot, this.yBasis, _yOpts);

    this.sceneObject = new THREE.Group();
    this.sceneObject.add(this.xArrow.getSceneObject());
    this.sceneObject.add(this.yArrow.getSceneObject());
}

/**
 * Returns an object that can be added to a THREE.js scene.
 */
BasisVectors2D.prototype.getSceneObject = function() {
    return this.sceneObject;
}

export { BasisVectors2D };