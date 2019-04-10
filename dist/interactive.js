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
                    mesh = figure.render(this.plot.getScope());
                }
                catch (e) {
                    success = false;
                    console.error(e);
                    console.warn('Figure not rendered!');
                    this.skip.add(figure);
                }
                if (success && mesh) {
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
            this.antialias = true;
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
const three_1 = __webpack_require__(/*! three */ "three");
const Hotspot2D_1 = __webpack_require__(/*! ../figures/Hotspot2D */ "./src/figures/Hotspot2D.ts");
const Label2D_1 = __webpack_require__(/*! ../figures/Label2D */ "./src/figures/Label2D.ts");
const Arrow2D_1 = __webpack_require__(/*! ../figures/Arrow2D */ "./src/figures/Arrow2D.ts");
const Point2D_1 = __webpack_require__(/*! ../figures/Point2D */ "./src/figures/Point2D.ts");
const Parametric2D_1 = __webpack_require__(/*! ../figures/Parametric2D */ "./src/figures/Parametric2D.ts");
const AngleArc2D_1 = __webpack_require__(/*! ../figures/AngleArc2D */ "./src/figures/AngleArc2D.ts");
const Utils_1 = __webpack_require__(/*! ../utils/Utils */ "./src/utils/Utils.ts");
const Polygon2D_1 = __webpack_require__(/*! ../figures/Polygon2D */ "./src/figures/Polygon2D.ts");
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
        this.hotspots = [];
        this.activeHotspot = null;
        ////////////////
        //// Events ////
        ////////////////
        let clientPosStart = null;
        let cameraPosStart = null;
        let onPanStart = (clientX, clientY) => {
            clientPosStart = [clientX, clientY];
            cameraPosStart = this.camera.position.clone();
        };
        let onPan = (clientX, clientY) => {
            let clientBounds = this.getContainer().getBoundingClientRect();
            let clientDiff = [clientX - clientPosStart[0], clientY - clientPosStart[1]];
            let cameraDim = [this.right - this.left, this.top - this.bottom];
            let cameraDiff = [clientDiff[0] / clientBounds.width * cameraDim[0], clientDiff[1] / clientBounds.height * cameraDim[1]];
            this.camera.position.x = cameraPosStart.x - cameraDiff[0];
            this.camera.position.y = cameraPosStart.y + cameraDiff[1];
            this.camera.updateMatrix();
            this.getPlot().requestFrame();
        };
        let onHotspotDrag = (clientX, clientY) => {
            let containerBounds = this.getContainer().getBoundingClientRect();
            let screenCoords = new THREE.Vector2(clientX - containerBounds.left, clientY - containerBounds.top);
            let worldCoords = unproject(screenCoords);
            this.activeHotspot.setPosition(worldCoords);
        };
        let onPanEnd = (clientX, clientY) => {
            clientPosStart = null;
            cameraPosStart = null;
        };
        var unproject = (screenCoords) => {
            let ratioX = screenCoords.x / this.getContainer().clientWidth;
            let ratioY = screenCoords.y / this.getContainer().clientHeight;
            let worldX = this.left + ratioX * (this.right - this.left) + this.camera.position.x;
            let worldY = this.top - ratioY * (this.top - this.bottom) + this.camera.position.y;
            return new three_1.Vector2(worldX, worldY);
        };
        var findActiveHotspot = (clientX, clientY) => {
            let leastDistance = 1000; // Arbitrarily large number
            let containerBounds = this.getContainer().getBoundingClientRect();
            let screenCoords = new THREE.Vector2(clientX - containerBounds.left, clientY - containerBounds.top);
            this.activeHotspot = null;
            for (let hotspot of this.hotspots) {
                let dist2 = this.project(hotspot.getPosition()).distanceToSquared(screenCoords);
                if (dist2 <= 20 * 20 && dist2 < leastDistance * leastDistance) {
                    this.activeHotspot = hotspot;
                }
            }
        };
        this.getContainer().addEventListener('mousedown', (e) => {
            if (e.buttons & 1) {
                findActiveHotspot(e.clientX, e.clientY);
                if (this.activeHotspot == null) {
                    onPanStart(e.clientX, e.clientY);
                }
            }
        });
        this.getContainer().addEventListener('mousemove', (e) => {
            if (e.buttons & 1) {
                if (this.activeHotspot == null) {
                    onPan(e.clientX, e.clientY);
                }
                else {
                    onHotspotDrag(e.clientX, e.clientY);
                }
            }
        });
        this.getContainer().addEventListener('mouseup', (e) => {
            if (e.buttons & 1) {
                if (this.activeHotspot == null) {
                    onPanEnd(e.clientX, e.clientY);
                }
            }
        });
    }
    addFigure(figure) {
        if (figure instanceof Hotspot2D_1.Hotspot2D) {
            this.hotspots.push(figure);
        }
        return super.addFigure(figure);
    }
    removeFigure(figure) {
        if (figure instanceof Hotspot2D_1.Hotspot2D) {
            let i = this.hotspots.indexOf(figure);
            if (i >= 0) {
                this.hotspots.splice(i, 1);
            }
        }
        return super.removeFigure(figure);
    }
    getCamera() {
        return this.camera;
    }
    project(worldCoords) {
        let ratioX = (worldCoords.x - this.camera.position.x - this.left) / (this.right - this.left);
        let ratioY = (worldCoords.y - this.camera.position.y - this.bottom) / (this.top - this.bottom);
        let screenX = ratioX * this.getContainer().clientWidth;
        let screenY = (1 - ratioY) * this.getContainer().clientHeight;
        return new three_1.Vector2(screenX, screenY);
    }
    /**
     * Supports legacy way of creating figures
     */
    plotExpression(expr, type, opts) {
        let args = Object.assign({}, opts);
        switch (type) {
            case 'angle':
                var parts = expr.split(/{|,|}/g);
                args.a = parts[1];
                args.b = parts[2];
                let angleArc = new AngleArc2D_1.AngleArc2D(args);
                this.addFigure(angleArc);
                break;
            case 'arrow':
                args.end = expr;
                let arrow = new Arrow2D_1.Arrow2D(args);
                this.addFigure(arrow);
                break;
            case 'label':
                args.axes = this;
                args.label = expr;
                let label = new Label2D_1.Label2D(args);
                this.addFigure(label);
                break;
            case 'point':
                args.position = expr;
                let point = new Point2D_1.Point2D(args);
                this.addFigure(point);
                break;
            case 'hotspot':
                args.plot = this.getPlot();
                args.variable = expr;
                let hotspot = new Hotspot2D_1.Hotspot2D(args);
                this.addFigure(hotspot);
                break;
            case 'parametric':
                var parts = expr.split(/{|}/g);
                args.expression = parts[0];
                let parts2 = parts[1].split(',');
                args.parameter = parts2[0];
                args.start = parts2[1];
                args.end = parts2[2];
                args.steps = parts2[3];
                let param = new Parametric2D_1.Parametric2D(args);
                this.addFigure(param);
                break;
            case 'polygon':
                let verts = Utils_1.bracketAwareSplit(expr.slice(1, expr.length - 1), ',');
                args.vertices = verts;
                let poly = new Polygon2D_1.Polygon2D(args);
                this.addFigure(poly);
                break;
            default:
                throw new Error("Unknown figure type!");
        }
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

/***/ "./src/core/Panel.tsx":
/*!****************************!*\
  !*** ./src/core/Panel.tsx ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const math = __webpack_require__(/*! mathjs */ "mathjs");
const React = __webpack_require__(/*! react */ "react");
const ReactDOM = __webpack_require__(/*! react-dom */ "react-dom");
class Panel {
    constructor(args) {
        let args2 = new PanelArgs(args);
        args2.validate();
        args2.defaults();
        this.plot = args2.plot;
        this.container = args2.container;
        this.panelComponents = [];
    }
    createSlider(args) {
        args.plot = this.plot;
        let slider = React.createElement(PanelComponent.Slider, Object.assign({}, args, { key: this.panelComponents.length }));
        this.append(slider);
    }
    addReadout(expression, opts) {
        let args = Object.assign({}, opts);
        args.plot = this.plot;
        args.expression = expression;
        let readout = React.createElement(PanelComponent.Readout, Object.assign({}, args, { key: this.panelComponents.length }));
        this.append(readout);
    }
    addCheckBox(variable, opts) {
        let args = Object.assign({}, opts);
        args.plot = this.plot;
        args.variable = variable;
        let checkbox = React.createElement(PanelComponent.CheckBox, Object.assign({}, args, { key: this.panelComponents.length }));
        this.append(checkbox);
    }
    append(element) {
        this.panelComponents.push(element);
        ReactDOM.render(React.createElement("div", null, this.panelComponents.map((elm) => React.createElement("div", null, elm))), this.container);
    }
}
exports.Panel = Panel;
var PanelComponent;
(function (PanelComponent) {
    class Slider extends React.Component {
        constructor(props) {
            super(props);
            this.args = new PanelComponent.SliderArgs(props);
            this.args.validate();
            this.args.defaults();
        }
        render() {
            let onInput = () => {
                this.args.plot.setConstant(this.args.variable, parseFloat(this.sliderElement.value));
                this.args.plot.refresh();
                this.args.plot.requestFrame();
            };
            let step = (this.args.end - this.args.start) / (this.args.steps - 1);
            let value = this.args.plot.getScope()[this.args.variable];
            // Set initial value if not already set
            if (math.typeof(value) != 'number') {
                value = this.args.start;
                this.args.plot.setConstant(this.args.variable, value);
            }
            return [this.args.variable + ':', React.createElement("input", { type: "range", min: this.args.start, max: this.args.end, step: step, defaultValue: value, onInput: onInput, ref: (elm) => this.sliderElement = elm, key: "1" })];
        }
    }
    PanelComponent.Slider = Slider;
    class SliderArgs {
        constructor(args) {
            this.plot = args.plot;
            this.variable = args.variable;
            this.start = args.start;
            this.end = args.end;
            this.steps = args.steps;
            this.continuousUpdate = args.continuousUpdate;
        }
        validate() {
            if (this.plot === undefined) {
                throw new Error('Invalid arguments: Plot not defined!');
            }
            if (this.variable === undefined) {
                throw new Error('Invalid arguments: Variable not defined!');
            }
            if (this.start === undefined) {
                throw new Error('Invalid arguments: Start not defined!');
            }
            if (this.end === undefined) {
                throw new Error('Invalid arguments: End not defined!');
            }
            return true;
        }
        defaults() {
            if (this.steps === undefined) {
                this.steps = 50;
            }
            if (this.continuousUpdate === undefined) {
                this.continuousUpdate = true;
            }
        }
    }
    PanelComponent.SliderArgs = SliderArgs;
    class Readout extends React.Component {
        constructor(props) {
            super(props);
            this.args = new PanelComponent.ReadoutArgs(props);
            this.args.validate();
            this.args.defaults();
            let getValue = () => {
                let value = 'N/A';
                try {
                    value = '' + this.args.plot.evalExpression(this.args.expression);
                    value = value.replace(/(\.\d\d\d)\d*/g, "$1");
                }
                catch (e) {
                    if (!(e instanceof Error) || !e.message.includes('Undefined symbol')) {
                        console.warn(e);
                    }
                }
                return value;
            };
            this.state = {
                value: getValue()
            };
            let updateValue = () => {
                this.setState({
                    value: getValue()
                });
            };
            this.args.plot.onRefresh(updateValue);
            this.args.plot.onExecExpression(updateValue);
        }
        render() {
            return [this.args.label + " =", React.createElement("input", { key: "1", type: "text", disabled: true, value: this.state.value })];
        }
    }
    PanelComponent.Readout = Readout;
    class ReadoutArgs {
        constructor(args) {
            this.plot = args.plot;
            this.expression = args.expression;
            this.label = args.label;
        }
        validate() {
            if (this.plot === undefined) {
                throw new Error('Invalid arguments: Plot not defined!');
            }
            if (this.expression === undefined) {
                throw new Error('Invalid arguments: Variable not defined!');
            }
            return true;
        }
        defaults() {
            if (this.label === undefined) {
                this.label = this.expression;
            }
        }
    }
    PanelComponent.ReadoutArgs = ReadoutArgs;
    class CheckBox extends React.Component {
        constructor(props) {
            super(props);
            this.args = new PanelComponent.CheckBoxArgs(props);
            this.args.validate();
            this.args.defaults();
        }
        render() {
            let onInput = () => {
                let value = this.checkBoxElement.checked ? 1 : 0;
                this.args.plot.setConstant(this.args.variable, value);
                this.args.plot.refresh();
                this.args.plot.requestFrame();
            };
            let value = this.args.plot.getScope()[this.args.variable];
            // Set initial value if not already set
            if (math.typeof(value) != 'number') {
                value = 0;
                this.args.plot.setConstant(this.args.variable, value);
            }
            return [this.args.label + ':', React.createElement("input", { type: "checkbox", onInput: onInput, defaultChecked: value, ref: (elm) => this.checkBoxElement = elm, key: "1" })];
        }
    }
    PanelComponent.CheckBox = CheckBox;
    class CheckBoxArgs {
        constructor(args) {
            this.plot = args.plot;
            this.variable = args.variable;
            this.label = args.label;
        }
        validate() {
            if (this.plot === undefined) {
                throw new Error('Invalid arguments: Plot not defined!');
            }
            if (this.variable === undefined) {
                throw new Error('Invalid arguments: Variable not defined!');
            }
            return true;
        }
        defaults() {
            if (this.label === undefined) {
                this.label = this.variable;
            }
        }
    }
    PanelComponent.CheckBoxArgs = CheckBoxArgs;
})(PanelComponent = exports.PanelComponent || (exports.PanelComponent = {}));
class PanelArgs {
    constructor(args) {
        this.plot = args.plot;
        this.container = args.container;
    }
    validate() {
        if (this.plot === undefined) {
            throw new Error("Invalid arguments: Plot not defined!");
        }
        if (this.container === undefined) {
            throw new Error("Invalid arguments: Container not defined!");
        }
        return true;
    }
    defaults() {
    }
}
exports.PanelArgs = PanelArgs;


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
        this.refreshCallbacks = [];
        this.execExpressionCallbacks = [];
        this.renderMutex = false;
        // Some useful functions
        let eps = Math.pow(2, -52);
        let eps2 = Math.pow(2, -26);
        this.scope.nderivative = function (f, x) {
            if (math.typeof(x) != 'number') {
                throw new Error('Invalid argument for x');
            }
            let h = math.max(math.abs(eps2 * x), eps2) / 2;
            return math.divide(math.subtract(f(x + h), f(x - h)), 2 * h);
        };
        this.scope.lerp = function (a, b, alpha) {
            if (math.typeof(alpha) != 'number') {
                throw new Error('Invalid argument for alpha');
            }
            return math.add(math.multiply(1 - alpha, a), math.multiply(alpha, b));
        };
        // Check visibility when scrolling
        let checkVisible = (el) => {
            var elemTop = el.getBoundingClientRect().top;
            var elemBottom = el.getBoundingClientRect().bottom;
            var isVisible = (elemBottom >= 0) && (elemTop <= window.innerHeight);
            return isVisible;
        };
        window.addEventListener('scroll', () => {
            for (let ax of this.axes) {
                if (checkVisible(ax.getContainer())) {
                    if (ax.isSleeping())
                        ax.wake();
                    ax.render();
                }
                else if (!ax.isSleeping()) {
                    ax.sleep();
                }
            }
        });
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
    * Creates a panel
    * @param args
    * @return The new panel
    */
    createPanel(args) {
        let args2 = new internal_1.PanelArgs(args);
        args2.plot = this;
        let panel = new internal_1.Panel(args2);
        return panel;
    }
    /**
    * Renders all axes that are on screen
    */
    render() {
        for (let ax of this.axes) {
            if (!ax.isSleeping()) {
                ax.render();
            }
        }
    }
    /**
     * Request a render frame
     */
    requestFrame() {
        if (!this.renderMutex) {
            this.renderMutex = true;
            requestAnimationFrame(() => {
                this.render();
                this.renderMutex = false;
            });
        }
    }
    /**
    * Refresh all axes
    */
    refresh() {
        for (let ax of this.axes) {
            ax.refreshAll();
        }
        for (let callback of this.refreshCallbacks) {
            callback();
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
        let result = math.eval(expr, this.scope);
        for (let callback of this.execExpressionCallbacks) {
            callback(expr);
        }
        return result;
    }
    /**
     * Evaluates an expression. Identical to exec expressions, but does not trigger onExpressionExec callbacks.
     */
    evalExpression(expr) {
        return math.eval(expr, this.scope);
    }
    /**
    * Sets the value of specified variable in the scope.
    * @param variable
    * @param value
    */
    setConstant(variable, value) {
        this.scope[variable] = value;
    }
    /**
     * Register a callback to perform when the plot is refreshed
     * @param callback
     */
    onRefresh(callback) {
        this.refreshCallbacks.push(callback);
    }
    /**
     * Register a callback to perform when an expression is executed
     * @param callback
     */
    onExecExpression(callback) {
        this.execExpressionCallbacks.push(callback);
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
__export(__webpack_require__(/*! ./Panel */ "./src/core/Panel.tsx"));
__export(__webpack_require__(/*! ./Plot */ "./src/core/Plot.ts"));


/***/ }),

/***/ "./src/figures/AngleArc2D.ts":
/*!***********************************!*\
  !*** ./src/figures/AngleArc2D.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = __webpack_require__(/*! three */ "three");
const math = __webpack_require__(/*! mathjs */ "mathjs");
class AngleArc2D {
    constructor(args) {
        let args2 = new AngleArc2DArgs(args);
        args2.validate();
        args2.defaults();
        this.aFun = math.parse(args2.a).compile();
        this.bFun = math.parse(args2.b).compile();
        this.hex = args2.hex;
        this.radius = args2.radius;
    }
    render(scope) {
        let a = new three_1.Vector2(...this.aFun.eval(scope)._data);
        let b = new three_1.Vector2(...this.bFun.eval(scope)._data);
        let thetaA = Math.atan2(a.y, a.x);
        let thetaB = Math.atan2(b.y, b.x);
        let clockwise = thetaA - thetaB < Math.PI && thetaA - thetaB >= 0;
        let points;
        if (Math.abs(a.dot(b)) < 0.01) {
            let v1 = a.clone().normalize().multiplyScalar(this.radius);
            let v3 = b.clone().normalize().multiplyScalar(this.radius);
            let v2 = v1.clone().add(v3);
            points = [v1, v2, v3];
        }
        else {
            let curve = new three_1.EllipseCurve(0, 0, // ax, aY
            this.radius, this.radius, // xRadius, yRadius
            thetaA, thetaB, // aStartAngle, aEndAngle
            clockwise, // aClockwise
            0 // aRotation
            );
            points = curve.getSpacedPoints(20);
        }
        let material = new three_1.LineBasicMaterial({ color: this.hex });
        let line = new three_1.Line(new three_1.Geometry().setFromPoints(points), material);
        return line;
    }
}
exports.AngleArc2D = AngleArc2D;
class AngleArc2DArgs {
    constructor(args) {
        this.origin = args.origin;
        this.a = args.a;
        this.b = args.b;
        this.hex = args.hex;
        this.radius = args.radius;
    }
    validate() {
        if (!this.a) {
            throw new Error("Invalid arguments: a not defined!");
        }
        if (!this.b) {
            throw new Error("Invalid arguments: b not defined!");
        }
        return true;
    }
    defaults() {
        if (this.origin === undefined) {
            this.origin = '[0,0]';
        }
        if (this.hex === undefined) {
            this.hex = 0xffffff;
        }
        if (this.radius === undefined) {
            this.radius = 0.2;
        }
    }
}
exports.AngleArc2DArgs = AngleArc2DArgs;


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
const LineArrowHelper_1 = __webpack_require__(/*! ../utils/LineArrowHelper */ "./src/utils/LineArrowHelper.ts");
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
        this.width = args2.width;
        this.showFun = math.parse(args2.show).compile();
    }
    render(scope) {
        let show = this.showFun.eval(scope);
        if (show == 0)
            return null;
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
        let headLength = this.headLength;
        let headWidth = this.headWidth;
        if (this.width <= 0) {
            return new three_1.ArrowHelper(dir, startVec, length, hex, headLength, headWidth);
        }
        else {
            return new LineArrowHelper_1.LineArrowHelper(dir, startVec, length, hex, headLength, headWidth, this.width);
        }
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
        this.width = args.width;
        this.show = args.show;
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
            this.headWidth = 0.15;
        }
        if (this.show === undefined) {
            this.show = '1';
        }
        if (this.width === undefined) {
            this.width = 0.01;
        }
    }
}
exports.Arrow2DArgs = Arrow2DArgs;


/***/ }),

/***/ "./src/figures/Hotspot2D.ts":
/*!**********************************!*\
  !*** ./src/figures/Hotspot2D.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = __webpack_require__(/*! three */ "three");
class Hotspot2D {
    constructor(args) {
        let args2 = new Hotspot2DArgs(args);
        args2.validate();
        args2.defaults();
        this.plot = args2.plot;
        this.variable = args2.variable;
        this.position = null;
    }
    getPosition() {
        if (this.position == null) {
            let vector = this.plot.getScope()[this.variable];
            this.position = new three_1.Vector2(...vector._data);
        }
        return this.position;
    }
    setPosition(position) {
        this.position = position;
        this.plot.execExpression(this.variable + '=[' + position.toArray() + ']');
        this.plot.refresh();
        this.plot.requestFrame();
    }
    render(scope) {
        return null;
    }
}
exports.Hotspot2D = Hotspot2D;
class Hotspot2DArgs {
    constructor(args) {
        this.plot = args.plot;
        this.variable = args.variable;
    }
    validate() {
        if (!this.plot) {
            throw new Error("Invalid arguments: Plot not defined!");
        }
        if (!this.variable) {
            throw new Error("Invalid arguments: Variable not defined!");
        }
        return true;
    }
    defaults() {
    }
}
exports.Hotspot2DArgs = Hotspot2DArgs;


/***/ }),

/***/ "./src/figures/Label2D.ts":
/*!********************************!*\
  !*** ./src/figures/Label2D.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = __webpack_require__(/*! three */ "three");
const math = __webpack_require__(/*! mathjs */ "mathjs");
const Axes2D_1 = __webpack_require__(/*! ../core/Axes2D */ "./src/core/Axes2D.ts");
class Label2D {
    constructor(args) {
        let args2 = new Label2DArgs(args);
        args2.validate();
        args2.defaults();
        this.axes = args2.axes;
        this.positionFun = math.parse(args2.position).compile();
        this.label = args.label;
        ////////////////////////////
        //// Creating Label Div ////
        ////////////////////////////
        let label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.width = '100';
        label.style.height = '100';
        label.style.color = 'white';
        label.style.cursor = 'default';
        // @ts-ignore: Legacy code
        label.style['pointer-events'] = 'none';
        // @ts-ignore: Legacy code
        label.style['-webkit-user-select'] = 'none'; /* Chrome, Opera, Safari */
        // @ts-ignore: Legacy code
        label.style['-moz-user-select'] = 'none'; /* Firefox 2+ */
        // @ts-ignore: Legacy code
        label.style['-ms-user-select'] = 'none'; /* IE 10+ */
        // @ts-ignore: Legacy code
        label.style['user-select'] = 'none'; /* Standard syntax */
        label.innerHTML = this.label;
        this.labelElement = label;
        document.body.appendChild(label);
    }
    render(scope) {
        let position = new three_1.Vector2(...this.positionFun.eval(scope)._data);
        let coords = this.axes.project(position);
        let rect = this.axes.getContainer().getBoundingClientRect();
        this.labelElement.style.top = window.scrollY + coords.y + rect.top + 'px';
        this.labelElement.style.left = window.scrollX + coords.x + rect.left + 'px';
        return null;
    }
}
exports.Label2D = Label2D;
class Label2DArgs {
    constructor(args) {
        this.axes = args.axes;
        this.position = args.position;
        this.label = args.label;
    }
    validate() {
        if (!this.axes) {
            throw new Error("Invalid arguments: Axes not defined!");
        }
        if (!(this.axes instanceof Axes2D_1.Axes2D)) {
            throw new Error("Invalid arguments: axes is not an Axes2D");
        }
        if (!this.position) {
            throw new Error("Invalid arguments: Variable not defined!");
        }
        return true;
    }
    defaults() {
        if (this.label === undefined) {
            this.label = this.position;
        }
    }
}
exports.Label2DArgs = Label2DArgs;


/***/ }),

/***/ "./src/figures/Parallelogram2D.ts":
/*!****************************************!*\
  !*** ./src/figures/Parallelogram2D.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = __webpack_require__(/*! three */ "three");
const math = __webpack_require__(/*! mathjs */ "mathjs");
const THREE = __webpack_require__(/*! three */ "three");
class Parallelogram2D {
    /**
     * Creates a parallelogram spanned by args.u and args.v
     * @param args
     */
    constructor(args) {
        let args2 = new Parallelogram2DArgs(args);
        args2.validate();
        args2.defaults();
        this.uFun = math.parse(args2.u).compile();
        this.vFun = math.parse(args2.v).compile();
        this.opacity = args2.opacity;
    }
    render(scope) {
        var o = new three_1.Vector3(0, 0, 0);
        var u = new three_1.Vector3(...this.uFun.eval(scope)._data, -0.1);
        var v = new three_1.Vector3(...this.vFun.eval(scope)._data, -0.1);
        var geom = new three_1.Geometry();
        geom.vertices.push(o);
        geom.vertices.push(o.clone().add(u));
        geom.vertices.push(o.clone().add(v));
        geom.vertices.push(o.clone().add(u).add(v));
        var f1 = new three_1.Face3(3, 1, 0);
        var f2 = new three_1.Face3(0, 2, 3);
        geom.faces.push(f1);
        geom.faces.push(f2);
        var mat = new three_1.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide, opacity: this.opacity, transparent: true });
        return new three_1.Mesh(geom, mat);
    }
}
exports.Parallelogram2D = Parallelogram2D;
class Parallelogram2DArgs {
    constructor(args) {
        this.u = args.u;
        this.v = args.v;
        this.opacity = args.opacity;
    }
    validate() {
        if (!this.u || !this.v) {
            throw new Error("Invalid arguments: u or v not defined!");
        }
        return true;
    }
    defaults() {
        if (this.opacity === undefined) {
            this.opacity = 1;
        }
    }
}
exports.Parallelogram2DArgs = Parallelogram2DArgs;


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
    render(scope) {
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

/***/ "./src/figures/Point2D.ts":
/*!********************************!*\
  !*** ./src/figures/Point2D.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = __webpack_require__(/*! three */ "three");
const math = __webpack_require__(/*! mathjs */ "mathjs");
class Point2D {
    constructor(args) {
        let args2 = new Point2DArgs(args);
        args2.validate();
        args2.defaults();
        this.positionFun = math.parse(args2.position).compile();
        this.hex = args2.hex;
        this.radius = args2.radius;
    }
    render(scope) {
        let position = new three_1.Vector3(...this.positionFun.eval(scope)._data, 0);
        let geometry = new three_1.CircleBufferGeometry(this.radius, 32);
        let material = new three_1.MeshBasicMaterial({ color: this.hex });
        let circle = new three_1.Mesh(geometry, material);
        circle.position.copy(position);
        return circle;
    }
}
exports.Point2D = Point2D;
class Point2DArgs {
    constructor(args) {
        this.position = args.position;
        this.hex = args.hex;
        this.radius = args.radius;
    }
    validate() {
        return true;
    }
    defaults() {
        if (this.hex === undefined) {
            this.hex = 0xffffff;
        }
        if (this.radius === undefined) {
            this.radius = 0.05;
        }
    }
}
exports.Point2DArgs = Point2DArgs;


/***/ }),

/***/ "./src/figures/Polygon2D.ts":
/*!**********************************!*\
  !*** ./src/figures/Polygon2D.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = __webpack_require__(/*! three */ "three");
const math = __webpack_require__(/*! mathjs */ "mathjs");
const THREE = __webpack_require__(/*! three */ "three");
class Polygon2D {
    /**
     * Creates a parallelogram spanned by args.u and args.v
     * @param args
     */
    constructor(args) {
        let args2 = new Polygon2DArgs(args);
        args2.validate();
        args2.defaults();
        this.vertexFuns = args2.vertices.map((vertex) => math.parse(vertex).compile());
        this.opacity = args2.opacity;
    }
    render(scope) {
        let vectors = this.vertexFuns.map((vf) => new three_1.Vector2(...vf.eval(scope)._data));
        let geom = new THREE.Geometry();
        let i = 0;
        for (let vector of vectors) {
            geom.vertices.push(new three_1.Vector3(vector.x, vector.y, 0));
            if (i > 1) {
                var f = new THREE.Face3(0, i, i - 1);
                geom.faces.push(f);
            }
            i++;
        }
        let mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, opacity: this.opacity, transparent: true });
        return new THREE.Mesh(geom, mat);
    }
}
exports.Polygon2D = Polygon2D;
class Polygon2DArgs {
    constructor(args) {
        this.vertices = args.vertices;
        this.opacity = args.opacity;
    }
    validate() {
        if (!this.vertices) {
            throw new Error("Invalid arguments: vertices not defined!");
        }
        return true;
    }
    defaults() {
        if (this.opacity === undefined) {
            this.opacity = 1;
        }
    }
}
exports.Polygon2DArgs = Polygon2DArgs;


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
var AngleArc2D_1 = __webpack_require__(/*! ./figures/AngleArc2D */ "./src/figures/AngleArc2D.ts");
exports.AngleArc2D = AngleArc2D_1.AngleArc2D;
exports.AngleArc2DArgs = AngleArc2D_1.AngleArc2DArgs;
var Arrow2D_1 = __webpack_require__(/*! ./figures/Arrow2D */ "./src/figures/Arrow2D.ts");
exports.Arrow2D = Arrow2D_1.Arrow2D;
exports.Arrow2DArgs = Arrow2D_1.Arrow2DArgs;
var Hotspot2D_1 = __webpack_require__(/*! ./figures/Hotspot2D */ "./src/figures/Hotspot2D.ts");
exports.Hotspot2D = Hotspot2D_1.Hotspot2D;
exports.Hotspot2DArgs = Hotspot2D_1.Hotspot2DArgs;
var Label2D_1 = __webpack_require__(/*! ./figures/Label2D */ "./src/figures/Label2D.ts");
exports.Label2D = Label2D_1.Label2D;
exports.Label2DArgs = Label2D_1.Label2DArgs;
var Parametric2D_1 = __webpack_require__(/*! ./figures/Parametric2D */ "./src/figures/Parametric2D.ts");
exports.Parametric2D = Parametric2D_1.Parametric2D;
exports.Parametric2DArgs = Parametric2D_1.Parametric2DArgs;
var Parallelogram2D_1 = __webpack_require__(/*! ./figures/Parallelogram2D */ "./src/figures/Parallelogram2D.ts");
exports.Parallelogram2D = Parallelogram2D_1.Parallelogram2D;
exports.Parallelogram2DArgs = Parallelogram2D_1.Parallelogram2DArgs;
var Point2D_1 = __webpack_require__(/*! ./figures/Point2D */ "./src/figures/Point2D.ts");
exports.Point2D = Point2D_1.Point2D;
exports.Point2DArgs = Point2D_1.Point2DArgs;


/***/ }),

/***/ "./src/utils/LineArrowHelper.ts":
/*!**************************************!*\
  !*** ./src/utils/LineArrowHelper.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const three_meshline_1 = __webpack_require__(/*! three.meshline */ "./node_modules/three.meshline/src/THREE.MeshLine.js");
const three_1 = __webpack_require__(/*! three */ "three");
class LineArrowHelper extends three_1.Object3D {
    constructor(dir, origin, length, hex, headLength, headWidth, width) {
        super();
        if (dir === undefined)
            dir = new three_1.Vector3(0, 0, 1);
        if (origin === undefined)
            origin = new three_1.Vector3(0, 0, 0);
        if (length === undefined)
            length = 1;
        if (hex === undefined)
            hex = 0xffff00;
        if (headLength === undefined)
            headLength = 0.2 * length;
        if (headWidth === undefined)
            headWidth = 0.2 * headLength;
        if (width === undefined)
            width = 0.01;
        let end = origin.clone().add(dir.clone().multiplyScalar(length - headLength));
        let geom = new three_1.Geometry();
        geom.vertices.push(origin);
        geom.vertices.push(end);
        let line = new three_meshline_1.MeshLine();
        line.setGeometry(geom);
        let material = new three_meshline_1.MeshLineMaterial({ lineWidth: width, color: new three_1.Color(hex) });
        this.add(new three_1.Mesh(line.geometry, material));
        this.add(new three_1.ArrowHelper(dir, origin, length, hex, headLength, headWidth));
    }
}
exports.LineArrowHelper = LineArrowHelper;


/***/ }),

/***/ "./src/utils/Utils.ts":
/*!****************************!*\
  !*** ./src/utils/Utils.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function bracketAwareSplit(s, delimiters) {
    let parts = [''];
    let depth = 0;
    for (let c of s) {
        if (c == '(' || c == '[' || c == '{') {
            depth++;
        }
        if (c == ')' || c == ']' || c == '}') {
            depth--;
        }
        if (depth == 0 && delimiters.includes(c)) {
            parts.push('');
        }
        else {
            parts[parts.length - 1] += c;
        }
    }
    return parts;
}
exports.bracketAwareSplit = bracketAwareSplit;


/***/ }),

/***/ "mathjs":
/*!***********************!*\
  !*** external "math" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = math;

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = React;

/***/ }),

/***/ "react-dom":
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ReactDOM;

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