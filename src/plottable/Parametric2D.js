import { Vector } from '../math/Vector.js';

function Parametric2D(func, interval, opts) {
    this.func = func;
    this.interval = interval;
    this.opts = opts !== undefined? opts: {}

    this.validated = false;
    this.sceneObject = null;

    this.color = this.opts.color;
}

Parametric2D.prototype.createLine = function() {
    var geom = new THREE.Geometry();
    var tarr = this.interval.array();
    var context = {};
    for(var i = 0; i < tarr.length; i++) {
        context[this.interval.varstr] = tarr[i]

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

Parametric2D.prototype.getSceneObject = function() {
    if(this.validated === false) {
        this.sceneObject = this.createLine();
        this.validated = true;
    }
    return this.sceneObject;
}

Parametric2D.prototype.invalidate = function() {
    this.validated = false;
}

export { Parametric2D }