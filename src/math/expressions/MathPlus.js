import { Vector } from '../Vector.js';
import { Number } from '../Number.js';

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

MathPlus.perp = function(x) {
    if(x.dimensions === 2) {
        return new Vector(x.q[1], x.q[0].neg())
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

MathPlus.signclamp = function(x, lower, upper) {
    if(x.compareTo(Number[0]) < 0) return lower;
    else if(x.compareTo(Number[0]) > 0) return upper;
    else return Number[0]
}

MathPlus.quadrant = function(x) {
    // if(x.q[0].value === 0 && x.q[1].value === 0) return Number[0];
    if(x.q[0].value >= 0 && x.q[1].value >= 0) {
        return Number[1];
    }
    if(x.q[0].value <= 0 && x.q[1].value >= 0) {
        return Number[2];
    }
    if(x.q[0].value <= 0 && x.q[1].value <= 0) {
        return Number[3];
    }
    if(x.q[0].value >= 0 && x.q[1].value <= 0) {
        return Number[4];
    }
}

MathPlus.octant = function(x) {
    if(x.q[0].value >= 0 && x.q[1].value >= 0 && x.q[2].value >= 0) { // +++
        return Number[1];
    }
    if(x.q[0].value <= 0 && x.q[1].value >= 0 && x.q[2].value >= 0) { // -++
        return Number[2];
    }
    if(x.q[0].value <= 0 && x.q[1].value <= 0 && x.q[2].value >= 0) { // --+
        return Number[3];
    }
    if(x.q[0].value >= 0 && x.q[1].value <= 0 && x.q[2].value >= 0) { // +-+
        return Number[4];
    }
    if(x.q[0].value >= 0 && x.q[1].value >= 0 && x.q[2].value <= 0) { // ++-
        return Number[5];
    }
    if(x.q[0].value <= 0 && x.q[1].value >= 0 && x.q[2].value <= 0) { // -+-
        return Number[6];
    }
    if(x.q[0].value <= 0 && x.q[1].value <= 0 && x.q[2].value <= 0) { // ---
        return Number[7];
    }
    if(x.q[0].value >= 0 && x.q[1].value <= 0 && x.q[2].value <= 0) { // +--
        return Number[8];
    }
}

MathPlus.select = function(i) {
    return arguments[i.value];
}

MathPlus.spectrum = function(x) {
    var y = x.value % 1;
    if(y < 0) y += 1;

    var r,g,b;
    if(y < 1/6) {
        r = 1
        g = y*6
        b = 0
    } else if (y < 2/6) {
        r = 2-y*6
        g = 1
        b = 0
    } else if (y < 3/6) {
        r = 0
        g = 1
        b = y*6-2
    } else if (y < 4/6) {
        r = 0
        g = 4-y*6
        b = 1
    } else if (y < 5/6) {
        r = y*6-4
        g = 0
        b = 1
    } else {
        r = 1
        g = 0
        b = 6-y*6
    }

    return new Vector(new Number(r), new Number(g), new Number(b))
}

MathPlus.abs = function(x) {
    return new Number(Math.abs(x.value));
}

MathPlus.ssign = function(x) {
    return MathPlus.sign(x).mul(MathPlus.abs(x).exp(new Number(0.2)));
}

MathPlus.map= function(v, f) {
    return v.map(f);
}

MathPlus.log = function(x) {
    return new Number(Math.log(x.value))
}

MathPlus.PI = new Number(Math.PI);

export{ MathPlus };