/**
 * Represents a vector with an arbitrary number of dimensions, and of any type that supports adding and scaling. Operations create new instances
 */
function Vector() {
    this.type = 'Vector';

    // Support an arbitrary number of dimensions (Read-only)
    this.dimensions = arguments.length;

    // q is the general term for a coordinate
    this.q = Array.from(arguments);
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
        result.q[i] += v.q[i];
    }
    return result;
}

/**
 * Sets this vector's coordinates to the input vector's
 */
Vector.prototype.set = function(v) {
    this.q = v.q.slice();
    return this;
}

export {Vector};