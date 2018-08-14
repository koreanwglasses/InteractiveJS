import { Plottable } from './Plottable.js';

function AngleArc2D(plot, plotInfo, opts) {
    Plottable.call(this, plot, opts)

    this.exprs = plotInfo.exprs;

    if(opts === undefined) opts = {};
    this.opts = {}
    this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;
    this.opts.radius = opts.radius !== undefined ? opts.radius : 0.2;
    this.opts.tolerance = opts.tolerance !== undefined ? opts.tolerance : 0.01;
}

AngleArc2D.prototype = Object.create(Plottable.prototype);
AngleArc2D.prototype.constructor = AngleArc2D;

AngleArc2D.prototype.createSceneObject = function() {
    var _a = new THREE.Vector3(...this.plot.parser.eval(this.exprs.v1).toArray());
    var _b = new THREE.Vector3(...this.plot.parser.eval(this.exprs.v2).toArray());

    var _thetaA = Math.atan2(_a.y, _a.x);
    var _thetaB = Math.atan2(_b.y, _b.x);
    var _clockwise = _thetaA-_thetaB < Math.PI && _thetaA-_thetaB >= 0;

    var _hex = this.opts.hex;
    var _radius = this.opts.radius;
    var _tolerance = this.opts.tolerance;

    if(Math.abs(_a.dot(_b)) < _tolerance) {
        var v1 = _a.clone().normalize().multiplyScalar(_radius);
        var v3 = _b.clone().normalize().multiplyScalar(_radius);
        var v2 = v1.clone().add(v3);
        var points = [v1, v2, v3];
    } else {
        var curve = new THREE.EllipseCurve(
            0, 0,             // ax, aY
            _radius, _radius, // xRadius, yRadius
            _thetaA, _thetaB, // aStartAngle, aEndAngle
            _clockwise        // aClockwise
        );
        
        var points = curve.getSpacedPoints( 20 );
    }
    
    var path = new THREE.Path();
    var geometry = path.createGeometry( points );
    
    var material = new THREE.LineBasicMaterial( { color : _hex } );
    
    var line = new THREE.Line( geometry, material );
    
    return line;
}

export { AngleArc2D };