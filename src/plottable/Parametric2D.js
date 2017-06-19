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
    var X = this.func.evaluate();
    if(this.color !== undefined) {
        var cX = this.color.evaluate();
    }
    var t = new Vector(0);
    for(var i = 0; i < tarr.length; i++) {
        t.q[0] = tarr[i]
        geom.vertices.push(X(t).toVector3());

        if(this.color !== undefined) {
            var color = cX(t);
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