import { Vector } from '../math/Vector.js';
import { Expression } from '../math/expressions/Expression.js';

function Parametric3D(plot, expr, opts) {
    this.plot = plot

    var parts = Expression.splitParametric(expr);
    this.func = new Expression(parts[0], this.plot.context);
    this.intervals = [];

    for(var i = 1; i < parts.length; i++) {
        this.intervals.push(new Expression(parts[i], this.plot.context));
    }

    this.opts = opts !== undefined? opts: {}

    this.validated = false;
    this.sceneObject = null;

    if(this.opts.color !== undefined) {
        this.color = new Expression(this.opts.color, this.plot.context);
    }
    if(this.opts.wireframe === undefined) this.opts.wireframe = false;
}

Parametric3D.prototype.createLine = function() {
    var geom = new THREE.Geometry();
    var int = this.intervals[0].evaluate();
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

Parametric3D.prototype.createSurface = function() {
    var geom = new THREE.Geometry();
    var uint = this.intervals[0].evaluate();
    var vint = this.intervals[1].evaluate();
    var uarr = uint.array();
    var varr = vint.array();
    var context = {};

    for(var i = 0; i < uarr.length; i++) {
        context[uint.varstr] = uarr[i];
        for(var j = 0; j < varr.length; j++) {
            context[vint.varstr] = varr[j];

            var v = this.func.evaluate(context).toVector3()
            geom.vertices.push(v);

            if(i > 0 && j > 0) {
                geom.faces.push(new THREE.Face3(i * varr.length + j, i * varr.length + j - 1, (i - 1) * varr.length + j - 1));
                geom.faces.push(new THREE.Face3(i * varr.length + j, (i - 1) * varr.length + j - 1, (i - 1) * varr.length + j));
            }
        }
    }
    geom.computeFaceNormals();

    if(this.opts.wireframe === true) {
        var mat = new THREE.MeshBasicMaterial();
        mat.wireframe = true;
    } else {
        var mat = new THREE.MeshLambertMaterial();
    }
    return new THREE.Mesh( geom, mat );
}

Parametric3D.prototype.getSceneObject = function() {
    if(this.validated === false) {
        if(this.intervals.length === 1) {
            this.sceneObject = this.createLine();
        } else {
            this.sceneObject = this.createSurface();
        }
        this.validated = true;
    }
    return this.sceneObject;
}

Parametric3D.prototype.invalidate = function() {
    this.validated = false;
}

export { Parametric3D }