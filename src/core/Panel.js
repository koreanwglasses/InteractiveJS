import { Expression } from '../math/expressions/Expression.js';
import { Number } from '../math/Number.js';

function Panel (parent, container) {
    this.parent = parent;

    this.container = container;
}

Panel.prototype.addSlider = function(expr, opts) {
    if(opts === undefined) opts = {};

    var interval = new Expression(expr, this.parent.context).evaluate();

    var slider = document.createElement('input');
    slider.setAttribute('type', 'range');
    slider.min = interval.start.value;
    slider.max = interval.end.value;
    slider.step = interval.step.value;

    if(this.parent.context[interval.varstr] !== undefined) {
        slider.value = this.parent.context[interval.varstr].value;
    }

    var valueLabel = document.createTextNode(slider.value);

    var _self = this;
    if(opts.continuous === undefined || opts.continuous === false) {
        slider.onchange = function() {            
            _self.parent.context[interval.varstr] = new Number(parseFloat(slider.value));
            _self.parent.refresh(interval.varstr);
            
            valueLabel.nodeValue = slider.value;
        }
    } else if(opts.continuous === true) {
        slider.oninput = function() {
            _self.parent.context[interval.varstr] = new Number(parseFloat(slider.value));
            _self.parent.refresh(interval.varstr);

            valueLabel.nodeValue = slider.value;
        }
    }

    var label = document.createTextNode(interval.varstr + ':');
    this.container.appendChild(label);
    this.container.appendChild(slider);
    this.container.appendChild(valueLabel);
}

export { Panel };