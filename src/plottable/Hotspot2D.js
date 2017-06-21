import { Expression } from '../math/expressions/Expression.js';

function Hotspot2D(plot, expr) {
    this.type = 'Hotspot2D'
    this.plot = plot;
    this.expr = new Expression(expr, plot.context);
    this.position = this.expr.evaluate().clone();
    this.size = 10;
}

Hotspot2D.prototype.ondrag = function(event) {
    this.position.q[0] = event.worldX;
    this.position.q[1] = event.worldY;

    this.plot.context[this.expr.string].q[0] = event.worldX;
    this.plot.context[this.expr.string].q[1] = event.worldY;

    this.plot.refresh(this.expr.string);
}

export{ Hotspot2D };