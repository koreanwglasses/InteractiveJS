import { Plot } from '../core/Plot.js';

function DynPlot(info) {
    this.plot = new Interactive.Plot();
    
    this.aid = 0;
    this.axesInfo = {};
    
    this.eid = 0;
    this.expressionsInfo = {};
    
    this.pid = 0;
    this.plotInfo = {};
    
    /**
     * Auxilliary html functions
     */
    this.resetContainer = null;
    this.createAxesContainer = null;
    this.removeAxesContainer = null;
    this.onCreateExpression = null;
    this.onRemoveExpression = null;
    
    if(info) reload(info);
}

DynPlot.prototype.compile = function() {
    var self_ = this;
    
    var plotInitCode = [
        'plot = new Interactive.Plot();',
    ];
    
    var compileAxesInitCode = function(ai) {
        var initCode = 'ax' + ai.id + ' = ';
        if(ai.type == '2D') initCode += 'plot.createAxes2D('; 
        if(ai.type == '3D') initCode += 'plot.createAxes3D('; 
        initCode += 'document.getElementById("ax' +  ai.id + '")';
        // other properties will go here
        initCode += ');';
        return initCode;
    }
    
    var compileAxesDrawCode = function(ai, pi) {
        var plotCode = 'ax' + ai.id + '.plotExpression("';
        if(pi.values.expr) {
            plotCode += pi.values.expr;
        }
        if(pi.values.interval) {
            plotCode += '{';
            plotCode += pi.values.interval.variable;
            plotCode += ',';
            plotCode += pi.values.interval.start;
            plotCode += ',';
            plotCode += pi.values.interval.end;
            plotCode += ',';
            plotCode += pi.values.interval.steps;
            plotCode += '}';
        }
        plotCode += '"';
        plotCode += ','
        switch(pi.type) {
            case 'Parametric Curve': 
            case 'Parametric Surface':
            plotCode += '"parametric"';
            break;
        }
        plotCode += ',{';
        if(pi.values.useColor) {
            plotCode += 'color:"';
            plotCode += pi.values.color;
            plotCode += '",'; 
        }
        // other properties will go here
        plotCode += '});';
        return plotCode;
    }
    
    var axInitCode = [
        
    ];
    var axDrawCode = [
        
    ];
    
    for(var key in this.axesInfo) {
        var ai = this.axesInfo[key];
        var initCode = compileAxesInitCode(ai);
        axInitCode.push(initCode);
        
        ai.plotIds.forEach((pid) => {
            var pi = self_.plotInfo[pid];
            if(pi.valid) {
                var plotCode = compileAxesDrawCode(ai, pi);
                axDrawCode.push(plotCode);
            }
        });
    }
    
    var compileExpressionCode = function(ex) {
        var code = 'ex' + ex.id + ' = ';
        code += 'plot.execExpression("';
        code += ex.expr;
        code += '");';
        return code;
    }
    
    var expressionCode = [
        
    ];
    
    var exprInfoSortedKeys = Object.keys(this.expressionsInfo);
    exprInfoSortedKeys.sort((a, b) => self_.expressionsInfo[a].priority < self_.expressionsInfo[b].priority);
    exprInfoSortedKeys.forEach((key) => {
        var ex = self_.expressionsInfo[key];
        var exCode = compileExpressionCode(ex);
        expressionCode.push(exCode);
    });
    
    var code = '';
    code += plotInitCode.join('\n');
    code = code.trim();
    code += '\n\n';
    code += axInitCode.join('\n');
    code = code.trim();
    code += '\n\n';
    code += expressionCode.join('\n');
    code = code.trim();
    code += '\n\n';
    code += axDrawCode.join('\n');
    code = code.trim();
    code += '\n';
    return code;
}

DynPlot.prototype.reload = function(info) {
    var self_ = this;
    
    var reset = function() {
        var removeAllExpressions = function() {
            for(var key in self_.expressionsInfo) {
                var ei = self_.expressionsInfo[key];
                self_.removeExpression(ei);
            }
        }
        var removeAllAxes = function() {
            for(var key in self_.axesInfo) {
                var ai = self_.axesInfo[key];
                self_.removeAxes(ai);
            }
        }
        var removeAllPlots = function() {
            for(var key in self_.plotInfo) {
                var pi = self_.plotInfo[key];
                self_.removePlot(pi);
            }
        }
        
        if(self_.plot) self_.plot.sleep();
        
        removeAllPlots();
        removeAllAxes();
        removeAllExpressions();
        
        if(self_.resetContainer) self_.resetContainer();
    }
    
    var loadInfo = function(info) {
        self_.aid = info.aid;
        self_.axesInfo = info.axesInfo;
        self_.eid = info.eid;
        self_.expressionsInfo = info.expressionsInfo;
        self_.pid = info.pid;
        self_.plotInfo = info.plotInfo;
    }
    
    var prepareExpressionContainers = function() {
        for(var key in self_.expressionsInfo) {
            var ei = self_.expressionsInfo[key];
            self_.addExpression(ei);
        }
    }
    
    var prepareAxesContainers = function() {
        for(var key in self_.axesInfo) {
            var ai = self_.axesInfo[key];
            self_.addAxes(ai);
        }
    }
    
    var loadPlot = function() {
        self_.plot = new Interactive.Plot();
        
        self_.updateExpressions();
        
        for(var key in self_.axesInfo) {
            var ai = self_.axesInfo[key];
            self_.updateAxes(ai);
        }
        
        for(var key in self_.plotInfo) {
            var pi = self_.plotInfo[key];
            self_.updatePlot(pi); 
        }
    }
    
    reset();
    loadInfo(info);
    prepareExpressionContainers();
    prepareAxesContainers();
    loadPlot();
    this.plot.render();
}

DynPlot.prototype.addAxes = function(ai) {
    if(ai === undefined) ai = {};
    if(ai.id === undefined) ai.id = this.aid++;
    if(ai.title === undefined) ai.title = 'Axes ' + ai.id;
    if(ai.type === undefined) ai.type = '2D';
    if(ai.plotIds === undefined) ai.plotIds = [];
    
    if(this.createAxesContainer) {
        ai.container = this.createAxesContainer(ai); 
    }
    
    this.updateAxes(ai);
    
    this.axesInfo[ai.id] = ai;
    return ai;
}

DynPlot.prototype.updateAxes = function(ai) {
    if(ai.obj) {
        this.plot.dropAxes(ai.obj);
        ai.obj = null;
    }
    
    if(ai.type == "2D") {
        ai.obj = this.plot.createAxes2D(ai.container);
    } 
    if(ai.type == "3D") {
        ai.obj = this.plot.createAxes3D(ai.container);
    }
    
    this.axesInfo[ai.id] = ai;
}

DynPlot.prototype.removeAxes = function(ai) {
    var self_ = this;
    ai.plotIds.slice().forEach((pid) => {
        var pi = self_.plotInfo[pid];
        self_.removePlot(pi);
    });
    
    if(ai.container && this.removeAxesContainer) {
        this.removeAxesContainer(ai);
    } 

    if(ai.obj) this.plot.dropAxes(ai.obj);

    delete this.axesInfo[ai.id];
}

DynPlot.prototype.addPlot = function(pi) {
    // Add entry to the global this.plot info set
    if(pi === undefined) pi = {};
    if(pi.id === undefined) pi.id = this.pid++;
    if(pi.type === undefined) return null;
    if(pi.axesId === undefined) return null;
    if(pi.valid === undefined) pi.valid = false;
    if(pi.values === undefined) pi.values = {};
    if(pi.opts === undefined) pi.opts = {};
    
    // Add a reference from the axes it is
    // embedded in
    this.axesInfo[pi.axesId].plotIds.push(pi.id);
    
    // Add the this.plot to the axes
    this.updatePlot(pi);
    
    this.plotInfo[pi.id] = pi;
    return pi;
}

DynPlot.prototype.updatePlot = function(pi) {
    var ai = this.axesInfo[pi.axesId]
    
    if(pi.obj) {
        ai.obj.removeFigure(pi.obj);    
        pi.obj = null;
    }

    if(pi.valid) {
        switch(pi.type) {
            case 'Parametric Curve':
            case 'Parametric Surface':
            pi.obj = ai.obj.plotExpression(pi.values, 'parametric', pi.opts);
            break;
        }
    }
    
    this.plotInfo[pi.id] = pi;
}

DynPlot.prototype.removePlot = function(pi) {
    // Remove reference to this this.plot from the axes
    // it is embedded in
    var ai = this.axesInfo[pi.axesId];
    var index = ai.plotIds.indexOf(pi.id);
    ai.plotIds.splice(index, 1);
    this.axesInfo[pi.axesId] = ai;
    
    // Remove this this.plot from the axes object
    if(pi.obj) ai.obj.removeFigure(pi.obj);
    
    // Remove reference to this this.plot from the global
    // this.plot info set
    delete this.plotInfo[pi.id];
}

DynPlot.prototype.addExpression = function(ei) {
    var self_ = this;
    
    if(ei === undefined) ei = {};
    if(ei.id === undefined) ei.id = this.eid++;
    if(ei.expr === undefined) ei.expr = '';
    if(ei.valid === undefined) ei.valid = false;
    if(ei.priority === undefined) ei.priority = ei.id;
    
    if(this.onCreateExpression) this.onCreateExpression(ei);

    this.updateExpressions();
    
    this.expressionsInfo[ei.id] = ei;
    return ei;
}

DynPlot.prototype.updateExpressions = function() {
    this.plot.resetContext();
    
    for(var key in this.expressionsInfo) {
        var ei = this.expressionsInfo[key];
        if(ei.valid) {
            this.plot.execExpression(ei.expr);
        }
    }
    
    this.plot.refresh();
    
    // Redraw all plots
    for(var key in this.plotInfo) {
        var pi = this.plotInfo[key];
        if(pi.obj) this.updatePlot(pi);
    }
}

DynPlot.prototype.removeExpression = function(ei) {
    if(this.onRemoveExpression) this.onRemoveExpression(ei);
    delete this.expressionsInfo[ei.id];
}

DynPlot.prototype.save = function() {
    var info = {};
    info.aid = this.aid;
    info.axesInfo = this.axesInfo;
    info.eid = this.eid;
    info.expressionsInfo = this.expressionsInfo;
    info.pid = this.pid;
    info.plotInfo = this.plotInfo;
    
    var replacer = function(key, value) {
        if(key == 'container') return undefined;
        if(key == 'obj') return undefined;
        return value;
    }
    
    var str = JSON.stringify(info, replacer);
    return str;
}

DynPlot.prototype.render = function() {
    this.plot.render();
};

export { DynPlot };