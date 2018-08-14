import { Arrow2D } from './Arrow2D.js';
import { Plottable } from './Plottable.js';
import { PlotInfo } from '../dyn/PlotInfo.js';

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
    Plottable.call(this, plot, null, opts);

    var _opts = opts !== undefined ? opts : {};

    this.xBasis = '[1,0]';
    this.yBasis = '[0,1]';

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
    this.xArrow = new Arrow2D(plot, new PlotInfo.Arrow2D({end: this.xBasis}), _xOpts);   
    this.yArrow = new Arrow2D(plot, new PlotInfo.Arrow2D({end: this.yBasis}), _yOpts);
}

BasisVectors2D.prototype = Object.create(Plottable.prototype);
BasisVectors2D.prototype.constructor = BasisVectors2D;

BasisVectors2D.prototype.createSceneObject = function() {
    var sceneObject = new THREE.Group();
    sceneObject.add(this.xArrow.getSceneObject());
    sceneObject.add(this.yArrow.getSceneObject());
    return sceneObject;
}

export { BasisVectors2D };