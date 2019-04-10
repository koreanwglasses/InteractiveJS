import { Figure } from '../core/Figure';
import { Vector3, Mesh, ArrowHelper, Object3D } from 'three';
import * as math from 'mathjs';
import {LineArrowHelper} from '../utils/LineArrowHelper';

export class Arrow2D implements Figure {
    private startFun : math.EvalFunction;
    private endFun: math.EvalFunction;
    private hex: number;
    private headLength: number;
    private headWidth: number;
    private width: number;

    private showFun: math.EvalFunction;
    
    public constructor(args: any) {
        let args2 = new Arrow2DArgs(args); 
        args2.validate();
        args2.defaults();
        
        this.startFun = math.parse(args2.start).compile();
        this.endFun = math.parse(args2.end).compile();

        this.hex = args2.hex;
        this.headLength = args2.headLength;
        this.headWidth = args2.headWidth;
        this.width = args2.width;

        this.showFun = math.parse(args2.show).compile();
    }
    
    public render(scope : any) : Object3D {
        let show = this.showFun.eval(scope);
        if(show == 0) return null;

        let end = this.endFun.eval(scope);
        if(math.typeof(end) != 'Matrix') {
            throw new Error('End expression does not evaluate to a vector (Matrix)!');
        }

        let endVec = new Vector3(end._data[0], end._data[1], 0);
        
        let start = this.startFun.eval(scope);
        if(math.typeof(start) != 'Matrix') {
            throw new Error('Start expression does not evaluate to vector (Matrix)!');
        }
        let startVec = new Vector3(start._data[0], start._data[1], 0);

        let dir = endVec.clone().sub(startVec).normalize();
        let length = endVec.distanceTo(startVec);

        let hex = this.hex;
        let headLength = this.headLength;
        let headWidth = this.headWidth;     
        
        if(this.width <= 0) {
            return new ArrowHelper(dir, startVec, length, hex, headLength, headWidth);
        } else {
            return new LineArrowHelper(dir, startVec, length, hex, headLength, headWidth, this.width);
        }
    }
}

export class Arrow2DArgs {
    public start : string;
    public end : string;
    public hex : number;
    public headLength : number;
    public headWidth : number;
    public width: number;

    /**
     * Arrow is visible is show evals to 1
     */
    public show: string;
    
    public constructor(args : any) {
        this.start = args.start;
        this.end = args.end;
        this.hex = args.hex;
        this.headLength = args.headLength;
        this.headWidth = args.headWidth;
        this.width = args.width;

        this.show = args.show;
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
            this.headWidth = 0.15;
        }
        if(this.show === undefined) {
            this.show = '1';
        }
        if(this.width === undefined) {
            this.width = 0.01;
        }
    }
}