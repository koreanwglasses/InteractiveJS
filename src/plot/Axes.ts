import { Expression } from "../expression/Expression";
import { Figure } from "./Figure";

/**
 * Used for plotting. Can put multiple figures on axes.
 */
export interface Axes {
    /**
     * Adds the figure to this plot. Will be drawn on next call to render()
     * @param figure Figure to add to plot
     */
    addFigure: (figure: Figure) => void;

    /**
     * Removes the figure from this plot. Will be erased on next call to render()
     * @param figure Figure to remove from plot
     */
    removeFigure: (figure: Figure) => void;

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
}