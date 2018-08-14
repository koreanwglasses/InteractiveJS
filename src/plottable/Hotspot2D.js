
function Hotspot2D(plot, expr) {
    this.isHotspot2DInstance = true;
    
    this.plot = plot;
    this.expr = expr;
    this.position = this.plot.parser.eval(expr);
    this.size = 20;
}

Hotspot2D.prototype.ondrag = function(event) {
    this.position._data[0] = event.worldX;
    this.position._data[1] = event.worldY;

    // this.plot.context[this.expr.string].q[0] = event.worldX;
    // this.plot.context[this.expr.string].q[1] = event.worldY;
    this.plot.parser.set(this.expr, math.matrix([event.worldX, event.worldY]));

    this.plot.refresh();
}

export{ Hotspot2D };