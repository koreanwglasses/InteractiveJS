import { Expression } from '../math/expressions/Expression.js';
import { Vector } from '../math/Vector.js';
import { Arrow3D } from './Arrow3D.js';
import { Plottable } from './Plottable.js';

/**
 * Object that represents basis axes in 3d space.
 * @param {*} opts Options to customize the appearance of the arrows. Includes:
 * origin -- Point of the origin. Default is (0, 0, 0)
 * hex -- hexadecimal value to define color. Default is 0xffff00.
 * headLength -- The length of the head of the arrow. Default is 0.2 * length.
 * headWidth -- The length of the width of the arrow. Default is 0.2 * headLength.
 * (Derived from THREE.js)
 */
function BasisVectors3D(plot, opts) {
    Plottable.call(this, plot, null, opts);

    var _opts = opts !== undefined ? opts : {};

    this.xBasis = '(1,0,0)'
    this.yBasis = '(0,1,0)'
    this.zBasis = '(0,0,1)'

    var _xOpts = Object.assign({},_opts);
    var _yOpts = Object.assign({},_opts);
    var _zOpts = Object.assign({},_opts);

    if( _opts.xHex === undefined) {
        _xOpts.hex = 0x880000;
    }
    if( _opts.yHex === undefined) {
        _yOpts.hex = 0x008800;
    }
    if( _opts.zHex === undefined) {
        _zOpts.hex = 0x4444ff;
    }

    this.xArrow = new Arrow3D(plot, this.xBasis, _xOpts);   
    this.yArrow = new Arrow3D(plot, this.yBasis, _yOpts);
    this.zArrow = new Arrow3D(plot, this.zBasis, _zOpts);
}

BasisVectors3D.prototype = Object.create(Plottable.prototype);
BasisVectors3D.prototype.constructor = BasisVectors3D;

BasisVectors3D.prototype.createSceneObject = function() {
    var sceneObject = new THREE.Group();
    sceneObject.add(this.xArrow.getSceneObject());
    sceneObject.add(this.yArrow.getSceneObject());
    sceneObject.add(this.zArrow.getSceneObject());
    return sceneObject;
}
    

export { BasisVectors3D };