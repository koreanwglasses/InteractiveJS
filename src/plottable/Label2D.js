import { Expression } from '../math/expressions/Expression.js';
import { Plottable } from './Plottable.js';

function Label2D(ax, text, opts) {
    var plot = ax.parent;
    this.ax = ax;
    this.text = text;

    if(opts === undefined) opts = {};
    this.opts = {}
    this.opts.origin = opts.origin !== undefined ? new Expression(opts.origin, plot.context) : new Expression('(0,0)', plot.context);
    this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;
}

var toWindowCoords = function(worldX, worldY, cameraLeft, cameraRight, cameraTop, cameraBottom, divLeft, divTop, divWidth, divHeight) {
    var windowX = divLeft + divWidth * (worldX - cameraLeft) / (cameraRight - cameraLeft);
    var windowY = divTop + divHeight * (cameraTop - worldY) / (cameraTop - cameraBottom);
    return {x: windowX, y: windowY};
}

Label2D.prototype.show = function() {
    var label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.width = 100;
    label.style.height = 100;
    label.style.color = "white";
    label.innerHTML = this.text;

    this.label = label;
    this.refresh();
    document.body.appendChild(label);
}

Label2D.prototype.refresh = function() {
    var _origin = this.opts.origin.evaluate();
    var coords = toWindowCoords(_origin.q[0].value, _origin.q[1].value, this.ax.camera.left, this.ax.camera.right, this.ax.camera.top, this.ax.camera.bottom, this.ax.frame.container.offsetLeft, this.ax.frame.container.offsetTop, this.ax.frame.container.clientWidth, this.ax.frame.container.clientHeight )

    this.label.style.top = coords.y + 'px';
    this.label.style.left = coords.x + 'px';
}

export { Label2D };