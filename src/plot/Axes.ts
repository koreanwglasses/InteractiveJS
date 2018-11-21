import { Figure } from "./Figure";
import { Plot } from "./Plot";

/**
 * Used for plotting. Can put multiple figures on axes.
 */
export interface Axes {
    /**
     * Adds the figure to this plot, if its not already there. Will be drawn on next call to render(). 
     * @param figure Figure to add to plot
     * @returns true if figure was not already present in this axes. false otherwise.
     */
    addFigure: (figure: Figure) => boolean;

    /**
     * Removes the figure from this plot, if it exists. Will be erased on next call to render()
     * @param figure Figure to remove from plot
     * @returns true if figure was removed. false if it did not exist
     */
    removeFigure: (figure: Figure) => boolean;

    /**
     * Forces all figures to recalculate their scene model.
     */
    refresh: () => void;

    /**
     * Draws all figures
     */
    render: () => void;

    /**
     * Removes the GL context from the page to conserve memory.
     */
    sleep: () => void;

    /**
     * Restores the GL context.
     */
    wake: () => void;

    /**
     * Returns the plot that this axes is created on
     */
    getPlot: () => Plot;
}

export interface AxesArgs {
    container: HTMLElement;
}