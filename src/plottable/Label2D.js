import { Plottable } from './Plottable.js';

function Label2D(ax, text, opts) {
    this.plot = ax.parent;
    this.ax = ax;
    this.text = text;

    if(opts === undefined) opts = {};
    this.opts = {}
    this.opts.position = opts.position !== undefined ? opts.position : '[0,0]';
    this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;
}

Label2D.prototype.show = function() {
    var label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.width = 100;
    label.style.height = 100;
    label.style.color = "white";

    label.style.cursor = "default";
    label.style['pointer-events'] = 'none';

    label.style['-webkit-user-select'] = 'none'; /* Chrome, Opera, Safari */
    label.style['-moz-user-select'] = 'none'; /* Firefox 2+ */
    label.style['-ms-user-select'] = 'none'; /* IE 10+ */
    label.style['user-select'] = 'none'; /* Standard syntax */

    label.innerHTML = this.text;

    this.label = label;
    this.refresh();
    document.body.appendChild(label);
}

Label2D.prototype.refresh = function() {
    var _origin = this.plot.parser.eval(this.opts.position);

    var rect = this.ax.frame.container.getBoundingClientRect();
    var _self = this.ax;
    
    // I forgot why this works
    var project = function(vector) {
        var vector2 = new THREE.Vector2(...vector.toArray());
        var projected = vector2.clone().sub(_self.camera.position).multiplyScalar(_self.zoom / 2).add(new THREE.Vector2(_self.frame.width / 2, _self.frame.height / 2));
        projected.y = _self.frame.height - projected.y;
        return projected;
    }

    var coords = project(_origin);

    this.label.style.top = window.scrollY + coords.y + rect.top + 'px';
    this.label.style.left = window.scrollX + coords.x + rect.left + 'px';
}

export { Label2D };