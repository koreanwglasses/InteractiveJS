function Number(value) {
    this.value = value;
} 

Number.prototype.add = function(n) {
    return new Number(this.value + n.value);
}

Number.prototype.sub = function(n) {
    return new Number(this.value - n.value);
}

Number.prototype.mul = function(n) {
    return new Number(this.value * n.value);
}

Number.prototype.div = function(n) {
    return new Number(this.value / n.value);
}

Number.prototype.exp = function(n) {
    return new Number(Math.pow(this.value, n.value));
}

Number.prototype.neg = function() {
    return new Number(-this.value);
}

export{ Number };