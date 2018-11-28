import { Axes, Axes2D, Axes2DArgs, Axes3D, Axes3DArgs } from './internal';
import * as math from 'mathjs';

/**
 * A controller for a plot. Can contain several axes, which can in turn contain
 * several figures. Each plot contains its own context on which expression are
 * evaluates/executed
 */
export class Plot {
    private axes : Set<Axes>;
    private scope : any;

    public constructor() {
        this.axes = new Set<Axes>();
        this.scope = {};
    }

    /**
     * Creates a new 2D axes from given arguments
     * @param args 
     */
    public createAxes2D(args: any): Axes2D {
        let axesArgs = new Axes2DArgs(args);
        axesArgs.plot = this;

        let newAxes = new Axes2D(axesArgs);
        this.addAxes(newAxes);
        return newAxes;
    }

    /**
     * Creates a new 2D axes from given arguments
     * @param args 
     */
    public createAxes3D(args: any): Axes3D {
        let axesArgs = new Axes3DArgs(args);
        axesArgs.plot = this;

        throw new Error("Method not implemented.");
    }

    /**
     * Removes the axes if it is present.
     * @param axes 
     * @returns true is axes was removed. false if it did not exist.
     */
    public dropAxes(axes: Axes): boolean {
        return this.axes.delete(axes);
    }

    /**
     * Renders all axes that are awake
     */
    public render() : void {
        for(let ax of this.axes) {
            if(!ax.isSleeping()) {
                ax.render();
            }
        }
    }

    /**
     * Disposes all GL contexts hosted by this plot
     */
    public sleep(): void {
        throw new Error("Method not implemented.");
    }

    /**
     * Re-instances the GL contexts
     */
    public wake(): void {
        throw new Error("Method not implemented.");
    }

    /**
     * Executes an expression
     */
    public execExpression(expr: string) : any {
        math.eval(expr, this.scope);
    }

    /**
     * Returns the scope used in evaluating expresions. Due to limitations on
     * how Javascript copies objects, it just returns a shallow copy.
     */
    public getScope() : any {
        return Object.create(this.scope);
    }

    /**
     * Adds specified axes to graph. 
     * @param axes
     */
    private addAxes(axes: Axes): void {
        this.axes.add(axes);
    }
}