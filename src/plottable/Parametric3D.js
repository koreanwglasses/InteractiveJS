import { Vector } from '../math/Vector.js';
import { Expression } from '../math/expressions/Expression.js';
import { Interval } from '../math/Interval.js';

function Parametric3D(plot, expr, opts) {
    this.plot = plot

    this.expr = new Expression(expr, plot.context);
    this.opts = opts !== undefined? opts: {}

    this.validated = false;
    this.sceneObject = null;

    if(this.opts.color !== undefined) {
        this.color = new Expression(this.opts.color, this.plot.context);
        this.colorf = this.color.evaluate();
    }
    if(this.opts.wireframe === undefined) this.opts.wireframe = false;
    if(this.opts.flat === undefined) this.opts.flat = false;
    if(this.opts.smooth === undefined) this.opts.smooth = true;
}

Parametric3D.prototype.getVariables = function() {
    if(this.opts.color !== undefined) return this.expr.getVariables().concat(this.color.getVariables());
    else return this.expr.getVariables();
}

Parametric3D.prototype.createLine = function(par) {
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

Parametric3D.prototype.createSurface = function(par) {
    var geom = new THREE.Geometry();
    var uint = par.intervals[0];
    var vint = par.intervals[1];
    var uarr = uint.array();
    var varr = vint.array();
    var colors = [];

    for(var i = 0; i < uarr.length; i++) {
        var u = uarr[i];
        for(var j = 0; j < varr.length; j++) {
            var v = varr[j];

            var vert = par.func(u,v).toVector3();
            geom.vertices.push(vert);

            if(this.color !== undefined) {
                var color = this.colorf(u,v);
                colors.push(new THREE.Color(color.q[0].value, color.q[1].value, color.q[2].value))
            }

            if(i > 0 && j > 0) {
                var v1 = i * varr.length + j;
                var v2 = i * varr.length + j - 1;
                var v3 = (i - 1) * varr.length + j;
                var v4 = (i - 1) * varr.length + j - 1;

                var f1 = new THREE.Face3(v1, v2, v4);
                var f2 = new THREE.Face3(v1, v4, v3);

                if(this.color !== undefined) {
                    f1.vertexColors[0] = colors[v1];
                    f1.vertexColors[1] = colors[v2];
                    f1.vertexColors[2] = colors[v4];

                    f2.vertexColors[0] = colors[v1];
                    f2.vertexColors[1] = colors[v4];
                    f2.vertexColors[2] = colors[v3];
                }

                geom.faces.push(f1);                
                geom.faces.push(f2);
            }
        }
    }
    geom.mergeVertices();
    geom.computeVertexNormals();

    var opts = {};
    if(this.color !== undefined) {
        opts['vertexColors'] = THREE.VertexColors;
    }
    if(this.opts.smooth === false) {
        opts['shading'] = THREE.FlatShading;
    }

    if(this.opts.wireframe === true || this.opts.flat === true) {
        var mat = new THREE.MeshBasicMaterial(opts);
        if(this.wireframe) mat.wireframe = true;
    } else {
        var mat = new THREE.MeshLambertMaterial(opts);
    }
    mat.side = THREE.DoubleSide;
    return new THREE.Mesh( geom, mat );
}

Parametric3D.prototype.getSceneObject = function() {
    if(this.validated === false) {
        var par = this.expr.evaluate();
        if(par.intervals.length === 1) {
            this.sceneObject = this.createLine(par);
        } else {
            this.sceneObject = this.createSurface(par);
        }
        this.validated = true;
    }
    return this.sceneObject;
}

Parametric3D.prototype.invalidate = function() {
    this.validated = false;
}

export { Parametric3D }