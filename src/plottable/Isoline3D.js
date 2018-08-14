import { LineMaterialCreator } from '../render/LineMaterial.js';
import { Line } from '../render/Line.js';
import { Plottable } from './Plottable.js';

function Isoline3D(parent, plotInfo, opts) {
    Plottable.call(this, parent.parent, opts);
    
    this.parent = parent;
    
    this.opts = opts !== undefined ? opts : {}
    // if(this.opts.axis === undefined) this.opts.axs = 'y';
    this.lineWidth = this.opts.thick === true ? 40 : 15;
 
    this.exprs = plotInfo.exprs;
    
    if(!this.exprs.color && this.opts.color) {
        this.exprs.color = this.opts.color;
        this.opts.color = true;
    }

    if (this.exprs.uvar && this.exprs.vvar) {
        this.exprs.pointFunc = '_tmp(' + this.exprs.uvar + ',' + this.exprs.vvar + ') = ' + this.exprs.point;
        if (this.exprs.color) {
            this.exprs.colorFunc = '_tmp(v) = ' + this.exprs.color;
        }
    } else {
        console.error(new Error('Invalid parameters').stack);
        return null;
    }
    
    this.sfld = [];
    this.sfldValidated = false;
}

Isoline3D.prototype = Object.create(Plottable.prototype);
Isoline3D.prototype.constructor = Isoline3D;

Isoline3D.prototype.createScalarField = function () {
    var pointFunc = this.plot.parser.eval(this.exprs.pointFunc);
    var uint = {
        min: this.plot.parser.eval(this.exprs.umin),
        max: this.plot.parser.eval(this.exprs.umax),
        steps: this.plot.parser.eval(this.exprs.usteps),
    };
    var vint = {
        min: this.plot.parser.eval(this.exprs.vmin),
        max: this.plot.parser.eval(this.exprs.vmax),
        steps: this.plot.parser.eval(this.exprs.vsteps),
    };
    
    var sfld = [];
    for (var i = 0; i < uint.steps; i++) {
        var u = i * (uint.max - uint.min) / (uint.steps - 1) + uint.min;
        sfld.push([])
        for (var j = 0; j < vint.steps; j++) {
            var v = j * (vint.max - vint.min) / (vint.steps - 1) + vint.min;
            var vert = pointFunc(u, v);
            sfld[sfld.length - 1].push(vert);
        }
    }
    this.sfld = sfld;
}

Isoline3D.prototype.lerp = function (a, b, az, z, bz) {
    var alpha = (z - az) / (bz - az)

    a = new THREE.Vector3(...a);
    b = new THREE.Vector3(...b);
    var result = a.multiplyScalar(1 - alpha).add(b.multiplyScalar(alpha))
    result.y = z;
    return result;
}

Isoline3D.prototype.createIsoline = function (isoline) {
    var pointFunc = this.plot.parser.eval(this.exprs.pointFunc);
    var uint = {
        min: this.plot.parser.eval(this.exprs.umin),
        max: this.plot.parser.eval(this.exprs.umax),
        steps: this.plot.parser.eval(this.exprs.usteps),
    };
    var vint = {
        min: this.plot.parser.eval(this.exprs.vmin),
        max: this.plot.parser.eval(this.exprs.vmax),
        steps: this.plot.parser.eval(this.exprs.vsteps),
    };
    
    var lvl = this.plot.parser.eval(this.exprs.level);
    
    if (this.sfldValidated === false) this.createScalarField();
    
    var edges = []
    
    for (var i = 0; i < uint.steps - 1; i++) {
        for (var j = 0; j < vint.steps - 1; j++) {
            var a = this.sfld[i][j + 1].toArray();
            var b = this.sfld[i + 1][j + 1].toArray();
            var c = this.sfld[i + 1][j].toArray();
            var d = this.sfld[i][j].toArray();
            
            var cse = (d[1] > lvl);
            cse = cse * 2 + (c[1] > lvl)
            cse = cse * 2 + (b[1] > lvl)
            cse = cse * 2 + (a[1] > lvl)
            
            switch (cse) {
                case 0:
                case 15:
                break;
                case 1:
                case 14:
                var v1 = this.lerp(a, d, a[1], lvl, d[1]);
                var v2 = this.lerp(a, b, a[1], lvl, b[1]);
                edges.push([v1, v2]);
                break;
                case 2:
                case 13:
                var v1 = this.lerp(a, b, a[1], lvl, b[1]);
                var v2 = this.lerp(b, c, b[1], lvl, c[1]);
                edges.push([v1, v2]);
                break;
                case 3:
                case 12:
                var v1 = this.lerp(a, d, a[1], lvl, d[1]);
                var v2 = this.lerp(b, c, b[1], lvl, c[1]);
                edges.push([v1, v2]);
                break;
                case 4:
                case 11:
                var v1 = this.lerp(b, c, b[1], lvl, c[1]);
                var v2 = this.lerp(c, d, c[1], lvl, d[1]);
                edges.push([v1, v2]);
                break;
                case 5:
                case 10:
                if ((cse === 10) ^ (a[i] + (b[i]) + c[i] + d[i] > 4 * lvl)) {
                    var v1 = this.lerp(a, d, a[1], lvl, d[1]);
                    var v2 = this.lerp(c, d, c[1], lvl, d[1]);
                    var v3 = this.lerp(a, b, a[1], lvl, b[1]);
                    var v4 = this.lerp(b, c, b[1], lvl, c[1]);
                    edges.push([v1, v2]);
                    edges.push([v3, v4]);
                } else {
                    var v1 = this.lerp(a, b, a[1], lvl, b[1]);
                    var v2 = this.lerp(a, d, a[1], lvl, d[1]);
                    var v3 = this.lerp(b, c, b[1], lvl, c[1]);
                    var v4 = this.lerp(c, d, c[1], lvl, d[1]);
                    edges.push([v1, v2]);
                    edges.push([v3, v4]);
                }
                break;
                case 6:
                case 9:
                var v1 = this.lerp(a, b, a[1], lvl, b[1]);
                var v2 = this.lerp(c, d, c[1], lvl, d[1]);
                edges.push([v1, v2]);
                break;
                case 7:
                case 8:
                var v1 = this.lerp(a, d, a[1], lvl, d[1]);
                var v2 = this.lerp(c, d, c[1], lvl, d[1]);
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
    
    var mat = new LineMaterialCreator(this.lineWidth, this.parent.frame.width, this.parent.frame.height).getMaterial();
    for(var i = 0; i < curves.length; i++) {
        var colors = undefined;
        if(this.opts.color) {
            var colorFunc = this.plot.parser.eval(this.exprs.colorFunc);
            colors = []
            for(var j = 0; j < curves[i].length; j++) {
                var v = curves[i][j].toArray();
                var color = colorFunc(v).toArray();
                colors.push(new THREE.Color(color[0], color[1], color[2]));
            }
        }
        objct.add(Line(curves[i],colors,mat))
    }
    return objct
}

Isoline3D.prototype.createSceneObject = function() {
    return this.createIsoline();
}

Isoline3D.prototype.invalidate = function () {
    // if (this.parExpr.getVariables().indexOf(expr) !== -1) this.sfldValidated = false;
    this.sfldValidated = false;
    this.validated = false;
}

export { Isoline3D };