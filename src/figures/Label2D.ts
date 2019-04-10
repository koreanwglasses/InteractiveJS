import { Figure } from '../core/Figure';
import { Vector2, Object3D } from 'three';
import * as math from 'mathjs';
import { Plot } from '../core/Plot';
import { Axes2D } from '../core/Axes2D';

export class Label2D implements Figure {
    private axes: Axes2D;
    private positionFun: math.EvalFunction;
    private label: string;

    private labelElement: HTMLDivElement;
    
    public constructor(args: any) {
        let args2 = new Label2DArgs(args); 
        args2.validate();
        args2.defaults();
        
        this.axes = args2.axes;
        this.positionFun = math.parse(args2.position).compile();
        this.label = args.label;

        ////////////////////////////
        //// Creating Label Div ////
        ////////////////////////////

        let label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.width = '100';
        label.style.height = '100';
        label.style.color = 'white';

        label.style.cursor = 'default';
        // @ts-ignore: Legacy code
        label.style['pointer-events'] = 'none';

        // @ts-ignore: Legacy code
        label.style['-webkit-user-select'] = 'none'; /* Chrome, Opera, Safari */
        // @ts-ignore: Legacy code
        label.style['-moz-user-select'] = 'none'; /* Firefox 2+ */
        // @ts-ignore: Legacy code
        label.style['-ms-user-select'] = 'none'; /* IE 10+ */
        // @ts-ignore: Legacy code
        label.style['user-select'] = 'none'; /* Standard syntax */

        label.innerHTML = this.label;

        this.labelElement = label;

        document.body.appendChild(label);
    }
    
    public render(scope : any) : Object3D {
        let position = new Vector2(...this.positionFun.eval(scope)._data);
        let coords = this.axes.project(position);
        let rect = this.axes.getContainer().getBoundingClientRect();
        this.labelElement.style.top = window.scrollY + coords.y + rect.top + 'px';
        this.labelElement.style.left = window.scrollX + coords.x + rect.left + 'px';
        return null;
    }
}

export class Label2DArgs {
    public axes: Axes2D;
    public position: string;
    public label: string;
    
    public constructor(args : any) {
        this.axes = args.axes;
        this.position = args.position;
        this.label = args.label;
    }
    
    public validate() : boolean {
        if(!this.axes) {
            throw new Error("Invalid arguments: Axes not defined!");
        }
        if(!(this.axes instanceof Axes2D)) {
            throw new Error("Invalid arguments: axes is not an Axes2D");
        }
        if(!this.position) { 
            throw new Error("Invalid arguments: Variable not defined!");
        }
        return true;
    }
    
    public defaults() : void {
        if(this.label === undefined){
            this.label = this.position;
        }
    }
}