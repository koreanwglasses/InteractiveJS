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
}

Plottable.prototype.getVariables = function() {
    if(!this.expr) {
        return []
    }
    return this.expr.getVariables();
}

/**
 * Returns an object that can be added to a THREE.js scene.
 */
Plottable.prototype.getSceneObject = function() {
    if(this.validated === false) {
        this.sceneObject = this.createSceneObject();
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