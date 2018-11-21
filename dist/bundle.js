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

/***/ "./src/plot/Axes2D.ts":
/*!****************************!*\
  !*** ./src/plot/Axes2D.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Axes2D {
    addFigure(figure) {
        throw new Error("Method not implemented.");
    }
    removeFigure(figure) {
        throw new Error("Method not implemented.");
    }
    refresh() {
        throw new Error("Method not implemented.");
    }
    render() {
        throw new Error("Method not implemented.");
    }
    sleep() {
        throw new Error("Method not implemented.");
    }
    wake() {
        throw new Error("Method not implemented.");
    }
    getPlot() {
        throw new Error("Method not implemented.");
    }
}
exports.Axes2D = Axes2D;


/***/ }),

/***/ "./src/plot/Axes3D.ts":
/*!****************************!*\
  !*** ./src/plot/Axes3D.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Axes3D {
    addFigure(figure) {
        throw new Error("Method not implemented.");
    }
    removeFigure(figure) {
        throw new Error("Method not implemented.");
    }
    refresh() {
        throw new Error("Method not implemented.");
    }
    render() {
        throw new Error("Method not implemented.");
    }
    sleep() {
        throw new Error("Method not implemented.");
    }
    wake() {
        throw new Error("Method not implemented.");
    }
    getPlot() {
        throw new Error("Method not implemented.");
    }
}
exports.Axes3D = Axes3D;


/***/ }),

/***/ "./src/plot/Plot.ts":
/*!**************************!*\
  !*** ./src/plot/Plot.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
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
        throw new Error("Method not implemented.");
    }
    /**
     * Creates a new 2D axes from given arguments
     * @param args
     */
    createAxes3D(args) {
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


/***/ })

/******/ });
//# sourceMappingURL=bundle.js.map