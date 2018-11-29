import { Figure } from '../core/Figure';
import { Vector3, Mesh, ArrowHelper, Object3D } from 'three';
import * as math from 'mathjs';

export class Arrow2D implements Figure {
    private startFun : math.EvalFunction;
    private endFun: math.EvalFunction;
    private hex: number;
    private headLength: number;
    private headWidth: number;
    
    public constructor(args: any) {
        let args2 = new Arrow2DArgs(args); 
        args2.validate();
        args2.defaults();
        
        let startNode = math.parse(args2.start);
        if(math.typeof(startNode) != 'ArrayNode') {
            throw new Error("Invalid arguments: Start vector expression is not a vector (array)!");
        } else {
            this.startFun = startNode.compile();
        }

        let endNode = math.parse(args2.end);
        if(math.typeof(endNode) != 'ArrayNode') {
            throw new Error("Invalid arguments: End vector expression is not a vector (array)!");
        } else {
            this.endFun = endNode.compile();
        }

        this.hex = args2.hex;
        this.headLength = args2.headLength;
        this.headWidth = args2.headWidth;
    }
    
    public getSceneObject(scope : any) : Object3D {
        let end = this.endFun.eval(scope);
        let endVec = new Vector3(end._data[0], end._data[1], 0);
        
        let start = this.startFun.eval(scope);
        let startVec = new Vector3(start._data[0], start._data[1], 0);

        let dir = endVec.clone().sub(startVec).normalize();
        let length = endVec.distanceTo(startVec);

        let hex = this.hex;
        let headLength = this.headLength * length;
        let headWidth = this.headWidth * headLength;     
        
        return new ArrowHelper(dir, startVec, length, hex, headLength, headWidth);
    }
}

export class Arrow2DArgs {
    public start : string;
    public end : string;
    public hex : number;
    public headLength : number;
    public headWidth : number;
    
    public constructor(args : any) {
        this.start = args.start;
        this.end = args.end;
        this.hex = args.hex;
        this.headLength = args.headLength;
        this.headWidth = args.headWidth;
    }
    
    public validate() : boolean {
        if(!this.end) {
            throw new Error("Invalid arguments: end not defined!");
        }
        return true;
    }
    
    public defaults() : void {
        let args : any = {};
        if (this.start === undefined) {
            this.start = '[0,0]';
        }
        if (this.hex === undefined) {
            this.hex = 0xffffff;
        }
        if(this.headLength === undefined) {
            this.headLength = 0.2;
        }
        if(this.headWidth === undefined) {
            this.headWidth = 0.5;
        }
    }
}