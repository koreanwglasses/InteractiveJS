import { Figure } from '../core/Figure';
import { Vector3, Mesh, ArrowHelper, Object3D, CircleBufferGeometry, MeshBasicMaterial, SphereBufferGeometry } from 'three';
import * as math from 'mathjs';

export class Point3D implements Figure {
    private positionFun: math.EvalFunction;

    private hex: number;
    private radius: number;
    
    public constructor(args: any) {
        let args2 = new Point3DArgs(args); 
        args2.validate();
        args2.defaults();
        
        this.positionFun = math.parse(args2.position).compile();

        this.hex = args2.hex;
        this.radius = args2.radius;
    }
    
    public render(scope : any) : Object3D {
        let position = new Vector3(...this.positionFun.eval(scope)._data);
    
        let geometry = new SphereBufferGeometry(this.radius, 32, 32 );
        let material = new MeshBasicMaterial( { color: this.hex} );
        let circle = new Mesh( geometry, material );
        circle.position.copy(position);

        return circle;
    }
}

export class Point3DArgs {
    public position: string;

    public hex : number;
    public radius: number;
    
    public constructor(args : any) {
        this.position = args.position;

        this.hex = args.hex;
        this.radius = args.radius;
    }
    
    public validate() : boolean {
        return true;
    }
    
    public defaults() : void {
        if (this.hex === undefined) {
            this.hex = 0xffffff;
        }
        if(this.radius === undefined) {
            this.radius = 0.05;
        }
    }
}