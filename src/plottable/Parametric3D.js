import { Vector } from '../math/Vector.js';
import { Expression } from '../math/expressions/Expression.js';

function Parametric3D(plot, expr, opts) {
    this.plot = plot

    var parts = Expression.splitParametric(expr);
    this.func = new Expression(parts[0], this.plot.context);
    this.interval = new Expression(parts[1], this.plot.context);
    this.opts = opts !== undefined? opts: {}

    this.validated = false;
    this.sceneObject = null;

    if(this.opts.color !== undefined) {
        this.color = new Expression(this.opts.color, this.plot.context);
    }
}

Parametric3D.prototype.createLine = function() {
    var geom = new THREE.Geometry();
    var int = this.interval.evaluate();
    var tarr = int.array();
    var context = {};
    for(var i = 0; i < tarr.length; i++) {
        context[int.varstr] = tarr[i]

        geom.vertices.push(this.func.evaluate(context).toVector3());

        if(this.color !== undefined) {
            var color = this.color.evaluate(context);
            geom.colors[i] = new THREE.Color(color.q[0], color.q[1], color.q[2])
        }
    } 
    if(this.color !== undefined) {
        return new THREE.Line(geom, new THREE.LineBasicMaterial({color: 0xffffff, vertexColors: THREE.VertexColors}));
    } else {
        return new THREE.Line(geom, new THREE.LineBasicMaterial());
    }
}

Parametric3D.prototype.getSceneObject = function() {
    if(this.validated === false) {
        this.sceneObject = this.createLine();
        this.validated = true;
    }
    return this.sceneObject;
}

Parametric3D.prototype.invalidate = function() {
    this.validated = false;
}

export { Parametric3D }