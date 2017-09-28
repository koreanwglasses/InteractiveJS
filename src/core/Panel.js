import { Expression } from '../math/expressions/Expression.js';
import { Number } from '../math/Number.js';

function Panel (parent, container) {
    this.parent = parent;

    this.container = container;

    this.readOuts = [];
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
    
    var div = document.createElement('div');

    this.container.appendChild(div);
    div.appendChild(label);
    div.appendChild(slider);
    // div.appendChild(valueLabel);
}

Panel.prototype.addReadout = function(expr, opts) {
    // TODO-ERR: Check if expr exists 

    if(opts === undefined) opts = {};

    var variable = expr;

    var textBox = document.createElement('input');
    textBox.setAttribute('type', 'text');
    textBox.setAttribute('disabled', 'true');

    // var _self = this;
    // textBox.onchange = function() {            
    //     _self.parent.context[expr] = new Expression(textBox.value, _self.parent.context);
    //     _self.parent.refresh(interval.varstr);
    // }

    var label = document.createTextNode(expr + '=');

    var div = document.createElement('div');
    
    this.container.appendChild(div);
    div.appendChild(label);
    div.appendChild(textBox);

    this.readOuts.push({exprLabel: expr, expr: new Expression(expr, this.parent.context), div: div, textBox: textBox});
}

Panel.prototype.addCheckBox = function(expr, opts) {
    if(opts == undefined) opts = {};
    var variable = expr;
    
    var chkBox = document.createElement('input');
    chkBox.setAttribute('type', 'checkbox');

    chkBox.checked = this.parent.context[variable] != 0;

    var _self = this;
    chkBox.onchange = function() {
        _self.parent.context[variable] = chkBox.checked ? Number[1] : Number[0];
        _self.parent.refresh(variable);
    }

    var label = document.createTextNode(opts.label);
    var div = document.createElement('div');

    this.container.appendChild(div);
    div.appendChild(label);
    div.appendChild(chkBox);
}

Panel.prototype.update = function() {
    for(var i = 0; i < this.readOuts.length; i++) {
        var readOut = this.readOuts[i];
        readOut.textBox.value = readOut.expr.evaluate().toString({precision: 4});
    }
}

export { Panel };