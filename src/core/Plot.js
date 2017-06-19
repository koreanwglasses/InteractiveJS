import { Axes3D } from './Axes3D.js';
import { Axes2D } from './Axes2D.js';
import { Expression } from '../math/expressions/Expression.js';

function Plot() {
    /**
     * The type of this object. (Read-only)
     */
    this.type = 'Plot';
    var _figures = [];

    /**
     * Create a 3D axis in the context of this plot
     */
    this.createAxes3D = function(container, opts) {
        return new Axes3D(this, container, opts);
    };

    /**
     * Create a 2D axis in the context of this plot
     */
    this.createAxes2D = function(container, opts) {
        return new Axes2D(this, container, opts);
    };

    /**
     * The variables the expressions will reference
     */
    this.context = {}

    /**
     * Cached expressions
     */
    this.expressions = {}
}

Plot.prototype.execExpression = function(expr) {
    if(this.expressions[expr] === undefined) this.expressions[expr] = new Expression(expr, this.context);
    return this.expressions[expr].evaluate();
}

export { Plot };