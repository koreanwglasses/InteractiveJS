import { Number } from './Number.js';

/**
 * Represents a vector with an arbitrary number of dimensions, and of any type that supports adding and scaling. Operations create new instances
 */
function Vector() {
    this.type = 'Vector';

    // Support an arbitrary number of dimensions (Read-only)
    this.dimensions = arguments.length;

    if(arguments[0] instanceof THREE.Vector3) {
        this.q = [arguments[0].x, arguments[0].y, arguments[0].z]
    } else {
        // q is the general term for a coordinate
        this.q = Array.from(arguments);
    }

    this.expr = null;
}

/**
 * Creates a copy of this vector
 */
Vector.prototype.clone = function() {
    var newVec = new Vector();
    newVec.dimensions = this.dimensions;
    newVec.q = this.q.slice();
    return newVec;
}

/**
 * Adds the vector to this vector
 */
Vector.prototype.add = function(v) {
    if(v.dimensions !== this.dimensions) {
        console.log('Interactive.Vector: Dimensions mismatch');
        return null;
    }

    var result = this.clone();
    for(var i = 0; i < this.dimensions; i++) {
        result.q[i] = result.q[i].add(v.q[i]);
    }
    return result;
}

Vector.prototype.sub = function(v) {
    if(v.dimensions !== this.dimensions) {
        console.log('Interactive.Vector: Dimensions mismatch');
        return null;
    }

    var result = this.clone();
    for(var i = 0; i < this.dimensions; i++) {
        result.q[i] = result.q[i].sub(v.q[i]);
    }
    return result;
}

Vector.prototype.crs = function(v) {
    if(v.dimensions !== this.dimensions) {
        console.log('Interactive.Vector: Dimensions mismatch');
        return null;
    }

    if(this.dimensions === 3) {
        return new Vector(this.q[1].mul(v.q[2]).sub(this.q[2].mul(v.q[1])), this.q[2].mul(v.q[0]).sub(this.q[0].mul(v.q[2])), this.q[0].mul(v.q[1]).sub(this.q[1].mul(v.q[0])));
    }
}

Vector.prototype.mul = function(v) {
    var result = this.clone();
    for(var i = 0; i < this.dimensions; i++) {
        result.q[i] = result.q[i].mul(v);
    }
    return result;
}

Vector.prototype.div = function(v) {
    var result = this.clone();
    for(var i = 0; i < this.dimensions; i++) {
        result.q[i] = result.q[i].div(v);
    }
    return result;
}

Vector.prototype.neg = function() {
    var result = this.clone();
    for(var i = 0; i < this.dimensions; i++) {
        result.q[i] = result.q[i].neg();
    }
    return result;
}

Vector.prototype.abs = function() {
    var ss = 0;
    for(var i = 0; i < this.dimensions; i++) {
        ss += this.q[i].value * this.q[i].value
    }
    return new Number(Math.sqrt(ss))
}

Vector.prototype.norm = function() {
    if(this.abs().value === 0) return this.clone();
    return this.div(this.abs());
}

Vector.prototype.map = function(f) {
    var result = this.clone();
    for(var i = 0; i < this.dimensions; i++) {
        result.q[i] = f(result.q[i])
    }
    return result;
}

/**
 * Sets this vector's coordinates to the input vector's
 */
Vector.prototype.set = function(v) {
    this.dimensions = v.dimensions;
    this.q = v.q.slice();
    return this;
}

/**
 * Convert this to a THREE vector2
 */
Vector.prototype.toVector2 = function() {
    return new THREE.Vector2(this.q[0], this.q[1]);
}

/**
 * Convert this to a THREE vector3
 */
Vector.prototype.toVector3 = function() {
    if(this.dimensions === 2) return new THREE.Vector3(this.q[0].value, this.q[1].value, 0);
    else return new THREE.Vector3(this.q[0].value, this.q[1].value, this.q[2].value);
}

/**
 * Sets an expression for this vector which can be evalulated with eval
 */
Vector.prototype.setExpression = function(expr) {
    this.expr = expr;
}

/**
 * Sets this vector to the result of the evaulation of expression, or if expression is null, returns self
 */
Vector.prototype.eval = function() {
    if(this.expr !== null) {
        this.set(this.expr.evaluate());
    }
    return this;
}

Vector.prototype.toString = function() {
    var str = '(' + this.q[0];
    for(var i = 1; i < this.dimensions; i++) {
        str += ',' + this.q[i];
    }
    return str + ')';
}

export {Vector};