import { Vector3, Object3D, Geometry, Face3, MeshBasicMaterial, Mesh, MeshPhongMaterial } from 'three';
import * as math from 'mathjs';
import * as THREE from 'three';
import { Figure } from '../core/Figure';

export class Parallelogram3D implements Figure {
    private oFun : math.EvalFunction; 
    private uFun : math.EvalFunction;
    private vFun : math.EvalFunction;
    private hex :number;
    private opacity: number;
    
    /**
     * Creates a parallelogram spanned by args.u and args.v
     * @param args 
     */
    public constructor(args: any) {
        let args2 = new Parallelogram3DArgs(args); 
        args2.validate();
        args2.defaults();
        
        this.oFun = math.parse(args2.origin).compile();
        this.uFun = math.parse(args2.u).compile();
        this.vFun = math.parse(args2.v).compile();
        this.hex = args2.hex;
        this.opacity = args2.opacity;
    }
    
    public render(scope : any) : Object3D {
        var o = new Vector3(...this.oFun.eval(scope)._data);
        var u = new Vector3(...this.uFun.eval(scope)._data);
        var v = new Vector3(...this.vFun.eval(scope)._data);
    
        var geom = new Geometry();
        geom.vertices.push(o);
        geom.vertices.push(o.clone().add(u));
        geom.vertices.push(o.clone().add(v));
        geom.vertices.push(o.clone().add(u).add(v));
        
        var f1 = new Face3(3, 1, 0);
        var f2 = new Face3(0, 2, 3);

        geom.faces.push(f1);                
        geom.faces.push(f2);

        var mat = new MeshBasicMaterial({color: this.hex, side: THREE.DoubleSide, opacity: this.opacity, transparent: true, depthTest: false});

        return new Mesh( geom, mat );
    }
}

export class Parallelogram3DArgs {
    public origin: string;
    public u: string;
    public v: string;

    public hex: number;
    public opacity: number;
    
    public constructor(args : any) {
        this.origin = args.origin;
        this.u = args.u;
        this.v = args.v;
        this.hex = args.hex;
        this.opacity = args.opacity;
    }
    
    public validate() : boolean {
        if(!this.u || !this.v) {
            throw new Error("Invalid arguments: u or v not defined!");
        }
        return true;
    }
    
    public defaults() : void {
        if (this.origin === undefined) {
            this.origin = '[0,0,0]';
        }
        if(this.hex === undefined) {
            this.hex = 0xffffff;
        }
        if (this.opacity === undefined) {
            this.opacity = 1;
        }
    }
}