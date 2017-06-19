function Hotspot2D(plot, expr) {
    this.type = 'Hotspot2D'

    // if (position.type !== 'Vector') {
    //     console.log('Interactive.Hotspot2D: position is not a vector.');
    //     return null;
    // }

    // if (position.dimensions !== 2) {
    //     console.log('Interactive.Hotspot2D: Vector dimension mismatch. 2D vector required.')
    //     return null;
    // }

    this.plot = plot;
    this.expr = expr;
    this.position = expr.evaluate();
    this.size = 10;
}

Hotspot2D.prototype.ondrag = function(event) {
    this.position.q[0] = event.worldX;
    this.position.q[1] = event.worldY;

    // Host plot = this.parent.parent
    this.plot.context[this.expr.string].q[0] = event.worldX;
    this.plot.context[this.expr.string].q[1] = event.worldY;
    this.plot.refresh();
}

export{ Hotspot2D };