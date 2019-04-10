import { Figure } from '../core/Figure';
import { Vector3, Mesh, ArrowHelper, Object3D, CircleBufferGeometry, MeshBasicMaterial, Vector2, EllipseCurve, Path, LineBasicMaterial, Line, Geometry } from 'three';
import * as math from 'mathjs';

export class AngleArc2D implements Figure {
    private aFun: math.EvalFunction;
    private bFun: math.EvalFunction;
    
    private hex: number;
    private radius: number;
    
    public constructor(args: any) {
        let args2 = new AngleArc2DArgs(args); 
        args2.validate();
        args2.defaults();
        
        this.aFun= math.parse(args2.a).compile();
        this.bFun = math.parse(args2.b).compile();
        
        this.hex = args2.hex;
        this.radius = args2.radius;
    }
    
    public render(scope : any) : Object3D {
        let a = new Vector2(...this.aFun.eval(scope)._data); 
        let b = new Vector2(...this.bFun.eval(scope)._data); 
        
        let thetaA = Math.atan2(a.y, a.x);
        let thetaB = Math.atan2(b.y, b.x);
        let clockwise = thetaA-thetaB < Math.PI && thetaA-thetaB >= 0;
        
        let points : Vector2[];
        if(Math.abs(a.dot(b)) < 0.01) {
            let v1 = a.clone().normalize().multiplyScalar(this.radius);
            let v3 = b.clone().normalize().multiplyScalar(this.radius);
            let v2 = v1.clone().add(v3);
            points = [v1, v2, v3]
        } else {
            let curve = new EllipseCurve(
                0, 0,                     // ax, aY
                this.radius, this.radius, // xRadius, yRadius
                thetaA, thetaB,           // aStartAngle, aEndAngle
                clockwise,                // aClockwise
                0                         // aRotation
            );
            
            points = curve.getSpacedPoints( 20 );
        }
        
        let material = new LineBasicMaterial( { color : this.hex } );
        
        let line = new Line( new Geometry().setFromPoints(points) , material );
        
        return line;
    }
}

export class AngleArc2DArgs {
    public origin: string;
    public a: string;
    public b: string;
    
    public hex : number;
    public radius: number;
    
    public constructor(args : any) {
        this.origin = args.origin;
        this.a = args.a;
        this.b = args.b;
        
        this.hex = args.hex;
        this.radius = args.radius;
    }
    
    public validate() : boolean {
        if(!this.a) {
            throw new Error("Invalid arguments: a not defined!");
        }
        if(!this.b) {
            throw new Error("Invalid arguments: b not defined!");
        }
        return true;
    }
    
    public defaults() : void {
        if(this.origin === undefined) {
            this.origin = '[0,0]';
        }
        if (this.hex === undefined) {
            this.hex = 0xffffff;
        }
        if(this.radius === undefined) {
            this.radius = 0.2;
        }
    }
}