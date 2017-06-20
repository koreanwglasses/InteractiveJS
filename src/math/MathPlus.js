import { Vector } from './Vector.js';
import { Number } from './Number.js';

var MathPlus = {}

MathPlus.epsilon = new Number(1e-10);

MathPlus.singleton = function(x) {
    return new Vector(x);
}

MathPlus.normal = function(X,u,v) {
    var dxdu = X(u.add(MathPlus.epsilon), v).sub(X(u.sub(MathPlus.epsilon), v)).div(MathPlus.epsilon.mul(new Number(2)));
    var dxdv = X(u, v.add(MathPlus.epsilon)).sub(X(u, v.sub(MathPlus.epsilon))).div(MathPlus.epsilon.mul(new Number(2)));
    return dxdu.crs(dxdv)
}

MathPlus.norm = function(x) {
    return x.norm();
}

MathPlus.component = function(v,i) {
    return v.q[i.value];
}

MathPlus.cos = function(x) {
    return new Number(Math.cos(x.value));
}

MathPlus.sin = function(x) {
    return new Number(Math.sin(x.value));
}

MathPlus.sign = function(x) {
    return new Number(Math.sign(x.value));
}

MathPlus.PI = new Number(Math.PI);

export{ MathPlus };