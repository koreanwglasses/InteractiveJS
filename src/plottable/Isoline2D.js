import { Isoline3D } from './Isoline3D.js'

function Isoline2D(parent, expr, opts) {
    Isoline3D.call(this, parent, expr, opts);
    
    this.lineWidth = this.opts.thick === true ? 10 : 5;
}

Isoline2D.prototype = Object.create(Isoline3D.prototype)
Isoline2D.prototype.constructor = Isoline2D

Isoline2D.prototype.lerp = function(a, b, az, z, bz) {
    var alpha = (z - az) / (bz - az)
    
    a = new THREE.Vector3(...a);
    b = new THREE.Vector3(...b);
    var result = a.multiplyScalar(1 - alpha).add(b.multiplyScalar(alpha))
    
    var temp = result.y;
    result.y = result.z;
    result.z = temp;
    
    return result;
}

export { Isoline2D }