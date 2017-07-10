import { Expression } from '../math/expressions/Expression.js';
import { Number } from '../math/Number.js';
import { LineMaterialCreator } from '../render/LineMaterial.js';
import { Line } from '../render/Line.js';
import { Vector } from '../math/Vector.js';
import { Plottable } from './Plottable.js';

function Isoline3D(parent, expr, opts) {
    Plottable.call(this, parent.parent, expr, opts);

    this.parent = parent;
    this.isoline = this.expr.evaluate();
    this.parExpr = new Expression(this.isoline.parametricExpr, this.plot.context);

    this.opts = opts !== undefined ? opts : {}

    this.slfd = [];

    this.sfldValidated = false;

    if (this.opts.color !== undefined) {
        this.color = new Expression(this.opts.color, this.plot.context);
        this.colorf = this.color.evaluate();
    }
    // if(this.opts.axis === undefined) this.opts.axis = 'y';
}

Isoline3D.prototype = Object.create(Plottable.prototype);
Isoline3D.prototype.constructor = Isoline3D;

Isoline3D.prototype.getVariables = function () {
    if (this.opts.color !== undefined) return this.expr.getVariables().concat(this.color.getVariables());
    else return this.expr.getVariables();
}

Isoline3D.prototype.createScalarField = function (par) {
    var uint = par.intervals[0];
    var vint = par.intervals[1];

    var uarr = uint.array();
    var varr = vint.array();

    var func = par.func;
    var sfld = [];
    for (var i = 0; i < uarr.length; i++) {
        var u = uarr[i];
        sfld.push([])
        for (var j = 0; j < varr.length; j++) {
            var v = varr[j];

            var vert = func(u, v);

            sfld[sfld.length - 1].push(vert);
        }
    }
    this.sfld = sfld;
}

Isoline3D.prototype.createIsoline = function (isoline) {
    var par = isoline.parametric

    var uint = par.intervals[0];
    var vint = par.intervals[1];

    var uarr = uint.array();
    var varr = vint.array();

    var lvl = isoline.level;

    if (this.sfldValidated === false) this.createScalarField(par);

    var edges = []

    var lerp = function (a, b, az, z, bz) {
        var alpha = z.sub(az).div(bz.sub(az));
        var result = a.mul(Number[1].sub(alpha)).add(b.mul(alpha))
        result.q[1] = z;
        // console.log(a,b,az,z,bz,result)
        return result.toVector3();
    }

    for (var i = 0; i < uarr.length - 1; i++) {
        for (var j = 0; j < varr.length - 1; j++) {
            var a = this.sfld[i][j + 1];
            var b = this.sfld[i + 1][j + 1];
            var c = this.sfld[i + 1][j];
            var d = this.sfld[i][j];

            var cse = (d.q[1].compareTo(lvl) > 0);
            cse = cse * 2 + (c.q[1].compareTo(lvl) > 0)
            cse = cse * 2 + (b.q[1].compareTo(lvl) > 0)
            cse = cse * 2 + (a.q[1].compareTo(lvl) > 0)

            switch (cse) {
                case 0:
                case 15:
                    break;
                case 1:
                case 14:
                    var v1 = lerp(a, d, a.q[1], lvl, d.q[1]);
                    var v2 = lerp(a, b, a.q[1], lvl, b.q[1]);
                    edges.push([v1, v2]);
                    break;
                case 2:
                case 13:
                    var v1 = lerp(a, b, a.q[1], lvl, b.q[1]);
                    var v2 = lerp(b, c, b.q[1], lvl, c.q[1]);
                    edges.push([v1, v2]);
                    break;
                case 3:
                case 12:
                    var v1 = lerp(a, d, a.q[1], lvl, d.q[1]);
                    var v2 = lerp(b, c, b.q[1], lvl, c.q[1]);
                    edges.push([v1, v2]);
                    break;
                case 4:
                case 11:
                    var v1 = lerp(b, c, b.q[1], lvl, c.q[1]);
                    var v2 = lerp(c, d, c.q[1], lvl, d.q[1]);
                    edges.push([v1, v2]);
                    break;
                case 5:
                case 10:
                    if ((cse === 10) ^ (a.q[i].add(b.q[i]).add(c.q[i]).add(d.q[i]).compareTo(lvl.mul(4)) > 0)) {
                        var v1 = lerp(a, d, a.q[1], lvl, d.q[1]);
                        var v2 = lerp(c, d, c.q[1], lvl, d.q[1]);
                        var v3 = lerp(a, b, a.q[1], lvl, b.q[1]);
                        var v4 = lerp(b, c, b.q[1], lvl, c.q[1]);
                        edges.push([v1, v2]);
                        edges.push([v3, v4]);
                    } else {
                        var v1 = lerp(a, b, a.q[1], lvl, b.q[1]);
                        var v2 = lerp(a, d, a.q[1], lvl, d.q[1]);
                        var v3 = lerp(b, c, b.q[1], lvl, c.q[1]);
                        var v4 = lerp(c, d, c.q[1], lvl, d.q[1]);
                        edges.push([v1, v2]);
                        edges.push([v3, v4]);
                    }
                    break;
                case 6:
                case 9:
                    var v1 = lerp(a, b, a.q[1], lvl, b.q[1]);
                    var v2 = lerp(c, d, c.q[1], lvl, d.q[1]);
                    edges.push([v1, v2]);
                    break;
                case 7:
                case 8:
                    var v1 = lerp(a, d, a.q[1], lvl, d.q[1]);
                    var v2 = lerp(c, d, c.q[1], lvl, d.q[1]);
                    edges.push([v1, v2]);
                    break;
            }
        }
    }

    // merge vertices

    var equiv = function(a,b) {
        return a.distanceTo(b) < 0.000005;
    }

    var curves = []
    while(edges.length > 0) {
        var e = edges.pop();
        (function() {
            for(var i = 0; i < edges.length; i++) {
                var edge = edges[i]
                if (equiv(edge[0], e[0])) {
                    e.reverse()
                    edges[i] = e.concat(edge.slice(1))
                    return;
                } else if (equiv(edge[0], e[e.length - 1])) {
                    edges[i] = e.concat(edge.slice(1))
                    return;
                } else if (equiv(edge[edge.length - 1], e[0])) {
                    edges[i] = edge.concat(e.slice(1))
                    return;
                } else if (equiv(edge[edge.length - 1], e[e.length - 1])) {
                    e.reverse();
                    edges[i] = edge.concat(e.slice(1))
                    return;
                }
            }
            curves.push(e)
            return;
        })();
    }

    var objct = new THREE.Group();

    var mat = new LineMaterialCreator(this.opts.thick === true ? 40 : 15, this.parent.frame.width, this.parent.frame.height).getMaterial();
    for(var i = 0; i < curves.length; i++) {
        var colors = undefined
        if(this.opts.color !== undefined) {
            colors = []
            for(var j = 0; j < curves[i].length; j++) {
                var v = new Vector(curves[i][j]);
                var color = this.colorf(v)
                colors.push(new THREE.Color(color.q[0].value, color.q[1].value, color.q[2].value));
            }
        }
        objct.add(Line(curves[i],colors,mat))
    }
    return objct
}

Isoline3D.prototype.createSceneObject = function() {
    this.isoline = this.expr.evaluate();
    return this.createIsoline(this.isoline);
}

Isoline3D.prototype.invalidate = function (expr) {
    if (this.parExpr.getVariables().includes(expr)) this.sfldValidated = false;
    this.validated = false;
}

export { Isoline3D };