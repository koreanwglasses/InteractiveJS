import { Figure } from "./Figure";
import { Plot } from "./Plot";
import * as THREE from "three";
import { instanceOf } from "prop-types";

/**
 * Used for plotting. Can put multiple figures on axes.
 */
export abstract class Axes {
    private plot: Plot;
    private container: HTMLElement;
    private width: number;
    private height: number;

    private renderer: THREE.WebGLRenderer;
    private antialias: boolean;

    private figures: Set<Figure>;
    private meshMap: Map<Figure, THREE.Mesh>;

    /**
     * Creates a new Axes from given args. Throws an error if args are invalid.
     */
    public constructor(args: AxesArgs) {
        args.validate();
        args.default();
        this.plot = args.plot;
        this.container = args.container;
        this.width = args.width;
        this.height = args.height;
        this.antialias = args.antialias;

        this.renderer = null;

        this.figures = new Set<Figure>();
        this.meshMap = new Map<Figure, THREE.Mesh>();

        throw new Error("Method not implemented.")
    }

    /**
     * Adds the figure to this plot, if its not already there. Will be drawn on next call to render(). 
     * @param figure Figure to add to plot
     * @returns true if figure was not already present in this axes. false otherwise.
     */
    public addFigure(figure: Figure): boolean {
        if(this.figures.has(figure)) {
            return false;
        } else {
            this.figures.add(figure);
            return true;
        }
    }

    /**
     * Removes the figure from this plot, if it exists. Will be erased on next call to render()
     * @param figure Figure to remove from plot
     * @returns true if figure was removed. false if it did not exist
     */
    public removeFigure(figure: Figure): boolean {
        if(!this.figures.has(figure)) {
            return false;
        } else {
            this.figures.delete(figure);
            return true;
        }
    }

    /**
     * Forces all figures to recalculate their scene model.
     */
    public refresh(): void {
        for(let figure of this.figures) {
            this.meshMap.set(figure, null);
        }
    }

    /**
     * Draws all figures
     */
    public abstract render(): void;

    /**
     * Removes the GL context from the page to conserve memory.
     */
    public sleep(): void {
        if(this.renderer != null) {
            this.renderer.forceContextLoss();
            this.renderer.context = null;
            this.renderer.domElement = null;        
            this.renderer = null;
        }
    }

    /**
     * Restores the GL context.
     */
    public wake(): void {
        if(this.renderer == null) {
            this.renderer = new THREE.WebGLRenderer({antialias: this.antialias});
    
            // Initialize renderer within container
            this.renderer.setSize(this.width, this.height);
            this.container.innerHTML = '';
            this.container.appendChild(this.renderer.domElement);
        }
    }

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

    public width: number;
    public height: number;

    public antialias: boolean;

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
    
    /**
     * Fills in default values for undefined properties
     */
    public default(): void {
        if(this.width === undefined) {
            this.width = this.container.clientWidth;
        }
        if(this.height === undefined) {
            this.height = this.container.clientHeight;
        }

        if(this.antialias === undefined) {
            this.antialias = false;
        }
    }
}