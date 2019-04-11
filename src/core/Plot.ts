import { Axes, Axes2D, Axes2DArgs, Axes3D, Axes3DArgs, Panel, PanelArgs } from './internal';
import * as math from 'mathjs';
import { func } from 'prop-types';

/**
* A controller for a plot. Can contain several axes, which can in turn contain
* several figures. Each plot contains its own context on which expression are
* evaluates/executed
*/
export class Plot {
    private axes : Set<Axes>;
    private scope : any;

    private refreshCallbacks: (() => void)[];
    private execExpressionCallbacks: ((expr: string) => void)[];
    
    private renderMutex: boolean;

    public constructor() {
        this.axes = new Set<Axes>();
        this.scope = {};

        this.refreshCallbacks = [];
        this.execExpressionCallbacks = [];
        
        this.renderMutex = false;

        // Some useful functions
        let eps = Math.pow(2, -52);
        let eps2 = Math.pow(2, -26);
        this.scope.nderivative = function(f: any, x: any) {
            if(math.typeof(x) != 'number') {
                throw new Error('Invalid argument for x');
            }

            let h = math.max(math.abs(eps2 * x), eps2) / 2;
            return math.divide(math.subtract(f(x + h), f(x - h)), 2 * h);
        }

        this.scope.lerp = function(a: any, b: any, alpha: any) {
            if(math.typeof(alpha) != 'number') {
                throw new Error('Invalid argument for alpha');
            }

            return math.add(math.multiply(1 - alpha, a), math.multiply(alpha, b)); 
        }

        // Check visibility when scrolling

        let checkVisible = (el: HTMLElement) => {
            var elemTop = el.getBoundingClientRect().top;
            var elemBottom = el.getBoundingClientRect().bottom;

            var isVisible = (elemBottom >= 0) && (elemTop <= window.innerHeight);
            return isVisible;
        }

        window.addEventListener('scroll', () => {
            for(let ax of this.axes) {
                if(checkVisible(ax.getContainer())) {
                    if(ax.isSleeping()) ax.wake();
                    this.requestFrame();
                } else if (!ax.isSleeping()) {
                    ax.sleep();
                }
            }
        });
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
        
        let newAxes = new Axes3D(axesArgs);
        this.addAxes(newAxes);
        return newAxes;
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
    * Creates a panel
    * @param args 
    * @return The new panel
    */
    public createPanel(args: any): Panel {
        let args2 = new PanelArgs(args);
        args2.plot = this;
        let panel = new Panel(args2);
        return panel;
    }
    
    /**
    * Renders all axes that are on screen
    */
    public render() : void {      
        for(let ax of this.axes) {
            if (!ax.isSleeping()) {
                ax.render(); 
            }
        }
    }
    
    /**
     * Request a render frame
     */
    public requestFrame(): void {
        if(!this.renderMutex) {
            this.renderMutex = true;
            requestAnimationFrame(() => {
                this.render();
                this.renderMutex = false;
            }); 
        } 
    }

    /**
    * Refresh all axes
    */
    public refresh() : void {
        for(let ax of this.axes) {
            ax.refreshAll();
        }
        for(let callback of this.refreshCallbacks) {
            callback();
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
        let result = math.eval(expr, this.scope);
        for(let callback of this.execExpressionCallbacks) {
            callback(expr);
        }
        return result;
    }

    /**
     * Evaluates an expression. Identical to exec expressions, but does not trigger onExpressionExec callbacks.
     */
    public evalExpression(expr: string): any {
        return math.eval(expr, this.scope);
    }
    
    /**
    * Sets the value of specified variable in the scope.
    * @param variable 
    * @param value 
    */
    public setConstant(variable: string, value: any) {
        this.scope[variable] = value;
    }
    
    /**
     * Register a callback to perform when the plot is refreshed
     * @param callback 
     */
    public onRefresh(callback: ()=>void) {
        this.refreshCallbacks.push(callback);
    }

    /**
     * Register a callback to perform when an expression is executed
     * @param callback 
     */
    public onExecExpression(callback: (expr: string) => void) {
        this.execExpressionCallbacks.push(callback);
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