import { Figure } from "./Figure";
import { Plot } from "./Plot";

/**
 * Used for plotting. Can put multiple figures on axes.
 */
export abstract class Axes {
    private plot: Plot;

    /**
     * Creates a new Axes from given args. Throws an error if args are invalid.
     */
    public constructor(args: AxesArgs) {
        args.validate();

        this.plot = args.plot;

        throw new Error("Method not implemented.")
    }

    /**
     * Adds the figure to this plot, if its not already there. Will be drawn on next call to render(). 
     * @param figure Figure to add to plot
     * @returns true if figure was not already present in this axes. false otherwise.
     */
    public abstract addFigure(figure: Figure): boolean;

    /**
     * Removes the figure from this plot, if it exists. Will be erased on next call to render()
     * @param figure Figure to remove from plot
     * @returns true if figure was removed. false if it did not exist
     */
    public abstract removeFigure(figure: Figure): boolean;

    /**
     * Forces all figures to recalculate their scene model.
     */
    public abstract refresh(): void;

    /**
     * Draws all figures
     */
    public abstract render(): void;

    /**
     * Removes the GL context from the page to conserve memory.
     */
    public abstract sleep(): void;

    /**
     * Restores the GL context.
     */
    public abstract wake(): void;

    /**
     * Returns the plot that this axes is created on
     */
    public getPlot(): Plot {
        return this.plot;
    }
}

/**
 * Arguments to use in the creation of Axes. Does not represent an ADT; is more
 * of a JS Object with more security.
 */
export abstract class AxesArgs {
    public plot: Plot;
    public container: HTMLElement;

    constructor(args: any) {
        this.plot = args.plot;
        this.container = args.container;
    }
   
    /**
     * Checks if arguments are valid. Returns true if valid. Throws error if not.
     */
    public validate(): boolean {
        if(!this.plot) {
            throw new Error("Invalid arguments: Parent plot not defined!");
        }
        if(!(this.plot instanceof Plot)) {
            throw new Error("Invalid arguments: Parent plot is not an instance of Plot!");
        }

        if(!this.container) {
            throw new Error("Invalid arguments: container (HTMLElement) not defined!");
        }
        if(!(this.container instanceof HTMLElement)) {
            throw new Error("Invalid arguments: container is not an instance of HTMLElement!");
        }
        return true;
    }
}