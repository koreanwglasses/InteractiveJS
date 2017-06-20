import { Number } from './Number.js';

function Interval(varstr, start, end, steps) {
    this.varstr = varstr; 

    this.start = start;
    this.end = end;
    this.steps = steps;

    this.expr = null;

    this.arr = null;
}

/**
 * Creates an array of evenly distributed values based on start end (inclusive) and steps
 */
Interval.prototype.array = function() {
    if(this.arr === null) {
        var step = (this.end.value - this.start.value) / (this.steps.value - 1);
        var arr = [];
        for(var x = this.start.value; x < this.end.value + step / 2; x += step) {
            arr.push(new Number(x));
        }
        this.arr = arr;
    }
    return this.arr;
}

Interval.prototype.set = function(i) {
    this.start = i.start;
    this.end = i.end;
    this.steps = i.steps;
    this.arr = i.arr;
}

/**
 * Sets an expression for this vector which can be evalulated with eval
 */
Interval.prototype.setExpression = function(expr) {
    this.expr = expr;
}

/**
 * Sets this vector to the result of the evaulation of expression, or if expression is null, returns self
 */
Interval.prototype.eval = function() {
    if(this.expr !== null) {
        this.set(this.expr.evaluate());
    }
    return this;
}

export { Interval };