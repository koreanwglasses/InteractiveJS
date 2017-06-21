import { Vector } from '../math/Vector.js';
import { Expression } from '../math/expressions/Expression.js';
import { Interval } from '../math/Interval.js';

function Parametric2D(plot, expr, opts) {
    this.plot = plot

    this.expr = new Expression(expr, plot.context);
    this.opts = opts !== undefined? opts: {}

    this.validated = false;
    this.sceneObject = null;

    if(this.opts.color !== undefined) {
        this.color = new Expression(this.opts.color, this.plot.context);
        this.colorf = this.color.evaluate();
    }
    if(this.opts.thick === undefined) this.opts.thick = true;
}

Parametric2D.prototype.createLine = function(par) {
    var geom = new THREE.Geometry();
    var int = par.intervals[0]
    var tarr = int.array();

    for(var i = 0; i < tarr.length; i++) {
        var t = tarr[i]

        geom.vertices.push(par.func(t).toVector3());

        if(this.color !== undefined) {
            var color = this.colorf(t);
            geom.colors[i] = new THREE.Color(color.q[0].value, color.q[1].value, color.q[2].value)
        }
    } 
    if(this.color !== undefined) {
        return new THREE.Line(geom, new THREE.LineBasicMaterial({color: 0xffffff, vertexColors: THREE.VertexColors}));
    } else {
        return new THREE.Line(geom, new THREE.LineBasicMaterial());
    }
}

Parametric2D.prototype.getSceneObject = function() {
    if(this.validated === false) {
        var par = this.expr.evaluate();
        this.sceneObject = this.createLine(par);
        this.validated = true;
    }
    return this.sceneObject;
}

Parametric2D.prototype.invalidate = function() {
    this.validated = false;
}

export { Parametric2D }