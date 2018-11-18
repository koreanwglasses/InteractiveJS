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

/***/ "./src/expression/Context.ts":
/*!***********************************!*\
  !*** ./src/expression/Context.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents a context in which an expression can be evaluated. Contains variable values, functions, etc.
 */
var Context = /** @class */ (function () {
    /**
     * Creates a new context
     */
    function Context() {
        throw new Error("Method not implemented.");
    }
    /**
     * Defines the specified variable in this context, and assigns its value. Updates the value if variable already exists.
     * @param name Name of the variable to define
     * @param value Value to assign to variable
     */
    Context.prototype.defineVariable = function (name, value) {
        throw new Error("Method not implemented.");
    };
    /**
     * Frees the specified variable (now acts as a free variable
     * @param name Name of the variable to free
     */
    Context.prototype.freeVariable = function (name) {
        throw new Error("Method not implemented.");
    };
    /**
     * Gets the value specified variable. Returns undefined if it is a free variable.
     * @param name Name of variable to get
     */
    Context.prototype.getVariable = function (name) {
        throw new Error("Method not implemented.");
    };
    return Context;
}());
exports.Context = Context;


/***/ }),

/***/ "./src/expression/ExpressionParser.ts":
/*!********************************************!*\
  !*** ./src/expression/ExpressionParser.ts ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Contains factory methods for creating expressions out of strings.
 */
var ExpressionParser = /** @class */ (function () {
    function ExpressionParser() {
    }
    /**
     * Parses the string and returns an Expression.
     * @param string
     */
    ExpressionParser.parseString = function (string) {
        throw new Error("Method not implemented.");
    };
    return ExpressionParser;
}());
exports.ExpressionParser = ExpressionParser;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Context_1 = __webpack_require__(/*! ./expression/Context */ "./src/expression/Context.ts");
exports.Context = Context_1.Context;
var ExpressionParser_1 = __webpack_require__(/*! ./expression/ExpressionParser */ "./src/expression/ExpressionParser.ts");
exports.ExpressionParser = ExpressionParser_1.ExpressionParser;
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
var Axes2D = /** @class */ (function () {
    function Axes2D() {
    }
    Axes2D.prototype.addFigure = function (figure) {
        throw new Error("Method not implemented.");
    };
    Axes2D.prototype.removeFigure = function (figure) {
        throw new Error("Method not implemented.");
    };
    Axes2D.prototype.refresh = function () {
        throw new Error("Method not implemented.");
    };
    Axes2D.prototype.render = function () {
        throw new Error("Method not implemented.");
    };
    Axes2D.prototype.sleep = function () {
        throw new Error("Method not implemented.");
    };
    Axes2D.prototype.wake = function () {
        throw new Error("Method not implemented.");
    };
    Axes2D.prototype.getPlot = function () {
        throw new Error("Method not implemented.");
    };
    return Axes2D;
}());
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
var Axes3D = /** @class */ (function () {
    function Axes3D() {
    }
    Axes3D.prototype.addFigure = function (figure) {
        throw new Error("Method not implemented.");
    };
    Axes3D.prototype.removeFigure = function (figure) {
        throw new Error("Method not implemented.");
    };
    Axes3D.prototype.refresh = function () {
        throw new Error("Method not implemented.");
    };
    Axes3D.prototype.render = function () {
        throw new Error("Method not implemented.");
    };
    Axes3D.prototype.sleep = function () {
        throw new Error("Method not implemented.");
    };
    Axes3D.prototype.wake = function () {
        throw new Error("Method not implemented.");
    };
    Axes3D.prototype.getPlot = function () {
        throw new Error("Method not implemented.");
    };
    return Axes3D;
}());
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
var Plot = /** @class */ (function () {
    function Plot() {
    }
    /**
     * Creates a new 2D axes from given arguments
     * @param args
     */
    Plot.prototype.createAxes2D = function (args) {
        throw new Error("Method not implemented.");
    };
    /**
     * Creates a new 2D axes from given arguments
     * @param args
     */
    Plot.prototype.createAxes3D = function (args) {
        throw new Error("Method not implemented.");
    };
    /**
     * Removes the axes if it is present.
     * @param axes
     * @returns true is axes was removed. false if it did not exist.
     */
    Plot.prototype.dropAxes = function (axes) {
        throw new Error("Method not implemented.");
    };
    /**
     * Disposes all GL contexts hosted by this plot
     */
    Plot.prototype.sleep = function () {
        throw new Error("Method not implemented.");
    };
    /**
     * Re-instances the GL contexts
     */
    Plot.prototype.wake = function () {
        throw new Error("Method not implemented.");
    };
    /**
     * Adds specified axes to graph.
     * @param axes
     */
    Plot.prototype.addAxes = function (axes) {
        throw new Error("Method not implemented.");
    };
    return Plot;
}());
exports.Plot = Plot;


/***/ })

/******/ });
//# sourceMappingURL=bundle.js.map