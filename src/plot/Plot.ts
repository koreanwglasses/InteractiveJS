import { Axes, AxesArgs, Axes2D, Axes2DArgs, Axes3D, Axes3DArgs } from './internal';

/**
 * A controller for a plot. Can contain several axes, which can in turn contain
 * several figures. Each plot contains its own context on which expression are
 * evaluates/executed
 */
export class Plot {

    public constructor() {
        console.log(Axes2D);        
    }

    /**
     * Creates a new 2D axes from given arguments
     * @param args 
     */
    public createAxes2D(args: any): Axes2D {
        let axesArgs = new Axes2DArgs(args);
        axesArgs.plot = this;

        throw new Error("Method not implemented.");
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
        throw new Error("Method not implemented.");
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
     * Adds specified axes to graph. 
     * @param axes
     */
    private addAxes(axes: Axes): void {
        throw new Error("Method not implemented.");
    }
}