var PlotInfo = function() {
    
}

var splitTuple = function(string) {
    var level = 0;
    var strip = false;
    var parts = [''];
    for(var i = 0; i < string.length; i++) {
        if(string[i] == '(' || string[i] == '[' || string[i] == '{') {
            level++;
            if(i == 0) {
                strip = true;
            } else {
                parts[parts.length - 1] += string[i];
            }
        } else if (string[i] == ')' || string[i] == ']' || string[i] == '}') {
            level--;
            if(i != string.length - 1 || !strip) {
                parts[parts.length - 1] += string[i];
            }
        } else if (((strip && level == 1) || (!strip && level == 0)) && string[i] == ',') {
            parts.push('');
        } else {
            parts[parts.length - 1] += string[i];
        }
    }
    return parts;
}

PlotInfo.AngleArc2D = function(exprs) {
    this.exprs = {
        // Vector or Null
        offset: '[0,0]',

        // Vector
        v1: null,

        // Vector
        v2: null
    }

    if(exprs.offset) {
        this.exprs.offset = exprs.offset;
    }

    if(exprs.v1) {
        this.exprs.v1 = exprs.v1;
    } else {
        throw new Error('Invalid expressions for AngleArc2D plot info: missing .v1');
    }

    if(exprs.v2) {
        this.exprs.v2 = exprs.v2;
    } else {
        throw new Error('Invalid expressions for AngleArc2D plot info: missing .v2');
    }
}
PlotInfo.AngleArc2D.fromString = function(string) {
    string = string.replace(/\s/g, '');
    var parts = splitTuple(string);

    var exprs = {};
    if(parts.length == 2) {
        exprs.v1 = parts[0];;
        exprs.v2 = parts[1];
    } else if (parts.length == 3) {
        exprs.offset = parts[0];
        exprs.v1 = parts[1];
        exprs.v2 = parts[2];
    } else {
        throw new Error('Invalid syntax for AngleArc2D expression');
    }

    return new PlotInfo.Parallelogram2D(exprs);
}

PlotInfo.Arrow2D = function(exprs) {
   this.exprs = {
        // Vector or null
        start: '[0,0]',

        // Vector
        end: null,
    }

    // Object.assign(this.exprs, exprs);

    if(exprs.start) {
        this.exprs.start = exprs.start;
    }

    if(exprs.end) {
        this.exprs.end = exprs.end;
    } else {
        throw new Error('Invalid expressions for Arrow2D plot info: missing .end');
    }
}
PlotInfo.Arrow2D.fromString = function(string) {
    string = string.replace(/\s/g, '');
    var parts = splitTuple(string);

    var exprs = {};

    if(parts.length == 1) {
        exprs.end = parts[0];
    } else if(parts.length == 2) {
        exprs.start = parts[0];
        exprs.end = parts[1];
    } else {
        throw new Error('Invalid syntax for Arrow2D expression');
    }

    return new PlotInfo.Arrow2D(exprs);
}

PlotInfo.Arrow3D = function(exprs) {
   this.exprs = {
        // Vector or null
        start: '[0,0,0]',

        // Vector
        end: null,
    }

    // Object.assign(this.exprs, exprs);

    if(exprs.start) {
        this.exprs.start = exprs.start;
    }

    if(exprs.end) {
        this.exprs.end = exprs.end;
    } else {
        throw new Error('Invalid expressions for Arrow3D plot info: missing .end');
    }
}
PlotInfo.Arrow3D.fromString = function(string) {
    string = string.replace(/\s/g, '');
    var parts = splitTuple(string);

    var exprs = {};
    if(parts.length == 2) {
        exprs.end = parts[0];
    } else if(parts.length == 4) {
        exprs.start = parts[0];
        exprs.end = parts[1];
    } else {
        throw new Error('Invalid syntax for Arrow3D expression');
    }

    return new PlotInfo.Arrow3D(exprs);
}

PlotInfo.Isoline3D = function(exprs) {
    // Default values
    this.exprs = {
        // Vector
        point: null,
        
        // Variable
        level: null,
        
        // String
        uvar: null,
        // Variable
        umin: null,
        // Variable
        umax: null,
        // Variable
        usteps: null,
        
        // String or Null
        vvar: null,
        // Variable or Null
        vmin: null,
        // Variable or Null
        vmax: null,
        // Variable or Null
        vsteps: null,
        
        // Vector3 or Null
        color: null
    }
    
    // Object.assign(this.exprs, exprs);
    
    if(exprs.point) {
        this.exprs.point = exprs.point;
    } else {
        throw new Error('Invalid expressions for Isoline3D plot info: missing .point');
    }

    if(exprs.level) {
        this.exprs.level = exprs.level;
    } else {
        throw new Error('Invalid expressions for Isoline3D plot info: missing .level');
    }
    
    if ((exprs.uvar && exprs.umin && exprs.umax && exprs.usteps) 
    && (exprs.vvar && exprs.vmin && exprs.vmax && exprs.vsteps) ) {
        this.exprs.uvar = exprs.uvar;
        this.exprs.umin = exprs.umin;
        this.exprs.umax = exprs.umax;
        this.exprs.usteps = exprs.usteps;
        
        this.exprs.vvar = exprs.vvar;
        this.exprs.vmin = exprs.vmin;
        this.exprs.vmax = exprs.vmax;
        this.exprs.vsteps = exprs.vsteps;
    } else {
        throw new Error('Invalid expressions for Isoline3D plot info: invalid parameterization');
    }
    
    if(exprs.color) {
        this.exprs.color = exprs.color;
    }
}
PlotInfo.Isoline3D.fromString = function(string) {
    string = string.replace(/\s/g, '');
    var parts = string.split(/(?:{|}|\|)+/g);
    
    var exprs = {};
    exprs.point = parts[0];
    
    var uint = parts[1].split(',');
    var vint = parts[2].split(',');
    var level = parts[3].split('=');
    
    exprs.uvar = uint[0];
    exprs.umin = uint[1];
    exprs.umax = uint[2];
    exprs.usteps = uint[3];
    
    exprs.vvar = vint[0];
    exprs.vmin = vint[1];
    exprs.vmax = vint[2];
    exprs.vsteps = vint[3];
    
    exprs.level = level[1];

    return new PlotInfo.Isoline3D(exprs);
}

PlotInfo.Isoline2D = PlotInfo.Isoline3D;

PlotInfo.Parallelogram2D = function(exprs) {
    this.exprs = {
        // Vector or Null
        offset: '[0,0]',

        // Vector
        v1: null,

        // Vector
        v2: null
    }

    if(exprs.offset) {
        this.exprs.offset = exprs.offset;
    }

    if(exprs.v1) {
        this.exprs.v1 = exprs.v1;
    } else {
        throw new Error('Invalid expressions for Parallelogram2D plot info: missing .v1');
    }

    if(exprs.v2) {
        this.exprs.v2 = exprs.v2;
    } else {
        throw new Error('Invalid expressions for Parallelogram2D plot info: missing .v2');
    }
}
PlotInfo.Parallelogram2D.fromString = function(string) {
    string = string.replace(/\s/g, '');
    var parts = splitTuple(string);

    var exprs = {};
    if(parts.length == 2) {
        exprs.v1 = parts[0];;
        exprs.v2 = parts[1];
    } else if (parts.length == 3) {
        exprs.offset = parts[0];
        exprs.v1 = parts[1];
        exprs.v2 = parts[2];
    } else {
        throw new Error('Invalid syntax for Parallelogram2D expression');
    }

    return new PlotInfo.Parallelogram2D(exprs);
}

PlotInfo.Polygon2D = function(exprs) {
   this.exprs = {
        // Array of vectors
        vertices: []
    }

    if(exprs.vertices && exprs.vertices.length > 1) {
        this.exprs.vertices = exprs.vertices;
    } else {
        throw new Error('Invalid expressions for Arrow3D plot info: missing .vertices');
    }
}
PlotInfo.Polygon2D.fromString = function(string) {
    string = string.replace(/\s/g, '');
    var parts = splitTuple(string);

    var exprs = {};
    if(parts.length > 1) {
        exprs.vertices = parts;
    } else {
        throw new Error('Invalid syntax for Polygon2D expression');
    }

    return new PlotInfo.Polygon2D(exprs);
}

PlotInfo.Parametric2D = function(exprs) {
    // Default values
    this.exprs = {
        // Vector
        point: null,
        
        // String
        tvar: null,
        // Variable
        tmin: null,
        // Variable
        tmax: null,
        // Variable
        tsteps: null,
        
        // Vector3 or Null
        color: null
    }
    
    // Object.assign(this.exprs, exprs);
    
    if(exprs.point) {
        this.exprs.point = exprs.point;
    } else {
        throw new Error('Invalid expressions for Parametric3D plot info: missing .point');
    }
    
    if( exprs.tvar && exprs.tmin && exprs.tmax && exprs.tsteps ) {
        this.exprs.tvar = exprs.tvar;
        this.exprs.tmin = exprs.tmin;
        this.exprs.tmax = exprs.tmax;
        this.exprs.tsteps = exprs.tsteps;
    } else {
        throw new Error('Invalid expressions for Parametric3D info: invalid parameterization');
    }
    
    if(exprs.color) {
        this.exprs.color = exprs.color;
    }
}
PlotInfo.Parametric2D.fromString = function(string) {
    string = string.replace(/\s/g, '');
    var parts = string.split(/(?:{|})+/g);
    
    var exprs = {};
    exprs.point = parts[0];
    
    if(parts.length == 3) {
        var interval = parts[1].split(',');
        exprs.tvar = interval[0];
        exprs.tmin = interval[1];
        exprs.tmax = interval[2];
        exprs.tsteps = interval[3];
    } else {
        console.error('Invalid syntax for Parametric3D expression');
    }
    
    return new PlotInfo.Parametric2D(exprs);
}

PlotInfo.Parametric3D = function(exprs) {
    // Default values
    this.exprs = {
        // Vector
        point: null,
        
        // String
        tvar: null,
        // Variable
        tmin: null,
        // Variable
        tmax: null,
        // Variable
        tsteps: null,
        
        // String
        uvar: null,
        // Variable
        umin: null,
        // Variable
        umax: null,
        // Variable
        usteps: null,
        
        // String or Null
        vvar: null,
        // Variable or Null
        vmin: null,
        // Variable or Null
        vmax: null,
        // Variable or Null
        vsteps: null,
        
        // Vector3 or Null
        color: null
    }
    
    // Object.assign(this.exprs, exprs);
    
    if(exprs.point) {
        this.exprs.point = exprs.point;
    } else {
        throw new Error('Invalid expressions for Parametric3D plot info: missing .point');
    }
    
    if( (exprs.tvar && exprs.tmin && exprs.tmax && exprs.tsteps)
    && (!exprs.uvar && !exprs.umin && !exprs.umax && !exprs.usteps) 
    && (!exprs.vvar && !exprs.vmin && !exprs.vmax && !exprs.vsteps) ) {
        this.exprs.tvar = exprs.tvar;
        this.exprs.tmin = exprs.tmin;
        this.exprs.tmax = exprs.tmax;
        this.exprs.tsteps = exprs.tsteps;
    } else if ( (!exprs.tvar && !exprs.tmin && !exprs.tmax && !exprs.tsteps)
    && (exprs.uvar && exprs.umin && exprs.umax && exprs.usteps) 
    && (exprs.vvar && exprs.vmin && exprs.vmax && exprs.vsteps) ) {
        this.exprs.uvar = exprs.uvar;
        this.exprs.umin = exprs.umin;
        this.exprs.umax = exprs.umax;
        this.exprs.usteps = exprs.usteps;
        
        this.exprs.vvar = exprs.vvar;
        this.exprs.vmin = exprs.vmin;
        this.exprs.vmax = exprs.vmax;
        this.exprs.vsteps = exprs.vsteps;
    } else {
        throw new Error('Invalid expressions for Parametric3D info: invalid parameterization');
    }
    
    if(exprs.color) {
        this.exprs.color = exprs.color;
    }
}
PlotInfo.Parametric3D.fromString = function(string) {
    string = string.replace(/\s/g, '');
    var parts = string.split(/(?:{|})+/g);
    
    var exprs = {};
    exprs.point = parts[0];
    
    if(parts.length == 3) {
        var interval = parts[1].split(',');
        exprs.tvar = interval[0];
        exprs.tmin = interval[1];
        exprs.tmax = interval[2];
        exprs.tsteps = interval[3];
    } else if(parts.length == 4) {
        var interval1 = parts[1].split(',');
        var interval2 = parts[2].split(',');
        
        exprs.uvar = interval1[0];
        exprs.umin = interval1[1];
        exprs.umax = interval1[2];
        exprs.usteps = interval1[3];
        
        exprs.vvar = interval2[0];
        exprs.vmin = interval2[1];
        exprs.vmax = interval2[2];
        exprs.vsteps = interval2[3];
    } else {
        console.error('Invalid syntax for Parametric3D expression');
    }
    
    return new PlotInfo.Parametric3D(exprs);
}

export { PlotInfo };