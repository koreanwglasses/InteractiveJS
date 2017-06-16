import { Figure3D } from './Figure3D.js';

function Plot() {
    this.type = 'Plot';
    var _figures = [];
    var _cameraData = {};

    this.createFigure3D = function(container, opts) {
        return new Figure3D(this, container, opts);
    };

    this.getCameraData = function(cameraGroup) {
        return this.cameras[cameraGroup];
    };
}

export { Plot };