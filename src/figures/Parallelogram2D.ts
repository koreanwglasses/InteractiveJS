import { Vector3, Object3D, Geometry, Face3, MeshBasicMaterial, Mesh } from 'three';
import * as math from 'mathjs';
import * as THREE from 'three';
import { Figure } from '../core/Figure';

export class Parallelogram2D implements Figure {
    private uFun : math.EvalFunction;
    private vFun: math.EvalFunction;
    private opacity: number;
    
    /**
     * Creates a parallelogram spanned by args.u and args.v
     * @param args 
     */
    public constructor(args: any) {
        let args2 = new Parallelogram2DArgs(args); 
        args2.validate();
        args2.defaults();
        
        this.uFun = math.parse(args2.u).compile();
        this.vFun = math.parse(args2.v).compile();
        this.opacity = args2.opacity;
    }
    
    public render(scope : any) : Object3D {
        var o = new Vector3(0, 0, 0);
        var u = new Vector3(...this.uFun.eval(scope)._data, -0.1);
        var v = new Vector3(...this.vFun.eval(scope)._data, -0.1);
    
        var geom = new Geometry();
        geom.vertices.push(o);
        geom.vertices.push(o.clone().add(u));
        geom.vertices.push(o.clone().add(v));
        geom.vertices.push(o.clone().add(u).add(v));
        
        var f1 = new Face3(3, 1, 0);
        var f2 = new Face3(0, 2, 3);

        geom.faces.push(f1);                
        geom.faces.push(f2);

        var mat = new MeshBasicMaterial({color: 0xFFFFFF, side: THREE.DoubleSide, opacity: this.opacity, transparent: true});

        return new Mesh( geom, mat );
    }
}

export class Parallelogram2DArgs {
    public u: string;
    public v: string;
    public opacity: number;
    
    public constructor(args : any) {
        this.u = args.u;
        this.v = args.v;
        this.opacity = args.opacity;
    }
    
    public validate() : boolean {
        if(!this.u || !this.v) {
            throw new Error("Invalid arguments: u or v not defined!");
        }
        return true;
    }
    
    public defaults() : void {
        if (this.opacity === undefined) {
            this.opacity = 1;
        }
    }
}