import { Plot } from './internal';
import * as math from 'mathjs';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export class Panel {
    private plot: Plot;
    private container: HTMLElement;

    public constructor(args: any) {
        let args2 = new PanelArgs(args);
        args2.validate();
        args2.defaults();

        this.plot = args2.plot;
        this.container = args2.container;
    }

    public createSlider(args: any) {
        let args2 = new Panel.SliderArgs(args);
        args2.validate();
        args2.defaults();

        let step = (args2.end - args2.start) / (args2.steps - 1);

        let self_ = this;
        let onInput = function(e : Event) {
            self_.plot.setConstant(args2.variable, parseFloat(this.value));
            self_.plot.refresh();
        }
        
        let value = this.plot.getScope()[args.variable];
        // Set initial value if not already set
        if (math.typeof(value) != 'number') {
            value = args2.start;
            this.plot.setConstant(args2.variable, value);
        }

        let slider = document.createElement('input');
        slider.setAttribute('type', 'range'); 
        slider.setAttribute('min', args2.start.toString()); 
        slider.setAttribute('max', args2.end.toString()); 
        slider.setAttribute('step', step.toString()); 
        slider.setAttribute('value', value.toString()); 
        slider.addEventListener('input', onInput);

        this.container.appendChild(slider);
    }

    public static SliderArgs = class {
        public variable: string;
        public start: number;
        public end: number;
        public steps: number;

        public continuousUpdate: boolean;

        public constructor(args: any) {
            this.variable = args.variable;
            this.start = args.start;
            this.end = args.end;
            this.steps = args.steps;

            this.continuousUpdate = args.continuousUpdate;
        }

        public validate() : boolean {
            if(this.variable === undefined) {
                throw new Error('Invalid arguments: Variable not defined!');
            }            
            if(this.start === undefined) {
                throw new Error('Invalid arguments: Start not defined!');
            }            
            if(this.end === undefined) {
                throw new Error('Invalid arguments: End not defined!');
            }    
            return true;        
        }

        public defaults() : void {
            if(this.steps === undefined) {
                this.steps = 50;
            }
            if(this.continuousUpdate === undefined) {
                this.continuousUpdate = true;
            }
        }
    }
}

export class PanelArgs {
    public plot: Plot;
    public container: HTMLElement;

    public constructor(args: any) {
        this.plot = args.plot;
        this.container = args.container;
    }

    public validate() : boolean {
        if(this.plot === undefined) {
            throw new Error("Invalid arguments: Plot not defined!")
        }
        if(this.container === undefined) {
            throw new Error("Invalid arguments: Container not defined!")
        }
        return true;
    }

    public defaults() : void {

    }
}