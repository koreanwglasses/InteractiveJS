function Panel (parent, container) {
    this.parent = parent;
    
    this.container = container;
    
    this.readOuts = [];
}

Panel.prototype.addConsole = function(opts) {
    var textBox = document.createElement('textarea');
    var refresh = document.createElement('input');
    refresh.setAttribute('type', 'button');
    refresh.setAttribute('value', 'refresh');
    this.container.appendChild(textBox);
    this.container.appendChild(refresh);
    
    refresh.onclick = () => {
        var lines = textBox.value.split('\n');
        lines.forEach((line) => {
            this.parent.execExpression(line);
        });
    };
} 

Panel.prototype.addSlider = function(expr, opts) {
    if(opts === undefined) opts = {};
    
    var parts = expr.split(/(?:{|}|,)+/g);
    var interval = {
        varstr: parts[1],
        start: parts[2],
        end: parts[3],
        steps: parts[4]
    }
    
    var slider = document.createElement('input');
    slider.setAttribute('type', 'range');
    slider.min = this.parent.parser.eval(interval.start);
    slider.max = this.parent.parser.eval(interval.end);
    slider.step = (slider.max - slider.min) / this.parent.parser.eval(interval.steps);
    
    if(this.parent.parser.get(interval.varstr) !== undefined) {
        slider.value = this.parent.parser.get(interval.varstr);
    }
    
    var valueLabel = document.createTextNode(slider.value);
    
    var _self = this;
    var update = function() {      
        _self.parent.parser.set(interval.varstr, parseFloat(slider.value));
        if(opts.updateAxes) {
            opts.updateAxes.forEach((axes) => {
                axes.refresh();
            })
        } else {
            _self.parent.refresh();
        }
        
        valueLabel.nodeValue = slider.value
    }
    if(opts.continuous) {
        slider.oninput = update;
    } else {
        slider.onchange = update;
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
    
    this.readOuts.push({exprLabel: expr, expr: expr, div: div, textBox: textBox});
}

Panel.prototype.addCheckBox = function(expr, opts) {
    if(opts == undefined) opts = {};
    var variable = expr;
    
    var chkBox = document.createElement('input');
    chkBox.setAttribute('type', 'checkbox');
    
    chkBox.checked = this.parent.parser.get(variable) != 0;
    
    var _self = this;
    chkBox.onchange = function() {
        _self.parent.parser.set(variable, chkBox.checked ? 1 : 0);
        _self.parent.refresh();
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
        readOut.textBox.value = math.round(this.parent.parser.eval(readOut.expr), 6).toString();
    }
}

export { Panel };