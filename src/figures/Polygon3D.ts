import { Vector3, Object3D, Geometry, Face3, MeshBasicMaterial, Mesh, Vector2 } from 'three';
import * as math from 'mathjs';
import * as THREE from 'three';
import { Figure, } from '../core/Figure';
import { Axes } from '../core/Axes';

export class Polygon3D implements Figure {
    private vertexFuns : math.EvalFunction[];
    private opacity: number;
    
    /**
     * Creates a parallelogram spanned by args.u and args.v
     * @param args 
     */
    public constructor(args: any) {
        let args2 = new Polygon3DArgs(args); 
        args2.validate();
        args2.defaults();
        
        this.vertexFuns = args2.vertices.map((vertex) => math.parse(vertex).compile());
        this.opacity = args2.opacity;
    }
    
    public render(scope : any, axes: Axes) : Object3D {
        let vectors = this.vertexFuns.map((vf) => new Vector3(...vf.eval(scope)._data) );
    
        let geom = new THREE.Geometry();
        let i = 0;
        for(let vector of vectors) {
            geom.vertices.push(vector);
            if(i > 1) {
                var f = new THREE.Face3(0,i,i-1);
                geom.faces.push(f);
            }
            i++;
        }

        const color = axes.isLightMode() ? 0x000000 : 0xFFFFFF;
        let mat = new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide, opacity: this.opacity, transparent: true});

        return new THREE.Mesh( geom, mat );
    }
}

export class Polygon3DArgs {
    public vertices: string[];
    public opacity: number;
    
    public constructor(args : any) {
        this.vertices = args.vertices;
        this.opacity = args.opacity;
    }
    
    public validate() : boolean {
        if(!this.vertices) {
            throw new Error("Invalid arguments: vertices not defined!");
        }
        return true;
    }
    
    public defaults() : void {
        if (this.opacity === undefined) {
            this.opacity = 1;
        }
    }
}