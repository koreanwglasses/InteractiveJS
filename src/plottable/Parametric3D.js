import { Vector } from '../math/Vector.js';
import { Expression } from '../math/expressions/Expression.js';
import { Interval } from '../math/Interval.js';
import { LineMaterialCreator } from '../render/LineMaterial.js';
import { Plottable } from './Plottable.js';

function Parametric3D(parent, expr, opts) {
    Plottable.call(this, parent.parent, expr, opts);

    this.parent = parent;
    this.opts = opts !== undefined? opts: {}

    if(this.opts.color !== undefined) {
        this.color = new Expression(this.opts.color, this.plot.context);
        this.colorf = this.color.evaluate();
    }
    if(this.opts.wireframe === undefined) this.opts.wireframe = false;
    if(this.opts.flat === undefined) this.opts.flat = false;
    if(this.opts.smooth === undefined) this.opts.smooth = true;
    if(this.opts.thick === undefined) this.opts.thick = false;
}

Parametric3D.prototype = Object.create(Plottable.prototype);
Parametric3D.prototype.constructor = Parametric3D;

Parametric3D.prototype.getVariables = function() {
    if(this.opts.color !== undefined) return this.expr.getVariables().concat(this.color.getVariables());
    else return this.expr.getVariables();
}

Parametric3D.prototype.createLine = function(par) {
 var geom = new THREE.BufferGeometry();
    var int = par.intervals[0]
    var tarr = int.array();

    var direction = new Float32Array(tarr.length * 2);
    var vertices = new Float32Array(tarr.length * 3 * 2);
    var previous = new Float32Array(tarr.length * 3 * 2);
    var next = new Float32Array(tarr.length * 3 * 2);

    var colors = new Uint8Array(tarr.length * 4 * 2);

    for(var i = 0; i < tarr.length; i++) {
        var t = tarr[i]

        direction[i*2] = 1;
        direction[i*2+1] = -1;

        // geom.vertices.push(par.func(t).toVector3());
        var v = par.func(t).toVector3()
        vertices[i*6] = v.x;
        vertices[i*6+1] = v.y;
        vertices[i*6+2] = v.z;

        vertices[i*6+3] = v.x;
        vertices[i*6+4] = v.y;
        vertices[i*6+5] = v.z;

        if(i > 0) {
            previous[i*6] = vertices[i*6-6]
            previous[i*6+1] = vertices[i*6-5]
            previous[i*6+2] = vertices[i*6-4]
            previous[i*6+3] = vertices[i*6-3]
            previous[i*6+4] = vertices[i*6-2]
            previous[i*6+5] = vertices[i*6-1]

            next[i*6-6] = vertices[i*6]
            next[i*6-5] = vertices[i*6+1]
            next[i*6-4] = vertices[i*6+2]
            next[i*6-3] = vertices[i*6+3]
            next[i*6-2] = vertices[i*6+4]
            next[i*6-1] = vertices[i*6+5]
        }

        if(this.color !== undefined) {
            var color = this.colorf(t);
            // geom.colors[i] = new THREE.Color(color.q[0].value, color.q[1].value, color.q[2].value)
            colors[i*8] = color.q[0].value * 255;
            colors[i*8 + 1] = color.q[1].value * 255;
            colors[i*8 + 2] = color.q[2].value * 255;
            colors[i*8 + 3] = 255;
            colors[i*8 + 4] = color.q[0].value * 255;
            colors[i*8 + 5] = color.q[1].value * 255;
            colors[i*8 + 6] = color.q[2].value * 255;
            colors[i*8 + 7] = 255;
        } else {
            colors[i*8] = 255;
            colors[i*8 + 1] = 255;
            colors[i*8 + 2] = 255;
            colors[i*8 + 3] = 255;
            colors[i*8 + 4] = 255;
            colors[i*8 + 5] = 255;
            colors[i*8 + 6] = 255;
            colors[i*8 + 7] = 255;
        }
    }

    previous[0] = vertices[0]
    previous[1] = vertices[1]
    previous[2] = vertices[2]
    previous[3] = vertices[3]
    previous[4] = vertices[4]
    previous[5] = vertices[5]
    next[tarr.length*6-6] = vertices[tarr.length*6-6]
    next[tarr.length*6-5] = vertices[tarr.length*6-5]
    next[tarr.length*6-4] = vertices[tarr.length*6-4]
    next[tarr.length*6-3] = vertices[tarr.length*6-3]
    next[tarr.length*6-2] = vertices[tarr.length*6-2]
    next[tarr.length*6-1] = vertices[tarr.length*6-1]

    geom.addAttribute('direction', new THREE.BufferAttribute(direction, 1));
    geom.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.addAttribute('previous', new THREE.BufferAttribute(previous, 3));
    geom.addAttribute('next', new THREE.BufferAttribute(next, 3));
    geom.addAttribute('color', new THREE.BufferAttribute(colors, 4, true));

    var mat = new LineMaterialCreator(this.opts.thick === true ? 30 : 15, this.parent.frame.width, this.parent.frame.height).getMaterial();
    var mesh = new THREE.Mesh(geom, mat);
    mesh.drawMode = THREE.TriangleStripDrawMode
    return mesh
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
        if(this.opts.wireframe) mat.wireframe = true;
    } else {
        var mat = new THREE.MeshLambertMaterial(opts);
    }
    mat.side = THREE.DoubleSide;
    return new THREE.Mesh( geom, mat );
}

Parametric3D.prototype.createSceneObject = function() {
    var par = this.expr.evaluate();
    if(par.intervals.length === 1) {
        return this.createLine(par);
    } else {
        return this.createSurface(par);
    }
}

export { Parametric3D }