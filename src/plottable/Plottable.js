import { Expression } from '../math/expressions/Expression.js'

function Plottable(plot, expr, opts) {
    /**
     * (Read-only)
     */
    this.isPlottableInstance = true;

    this.plot = plot;
    
    if(expr) {
        this.expr = new Expression(expr, plot.context);
    }
    
    this.sceneObject = null;
    this.validated = false;

    if(opts === undefined) opts = {}
    this.showExpr = opts.show !== undefined ? new Expression(opts.show, plot.context) : null;
}

Plottable.prototype.getVariables = function() {
    if(!this.expr) {
        return []
    }
    if(this.showExpr) {
        return this.expr.getVariables().concat(this.showExpr.getVariables());
    }
    return this.expr.getVariables();
}

/**
 * Returns an object that can be added to a THREE.js scene.
 */
Plottable.prototype.getSceneObject = function() {
    if(this.validated === false) {
        if(!this.showExpr || this.showExpr.evaluate() != 0) {
            this.sceneObject = this.createSceneObject();
        } else {
            this.sceneObject = null;
        }
        this.validated = true;
    }
    return this.sceneObject;
}

/**
 * Creates the sceneObject
 */
Plottable.prototype.createSceneObject = function() {
    console.log('Interactive.' + this._proto_.constructor.name + ': Method not implemented')
    return null;
}


/**
 * Updates on the next call to render
 */
Plottable.prototype.invalidate = function() {
    this.validated = false;
}

export { Plottable };