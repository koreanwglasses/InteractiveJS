import { LineMaterialCreator } from '../render/LineMaterial.js';
import { Plottable } from './Plottable.js';
import { PlotInfo } from '../dyn/PlotInfo.js';

function Parametric2D(parent, plotInfo, opts) {
    Plottable.call(this, parent.parent, opts);

    this.parent = parent;
    this.opts = opts !== undefined ? opts : {}
    
    if (this.opts.thick === undefined) this.opts.thick = false;

    this.exprs = plotInfo.exprs; 

    if(!this.exprs.color && this.opts.color) {
        this.exprs.color = this.opts.color;
        this.opts.color = true;
    }

    this.exprs.pointFunc = '_tmp(' + this.exprs.tvar + ') = ' + this.exprs.point;
    if (this.exprs.color) {
        this.exprs.colorFunc = '_tmp(' + this.exprs.tvar + ') = ' + this.exprs.color;
    }
}

Parametric2D.prototype = Object.create(Plottable.prototype);
Parametric2D.prototype.constructor = Parametric2D;

Parametric2D.prototype.getVariables = function () {
    if (this.opts.color !== undefined) return this.expr.getVariables().concat(this.color.getVariables());
    else return this.expr.getVariables();
}

Parametric2D.prototype.createLine = function () {
    var geom = new THREE.BufferGeometry();
    
    var pointFunc = this.plot.parser.eval(this.exprs.pointFunc);
    var tint = {
        min: this.plot.parser.eval(this.exprs.tmin),
        max: this.plot.parser.eval(this.exprs.tmax),
        steps: this.plot.parser.eval(this.exprs.tsteps),
    };
    if(this.opts.color) {
        var colorFunc = this.plot.parser.eval(this.exprs.colorFunc);
    }
    
    var direction = new Float32Array(tint.steps * 2);
    var vertices = new Float32Array(tint.steps * 3 * 2);
    var previous = new Float32Array(tint.steps * 3 * 2);
    var next = new Float32Array(tint.steps * 3 * 2);
    
    var colors = new Uint8Array(tint.steps * 4 * 2);
    
    for (var i = 0; i < tint.steps; i++) {
        var t = i * (tint.max - tint.min) / (tint.steps - 1) + tint.min;
        
        direction[i * 2] = 1;
        direction[i * 2 + 1] = -1;
        
        var v = new THREE.Vector3(...pointFunc(t).toArray());
        vertices[i * 6] = v.x;
        vertices[i * 6 + 1] = v.y;
        vertices[i * 6 + 2] = v.z;
        
        vertices[i * 6 + 3] = v.x;
        vertices[i * 6 + 4] = v.y;
        vertices[i * 6 + 5] = v.z;
        
        if (i > 0) {
            previous[i * 6] = vertices[i * 6 - 6]
            previous[i * 6 + 1] = vertices[i * 6 - 5]
            previous[i * 6 + 2] = vertices[i * 6 - 4]
            previous[i * 6 + 3] = vertices[i * 6 - 3]
            previous[i * 6 + 4] = vertices[i * 6 - 2]
            previous[i * 6 + 5] = vertices[i * 6 - 1]
            
            next[i * 6 - 6] = vertices[i * 6]
            next[i * 6 - 5] = vertices[i * 6 + 1]
            next[i * 6 - 4] = vertices[i * 6 + 2]
            next[i * 6 - 3] = vertices[i * 6 + 3]
            next[i * 6 - 2] = vertices[i * 6 + 4]
            next[i * 6 - 1] = vertices[i * 6 + 5]
        }
        
        if (this.opts.color) {
            var color = colorFunc(t).toArray();
            colors[i * 8] = color[0] * 255;
            colors[i * 8 + 1] = color[1] * 255;
            colors[i * 8 + 2] = color[2] * 255;
            colors[i * 8 + 3] = 255;
            colors[i * 8 + 4] = color[0] * 255;
            colors[i * 8 + 5] = color[1] * 255;
            colors[i * 8 + 6] = color[2] * 255;
            colors[i * 8 + 7] = 255;
        } else {
            colors[i * 8] = 255;
            colors[i * 8 + 1] = 255;
            colors[i * 8 + 2] = 255;
            colors[i * 8 + 3] = 255;
            colors[i * 8 + 4] = 255;
            colors[i * 8 + 5] = 255;
            colors[i * 8 + 6] = 255;
            colors[i * 8 + 7] = 255;
        }
    }
    
    previous[0] = vertices[0]
    previous[1] = vertices[1]
    previous[2] = vertices[2]
    previous[3] = vertices[3]
    previous[4] = vertices[4]
    previous[5] = vertices[5]
    next[tint.steps * 6 - 6] = vertices[tint.steps * 6 - 6]
    next[tint.steps * 6 - 5] = vertices[tint.steps * 6 - 5]
    next[tint.steps * 6 - 4] = vertices[tint.steps * 6 - 4]
    next[tint.steps * 6 - 3] = vertices[tint.steps * 6 - 3]
    next[tint.steps * 6 - 2] = vertices[tint.steps * 6 - 2]
    next[tint.steps * 6 - 1] = vertices[tint.steps * 6 - 1]
    
    geom.addAttribute('direction', new THREE.BufferAttribute(direction, 1));
    geom.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.addAttribute('previous', new THREE.BufferAttribute(previous, 3));
    geom.addAttribute('next', new THREE.BufferAttribute(next, 3));
    geom.addAttribute('color', new THREE.BufferAttribute(colors, 4, true));
    
    var mat = new LineMaterialCreator(this.opts.thick === true ? 10 : 5, this.parent.frame.width, this.parent.frame.height).getMaterial();
    var mesh = new THREE.Mesh(geom, mat);
    mesh.drawMode = THREE.TriangleStripDrawMode
    return mesh
}

Parametric2D.prototype.createSceneObject = function () {
    return this.createLine();
}

export { Parametric2D }