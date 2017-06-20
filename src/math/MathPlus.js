import { Vector } from './Vector.js';

var MathPlus = {}

MathPlus.epsilon = 1e-10;

MathPlus.singleton = function(x) {
    return new Vector(x);
}

MathPlus.normal = function(x) {
    var X = x.q[0];
    var u = x.q[1];
    var v = x.q[2];
    var dxdu = X(new Vector(u + MathPlus.epsilon, v)).sub(X(new Vector(u - MathPlus.epsilon, v))).div(2 * MathPlus.epsilon);
    var dxdv = X(new Vector(u, v + MathPlus.epsilon)).sub(X(new Vector(u, v - MathPlus.epsilon))).div(2 * MathPlus.epsilon);
    return dxdu.crs(dxdv)
}

MathPlus.norm = function(x) {
    return x.norm();
}

MathPlus.component = function(x) {
    var v = x.q[0];
    var i = x.q[1];
    return v.q[i];
}

export{ MathPlus };