import { Vector } from './Vector.js';

var MathPlus = {}

MathPlus.singleton = function(x) {
    return new Vector(x);
}

export{ MathPlus };