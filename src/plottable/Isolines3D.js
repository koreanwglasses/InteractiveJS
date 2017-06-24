function Isolines3D(parent, funExpr, lvlExpr, opts) {
    this.parent = parent;
    this.plot = parent.parent;

    this.parExpr = new Expression(parExpr, this.plot.context);
    this.lvlExpr = new Expression(lvlExpr, this.plot.context);
    this.opts = opts !== undefined? opts: {}

    this.slfd = [];

    this.sfldValidated = false;
    this.isoValidated = false;

    this.validated = false;
    this.sceneObject = null;

    if(this.opts.color !== undefined) {
        this.color = new Expression(this.opts.color, this.plot.context);
        this.colorf = this.color.evaluate();
    }
    // if(this.opts.axis === undefined) this.opts.axis = 'y';
}

Isolines3D.prototype.getVariables = function() {
    return this.funExpr.getVariables().concat(this.lvlExpr.getVariables());
}

Isolines3D.prototype.createScalarField = function(par) {
    var uint = par.intervals[0];
    var vint = par.intervals[1];
    var func = par.func;
    var sfld = [];
    for(var i = 0; i < uarr.length; i++) {
        var u = uarr[i];
        sfld.push([])
        for(var j = 0; j < varr.length; j++) {
            var v = varr[j];

            var vert = func(u,v).toVector3();

            slfd[slfd.length - 1].push(vert);
        }
    }
    this.sfld = slfd;
}

Isolines3D.prototype.createIsoline = function(par) {
    var uint = par.intervals[0];
    var vint = par.intervals[1];
    var lvl = this.lvlExpr.evaluate();

    if(this.sfldValidated === false) this.createScalarField();

    for(var i = 0; i < uarr.length - 1; i++) {
        for(var j = 0; j < varr.length - 1; j++) {
            var cse = ((this.slfd[i][j] > lvl) << 3) + ((this.slfd[i+1][j] > lvl) << 2) + ((this.slfd[i+1][j+1] > lvl) << 1) + (this.slfd[i][j+1] > lvl);
            console.log(cse);
        }
    }
}

Isolines3D.prototype.getSceneObject = function() {
    if(this.validated === false) {
        var par = this.parExpr.evaluate();
        this.sceneObject = this.createIsoline(par);
        this.validated = true;
    }
    return this.sceneObject;
}

Isolines3D.prototype.invalidate = function(expr) {
    if(this.funExpr.getVariables.includes(expr)) this.sfldValidated = false;
    if(this.lvlExpr.getVariables.includes(expr)) this.isoValidated = false;
    this.validated = false;
}

export { Isolines3D };