import { Figure3D } from './Figure3D.js';

function Plot() {
    this.type = 'Plot';
    var _figures = [];

    this.createFigure3D = function(container, opts) {
        return new Figure3D(this, container, opts);
    };
}

export { Plot };