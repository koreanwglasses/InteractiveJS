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

/***/ "./node_modules/three.meshline/src/THREE.MeshLine.js":
/*!***********************************************************!*\
  !*** ./node_modules/three.meshline/src/THREE.MeshLine.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

;(function() {

"use strict";

var root = this

var has_require = "function" !== 'undefined'

var THREE = root.THREE || has_require && __webpack_require__(/*! three */ "three")
if( !THREE )
	throw new Error( 'MeshLine requires three.js' )

function MeshLine() {

	this.positions = [];
	this.colors = [];

	this.previous = [];
	this.next = [];
	this.side = [];
	this.width = [];
	this.indices_array = [];
	this.uvs = [];
	this.counters = [];
	this.geometry = new THREE.BufferGeometry();

	this.widthCallback = null;

}

MeshLine.prototype.setGeometry = function( g, c ) {

	this.widthCallback = c;

	this.positions = [];
	this.counters = [];

	if( g instanceof THREE.Geometry ) {
		for( var j = 0; j < g.vertices.length; j++ ) {
			var v = g.vertices[ j ];
			var c = j/g.vertices.length;
			this.positions.push( v.x, v.y, v.z );
			this.positions.push( v.x, v.y, v.z );
			this.colors.push( 0, 0, 0, 0 );
			this.colors.push( 0, 0, 0, 0 );
			this.counters.push(c);
			this.counters.push(c);
		}
	}

	if( g instanceof THREE.BufferGeometry ) {
		var verts = g.getAttribute('position').array;
		var colors = g.getAttribute('color').array;

		for( var j = 0; j*3 < verts.length; j += 1 ) {
			var c = j*3/verts.length;
			this.positions.push( verts[ j*3 ], verts[ j*3 + 1 ], verts[ j*3 + 2 ] );
			this.positions.push( verts[ j*3 ], verts[ j*3 + 1 ], verts[ j*3 + 2 ] );
			this.colors.push( colors[ j*4 ], colors[ j*4 + 1 ], colors[ j*4 + 2 ], colors[ j*4 + 3 ] );
			this.colors.push( colors[ j*4 ], colors[ j*4 + 1 ], colors[ j*4 + 2 ], colors[ j*4 + 3 ] );
			this.counters.push(c);
			this.counters.push(c);
		}
	}

	if( g instanceof Float32Array || g instanceof Array ) {
		for( var j = 0; j < g.length; j += 3 ) {
			var c = j/g.length;
			this.positions.push( g[ j ], g[ j + 1 ], g[ j + 2 ] );
			this.positions.push( g[ j ], g[ j + 1 ], g[ j + 2 ] );
			this.colors.push( 0, 0, 0, 0 );
			this.colors.push( 0, 0, 0, 0 );
			this.counters.push(c);
			this.counters.push(c);
		}
	}

	this.process();

}

MeshLine.prototype.compareV3 = function( a, b ) {

	var aa = a * 6;
	var ab = b * 6;
	return ( this.positions[ aa ] === this.positions[ ab ] ) && ( this.positions[ aa + 1 ] === this.positions[ ab + 1 ] ) && ( this.positions[ aa + 2 ] === this.positions[ ab + 2 ] );

}

MeshLine.prototype.copyV3 = function( a ) {

	var aa = a * 6;
	return [ this.positions[ aa ], this.positions[ aa + 1 ], this.positions[ aa + 2 ] ];

}

MeshLine.prototype.process = function() {

	var l = this.positions.length / 6;

	this.previous = [];
	this.next = [];
	this.side = [];
	this.width = [];
	this.indices_array = [];
	this.uvs = [];

	for( var j = 0; j < l; j++ ) {
		this.side.push( 1 );
		this.side.push( -1 );
	}

	var w;
	for( var j = 0; j < l; j++ ) {
		if( this.widthCallback ) w = this.widthCallback( j / ( l -1 ) );
		else w = 1;
		this.width.push( w );
		this.width.push( w );
	}

	for( var j = 0; j < l; j++ ) {
		this.uvs.push( j / ( l - 1 ), 0 );
		this.uvs.push( j / ( l - 1 ), 1 );
	}

	var v;

	if( this.compareV3( 0, l - 1 ) ){
		v = this.copyV3( l - 2 );
	} else {
		v = this.copyV3( 0 );
	}
	this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );
	this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );
	for( var j = 0; j < l - 1; j++ ) {
		v = this.copyV3( j );
		this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );
		this.previous.push( v[ 0 ], v[ 1 ], v[ 2 ] );
	}

	for( var j = 1; j < l; j++ ) {
		v = this.copyV3( j );
		this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );
		this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );
	}

	if( this.compareV3( l - 1, 0 ) ){
		v = this.copyV3( 1 );
	} else {
		v = this.copyV3( l - 1 );
	}
	this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );
	this.next.push( v[ 0 ], v[ 1 ], v[ 2 ] );

	for( var j = 0; j < l - 1; j++ ) {
		var n = j * 2;
		this.indices_array.push( n, n + 1, n + 2 );
		this.indices_array.push( n + 2, n + 1, n + 3 );
	}

	if (!this.attributes) {
		this.attributes = {
			position: new THREE.BufferAttribute( new Float32Array( this.positions ), 3 ),
			color: new THREE.BufferAttribute(new Float32Array( this.colors ), 4 ),
			previous: new THREE.BufferAttribute( new Float32Array( this.previous ), 3 ),
			next: new THREE.BufferAttribute( new Float32Array( this.next ), 3 ),
			side: new THREE.BufferAttribute( new Float32Array( this.side ), 1 ),
			width: new THREE.BufferAttribute( new Float32Array( this.width ), 1 ),
			uv: new THREE.BufferAttribute( new Float32Array( this.uvs ), 2 ),
			index: new THREE.BufferAttribute( new Uint16Array( this.indices_array ), 1 ),
			counters: new THREE.BufferAttribute( new Float32Array( this.counters ), 1 )
		}
	} else {
		this.attributes.position.copyArray(new Float32Array(this.positions));
		this.attributes.position.needsUpdate = true;
		this.attributes.color.copyArray(new Float32Array(this.colors));
		this.attributes.color.needsUpdate = true;
		this.attributes.previous.copyArray(new Float32Array(this.previous));
		this.attributes.previous.needsUpdate = true;
		this.attributes.next.copyArray(new Float32Array(this.next));
		this.attributes.next.needsUpdate = true;
		this.attributes.side.copyArray(new Float32Array(this.side));
		this.attributes.side.needsUpdate = true;
		this.attributes.width.copyArray(new Float32Array(this.width));
		this.attributes.width.needsUpdate = true;
		this.attributes.uv.copyArray(new Float32Array(this.uvs));
		this.attributes.uv.needsUpdate = true;
		this.attributes.index.copyArray(new Uint16Array(this.indices_array));
		this.attributes.index.needsUpdate = true;
    }

	this.geometry.addAttribute( 'position', this.attributes.position );
	this.geometry.addAttribute( 'color', this.attributes.color );
	this.geometry.addAttribute( 'previous', this.attributes.previous );
	this.geometry.addAttribute( 'next', this.attributes.next );
	this.geometry.addAttribute( 'side', this.attributes.side );
	this.geometry.addAttribute( 'width', this.attributes.width );
	this.geometry.addAttribute( 'uv', this.attributes.uv );
	this.geometry.addAttribute( 'counters', this.attributes.counters );

	this.geometry.setIndex( this.attributes.index );

}

function memcpy (src, srcOffset, dst, dstOffset, length) {
	var i

	src = src.subarray || src.slice ? src : src.buffer
	dst = dst.subarray || dst.slice ? dst : dst.buffer

	src = srcOffset ? src.subarray ?
	src.subarray(srcOffset, length && srcOffset + length) :
	src.slice(srcOffset, length && srcOffset + length) : src

	if (dst.set) {
		dst.set(src, dstOffset)
	} else {
		for (i=0; i<src.length; i++) {
			dst[i + dstOffset] = src[i]
		}
	}

	return dst
}

/**
 * Fast method to advance the line by one position.  The oldest position is removed.
 * @param position
 */
MeshLine.prototype.advance = function(position) {

	var positions = this.attributes.position.array;
	var previous = this.attributes.previous.array;
	var next = this.attributes.next.array;
	var l = positions.length;

	// PREVIOUS
	memcpy( positions, 0, previous, 0, l );

	// POSITIONS
	memcpy( positions, 6, positions, 0, l - 6 );

	positions[l - 6] = position.x;
	positions[l - 5] = position.y;
	positions[l - 4] = position.z;
	positions[l - 3] = position.x;
	positions[l - 2] = position.y;
	positions[l - 1] = position.z;

    // NEXT
	memcpy( positions, 6, next, 0, l - 6 );

	next[l - 6]  = position.x;
	next[l - 5]  = position.y;
	next[l - 4]  = position.z;
	next[l - 3]  = position.x;
	next[l - 2]  = position.y;
	next[l - 1]  = position.z;

	this.attributes.position.needsUpdate = true;
	this.attributes.previous.needsUpdate = true;
	this.attributes.next.needsUpdate = true;

};

function MeshLineMaterial( parameters ) {

	var vertexShaderSource = [
'precision highp float;',
'',
'attribute vec3 position;',
'attribute vec4 color;',
'attribute vec3 previous;',
'attribute vec3 next;',
'attribute float side;',
'attribute float width;',
'attribute vec2 uv;',
'attribute float counters;',
'',
'uniform mat4 projectionMatrix;',
'uniform mat4 modelViewMatrix;',
'uniform vec2 resolution;',
'uniform float lineWidth;',
'uniform float useGlobalColor;',
'uniform vec3 gcolor;',
'uniform float gopacity;',
'uniform float near;',
'uniform float far;',
'uniform float sizeAttenuation;',
'',
'varying vec2 vUV;',
'varying vec4 vColor;',
'varying float vCounters;',
'',
'vec2 fix( vec4 i, float aspect ) {',
'',
'    vec2 res = i.xy / i.w;',
'    res.x *= aspect;',
'	 vCounters = counters;',
'    return res;',
'',
'}',
'',
'void main() {',
'',
'    float aspect = resolution.x / resolution.y;',
'	 float pixelWidthRatio = 1. / (resolution.x * projectionMatrix[0][0]);',
'',
'    if(useGlobalColor == 1.0) {',
'        vColor = vec4( gcolor, gopacity );',
'    } else {',
'        vColor = color;',
'    }',
'',
'    vUV = uv;',
'',
'    mat4 m = projectionMatrix * modelViewMatrix;',
'    vec4 finalPosition = m * vec4( position, 1.0 );',
'    vec4 prevPos = m * vec4( previous, 1.0 );',
'    vec4 nextPos = m * vec4( next, 1.0 );',
'',
'    vec2 currentP = fix( finalPosition, aspect );',
'    vec2 prevP = fix( prevPos, aspect );',
'    vec2 nextP = fix( nextPos, aspect );',
'',
'	 float pixelWidth = finalPosition.w * pixelWidthRatio;',
'    float w = 1.8 * pixelWidth * lineWidth * width;',
'',
'    if( sizeAttenuation == 1. ) {',
'        w = 1.8 * lineWidth * width;',
'    }',
'',
'    vec2 dir;',
'    if( nextP == currentP ) dir = normalize( currentP - prevP );',
'    else if( prevP == currentP ) dir = normalize( nextP - currentP );',
'    else {',
'        vec2 dir1 = normalize( currentP - prevP );',
'        vec2 dir2 = normalize( nextP - currentP );',
'        dir = normalize( dir1 + dir2 );',
'',
'        vec2 perp = vec2( -dir1.y, dir1.x );',
'        vec2 miter = vec2( -dir.y, dir.x );',
'        //w = clamp( w / dot( miter, perp ), 0., 4. * lineWidth * width );',
'',
'    }',
'',
'    //vec2 normal = ( cross( vec3( dir, 0. ), vec3( 0., 0., 1. ) ) ).xy;',
'    vec2 normal = vec2( -dir.y, dir.x );',
'    normal.x /= aspect;',
'    normal *= .5 * w;',
'',
'    vec4 offset = vec4( normal * side, 0.0, 1.0 );',
'    finalPosition.xy += offset.xy;',
'',
'    gl_Position = finalPosition;',
'',
'}' ];

	var fragmentShaderSource = [
		'#extension GL_OES_standard_derivatives : enable',
'precision mediump float;',
'',
'uniform sampler2D map;',
'uniform sampler2D alphaMap;',
'uniform float useMap;',
'uniform float useAlphaMap;',
'uniform float useDash;',
'uniform float dashArray;',
'uniform float dashOffset;',
'uniform float dashRatio;',
'uniform float visibility;',
'uniform float alphaTest;',
'uniform vec2 repeat;',
'',
'varying vec2 vUV;',
'varying vec4 vColor;',
'varying float vCounters;',
'',
'void main() {',
'',
'    vec4 c = vColor;',
'    if( useMap == 1. ) c *= texture2D( map, vUV * repeat );',
'    if( useAlphaMap == 1. ) c.a *= texture2D( alphaMap, vUV * repeat ).a;',
'    if( c.a < alphaTest ) discard;',
'    if( useDash == 1. ){',
'        c.a *= ceil(mod(vCounters + dashOffset, dashArray) - (dashArray * dashRatio));',
'    }',
'    gl_FragColor = c;',
'    gl_FragColor.a *= step(vCounters, visibility);',
'}' ];

	function check( v, d ) {
		if( v === undefined ) return d;
		return v;
	}

	THREE.Material.call( this );

	parameters = parameters || {};

	this.lineWidth = check( parameters.lineWidth, 1 );
	this.map = check( parameters.map, null );
	this.useMap = check( parameters.useMap, 0 );
	this.alphaMap = check( parameters.alphaMap, null );
	this.useAlphaMap = check( parameters.useAlphaMap, 0 );
	this.useGlobalColor = check( parameters.useGlobalColor, 1 );
	this.color = check( parameters.color, new THREE.Color( 0xffffff ) );
	this.opacity = check( parameters.opacity, 1 );
	this.resolution = check( parameters.resolution, new THREE.Vector2( 1, 1 ) );
	this.sizeAttenuation = check( parameters.sizeAttenuation, 1 );
	this.near = check( parameters.near, 1 );
	this.far = check( parameters.far, 1 );
	this.dashArray = check( parameters.dashArray, 0 );
	this.dashOffset = check( parameters.dashOffset, 0 );
	this.dashRatio = check( parameters.dashRatio, 0.5 );
	this.useDash = ( this.dashArray !== 0 ) ? 1 : 0;
	this.visibility = check( parameters.visibility, 1 );
	this.alphaTest = check( parameters.alphaTest, 0 );
	this.repeat = check( parameters.repeat, new THREE.Vector2( 1, 1 ) );

	var material = new THREE.RawShaderMaterial( {
		uniforms:{
			lineWidth: { type: 'f', value: this.lineWidth },
			map: { type: 't', value: this.map },
			useMap: { type: 'f', value: this.useMap },
			alphaMap: { type: 't', value: this.alphaMap },
			useAlphaMap: { type: 'f', value: this.useAlphaMap },
			useGlobalColor: {type: 'f', value: this.useGlobalColor },
			gcolor: { type: 'c', value: this.color },
			gopacity: { type: 'f', value: this.opacity },
			resolution: { type: 'v2', value: this.resolution },
			sizeAttenuation: { type: 'f', value: this.sizeAttenuation },
			near: { type: 'f', value: this.near },
			far: { type: 'f', value: this.far },
			dashArray: { type: 'f', value: this.dashArray },
			dashOffset: { type: 'f', value: this.dashOffset },
			dashRatio: { type: 'f', value: this.dashRatio },
			useDash: { type: 'f', value: this.useDash },
			visibility: {type: 'f', value: this.visibility},
			alphaTest: {type: 'f', value: this.alphaTest},
			repeat: { type: 'v2', value: this.repeat }
		},
		vertexShader: vertexShaderSource.join( '\r\n' ),
		fragmentShader: fragmentShaderSource.join( '\r\n' )
	});

	delete parameters.lineWidth;
	delete parameters.map;
	delete parameters.useMap;
	delete parameters.alphaMap;
	delete parameters.useAlphaMap;
	delete parameters.useGlobalColor;
	delete parameters.color;
	delete parameters.opacity;
	delete parameters.resolution;
	delete parameters.sizeAttenuation;
	delete parameters.near;
	delete parameters.far;
	delete parameters.dashArray;
	delete parameters.dashOffset;
	delete parameters.dashRatio;
	delete parameters.visibility;
	delete parameters.alphaTest;
	delete parameters.repeat;

	material.type = 'MeshLineMaterial';

	material.setValues( parameters );

	return material;

};

MeshLineMaterial.prototype = Object.create( THREE.Material.prototype );
MeshLineMaterial.prototype.constructor = MeshLineMaterial;

MeshLineMaterial.prototype.copy = function ( source ) {

	THREE.Material.prototype.copy.call( this, source );

	this.lineWidth = source.lineWidth;
	this.map = source.map;
	this.useMap = source.useMap;
	this.alphaMap = source.alphaMap;
	this.useAlphaMap = source.useAlphaMap;
	this.useGlobalColor = check( parameters.useGlobalColor, 1);
	this.color.copy( source.color );
	this.opacity = source.opacity;
	this.resolution.copy( source.resolution );
	this.sizeAttenuation = source.sizeAttenuation;
	this.near = source.near;
	this.far = source.far;
	this.dashArray.copy( source.dashArray );
	this.dashOffset.copy( source.dashOffset );
	this.dashRatio.copy( source.dashRatio );
	this.useDash = source.useDash;
	this.visibility = source.visibility;
	this.alphaTest = source.alphaTest;
	this.repeat.copy( source.repeat );

	return this;

};

if( true ) {
	if(  true && module.exports ) {
		exports = module.exports = { MeshLine: MeshLine, MeshLineMaterial: MeshLineMaterial };
	}
	exports.MeshLine = MeshLine;
	exports.MeshLineMaterial = MeshLineMaterial;
}
else {}

}).call(this);


/***/ }),

/***/ "./src/core/Axes.ts":
/*!**************************!*\
  !*** ./src/core/Axes.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const internal_1 = __webpack_require__(/*! ./internal */ "./src/core/internal.ts");
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
        this.objMap = new Map();
        this.skip = new Set();
        this.wake();
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
            this.objMap.set(figure, null);
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
            this.objMap.delete(figure);
            return true;
        }
    }
    /**
    * Forces a figure to recalculate its scene model.
    * @param figure Figure to refresh
    */
    refresh(figure) {
        let mesh = this.objMap.get(figure);
        if (mesh != null) {
            this.scene.remove(mesh);
        }
        this.objMap.set(figure, null);
        this.skip.delete(figure);
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
        this.renderer.render(this.scene, this.getCamera());
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
    * Restores/creates the GL context.
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
    /**
    * @returns Returns whether or not this axes is sleeping
    */
    isSleeping() {
        return this.renderer == null;
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
            let mesh = this.objMap.get(figure);
            if (mesh == null && !this.skip.has(figure)) {
                let success = true;
                try {
                    mesh = figure.getSceneObject(this.plot.getScope());
                }
                catch (e) {
                    success = false;
                    console.error(e);
                    console.warn('Figure not rendered!');
                    this.skip.add(figure);
                }
                if (success) {
                    this.objMap.set(figure, mesh);
                    this.scene.add(mesh);
                }
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
        if (!(this.plot instanceof internal_1.Plot)) {
            throw new Error("Invalid arguments: Parent plot is not an instance of Plot!");
        }
        if (!this.container) {
            throw new Error("Invalid arguments: container (HTMLElement) not defined!");
        }
        if (!(this.container instanceof HTMLElement)) {
            throw new Error("Invalid arguments: container is not an instance of HTMLElement!");
        }
        if (this.width === undefined && this.container.clientWidth == 0) {
            throw new Error("Invalid arguments: container has client width 0!");
        }
        if (this.height === undefined && this.container.clientHeight == 0) {
            throw new Error("Invalid arguments: container has client height 0!");
        }
        if (this.width !== undefined && this.width <= 0) {
            throw new Error("Invalid arguments: width <= 0!");
        }
        if (this.height !== undefined && this.height <= 0) {
            throw new Error("Invalid arguments: height <= 0!");
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

/***/ "./src/core/Axes2D.ts":
/*!****************************!*\
  !*** ./src/core/Axes2D.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const internal_1 = __webpack_require__(/*! ./internal */ "./src/core/internal.ts");
const THREE = __webpack_require__(/*! three */ "three");
/**
 * An axes where 2D elementds can be plotted.
 *
 * Controls:
 * -    Left click and drag to pan
 */
class Axes2D extends internal_1.Axes {
    constructor(args) {
        super(args);
        this.camera = new THREE.OrthographicCamera(args.left, args.right, args.top, args.bottom, 0, 20);
        this.camera.position.z = 10;
        this.camera.lookAt(this.getScene().position);
        this.left = args.left;
        this.right = args.right;
        this.top = args.top;
        this.bottom = args.bottom;
        let self_ = this;
        let clientPosStart = null;
        let cameraPosStart = null;
        let onPanStart = function (clientX, clientY) {
            clientPosStart = [clientX, clientY];
            cameraPosStart = self_.camera.position.clone();
        };
        let onPan = function (clientX, clientY) {
            let clientBounds = self_.getContainer().getBoundingClientRect();
            let clientDiff = [clientX - clientPosStart[0], clientY - clientPosStart[1]];
            let cameraDim = [self_.right - self_.left, self_.top - self_.bottom];
            let cameraDiff = [clientDiff[0] / clientBounds.width * cameraDim[0], clientDiff[1] / clientBounds.height * cameraDim[1]];
            self_.camera.position.x = cameraPosStart.x - cameraDiff[0];
            self_.camera.position.y = cameraPosStart.y + cameraDiff[1];
            self_.camera.updateMatrix();
        };
        let onPanEnd = function (clientX, clientY) {
            clientPosStart = null;
            cameraPosStart = null;
        };
        this.getContainer().addEventListener('mousedown', (e) => {
            if (e.buttons & 1) {
                onPanStart(e.clientX, e.clientY);
            }
        });
        this.getContainer().addEventListener('mousemove', (e) => {
            if (e.buttons & 1) {
                onPan(e.clientX, e.clientY);
            }
        });
        this.getContainer().addEventListener('mouseup', (e) => {
            if (e.buttons & 1) {
                onPanEnd(e.clientX, e.clientY);
            }
        });
    }
    getCamera() {
        return this.camera;
    }
}
exports.Axes2D = Axes2D;
class Axes2DArgs extends internal_1.AxesArgs {
    constructor(args) {
        super(args);
        this.left = args.left;
        this.right = args.right;
        this.top = args.top;
        this.bottom = args.bottom;
    }
    validate() {
        super.validate();
        if (this.right !== undefined && this.left !== undefined && this.right - this.left <= 0) {
            throw new Error("Invalid arguments: left >= right.");
        }
        if (this.top !== undefined && this.bottom !== undefined && this.top - this.bottom <= 0) {
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

/***/ "./src/core/Axes3D.ts":
/*!****************************!*\
  !*** ./src/core/Axes3D.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const internal_1 = __webpack_require__(/*! ./internal */ "./src/core/internal.ts");
const THREE = __webpack_require__(/*! three */ "three");
class Axes3D extends internal_1.Axes {
    constructor(args) {
        super(args);
        this.camera = new THREE.PerspectiveCamera();
    }
    getCamera() {
        throw new Error("Method not implemented.");
    }
}
exports.Axes3D = Axes3D;
class Axes3DArgs extends internal_1.AxesArgs {
}
exports.Axes3DArgs = Axes3DArgs;


/***/ }),

/***/ "./src/core/Plot.ts":
/*!**************************!*\
  !*** ./src/core/Plot.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const internal_1 = __webpack_require__(/*! ./internal */ "./src/core/internal.ts");
const math = __webpack_require__(/*! mathjs */ "mathjs");
/**
 * A controller for a plot. Can contain several axes, which can in turn contain
 * several figures. Each plot contains its own context on which expression are
 * evaluates/executed
 */
class Plot {
    constructor() {
        this.axes = new Set();
        this.scope = {};
    }
    /**
     * Creates a new 2D axes from given arguments
     * @param args
     */
    createAxes2D(args) {
        let axesArgs = new internal_1.Axes2DArgs(args);
        axesArgs.plot = this;
        let newAxes = new internal_1.Axes2D(axesArgs);
        this.addAxes(newAxes);
        return newAxes;
    }
    /**
     * Creates a new 2D axes from given arguments
     * @param args
     */
    createAxes3D(args) {
        let axesArgs = new internal_1.Axes3DArgs(args);
        axesArgs.plot = this;
        throw new Error("Method not implemented.");
    }
    /**
     * Removes the axes if it is present.
     * @param axes
     * @returns true is axes was removed. false if it did not exist.
     */
    dropAxes(axes) {
        return this.axes.delete(axes);
    }
    /**
     * Renders all axes that are awake
     */
    render() {
        for (let ax of this.axes) {
            if (!ax.isSleeping()) {
                ax.render();
            }
        }
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
     * Executes an expression
     */
    execExpression(expr) {
        math.eval(expr, this.scope);
    }
    /**
     * Returns the scope used in evaluating expresions. Due to limitations on
     * how Javascript copies objects, it just returns a shallow copy.
     */
    getScope() {
        return Object.create(this.scope);
    }
    /**
     * Adds specified axes to graph.
     * @param axes
     */
    addAxes(axes) {
        this.axes.add(axes);
    }
}
exports.Plot = Plot;


/***/ }),

/***/ "./src/core/internal.ts":
/*!******************************!*\
  !*** ./src/core/internal.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
// Makes sure modules load in the correct order 
__export(__webpack_require__(/*! ./Axes */ "./src/core/Axes.ts"));
__export(__webpack_require__(/*! ./Axes2D */ "./src/core/Axes2D.ts"));
__export(__webpack_require__(/*! ./Axes3D */ "./src/core/Axes3D.ts"));
__export(__webpack_require__(/*! ./Plot */ "./src/core/Plot.ts"));


/***/ }),

/***/ "./src/figures/Arrow2D.ts":
/*!********************************!*\
  !*** ./src/figures/Arrow2D.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = __webpack_require__(/*! three */ "three");
const math = __webpack_require__(/*! mathjs */ "mathjs");
class Arrow2D {
    constructor(args) {
        let args2 = new Arrow2DArgs(args);
        args2.validate();
        args2.defaults();
        this.startFun = math.parse(args2.start).compile();
        this.endFun = math.parse(args2.end).compile();
        this.hex = args2.hex;
        this.headLength = args2.headLength;
        this.headWidth = args2.headWidth;
    }
    getSceneObject(scope) {
        let end = this.endFun.eval(scope);
        if (math.typeof(end) != 'Matrix') {
            throw new Error('End expression does not evaluate to a vector (Matrix)!');
        }
        let endVec = new three_1.Vector3(end._data[0], end._data[1], 0);
        let start = this.startFun.eval(scope);
        if (math.typeof(start) != 'Matrix') {
            throw new Error('Start expression does not evaluate to vector (Matrix)!');
        }
        let startVec = new three_1.Vector3(start._data[0], start._data[1], 0);
        let dir = endVec.clone().sub(startVec).normalize();
        let length = endVec.distanceTo(startVec);
        let hex = this.hex;
        let headLength = this.headLength * length;
        let headWidth = this.headWidth * headLength;
        return new three_1.ArrowHelper(dir, startVec, length, hex, headLength, headWidth);
    }
}
exports.Arrow2D = Arrow2D;
class Arrow2DArgs {
    constructor(args) {
        this.start = args.start;
        this.end = args.end;
        this.hex = args.hex;
        this.headLength = args.headLength;
        this.headWidth = args.headWidth;
    }
    validate() {
        if (!this.end) {
            throw new Error("Invalid arguments: end not defined!");
        }
        return true;
    }
    defaults() {
        let args = {};
        if (this.start === undefined) {
            this.start = '[0,0]';
        }
        if (this.hex === undefined) {
            this.hex = 0xffffff;
        }
        if (this.headLength === undefined) {
            this.headLength = 0.2;
        }
        if (this.headWidth === undefined) {
            this.headWidth = 0.5;
        }
    }
}
exports.Arrow2DArgs = Arrow2DArgs;


/***/ }),

/***/ "./src/figures/Parametric2D.ts":
/*!*************************************!*\
  !*** ./src/figures/Parametric2D.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const three_meshline_1 = __webpack_require__(/*! three.meshline */ "./node_modules/three.meshline/src/THREE.MeshLine.js");
const math = __webpack_require__(/*! mathjs */ "mathjs");
const three_1 = __webpack_require__(/*! three */ "three");
class Parametric2D {
    constructor(args) {
        let args2 = new Parametric2DArgs(args);
        args2.validate();
        args2.defaults();
        this.expressionFun = math.parse(args2.expression).compile();
        this.parameter = args.parameter;
        this.startFun = math.parse(args2.start).compile();
        this.endFun = math.parse(args2.end).compile();
        this.stepsFun = math.parse(args2.steps).compile();
        if (args.color == null) {
            this.colorFun = null;
        }
        else {
            this.colorFun = math.parse(args2.color).compile();
        }
        this.width = args2.width;
    }
    getSceneObject(scope) {
        let self_ = this;
        let newScope = Object.create(scope);
        // Determine start end step
        let start = this.startFun.eval(scope);
        if (math.typeof(start) != 'number') {
            throw new Error("Start does not evaluate to a number!");
        }
        let end = this.endFun.eval(scope);
        if (math.typeof(end) != 'number') {
            throw new Error("End does not evaluate to a number!");
        }
        let steps = this.stepsFun.eval(scope);
        if (math.typeof(steps) != 'number') {
            throw new Error("Step does not evaluate to a number!");
        }
        // Create parametric function
        let parametricFun = function (t) {
            newScope[self_.parameter] = t;
            return self_.expressionFun.eval(newScope);
        };
        // Test expression returns correct type
        if (math.typeof(parametricFun(start)) != 'Matrix') {
            throw new Error("Expression does not evaluate to a vector (Matrix)!");
        }
        // Create color function
        let colorFun;
        if (this.colorFun != null) {
            // Test to make sure color returns correct type
            newScope[this.parameter] = start;
            if (math.typeof(this.colorFun.eval(newScope)) != 'Matrix') {
                throw new Error("Color does not evaluate to a vector (Matrix)!");
            }
            colorFun = function (t) {
                newScope[self_.parameter] = t;
                let result = self_.colorFun.eval(newScope);
                return [...result._data];
            };
        }
        else {
            colorFun = function (t) {
                return [1, 1, 1];
            };
        }
        let step = (end - start) / (steps - 1);
        let verts = new Float32Array(steps * 3);
        let colors = new Float32Array(steps * 4);
        for (let i = 0; i < steps; i++) {
            let t = start + i * step;
            let point = parametricFun(t);
            let color = colorFun(t);
            verts[i * 3] = point._data[0];
            verts[i * 3 + 1] = point._data[1];
            verts[i * 3 + 2] = 0;
            colors[i * 4] = color[0];
            colors[i * 4 + 1] = color[1];
            colors[i * 4 + 2] = color[2];
            colors[i * 4 + 3] = 1;
        }
        let geom = new three_1.BufferGeometry();
        geom.addAttribute('position', new three_1.BufferAttribute(verts, 3));
        geom.addAttribute('color', new three_1.BufferAttribute(colors, 4));
        let line = new three_meshline_1.MeshLine();
        line.setGeometry(geom);
        let material = new three_meshline_1.MeshLineMaterial({ useGlobalColor: 0, lineWidth: this.width });
        return new three_1.Mesh(line.geometry, material);
    }
}
exports.Parametric2D = Parametric2D;
class Parametric2DArgs {
    constructor(args) {
        this.expression = args.expression;
        this.parameter = args.parameter;
        this.start = args.start;
        this.end = args.end;
        this.steps = args.steps;
        this.color = args.color;
        this.width = args.width;
    }
    validate() {
        if (!this.expression) {
            throw new Error("Invalid arguments: expression not defined!");
        }
        if (!this.parameter) {
            throw new Error("Invalid arguments: parameter (variable) not defined!");
        }
        if (this.start === undefined) {
            throw new Error("Invalid arguments: start not defined!");
        }
        if (this.end === undefined) {
            throw new Error("Invalid arguments: end not defined!");
        }
        return true;
    }
    defaults() {
        if (this.steps === undefined) {
            this.steps = '50';
        }
        if (this.color === undefined) {
            this.color = null;
        }
        if (this.width === undefined) {
            this.width = 0.01;
        }
    }
}
exports.Parametric2DArgs = Parametric2DArgs;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var internal_1 = __webpack_require__(/*! ./core/internal */ "./src/core/internal.ts");
exports.Axes2D = internal_1.Axes2D;
exports.Axes2DArgs = internal_1.Axes2DArgs;
exports.Axes3D = internal_1.Axes3D;
exports.Axes3DArgs = internal_1.Axes3DArgs;
exports.Plot = internal_1.Plot;
var Arrow2D_1 = __webpack_require__(/*! ./figures/Arrow2D */ "./src/figures/Arrow2D.ts");
exports.Arrow2D = Arrow2D_1.Arrow2D;
exports.Arrow2DArgs = Arrow2D_1.Arrow2DArgs;
var Parametric2D_1 = __webpack_require__(/*! ./figures/Parametric2D */ "./src/figures/Parametric2D.ts");
exports.Parametric2D = Parametric2D_1.Parametric2D;
exports.Parametric2DArgs = Parametric2D_1.Parametric2DArgs;


/***/ }),

/***/ "mathjs":
/*!***********************!*\
  !*** external "math" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = math;

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