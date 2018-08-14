import { Axes3D } from './Axes3D.js';
import { Axes2D } from './Axes2D.js';
import { Panel } from './Panel.js';

function Plot() {
    /**
    * The type of this object. (Read-only)
    */
    this.type = 'Plot';
    this.axes = {};
    this.panels = [];
    
    this.parser = math.parser();
    
    // Custom Functions
    var self_ = this;
    this.parser.set('diffh', function(f, x, h) {
        return math.divide(math.subtract(f(x + h/2), f(x - h/2)), h);
    });
    this.parser.eval('diff(f, x) = diffh(f, x, 0.0000001)')
    this.parser.set('diff2h', function(f, x, h) {
        return math.divide(math.add(f(x + h), f(x - h), math.multiply(f(x), -2)), math.multiply(h, h));
    });
    this.parser.eval('diff2(f, x) = diff2h(f, x, 0.0000001)')
    this.parser.eval('interpolate(a, b, alpha) = a * (1 - alpha) + b * alpha');
    this.parser.set('normalh', function(X, u, v, h) {
        var du = math.divide(math.subtract(X(u + h/2, v), X(u - h/2, v)), h);
        var dv = math.divide(math.subtract(X(u, v + h/2), X(u, v - h/2)), h);
        return math.cross(du, dv);
    });
    this.parser.eval('normal(X, u, v) = normalh(X, u, v, 0.0000001)')
    this.parser.eval('normalize(b) = b / norm(b)');
    this.parser.set('quadrant', function(v) {
        var arr = v.toArray();
        if(arr[0] < 0 && arr[1] < 0) return 3;
        if(arr[0] < 0 && arr[1] == 0) return 2.5;
        if(arr[0] < 0 && arr[1] > 0) return 2;
        if(arr[0] == 0 && arr[1] < 0) return 3.5;
        if(arr[0] == 0 && arr[1] == 0) return 0;
        if(arr[0] == 0 && arr[1] > 0) return 1.5;
        if(arr[0] > 0 && arr[1] < 0) return 4;
        if(arr[0] > 0 && arr[1] == 0) return 0.5;
        if(arr[0] > 0 && arr[1] > 0) return 1;
    });
    this.parser.set('select', function(i) {
        if(!Number.isInteger(i) || !(1 <= i && i <= arguments.length)) {
            throw new Error('Invalid argument "' + i + '"!')
        }
        return arguments[i];
    });
    this.parser.set('spectrum', function(h) {
        h = h % 1;
        if(h < 0) h = h + 1;

        var r, g, b, i, f, q;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        q = 1 - f;
        switch (i % 6) {
            case 0: r = 1, g = f, b = 0; break;
            case 1: r = q, g = 1, b = 0; break;
            case 2: r = 0, g = 1, b = f; break;
            case 3: r = 0, g = q, b = 1; break;
            case 4: r = f, g = 0, b = 1; break;
            case 5: r = 1, g = 0, b = q; break;
        }
        return math.matrix([r, g, b]);
    });    
}

Plot.prototype.execExpression = function(expr) {
    var result;
    try {
        result = this.parser.eval(expr);
    } catch (err) {
        result = err;
    } 
    return result;
}

Plot.prototype.refresh = function() {
    for(var key in this.axes) {
        this.axes[key].refresh();
    }
}

Plot.prototype.linkCameras = function(from) {
    for(var i = 1; i < arguments.length; i++) {
        arguments[i].camera = from.camera;
    }
}

/**
* Create a 3D axis in the context of this plot
*/
Plot.prototype.createAxes3D = function(container, opts) {
    var ax = new Axes3D(this, container, opts);
    this.axes[ax.uid] = ax;
    return ax;
};

/**
* Create a 2D axis in the context of this plot
*/
Plot.prototype.createAxes2D = function(container, opts) {
    var ax = new Axes2D(this, container, opts);
    this.axes[ax.uid] = ax;
    return ax;
};

Plot.prototype.dropAxes = function(axes) {
    axes.sleep();
    delete this.axes[axes.uid];
}

Plot.prototype.createPanel = function(container, opts) {
    var panel = new Panel(this, container, opts);
    this.panels.push(panel);
    return panel;
}

Plot.prototype.resetContext = function() {
    this.parser = math.parser();
}

Plot.prototype.sleep = function() {
    for(var key in this.axes) {
        this.axes[key].sleep();
    }
}

Plot.prototype.render = function() {
    function checkVisible(el) {
        var elemTop = el.getBoundingClientRect().top;
        var elemBottom = el.getBoundingClientRect().bottom;
        
        var isVisible = (elemBottom >= 0) && (elemTop <= window.innerHeight);
        return isVisible;
    }
    
    for(var key in this.axes) {
        var ax = this.axes[key];
        if(checkVisible(ax.frame.container)) {
            if(ax.frame.isSleeping) ax.wake();
            ax.render();
        } else if(!ax.frame.isSleeping) ax.sleep();
    }
    
    this.panels.forEach(function(pan) {
        pan.update();
    })
}

export { Plot };