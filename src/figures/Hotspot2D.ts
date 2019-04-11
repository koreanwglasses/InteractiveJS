import { Figure } from '../core/Figure';
import { Vector2, Object3D } from 'three';
import * as math from 'mathjs';
import { Plot } from '../core/Plot';

export class Hotspot2D implements Figure {
    private plot: Plot;
    private variable: string;
    private position: Vector2;
    
    public constructor(args: any) {
        let args2 = new Hotspot2DArgs(args); 
        args2.validate();
        args2.defaults();
        
        this.plot = args2.plot;
        this.variable = args2.variable;
        this.position = null;

        this.plot.onRefresh(() => this.position = null);
        this.plot.onExecExpression(() => this.position = null);
    }

    public getPosition(): Vector2 {
        if(this.position == null) {
            let vector = this.plot.getScope()[this.variable];
            this.position = new Vector2(...vector._data)
        }
        return this.position;
    }

    public setPosition(position: Vector2): void {
        this.position = position;
        this.plot.execExpression(this.variable + '=[' + position.toArray() + ']');
        this.plot.refresh();
        this.plot.requestFrame();
    }
    
    public render(scope : any) : Object3D {
        return null;
    }
}

export class Hotspot2DArgs {
    public plot: Plot;
    public variable: string;
    
    public constructor(args : any) {
        this.plot = args.plot;
        this.variable = args.variable;
    }
    
    public validate() : boolean {
        if(!this.plot) {
            throw new Error("Invalid arguments: Plot not defined!");
        }
        if(!this.variable) {
            throw new Error("Invalid arguments: Variable not defined!");
        }
        return true;
    }
    
    public defaults() : void {
      
    }
}