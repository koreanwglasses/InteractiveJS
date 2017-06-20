import { Axes3D } from './Axes3D.js';
import { Axes2D } from './Axes2D.js';
import { Expression } from '../math/expressions/Expression.js';

function Plot() {
    /**
     * The type of this object. (Read-only)
     */
    this.type = 'Plot';
    this.axes = [];

    /**
     * Create a 3D axis in the context of this plot
     */
    this.createAxes3D = function(container, opts) {
        var ax = new Axes3D(this, container, opts);
        this.axes.push(ax)
        return ax;
    };

    /**
     * Create a 2D axis in the context of this plot
     */
    this.createAxes2D = function(container, opts) {
        var ax = new Axes2D(this, container, opts);
        this.axes.push(ax)
        return ax;
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

Plot.prototype.refresh = function() {
    for(var i = 0; i < this.axes.length; i++) {
        this.axes[i].refresh();
    }
}

Plot.prototype.linkCameras = function(from) {
    for(var i = 1; i < arguments.length; i++) {
        arguments[i].camera = from.camera;
    }
}

export { Plot };