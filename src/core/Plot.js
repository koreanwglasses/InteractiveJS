import { Axes3D } from './Axes3D.js';
import { Axes2D } from './Axes2D.js';
import { Panel } from './Panel.js';
import { Expression } from '../math/expressions/Expression.js';

function Plot() {
    /**
     * The type of this object. (Read-only)
     */
    this.type = 'Plot';
    this.axes = {};
    this.panels = [];

    /**
     * The variables the expressions will reference
     */
    this.context = Expression.getDefaultContext();

    /**
     * Cached expressions
     */
    this.expressions = {}
}

Plot.prototype.execExpression = function(expr) {
    if(this.expressions[expr] === undefined) this.expressions[expr] = new Expression(expr, this.context);
    return this.expressions[expr].evaluate();
}

Plot.prototype.refresh = function(expr) {
    for(var key in this.axes) {
        this.axes[key].refresh(expr);
    }
}

Plot.prototype.linkCameras = function(from) {
    for(var i = 1; i < arguments.length; i++) {
        arguments[i].camera = from.camera;
    }
}

/**
 * Create a 3D axis in the context of this plot
 */
Plot.prototype.createAxes3D = function(container, opts) {
    var ax = new Axes3D(this, container, opts);
    this.axes[ax.uid] = ax;
    return ax;
};

/**
 * Create a 2D axis in the context of this plot
 */
Plot.prototype.createAxes2D = function(container, opts) {
    var ax = new Axes2D(this, container, opts);
    this.axes[ax.uid] = ax;
    return ax;
};

Plot.prototype.dropAxes = function(axes) {
    axes.sleep();
    delete this.axes[axes.uid];
}

Plot.prototype.createPanel = function(container, opts) {
    var panel = new Panel(this, container, opts);
    this.panels.push(panel);
    return panel;
}

Plot.prototype.resetContext = function() {
    this.context = Expression.getDefaultContext();
    this.expressions = {};
}

Plot.prototype.render = function() {
    function checkVisible(el) {
        var elemTop = el.getBoundingClientRect().top;
        var elemBottom = el.getBoundingClientRect().bottom;

        var isVisible = (elemBottom >= 0) && (elemTop <= window.innerHeight);
        return isVisible;
    }

    for(var key in this.axes) {
        var ax = this.axes[key];
        if(checkVisible(ax.frame.container)) {
            if(ax.frame.isSleeping) ax.wake();
            ax.render();
        } else if(!ax.frame.isSleeping) ax.sleep();
    }

    this.panels.forEach(function(pan) {
        pan.update();
    })
}

export { Plot };