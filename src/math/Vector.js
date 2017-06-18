/**
 * Represents a vector with an arbitrary number of dimensions, and of any type that supports adding and scaling. Operations are done in place where appropriate.
 */
function Vector() {
    this.type = 'Vector';

    // Support an arbitrary number of dimensions (Read-only)
    this.dimensions = arguments.length;

    // q is the general term for a coordinate
    this.q = Array.from(arguments);
}

Vector.prototype.clone = function() {
    var newVec = new Vector();
    newVec.dimensions = this.dimensions;
    newVec.q = this.q.slice();
}

export {Vector};