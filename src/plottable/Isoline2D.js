import { Isoline3D } from './Isoline3D.js'
import { Number } from '../math/Number.js'

function Isoline2D(parent, expr, opts) {
    Isoline3D.call(this, parent, expr, opts);
    
    this.lineWidth = this.opts.thick === true ? 10 : 5;
}

Isoline2D.prototype = Object.create(Isoline3D.prototype)
Isoline2D.prototype.constructor = Isoline2D

Isoline2D.prototype.lerp = function(a, b, az, z, bz) {
    var alpha = z.sub(az).div(bz.sub(az));
    var result = a.mul(Number[1].sub(alpha)).add(b.mul(alpha))
    result.q[1] = result.q[2];
    result.q[2] = Number[0];
    return result.toVector3();
}

export { Isoline2D }