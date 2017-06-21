import { Expression } from '../math/expressions/Expression.js';
import { Number } from '../math/Number.js';

function Panel (parent, container) {
    this.parent = parent;

    this.container = container;
}

Panel.prototype.addSlider = function(expr, opts) {
    if(opts === undefined) opts = {};

    var interval = new Expression(expr, parent.context).evaluate();

    var slider = document.createElement('input');
    slider.setAttribute('type', 'range');
    slider.min = interval.start.value;
    slider.max = interval.end.value;
    slider.step = interval.step.value;

    if(this.parent.context[interval.varstr] !== undefined) {
        slider.value = this.parent.context[interval.varstr].value;
    }

    var _self = this;
    if(opts.continuous === undefined || opts.continuous === false) {
        slider.onchange = function() {            
            _self.parent.context[interval.varstr] = new Number(parseFloat(slider.value));
            _self.parent.refresh();
        }
    } else if(opts.continuous === true) {
        slider.oninput = function() {
            _self.parent.context[interval.varstr] = new Number(parseFloat(slider.value));
            _self.parent.refresh();
        }
    }

    this.container.appendChild(slider);
}

export { Panel };