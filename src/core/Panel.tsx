import { Plot } from './internal';
import * as math from 'mathjs';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export class Panel {
    private plot: Plot;
    private container: HTMLElement;

    private panelComponents: JSX.Element[];

    public constructor(args: any) {
        let args2 = new PanelArgs(args);
        args2.validate();
        args2.defaults();

        this.plot = args2.plot;
        this.container = args2.container;

        this.panelComponents = [];
    }

    public createSlider(args: any) {
        args.plot = this.plot;
        let slider = <PanelComponent.Slider {...args} key={this.panelComponents.length}/>;

        this.append(slider);
    }

    public addReadout(expression: string) {
        let args = {
            plot: this.plot,
            expression: expression
        } as any;
        let readout = <PanelComponent.Readout {...args} key={this.panelComponents.length}/>;

        this.append(readout);
    }

    public addCheckBox(variable: string, opts: any) {
        let args = Object.assign({}, opts);
        args.plot = this.plot;
        args.variable = variable;
        let checkbox = <PanelComponent.CheckBox {...args} key={this.panelComponents.length}/>;

        this.append(checkbox);
    }

    private append(element: JSX.Element) {
        this.panelComponents.push(element);
        ReactDOM.render(
            <div>{this.panelComponents.map((elm) => <div>{elm}</div> )}</div>,
            this.container);
    }
}

export namespace PanelComponent {

    export class Slider extends React.Component {
        props: any;

        private args: PanelComponent.SliderArgs;

        private sliderElement: HTMLInputElement;

        public constructor(props: any) {
            super(props);

            this.args = new PanelComponent.SliderArgs(props);
            this.args.validate();
            this.args.defaults();
        }

        public render() {
            let onInput = () => {
                this.args.plot.setConstant(this.args.variable, parseFloat(this.sliderElement.value));
                this.args.plot.refresh();
                this.args.plot.requestFrame();
            }

            let step = (this.args.end - this.args.start) / (this.args.steps - 1);

            let value = this.args.plot.getScope()[this.args.variable];
            // Set initial value if not already set
            if (math.typeof(value) != 'number') {
                value = this.args.start;
                this.args.plot.setConstant(this.args.variable, value);
            }

            return [this.args.variable + ':', <input type="range" 
                min={this.args.start}
                max={this.args.end}
                step={step}
                defaultValue={value}
                onInput={onInput}
                ref={(elm) => this.sliderElement = elm}
                key="1"></input>]
        }
    }

    export class SliderArgs {
        public plot: Plot;

        public variable: string;
        public start: number;
        public end: number;
        public steps: number;

        public continuousUpdate: boolean;

        public constructor(args: any) {
            this.plot = args.plot;

            this.variable = args.variable;
            this.start = args.start;
            this.end = args.end;
            this.steps = args.steps;

            this.continuousUpdate = args.continuousUpdate;
        }

        public validate() : boolean {
            if(this.plot === undefined) {
                throw new Error('Invalid arguments: Plot not defined!');
            }
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

    export class Readout extends React.Component {
        props: any;
        state: {value: string};

        private args: PanelComponent.ReadoutArgs;

        public constructor(props: any) {
            super(props);

            this.args = new PanelComponent.ReadoutArgs(props);
            this.args.validate();
            this.args.defaults();

            let getValue = () => {
                let value = 'N/A';
                try {
                    value = '' + this.args.plot.evalExpression(this.args.expression);
                    value = value.replace(/(\.\d\d\d)\d*/g, "$1");
                } catch (e) {

                }
                return value;
            }

            this.state = {
                value: getValue()
            };

            let updateValue = () => {
                this.setState({
                    value: getValue()   
                });
            };

            this.args.plot.onRefresh(updateValue);
            this.args.plot.onExecExpression(updateValue);
        }

        public render() {
            return [this.args.expression + " =", <input key="1" type="text"
                disabled={true} value={this.state.value}></input>];
        }
    }

    export class ReadoutArgs {
        public plot: Plot;
        public expression: string;

        public constructor(args: any) {
            this.plot = args.plot;
            this.expression = args.expression;
        }

        public validate() : boolean {
            if(this.plot === undefined) {
                throw new Error('Invalid arguments: Plot not defined!');
            }     
            if(this.expression === undefined) {
                throw new Error('Invalid arguments: Variable not defined!');
            }     
            return true;        
        }

        public defaults() : void {
            
        }
    }

    export class CheckBox extends React.Component {
        props: any;

        private args: PanelComponent.CheckBoxArgs;

        private checkBoxElement: HTMLInputElement;

        public constructor(props: any) {
            super(props);

            this.args = new PanelComponent.CheckBoxArgs(props);
            this.args.validate();
            this.args.defaults();
        }

        public render() {
            let onInput = () => {
                let value = this.checkBoxElement.checked ? 1 : 0;
                this.args.plot.setConstant(this.args.variable, value);
                this.args.plot.refresh();
                this.args.plot.requestFrame();
            }

            let value = this.args.plot.getScope()[this.args.variable];
            // Set initial value if not already set
            if (math.typeof(value) != 'number') {
                value = 0;
                this.args.plot.setConstant(this.args.variable, value);
            }

            return [this.args.label + ':', <input type="checkbox" 
                onInput={onInput}
                defaultChecked={value}
                ref={(elm) => this.checkBoxElement = elm}
                key="1"></input>]
        }
    }

    export class CheckBoxArgs {
        public plot: Plot;
        public variable: string;
        public label: string;

        public constructor(args: any) {
            this.plot = args.plot;
            this.variable = args.variable;
            this.label = args.label;
        }

        public validate() : boolean {
            if(this.plot === undefined) {
                throw new Error('Invalid arguments: Plot not defined!');
            }
            if(this.variable === undefined) {
                throw new Error('Invalid arguments: Variable not defined!');
            }            
            return true;        
        }

        public defaults() : void {
            if(this.label === undefined) {
                this.label = this.variable;
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