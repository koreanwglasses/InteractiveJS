import { Frame } from './Frame.js';
import { Plot } from './Plot.js';
import { Expression } from '../math/expressions/Expression.js';
import { Plottable } from '../plottable/Plottable.js';

/**
 * The base for rendering plots
 * @param {Plot} parent 
 * @param {Element} container 
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


    // Jquery compatibility
    if(jQuery !== undefined && container instanceof jQuery) {
        container = container[0];
    }

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

    // Keeps a roll of sceneobjects to faciliate removal
    this.sceneObjects = []

    // Objects not rendered by THREE that still need to refreshed
    this.nonJSObjects = []

    /**
     * Expressions to plot
     */
    this.expressions = {}
}

Axes.prototype.sleep = function() {
    this.frame.sleep();
}

Axes.prototype.wake = function() {
    this.frame.wake();
}

/**
 * Render all plots contained in this axes
 */
Axes.prototype.render = function() {
    if(this.frame.isSleeping) return;

    for(var i = 0; i < this.objects.length; i++ ) {
        var object = this.objects[i]
        if(object.validated === false) {
            var sceneObject = object.getSceneObject();
            if(this.sceneObjects[i] !== undefined) {
                this.frame.scene.remove(this.sceneObjects[i])
            }
            if(sceneObject != null) {
                this.frame.scene.add(sceneObject);
            }
            this.sceneObjects[i] = sceneObject;
        }
    }

    this.frame.render(this.camera);

    for(var i = 0; i < this.nonJSObjects.length; i++) {
        this.nonJSObjects[i].refresh();
    }
}

/**
 * Plot an expression
 * @param {Expression} expr Expression to plot
 * @param {String} type Type of plot
 * @param {*} opts Options
 */
Axes.prototype.plotExpression = function(expr, type, opts) {
    console.log('Interactive.' + this._proto_.constructor.name + ': Method not implemented')
    return null;
}

/**
 * Add an object to plot
 * @param {Plottable} object Object to plot
 */
Axes.prototype.addFigure = function(object) {
    if(object.isPlottableInstance !== true) {
        console.log('Interactive.' + this._proto_.constructor.name + ': Object is not a Plottable')
        return;
    }

    this.objects.push(object);
}

/**
 * Remove a plotted object
 * @param {Plottable} object Object to remove
 */
Axes.prototype.removeFigure = function(object) {
    var index = this.objects.indexOf(object);
    if (index === -1) {
        console.log('Interactive.' + this._proto_.constructor.name + ': Figure not in axes')
        return null;
    }
    this.objects.splice(index, 1);
    this.frame.scene.remove(sceneObjects[index]);
    this.sceneObjects.splice(index, 1);
}

/**
 * Force the object to update
 * @param {Plottable} object Object to redraw
 */
Axes.prototype.redrawFigure = function(object) {
    var index = this.objects.indexOf(object);
    if (index === -1) {
        console.log('Interactive.' + this._proto_.constructor.name + ': Figure not in axes')
        return null;
    }
    object.invalidate();
}

/**
 * Redraw an existing expression
 * @param {Expression} expr Expression to redraw
 */
Axes.prototype.redrawExpression = function(expr) {
    this.redrawFigure(this.expressions[expr]);
}

/**
 * Redraw all objects
 * @param {Expression} expr Optional: only redraw expressions which contain the variables in given expression
 */
Axes.prototype.refresh = function(expr) {
    for(var i = 0; i < this.objects.length; i++) {
        if(this.objects[i].invalidate !== undefined && (expr === undefined || this.objects[i].getVariables().indexOf(expr) !== -1)) {
            this.objects[i].invalidate(expr);
        }
    }
}

export { Axes };