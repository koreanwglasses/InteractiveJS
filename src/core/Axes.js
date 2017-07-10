import { Frame } from '../render/Frame.js';
import { Arrow2D } from '../plottable/Arrow2D.js';
import { Hotspot2D } from '../plottable/Hotspot2D.js';
import { Parametric2D } from '../plottable/Parametric2D.js';
import { Vector } from '../math/Vector.js';
import { Number } from '../math/Number.js';
import { Expression } from '../math/expressions/Expression.js';

/**
 * Renders plots in 2D (not to be confused with the Figure class)
 * TODO: Add functionality to link cameras between figures
 * TODO: Add better control of the viewport
 * @param {*} parent 
 * @param {*} container 
 * @param {*} opts 
 */

function Axes(parent, container, opts) {
    /**
     * Used internally for optimization (Read-only)
     */
    this.isAxesInstance = true;

    /**
     * The plot that generated this figure. (Read-only)
     */
    this.parent = parent;

    /**
     * The frame which will render the axes
     */
    this.frame = new Frame(container, opts);

    // avoid null pointer errors
    if(opts === undefined) opts = {};

    this.fixedZoom = opts.fixedZoom !== undefined? opts.fixedZoom : false;

    /**
     * Objects to plot
     */
    this.objects = []

    /**
     * Expressions to plot
     */
    this.expressions = {}
}

/**
 * Render the axes
 */
Axes.prototype.render = function() {
    this.frame.render(this.camera);
}

/**
 * Plot an expression
 */
Axes.prototype.plotExpression = function(expr, type, opts) {
    console.log('Interactive.' + this._proto_.constructor.name + ': Method not implemented')
    return null;
}

/**
 * Add an object to plot
 * @param {*} object Must be plottable
 */
Axes.prototype.addFigure = function(object) {
    this.objects.push(object);
    this.frame.scene.add(object.getSceneObject());
}

/**
 * Remove a plotted object
 */
Axes.prototype.removeFigure = function(object) {
    var index = this.objects.indexOf(object);
    if (index === -1) {
        console.log('Interactive.' + this._proto_.constructor.name + ': Figure not in axes')
        return null;
    }
    this.objects.splice(index, 1);
    this.frame.scene.remove(object.getSceneObject());
}

/**
 * Force the object to update
 */
Axes.prototype.redrawFigure = function(object) {
    var index = this.objects.indexOf(object);
    if (index === -1) {
        console.log('Interactive.' + this._proto_.constructor.name + ': Figure not in axes')
        return null;
    }
    this.frame.scene.remove(object.getSceneObject());
    object.invalidate();
    this.frame.scene.add(object.getSceneObject());
}

Axes.prototype.redrawExpression = function(expr) {
    this.redrawFigure(this.expressions[expr]);
}

/**
 * Redraw all objects
 */
Axes.prototype.refresh = function(expr) {
    for(var i = 0; i < this.objects.length; i++) {
        if(this.objects[i].invalidate !== undefined && (expr === undefined || this.objects[i].getVariables().includes(expr))) {
            this.frame.scene.remove(this.objects[i].getSceneObject());
            this.objects[i].invalidate(expr);
            this.frame.scene.add(this.objects[i].getSceneObject());
        }
    }
}

export { Axes };