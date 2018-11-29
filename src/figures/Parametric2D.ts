import { Figure } from '../core/Figure';
import { MeshLine, MeshLineMaterial } from 'three.meshline';
import * as math from 'mathjs';
import { Object3D, BufferGeometry, BufferAttribute, Mesh } from 'three';

export class Parametric2D implements Figure {

    private expressionFun: math.EvalFunction;
    private parameter: string;

    private startFun: math.EvalFunction;
    private endFun: math.EvalFunction;
    private stepsFun: math.EvalFunction;

    private colorFun: math.EvalFunction;

    private width: number;

    public constructor(args: any) {
        let args2 = new Parametric2DArgs(args);
        args2.validate();
        args2.defaults();

        this.expressionFun = math.parse(args2.expression).compile();
        this.parameter = args.parameter;

        this.startFun = math.parse(args2.start).compile();
        this.endFun = math.parse(args2.end).compile();
        this.stepsFun = math.parse(args2.steps).compile();

        if(args.color == null) {
            this.colorFun = null;
        } else {
            this.colorFun = math.parse(args2.color).compile();
        }

        this.width = args2.width;
    }

    public getSceneObject(scope?: any) : Object3D {
        let self_ = this;
        let newScope = Object.create(scope);

        // Determine start end step
        let start = this.startFun.eval(scope);
        if(math.typeof(start) != 'number') {
            throw new Error("Start does not evaluate to a number!");
        }

        let end = this.endFun.eval(scope);
        if(math.typeof(end) != 'number') {
            throw new Error("End does not evaluate to a number!");
        }

        let steps = this.stepsFun.eval(scope);
        if(math.typeof(steps) != 'number') {
            throw new Error("Step does not evaluate to a number!");
        }

        // Create parametric function
        let parametricFun = function(t: number) {
            newScope[self_.parameter] = t;
            return self_.expressionFun.eval(newScope);
        }

        // Test expression returns correct type
        if(math.typeof(parametricFun(start)) != 'Matrix') {
            throw new Error("Expression does not evaluate to a vector (Matrix)!");
        }

        // Create color function
        let colorFun : (t: number) => Array<number>;
        if(this.colorFun != null) {
            // Test to make sure color returns correct type
            newScope[this.parameter] = start;
            if(math.typeof(this.colorFun.eval(newScope)) != 'Matrix') {
                throw new Error("Color does not evaluate to a vector (Matrix)!");
            }

            colorFun = function(t: number) : Array<number> {
                newScope[self_.parameter] = t;
                let result = self_.colorFun.eval(newScope);
                return [...result._data];
            }
        } else {
            colorFun = function(t: number) : Array<number> {
                return [1,1,1];
            }
        }

       let step = (end - start) / (steps - 1);
       let verts = new Float32Array(steps * 3);
       let colors = new Float32Array(steps * 4);
       for(let i = 0; i < steps; i++) {
           let t = start + i * step;
           let point = parametricFun(t);
           let color = colorFun(t);

           verts[i*3] = point._data[0];
           verts[i*3 + 1] = point._data[1];
           verts[i*3 + 2] = 0;

           colors[i*4] = color[0];
           colors[i*4 + 1] = color[1];
           colors[i*4 + 2] = color[2];
           colors[i*4 + 3] = 1;
       } 

       let geom = new BufferGeometry();
       geom.addAttribute('position', new BufferAttribute(verts, 3));
       geom.addAttribute('color', new BufferAttribute(colors, 4));
        
       let line = new MeshLine();
       line.setGeometry(geom);

       let material = new MeshLineMaterial({useGlobalColor: 0, lineWidth: this.width});
       return new Mesh(line.geometry, material)
    }

}

export class Parametric2DArgs {
    /**
     * The parametric expression to plot. Should be a vector.
     */
    public expression: string;
    /**
     * The parameter to vary
     */
    public parameter: string;

    /**
     * The starting value of the parameter
     */
    public start: string;
    /**
     * The end value of the parameter
     */
    public end: string;
    /**
     * The number of steps at which to calculate points
     */
    public steps: string;

    /**
     * The color of the line. Evaluated as a function of the parameter.
     */
    public color: string;

    /**
     * width of the curve when plotted
     */
    public width: number;

    public constructor(args: any) {
        this.expression = args.expression;
        this.parameter = args.parameter;
        this.start = args.start;
        this.end = args.end;
        this.steps = args.steps;
        this.color = args.color;
        this.width = args.width;
    }

    public validate() : boolean {
        if(!this.expression) {
            throw new Error("Invalid arguments: expression not defined!");
        }
        if(!this.parameter) {
            throw new Error("Invalid arguments: parameter (variable) not defined!");
        }
        if(this.start === undefined) {
            throw new Error("Invalid arguments: start not defined!");
        }
        if(this.end === undefined) {
            throw new Error("Invalid arguments: end not defined!");
        }
        return true;
    }

    public defaults() : void {
        if (this.steps === undefined) {
            this.steps = '50';
        }
        if (this.color === undefined) {
            this.color = null;
        }
        if (this.width === undefined) {
            this.width = 0.01;
        }
    }
}