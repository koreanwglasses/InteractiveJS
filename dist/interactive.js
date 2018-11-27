var Interactive =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Axes2D_1 = __webpack_require__(/*! ./plot/Axes2D */ "./src/plot/Axes2D.ts");
exports.Axes2D = Axes2D_1.Axes2D;
var Axes3D_1 = __webpack_require__(/*! ./plot/Axes3D */ "./src/plot/Axes3D.ts");
exports.Axes3D = Axes3D_1.Axes3D;
var Plot_1 = __webpack_require__(/*! ./plot/Plot */ "./src/plot/Plot.ts");
exports.Plot = Plot_1.Plot;


/***/ }),

/***/ "./src/plot/Axes.ts":
/*!**************************!*\
  !*** ./src/plot/Axes.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Plot_1 = __webpack_require__(/*! ./Plot */ "./src/plot/Plot.ts");
const THREE = __webpack_require__(/*! three */ "three");
/**
* Used for plotting. Can put multiple figures on axes.
*/
class Axes {
    /**
    * Creates a new Axes from given args. Throws an error if args are invalid.
    */
    constructor(args) {
        args.validate();
        args.default();
        this.plot = args.plot;
        this.container = args.container;
        this.width = args.width;
        this.height = args.height;
        this.antialias = args.antialias;
        this.renderer = null;
        this.scene = new THREE.Scene();
        this.figures = new Set();
        this.meshMap = new Map();
    }
    /**
    * Adds the figure to this plot, if its not already there. Will be drawn on next call to render().
    * @param figure Figure to add to plot
    * @returns true if figure was not already present in this axes. false otherwise.
    */
    addFigure(figure) {
        if (this.figures.has(figure)) {
            return false;
        }
        else {
            this.figures.add(figure);
            this.meshMap.set(figure, null);
            return true;
        }
    }
    /**
    * Removes the figure from this plot, if it exists. Will be erased on next call to render()
    * @param figure Figure to remove from plot
    * @returns true if figure was removed. false if it did not exist
    */
    removeFigure(figure) {
        if (!this.figures.has(figure)) {
            return false;
        }
        else {
            this.figures.delete(figure);
            this.meshMap.delete(figure);
            return true;
        }
    }
    /**
    * Forces a figure to recalculate its scene model.
    * @param figure Figure to refresh
    */
    refresh(figure) {
        let mesh = this.meshMap.get(figure);
        if (mesh != null) {
            this.scene.remove(mesh);
        }
        this.meshMap.set(figure, null);
    }
    /**
    * Forces all figures to recalculate their scene models
    */
    refreshAll() {
        for (let figure of this.figures) {
            this.refresh(figure);
        }
    }
    /**
    * Draws all figures. Does nothing if the Axes is asleep
    */
    render() {
        // If sleeping, do nothing
        if (this.renderer == null) {
            return;
        }
        this.recalculate();
        this.renderer.render(this.scene, this.getCamera(), this.container);
    }
    /**
    * Removes the GL context from the page to conserve memory.
    */
    sleep() {
        if (this.renderer != null) {
            this.renderer.forceContextLoss();
            this.renderer.context = null;
            this.renderer.domElement = null;
            this.renderer = null;
        }
    }
    /**
    * Restores the GL context.
    */
    wake() {
        if (this.renderer == null) {
            this.renderer = new THREE.WebGLRenderer({ antialias: this.antialias });
            // Initialize renderer within container
            this.renderer.setSize(this.width, this.height);
            this.container.innerHTML = '';
            this.container.appendChild(this.renderer.domElement);
        }
    }
    /**
    * Returns the plot that this axes is created on
    */
    getPlot() {
        return this.plot;
    }
    /**
     * Returns the HTMLELement that this axes is rendered into
     */
    getContainer() {
        return this.container;
    }
    getRenderer() {
        return this.renderer;
    }
    getScene() {
        return this.scene;
    }
    /**
    * Recalculates the mesh for figures whose mesh have not been calculated,
    * and adds them to the scene
    */
    recalculate() {
        for (let figure of this.figures) {
            let mesh = this.meshMap.get(figure);
            if (mesh == null) {
                mesh = figure.getSceneObject();
                this.meshMap.set(figure, mesh);
                this.scene.add(mesh);
            }
        }
    }
}
exports.Axes = Axes;
/**
* Arguments to use in the creation of Axes. Does not represent an ADT; is more
* of a JS Object with more security.
*/
class AxesArgs {
    constructor(args) {
        this.plot = args.plot;
        this.container = args.container;
    }
    /**
    * Checks if arguments are valid. Returns true if valid. Throws error if not.
    */
    validate() {
        if (!this.plot) {
            throw new Error("Invalid arguments: Parent plot not defined!");
        }
        if (!(this.plot instanceof Plot_1.Plot)) {
            throw new Error("Invalid arguments: Parent plot is not an instance of Plot!");
        }
        if (!this.container) {
            throw new Error("Invalid arguments: container (HTMLElement) not defined!");
        }
        if (!(this.container instanceof HTMLElement)) {
            throw new Error("Invalid arguments: container is not an instance of HTMLElement!");
        }
        return true;
    }
    /**
    * Fills in default values for undefined properties
    */
    default() {
        if (this.width === undefined) {
            this.width = this.container.clientWidth;
        }
        if (this.height === undefined) {
            this.height = this.container.clientHeight;
        }
        if (this.antialias === undefined) {
            this.antialias = false;
        }
    }
}
exports.AxesArgs = AxesArgs;


/***/ }),

/***/ "./src/plot/Axes2D.ts":
/*!****************************!*\
  !*** ./src/plot/Axes2D.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Axes_1 = __webpack_require__(/*! ./Axes */ "./src/plot/Axes.ts");
const THREE = __webpack_require__(/*! three */ "three");
class Axes2D extends Axes_1.Axes {
    constructor(args) {
        super(args);
        this.camera = new THREE.OrthographicCamera(args.left, args.right, args.top, args.bottom);
    }
    getCamera() {
        return this.camera;
    }
}
exports.Axes2D = Axes2D;
class Axes2DArgs extends Axes_1.AxesArgs {
    constructor(args) {
        super(args);
        this.left = args.left;
        this.right = args.right;
        this.top = args.top;
        this.bottom = args.bottom;
    }
    validate() {
        super.validate();
        if (this.right != undefined && this.left !== undefined && this.right - this.left <= 0) {
            throw new Error("Invalid arguments: left >= right.");
        }
        if (this.top != undefined && this.bottom !== undefined && this.top - this.bottom <= 0) {
            throw new Error("Invalid arguments: top <= bottom.");
        }
        return true;
    }
    default() {
        super.default();
        if (this.left === undefined) {
            this.left = -10;
        }
        if (this.right === undefined) {
            this.right = 10;
        }
        if (this.top === undefined) {
            this.top = 10;
        }
        if (this.bottom === undefined) {
            this.bottom = -10;
        }
    }
}
exports.Axes2DArgs = Axes2DArgs;


/***/ }),

/***/ "./src/plot/Axes3D.ts":
/*!****************************!*\
  !*** ./src/plot/Axes3D.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Axes_1 = __webpack_require__(/*! ./Axes */ "./src/plot/Axes.ts");
const THREE = __webpack_require__(/*! three */ "three");
class Axes3D extends Axes_1.Axes {
    constructor(args) {
        super(args);
        this.camera = new THREE.PerspectiveCamera();
    }
    getCamera() {
        throw new Error("Method not implemented.");
    }
}
exports.Axes3D = Axes3D;
class Axes3DArgs extends Axes_1.AxesArgs {
}
exports.Axes3DArgs = Axes3DArgs;


/***/ }),

/***/ "./src/plot/Plot.ts":
/*!**************************!*\
  !*** ./src/plot/Plot.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Axes2D_1 = __webpack_require__(/*! ./Axes2D */ "./src/plot/Axes2D.ts");
const Axes3D_1 = __webpack_require__(/*! ./Axes3D */ "./src/plot/Axes3D.ts");
/**
 * A controller for a plot. Can contain several axes, which can in turn contain
 * several figures. Each plot contains its own context on which expression are
 * evaluates/executed
 */
class Plot {
    /**
     * Creates a new 2D axes from given arguments
     * @param args
     */
    createAxes2D(args) {
        let axesArgs = new Axes2D_1.Axes2DArgs(args);
        axesArgs.plot = this;
        throw new Error("Method not implemented.");
    }
    /**
     * Creates a new 2D axes from given arguments
     * @param args
     */
    createAxes3D(args) {
        let axesArgs = new Axes3D_1.Axes3DArgs(args);
        axesArgs.plot = this;
        throw new Error("Method not implemented.");
    }
    /**
     * Removes the axes if it is present.
     * @param axes
     * @returns true is axes was removed. false if it did not exist.
     */
    dropAxes(axes) {
        throw new Error("Method not implemented.");
    }
    /**
     * Disposes all GL contexts hosted by this plot
     */
    sleep() {
        throw new Error("Method not implemented.");
    }
    /**
     * Re-instances the GL contexts
     */
    wake() {
        throw new Error("Method not implemented.");
    }
    /**
     * Adds specified axes to graph.
     * @param axes
     */
    addAxes(axes) {
        throw new Error("Method not implemented.");
    }
}
exports.Plot = Plot;


/***/ }),

/***/ "three":
/*!************************!*\
  !*** external "THREE" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = THREE;

/***/ })

/******/ });
//# sourceMappingURL=interactive.js.map