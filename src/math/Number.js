function Number(value) {
    this.value = value;
    this.isNumberInstance = true;
} 

Number.prototype.add = function(n) {
    return new Number(this.value + n.value);
}

Number.prototype.sub = function(n) {
    return new Number(this.value - n.value);
}

Number.prototype.mul = function(n) {
    if(n.isNumberInstance !== true) {
        return n.preMul(this);
    }
    return new Number(this.value * n.value);
}

Number.prototype.div = function(n) {
    if(n.isNumberInstance !== true) {
        return n.preMul(this);
    }
    return new Number(this.value / n.value);
}

Number.prototype.exp = function(n) {
    return new Number(Math.pow(this.value, n.value));
}

Number.prototype.abs = function() {
    return new Number(Math.abs(this.value));
}

Number.prototype.neg = function() {
    return new Number(-this.value);
}

Number.prototype.compareTo = function(n) {
    if(this.value > n.value) return 1;
    if(this.value < n.value) return -1;
    if(this.value === n.value) return 0;
    return null;
}

Number.prototype.toString = function() {
    return '' + this.value;
}

for(var i = 0; i < 10; i++) {
    Number[i] = new Number(i);
}

export{ Number };