import { Vector } from './Vector.js';
import { Number } from './Number.js';

var MathPlus = {}

MathPlus.epsilon = new Number(1e-7);
MathPlus.epsilonx2 = MathPlus.epsilon.mul(new Number(2))

MathPlus.optimalh = function(x) {
    if(x.abs().compareTo(Number[1]) > 0) {
        return MathPlus.epsilon.mul(x.abs());
    } else {
        return MathPlus.epsilon;
    }
}

MathPlus.singleton = function(x) {
    return new Vector(x);
}

MathPlus.derivative = function(X, t) {
    var h = MathPlus.optimalh(t);
    var tph = t.add(h);
    var tmh = t.sub(h);
    var dt = tph.sub(tmh);
    return X(tph).sub(X(tmh)).div(dt)
}

MathPlus.derivative2 = function(X, t) {
    var h = MathPlus.optimalh(t);
    var tph = t.add(h);
    var tmh = t.sub(h);
    var h2 = tph.sub(t).add(t.sub(tmh));
    return MathPlus.derivative(X, tph).sub(MathPlus.derivative(X, tmh)).div(h2)
}

MathPlus.binormal = function(X, t) {
    var h = MathPlus.optimalh(t);
    return MathPlus.derivative(X, t.add(h)).crs(MathPlus.derivative(X, t.sub(h))).norm();
}

MathPlus.normal = function(X,u,v) {
    if(v === undefined) {
        return MathPlus.binormal(X, u).crs(MathPlus.derivative(X, u)).norm();
    } else {
        var dxdu = X(u.add(MathPlus.epsilon), v).sub(X(u.sub(MathPlus.epsilon), v)).div(MathPlus.epsilonx2);
        var dxdv = X(u, v.add(MathPlus.epsilon)).sub(X(u, v.sub(MathPlus.epsilon))).div(MathPlus.epsilonx2);
        return dxdu.crs(dxdv).norm();
    }
}

MathPlus.interpolate = function(a, b, alpha) {
    return a.mul(alpha).add(b.mul(Number[1].sub(alpha)));
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

MathPlus.abs = function(x) {
    return new Number(Math.abs(x.value));
}

MathPlus.ssign = function(x) {
    return MathPlus.sign(x).mul(MathPlus.abs(x).exp(new Number(0.2)));
}

MathPlus.log = function(x) {
    return new Number(Math.log(x.value))
}

MathPlus.PI = new Number(Math.PI);

export{ MathPlus };