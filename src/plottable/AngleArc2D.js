import { Expression } from '../math/expressions/Expression.js';
import { Plottable } from './Plottable.js';
import { Number } from '../math/Number.js';

function AngleArc2D(plot, expr, opts) {
    Plottable.call(this, plot, expr, opts)

    if(opts === undefined) opts = {};
    this.opts = {}
    this.opts.origin = opts.origin !== undefined ? new Expression(opts.origin, plot.context) : new Expression('(0,0)');
    this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;
    this.opts.radius = opts.radius !== undefined ? opts.radius : 0.2;
    this.opts.tolerance = opts.tolerance !== undefined ? opts.tolerance : 0.01;
}

AngleArc2D.prototype = Object.create(Plottable.prototype);
AngleArc2D.prototype.constructor = AngleArc2D;

AngleArc2D.prototype.getVariables = function() {
    return this.expr.getVariables();
}

AngleArc2D.prototype.createSceneObject = function() {
    var _vectors = this.expr.evaluate();
    var _a = _vectors.q[0];
    var _b = _vectors.q[1];

    var _thetaA = Math.atan2(_a.q[1].value, _a.q[0].value);
    var _thetaB = Math.atan2(_b.q[1].value, _b.q[0].value);
    var _clockwise = _thetaA-_thetaB < Math.PI && _thetaA-_thetaB >= 0;

    var _hex = this.opts.hex;
    var _radius = this.opts.radius;
    var _tolerance = this.opts.tolerance;

    if(Math.abs(_a.dot(_b).value) < _tolerance) {
        var v1 = _a.norm().mul(new Number(_radius));
        var v3 = _b.norm().mul(new Number(_radius));
        var v2 = v1.add(v3);
        var points = [v1.toVector3(), v2.toVector3(), v3.toVector3()]
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