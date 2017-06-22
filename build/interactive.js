(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Interactive = global.Interactive || {})));
}(this, (function (exports) { 'use strict';

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.SpriteCanvasMaterial = function ( parameters ) {

	THREE.Material.call( this );

	this.type = 'SpriteCanvasMaterial';

	this.color = new THREE.Color( 0xffffff );
	this.program = function () {};

	this.setValues( parameters );

};

THREE.SpriteCanvasMaterial.prototype = Object.create( THREE.Material.prototype );
THREE.SpriteCanvasMaterial.prototype.constructor = THREE.SpriteCanvasMaterial;
THREE.SpriteCanvasMaterial.prototype.isSpriteCanvasMaterial = true;

THREE.SpriteCanvasMaterial.prototype.clone = function () {

	var material = new THREE.SpriteCanvasMaterial();

	material.copy( this );
	material.color.copy( this.color );
	material.program = this.program;

	return material;

};

//

THREE.CanvasRenderer = function ( parameters ) {

	console.log( 'THREE.CanvasRenderer', THREE.REVISION );

	parameters = parameters || {};

	var _this = this,
		_renderData, _elements, _lights,
		_projector = new THREE.Projector(),

		_canvas = parameters.canvas !== undefined
				 ? parameters.canvas
				 : document.createElement( 'canvas' ),

		_canvasWidth = _canvas.width,
		_canvasHeight = _canvas.height,
		_canvasWidthHalf = Math.floor( _canvasWidth / 2 ),
		_canvasHeightHalf = Math.floor( _canvasHeight / 2 ),

		_viewportX = 0,
		_viewportY = 0,
		_viewportWidth = _canvasWidth,
		_viewportHeight = _canvasHeight,

		_pixelRatio = 1,

		_context = _canvas.getContext( '2d', {
			alpha: parameters.alpha === true
		} ),

		_clearColor = new THREE.Color( 0x000000 ),
		_clearAlpha = parameters.alpha === true ? 0 : 1,

		_contextGlobalAlpha = 1,
		_contextGlobalCompositeOperation = 0,
		_contextStrokeStyle = null,
		_contextFillStyle = null,
		_contextLineWidth = null,
		_contextLineCap = null,
		_contextLineJoin = null,
		_contextLineDash = [],

		_v1, _v2, _v3,

		_v1x, _v1y, _v2x, _v2y, _v3x, _v3y,

		_color = new THREE.Color(),

		_diffuseColor = new THREE.Color(),
		_emissiveColor = new THREE.Color(),

		_lightColor = new THREE.Color(),

		_patterns = {},

		_uvs,
		_uv1x, _uv1y, _uv2x, _uv2y, _uv3x, _uv3y,

		_clipBox = new THREE.Box2(),
		_clearBox = new THREE.Box2(),
		_elemBox = new THREE.Box2(),

		_ambientLight = new THREE.Color(),
		_directionalLights = new THREE.Color(),
		_pointLights = new THREE.Color(),

		_vector3 = new THREE.Vector3(), // Needed for PointLight
		_centroid = new THREE.Vector3(),
		_normal = new THREE.Vector3(),
		_normalViewMatrix = new THREE.Matrix3();

	/* TODO
	_canvas.mozImageSmoothingEnabled = false;
	_canvas.webkitImageSmoothingEnabled = false;
	_canvas.msImageSmoothingEnabled = false;
	_canvas.imageSmoothingEnabled = false;
	*/

	// dash+gap fallbacks for Firefox and everything else

	if ( _context.setLineDash === undefined ) {

		_context.setLineDash = function () {};

	}

	this.domElement = _canvas;

	this.autoClear = true;
	this.sortObjects = true;
	this.sortElements = true;

	this.info = {

		render: {

			vertices: 0,
			faces: 0

		}

	};

	// WebGLRenderer compatibility

	this.supportsVertexTextures = function () {};
	this.setFaceCulling = function () {};

	// API

	this.getContext = function () {

		return _context;

	};

	this.getContextAttributes = function () {

		return _context.getContextAttributes();

	};

	this.getPixelRatio = function () {

		return _pixelRatio;

	};

	this.setPixelRatio = function ( value ) {

		if ( value !== undefined ) _pixelRatio = value;

	};

	this.setSize = function ( width, height, updateStyle ) {

		_canvasWidth = width * _pixelRatio;
		_canvasHeight = height * _pixelRatio;

		_canvas.width = _canvasWidth;
		_canvas.height = _canvasHeight;

		_canvasWidthHalf = Math.floor( _canvasWidth / 2 );
		_canvasHeightHalf = Math.floor( _canvasHeight / 2 );

		if ( updateStyle !== false ) {

			_canvas.style.width = width + 'px';
			_canvas.style.height = height + 'px';

		}

		_clipBox.min.set( - _canvasWidthHalf, - _canvasHeightHalf );
		_clipBox.max.set(   _canvasWidthHalf,   _canvasHeightHalf );

		_clearBox.min.set( - _canvasWidthHalf, - _canvasHeightHalf );
		_clearBox.max.set(   _canvasWidthHalf,   _canvasHeightHalf );

		_contextGlobalAlpha = 1;
		_contextGlobalCompositeOperation = 0;
		_contextStrokeStyle = null;
		_contextFillStyle = null;
		_contextLineWidth = null;
		_contextLineCap = null;
		_contextLineJoin = null;

		this.setViewport( 0, 0, width, height );

	};

	this.setViewport = function ( x, y, width, height ) {

		_viewportX = x * _pixelRatio;
		_viewportY = y * _pixelRatio;

		_viewportWidth = width * _pixelRatio;
		_viewportHeight = height * _pixelRatio;

	};

	this.setScissor = function () {};
	this.setScissorTest = function () {};

	this.setClearColor = function ( color, alpha ) {

		_clearColor.set( color );
		_clearAlpha = alpha !== undefined ? alpha : 1;

		_clearBox.min.set( - _canvasWidthHalf, - _canvasHeightHalf );
		_clearBox.max.set(   _canvasWidthHalf,   _canvasHeightHalf );

	};

	this.setClearColorHex = function ( hex, alpha ) {

		console.warn( 'THREE.CanvasRenderer: .setClearColorHex() is being removed. Use .setClearColor() instead.' );
		this.setClearColor( hex, alpha );

	};

	this.getClearColor = function () {

		return _clearColor;

	};

	this.getClearAlpha = function () {

		return _clearAlpha;

	};

	this.getMaxAnisotropy = function () {

		return 0;

	};

	this.clear = function () {

		if ( _clearBox.isEmpty() === false ) {

			_clearBox.intersect( _clipBox );
			_clearBox.expandByScalar( 2 );

			_clearBox.min.x =   _clearBox.min.x + _canvasWidthHalf;
			_clearBox.min.y = - _clearBox.min.y + _canvasHeightHalf;		// higher y value !
			_clearBox.max.x =   _clearBox.max.x + _canvasWidthHalf;
			_clearBox.max.y = - _clearBox.max.y + _canvasHeightHalf;		// lower y value !

			if ( _clearAlpha < 1 ) {

				_context.clearRect(
					_clearBox.min.x | 0,
					_clearBox.max.y | 0,
					( _clearBox.max.x - _clearBox.min.x ) | 0,
					( _clearBox.min.y - _clearBox.max.y ) | 0
				);

			}

			if ( _clearAlpha > 0 ) {

				setBlending( THREE.NormalBlending );
				setOpacity( 1 );

				setFillStyle( 'rgba(' + Math.floor( _clearColor.r * 255 ) + ',' + Math.floor( _clearColor.g * 255 ) + ',' + Math.floor( _clearColor.b * 255 ) + ',' + _clearAlpha + ')' );

				_context.fillRect(
					_clearBox.min.x | 0,
					_clearBox.max.y | 0,
					( _clearBox.max.x - _clearBox.min.x ) | 0,
					( _clearBox.min.y - _clearBox.max.y ) | 0
				);

			}

			_clearBox.makeEmpty();

		}

	};

	// compatibility

	this.clearColor = function () {};
	this.clearDepth = function () {};
	this.clearStencil = function () {};

	this.render = function ( scene, camera ) {

		if ( camera.isCamera === undefined ) {

			console.error( 'THREE.CanvasRenderer.render: camera is not an instance of THREE.Camera.' );
			return;

		}

		var background = scene.background;

		if ( background && background.isColor ) {

			setFillStyle( 'rgb(' + Math.floor( background.r * 255 ) + ',' + Math.floor( background.g * 255 ) + ',' + Math.floor( background.b * 255 ) + ')' );
			_context.fillRect( 0, 0, _canvasWidth, _canvasHeight );

		} else if ( this.autoClear === true ) {

			this.clear();

		}

		_this.info.render.vertices = 0;
		_this.info.render.faces = 0;

		_context.setTransform( _viewportWidth / _canvasWidth, 0, 0, - _viewportHeight / _canvasHeight, _viewportX, _canvasHeight - _viewportY );
		_context.translate( _canvasWidthHalf, _canvasHeightHalf );

		_renderData = _projector.projectScene( scene, camera, this.sortObjects, this.sortElements );
		_elements = _renderData.elements;
		_lights = _renderData.lights;

		_normalViewMatrix.getNormalMatrix( camera.matrixWorldInverse );

		/* DEBUG
		setFillStyle( 'rgba( 0, 255, 255, 0.5 )' );
		_context.fillRect( _clipBox.min.x, _clipBox.min.y, _clipBox.max.x - _clipBox.min.x, _clipBox.max.y - _clipBox.min.y );
		*/

		calculateLights();

		for ( var e = 0, el = _elements.length; e < el; e ++ ) {

			var element = _elements[ e ];

			var material = element.material;

			if ( material === undefined || material.opacity === 0 ) continue;

			_elemBox.makeEmpty();

			if ( element instanceof THREE.RenderableSprite ) {

				_v1 = element;
				_v1.x *= _canvasWidthHalf; _v1.y *= _canvasHeightHalf;

				renderSprite( _v1, element, material );

			} else if ( element instanceof THREE.RenderableLine ) {

				_v1 = element.v1; _v2 = element.v2;

				_v1.positionScreen.x *= _canvasWidthHalf; _v1.positionScreen.y *= _canvasHeightHalf;
				_v2.positionScreen.x *= _canvasWidthHalf; _v2.positionScreen.y *= _canvasHeightHalf;

				_elemBox.setFromPoints( [
					_v1.positionScreen,
					_v2.positionScreen
				] );

				if ( _clipBox.intersectsBox( _elemBox ) === true ) {

					renderLine( _v1, _v2, element, material );

				}

			} else if ( element instanceof THREE.RenderableFace ) {

				_v1 = element.v1; _v2 = element.v2; _v3 = element.v3;

				if ( _v1.positionScreen.z < - 1 || _v1.positionScreen.z > 1 ) continue;
				if ( _v2.positionScreen.z < - 1 || _v2.positionScreen.z > 1 ) continue;
				if ( _v3.positionScreen.z < - 1 || _v3.positionScreen.z > 1 ) continue;

				_v1.positionScreen.x *= _canvasWidthHalf; _v1.positionScreen.y *= _canvasHeightHalf;
				_v2.positionScreen.x *= _canvasWidthHalf; _v2.positionScreen.y *= _canvasHeightHalf;
				_v3.positionScreen.x *= _canvasWidthHalf; _v3.positionScreen.y *= _canvasHeightHalf;

				if ( material.overdraw > 0 ) {

					expand( _v1.positionScreen, _v2.positionScreen, material.overdraw );
					expand( _v2.positionScreen, _v3.positionScreen, material.overdraw );
					expand( _v3.positionScreen, _v1.positionScreen, material.overdraw );

				}

				_elemBox.setFromPoints( [
					_v1.positionScreen,
					_v2.positionScreen,
					_v3.positionScreen
				] );

				if ( _clipBox.intersectsBox( _elemBox ) === true ) {

					renderFace3( _v1, _v2, _v3, 0, 1, 2, element, material );

				}

			}

			/* DEBUG
			setLineWidth( 1 );
			setStrokeStyle( 'rgba( 0, 255, 0, 0.5 )' );
			_context.strokeRect( _elemBox.min.x, _elemBox.min.y, _elemBox.max.x - _elemBox.min.x, _elemBox.max.y - _elemBox.min.y );
			*/

			_clearBox.union( _elemBox );

		}

		/* DEBUG
		setLineWidth( 1 );
		setStrokeStyle( 'rgba( 255, 0, 0, 0.5 )' );
		_context.strokeRect( _clearBox.min.x, _clearBox.min.y, _clearBox.max.x - _clearBox.min.x, _clearBox.max.y - _clearBox.min.y );
		*/

		_context.setTransform( 1, 0, 0, 1, 0, 0 );

	};

	//

	function calculateLights() {

		_ambientLight.setRGB( 0, 0, 0 );
		_directionalLights.setRGB( 0, 0, 0 );
		_pointLights.setRGB( 0, 0, 0 );

		for ( var l = 0, ll = _lights.length; l < ll; l ++ ) {

			var light = _lights[ l ];
			var lightColor = light.color;

			if ( light.isAmbientLight ) {

				_ambientLight.add( lightColor );

			} else if ( light.isDirectionalLight ) {

				// for sprites

				_directionalLights.add( lightColor );

			} else if ( light.isPointLight ) {

				// for sprites

				_pointLights.add( lightColor );

			}

		}

	}

	function calculateLight( position, normal, color ) {

		for ( var l = 0, ll = _lights.length; l < ll; l ++ ) {

			var light = _lights[ l ];

			_lightColor.copy( light.color );

			if ( light.isDirectionalLight ) {

				var lightPosition = _vector3.setFromMatrixPosition( light.matrixWorld ).normalize();

				var amount = normal.dot( lightPosition );

				if ( amount <= 0 ) continue;

				amount *= light.intensity;

				color.add( _lightColor.multiplyScalar( amount ) );

			} else if ( light.isPointLight ) {

				var lightPosition = _vector3.setFromMatrixPosition( light.matrixWorld );

				var amount = normal.dot( _vector3.subVectors( lightPosition, position ).normalize() );

				if ( amount <= 0 ) continue;

				amount *= light.distance == 0 ? 1 : 1 - Math.min( position.distanceTo( lightPosition ) / light.distance, 1 );

				if ( amount == 0 ) continue;

				amount *= light.intensity;

				color.add( _lightColor.multiplyScalar( amount ) );

			}

		}

	}

	function renderSprite( v1, element, material ) {

		setOpacity( material.opacity );
		setBlending( material.blending );

		var scaleX = element.scale.x * _canvasWidthHalf;
		var scaleY = element.scale.y * _canvasHeightHalf;

		var dist = Math.sqrt( scaleX * scaleX + scaleY * scaleY ); // allow for rotated sprite
		_elemBox.min.set( v1.x - dist, v1.y - dist );
		_elemBox.max.set( v1.x + dist, v1.y + dist );

		if ( material.isSpriteMaterial ) {

			var texture = material.map;

			if ( texture !== null ) {

				var pattern = _patterns[ texture.id ];

				if ( pattern === undefined || pattern.version !== texture.version ) {

					pattern = textureToPattern( texture );
					_patterns[ texture.id ] = pattern;

				}

				if ( pattern.canvas !== undefined ) {

					setFillStyle( pattern.canvas );

					var bitmap = texture.image;

					var ox = bitmap.width * texture.offset.x;
					var oy = bitmap.height * texture.offset.y;

					var sx = bitmap.width * texture.repeat.x;
					var sy = bitmap.height * texture.repeat.y;

					var cx = scaleX / sx;
					var cy = scaleY / sy;

					_context.save();
					_context.translate( v1.x, v1.y );
					if ( material.rotation !== 0 ) _context.rotate( material.rotation );
					_context.translate( - scaleX / 2, - scaleY / 2 );
					_context.scale( cx, cy );
					_context.translate( - ox, - oy );
					_context.fillRect( ox, oy, sx, sy );
					_context.restore();

				}

			} else {

				// no texture

				setFillStyle( material.color.getStyle() );

				_context.save();
				_context.translate( v1.x, v1.y );
				if ( material.rotation !== 0 ) _context.rotate( material.rotation );
				_context.scale( scaleX, - scaleY );
				_context.fillRect( - 0.5, - 0.5, 1, 1 );
				_context.restore();

			}

		} else if ( material.isSpriteCanvasMaterial ) {

			setStrokeStyle( material.color.getStyle() );
			setFillStyle( material.color.getStyle() );

			_context.save();
			_context.translate( v1.x, v1.y );
			if ( material.rotation !== 0 ) _context.rotate( material.rotation );
			_context.scale( scaleX, scaleY );

			material.program( _context );

			_context.restore();

		} else if ( material.isPointsMaterial ) {

			setFillStyle( material.color.getStyle() );

			_context.save();
			_context.translate( v1.x, v1.y );
			if ( material.rotation !== 0 ) _context.rotate( material.rotation );
			_context.scale( scaleX * material.size, - scaleY * material.size );
			_context.fillRect( - 0.5, - 0.5, 1, 1 );
			_context.restore();

		}

		/* DEBUG
		setStrokeStyle( 'rgb(255,255,0)' );
		_context.beginPath();
		_context.moveTo( v1.x - 10, v1.y );
		_context.lineTo( v1.x + 10, v1.y );
		_context.moveTo( v1.x, v1.y - 10 );
		_context.lineTo( v1.x, v1.y + 10 );
		_context.stroke();
		*/

	}

	function renderLine( v1, v2, element, material ) {

		setOpacity( material.opacity );
		setBlending( material.blending );

		_context.beginPath();
		_context.moveTo( v1.positionScreen.x, v1.positionScreen.y );
		_context.lineTo( v2.positionScreen.x, v2.positionScreen.y );

		if ( material.isLineBasicMaterial ) {

			setLineWidth( material.linewidth );
			setLineCap( material.linecap );
			setLineJoin( material.linejoin );

			if ( material.vertexColors !== THREE.VertexColors ) {

				setStrokeStyle( material.color.getStyle() );

			} else {

				var colorStyle1 = element.vertexColors[ 0 ].getStyle();
				var colorStyle2 = element.vertexColors[ 1 ].getStyle();

				if ( colorStyle1 === colorStyle2 ) {

					setStrokeStyle( colorStyle1 );

				} else {

					try {

						var grad = _context.createLinearGradient(
							v1.positionScreen.x,
							v1.positionScreen.y,
							v2.positionScreen.x,
							v2.positionScreen.y
						);
						grad.addColorStop( 0, colorStyle1 );
						grad.addColorStop( 1, colorStyle2 );

					} catch ( exception ) {

						grad = colorStyle1;

					}

					setStrokeStyle( grad );

				}

			}

			_context.stroke();
			_elemBox.expandByScalar( material.linewidth * 2 );

		} else if ( material.isLineDashedMaterial ) {

			setLineWidth( material.linewidth );
			setLineCap( material.linecap );
			setLineJoin( material.linejoin );
			setStrokeStyle( material.color.getStyle() );
			setLineDash( [ material.dashSize, material.gapSize ] );

			_context.stroke();

			_elemBox.expandByScalar( material.linewidth * 2 );

			setLineDash( [] );

		}

	}

	function renderFace3( v1, v2, v3, uv1, uv2, uv3, element, material ) {

		_this.info.render.vertices += 3;
		_this.info.render.faces ++;

		setOpacity( material.opacity );
		setBlending( material.blending );

		_v1x = v1.positionScreen.x; _v1y = v1.positionScreen.y;
		_v2x = v2.positionScreen.x; _v2y = v2.positionScreen.y;
		_v3x = v3.positionScreen.x; _v3y = v3.positionScreen.y;

		drawTriangle( _v1x, _v1y, _v2x, _v2y, _v3x, _v3y );

		if ( ( material.isMeshLambertMaterial || material.isMeshPhongMaterial || material.isMeshStandardMaterial ) && material.map === null ) {

			_diffuseColor.copy( material.color );
			_emissiveColor.copy( material.emissive );

			if ( material.vertexColors === THREE.FaceColors ) {

				_diffuseColor.multiply( element.color );

			}

			_color.copy( _ambientLight );

			_centroid.copy( v1.positionWorld ).add( v2.positionWorld ).add( v3.positionWorld ).divideScalar( 3 );

			calculateLight( _centroid, element.normalModel, _color );

			_color.multiply( _diffuseColor ).add( _emissiveColor );

			material.wireframe === true
				 ? strokePath( _color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin )
				 : fillPath( _color );

		} else if ( material.isMeshBasicMaterial || material.isMeshLambertMaterial || material.isMeshPhongMaterial || material.isMeshStandardMaterial ) {

			if ( material.map !== null ) {

				var mapping = material.map.mapping;

				if ( mapping === THREE.UVMapping ) {

					_uvs = element.uvs;
					patternPath( _v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _uvs[ uv1 ].x, _uvs[ uv1 ].y, _uvs[ uv2 ].x, _uvs[ uv2 ].y, _uvs[ uv3 ].x, _uvs[ uv3 ].y, material.map );

				}

			} else if ( material.envMap !== null ) {

				if ( material.envMap.mapping === THREE.SphericalReflectionMapping ) {

					_normal.copy( element.vertexNormalsModel[ uv1 ] ).applyMatrix3( _normalViewMatrix );
					_uv1x = 0.5 * _normal.x + 0.5;
					_uv1y = 0.5 * _normal.y + 0.5;

					_normal.copy( element.vertexNormalsModel[ uv2 ] ).applyMatrix3( _normalViewMatrix );
					_uv2x = 0.5 * _normal.x + 0.5;
					_uv2y = 0.5 * _normal.y + 0.5;

					_normal.copy( element.vertexNormalsModel[ uv3 ] ).applyMatrix3( _normalViewMatrix );
					_uv3x = 0.5 * _normal.x + 0.5;
					_uv3y = 0.5 * _normal.y + 0.5;

					patternPath( _v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _uv1x, _uv1y, _uv2x, _uv2y, _uv3x, _uv3y, material.envMap );

				}

			} else {

				_color.copy( material.color );

				if ( material.vertexColors === THREE.FaceColors ) {

					_color.multiply( element.color );

				}

				material.wireframe === true
					 ? strokePath( _color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin )
					 : fillPath( _color );

			}

		} else if ( material.isMeshNormalMaterial ) {

			_normal.copy( element.normalModel ).applyMatrix3( _normalViewMatrix );

			_color.setRGB( _normal.x, _normal.y, _normal.z ).multiplyScalar( 0.5 ).addScalar( 0.5 );

			material.wireframe === true
				 ? strokePath( _color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin )
				 : fillPath( _color );

		} else {

			_color.setRGB( 1, 1, 1 );

			material.wireframe === true
				 ? strokePath( _color, material.wireframeLinewidth, material.wireframeLinecap, material.wireframeLinejoin )
				 : fillPath( _color );

		}

	}

	//

	function drawTriangle( x0, y0, x1, y1, x2, y2 ) {

		_context.beginPath();
		_context.moveTo( x0, y0 );
		_context.lineTo( x1, y1 );
		_context.lineTo( x2, y2 );
		_context.closePath();

	}

	function strokePath( color, linewidth, linecap, linejoin ) {

		setLineWidth( linewidth );
		setLineCap( linecap );
		setLineJoin( linejoin );
		setStrokeStyle( color.getStyle() );

		_context.stroke();

		_elemBox.expandByScalar( linewidth * 2 );

	}

	function fillPath( color ) {

		setFillStyle( color.getStyle() );
		_context.fill();

	}

	function textureToPattern( texture ) {

		if ( texture.version === 0 ||
			texture instanceof THREE.CompressedTexture ||
			texture instanceof THREE.DataTexture ) {

			return {
				canvas: undefined,
				version: texture.version
			};

		}

		var image = texture.image;

		if ( image.complete === false ) {

			return {
				canvas: undefined,
				version: 0
			};

		}

		var repeatX = texture.wrapS === THREE.RepeatWrapping || texture.wrapS === THREE.MirroredRepeatWrapping;
		var repeatY = texture.wrapT === THREE.RepeatWrapping || texture.wrapT === THREE.MirroredRepeatWrapping;

		var mirrorX = texture.wrapS === THREE.MirroredRepeatWrapping;
		var mirrorY = texture.wrapT === THREE.MirroredRepeatWrapping;

		//

		var canvas = document.createElement( 'canvas' );
		canvas.width = image.width * ( mirrorX ? 2 : 1 );
		canvas.height = image.height * ( mirrorY ? 2 : 1 );

		var context = canvas.getContext( '2d' );
		context.setTransform( 1, 0, 0, - 1, 0, image.height );
		context.drawImage( image, 0, 0 );

		if ( mirrorX === true ) {

			context.setTransform( - 1, 0, 0, - 1, image.width, image.height );
			context.drawImage( image, - image.width, 0 );

		}

		if ( mirrorY === true ) {

			context.setTransform( 1, 0, 0, 1, 0, 0 );
			context.drawImage( image, 0, image.height );

		}

		if ( mirrorX === true && mirrorY === true ) {

			context.setTransform( - 1, 0, 0, 1, image.width, 0 );
			context.drawImage( image, - image.width, image.height );

		}

		var repeat = 'no-repeat';

		if ( repeatX === true && repeatY === true ) {

			repeat = 'repeat';

		} else if ( repeatX === true ) {

			repeat = 'repeat-x';

		} else if ( repeatY === true ) {

			repeat = 'repeat-y';

		}

		var pattern = _context.createPattern( canvas, repeat );

		if ( texture.onUpdate ) texture.onUpdate( texture );

		return {
			canvas: pattern,
			version: texture.version
		};

	}

	function patternPath( x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2, texture ) {

		var pattern = _patterns[ texture.id ];

		if ( pattern === undefined || pattern.version !== texture.version ) {

			pattern = textureToPattern( texture );
			_patterns[ texture.id ] = pattern;

		}

		if ( pattern.canvas !== undefined ) {

			setFillStyle( pattern.canvas );

		} else {

			setFillStyle( 'rgba( 0, 0, 0, 1)' );
			_context.fill();
			return;

		}

		// http://extremelysatisfactorytotalitarianism.com/blog/?p=2120

		var a, b, c, d, e, f, det, idet,
			offsetX = texture.offset.x / texture.repeat.x,
			offsetY = texture.offset.y / texture.repeat.y,
			width = texture.image.width * texture.repeat.x,
			height = texture.image.height * texture.repeat.y;

		u0 = ( u0 + offsetX ) * width;
		v0 = ( v0 + offsetY ) * height;

		u1 = ( u1 + offsetX ) * width;
		v1 = ( v1 + offsetY ) * height;

		u2 = ( u2 + offsetX ) * width;
		v2 = ( v2 + offsetY ) * height;

		x1 -= x0; y1 -= y0;
		x2 -= x0; y2 -= y0;

		u1 -= u0; v1 -= v0;
		u2 -= u0; v2 -= v0;

		det = u1 * v2 - u2 * v1;

		if ( det === 0 ) return;

		idet = 1 / det;

		a = ( v2 * x1 - v1 * x2 ) * idet;
		b = ( v2 * y1 - v1 * y2 ) * idet;
		c = ( u1 * x2 - u2 * x1 ) * idet;
		d = ( u1 * y2 - u2 * y1 ) * idet;

		e = x0 - a * u0 - c * v0;
		f = y0 - b * u0 - d * v0;

		_context.save();
		_context.transform( a, b, c, d, e, f );
		_context.fill();
		_context.restore();

	}

	/*
	function clipImage( x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2, image ) {

		// http://extremelysatisfactorytotalitarianism.com/blog/?p=2120

		var a, b, c, d, e, f, det, idet,
		width = image.width - 1,
		height = image.height - 1;

		u0 *= width; v0 *= height;
		u1 *= width; v1 *= height;
		u2 *= width; v2 *= height;

		x1 -= x0; y1 -= y0;
		x2 -= x0; y2 -= y0;

		u1 -= u0; v1 -= v0;
		u2 -= u0; v2 -= v0;

		det = u1 * v2 - u2 * v1;

		idet = 1 / det;

		a = ( v2 * x1 - v1 * x2 ) * idet;
		b = ( v2 * y1 - v1 * y2 ) * idet;
		c = ( u1 * x2 - u2 * x1 ) * idet;
		d = ( u1 * y2 - u2 * y1 ) * idet;

		e = x0 - a * u0 - c * v0;
		f = y0 - b * u0 - d * v0;

		_context.save();
		_context.transform( a, b, c, d, e, f );
		_context.clip();
		_context.drawImage( image, 0, 0 );
		_context.restore();

	}
	*/

	// Hide anti-alias gaps

	function expand( v1, v2, pixels ) {

		var x = v2.x - v1.x, y = v2.y - v1.y,
			det = x * x + y * y, idet;

		if ( det === 0 ) return;

		idet = pixels / Math.sqrt( det );

		x *= idet; y *= idet;

		v2.x += x; v2.y += y;
		v1.x -= x; v1.y -= y;

	}

	// Context cached methods.

	function setOpacity( value ) {

		if ( _contextGlobalAlpha !== value ) {

			_context.globalAlpha = value;
			_contextGlobalAlpha = value;

		}

	}

	function setBlending( value ) {

		if ( _contextGlobalCompositeOperation !== value ) {

			if ( value === THREE.NormalBlending ) {

				_context.globalCompositeOperation = 'source-over';

			} else if ( value === THREE.AdditiveBlending ) {

				_context.globalCompositeOperation = 'lighter';

			} else if ( value === THREE.SubtractiveBlending ) {

				_context.globalCompositeOperation = 'darker';

			} else if ( value === THREE.MultiplyBlending ) {

				_context.globalCompositeOperation = 'multiply';

			}

			_contextGlobalCompositeOperation = value;

		}

	}

	function setLineWidth( value ) {

		if ( _contextLineWidth !== value ) {

			_context.lineWidth = value;
			_contextLineWidth = value;

		}

	}

	function setLineCap( value ) {

		// "butt", "round", "square"

		if ( _contextLineCap !== value ) {

			_context.lineCap = value;
			_contextLineCap = value;

		}

	}

	function setLineJoin( value ) {

		// "round", "bevel", "miter"

		if ( _contextLineJoin !== value ) {

			_context.lineJoin = value;
			_contextLineJoin = value;

		}

	}

	function setStrokeStyle( value ) {

		if ( _contextStrokeStyle !== value ) {

			_context.strokeStyle = value;
			_contextStrokeStyle = value;

		}

	}

	function setFillStyle( value ) {

		if ( _contextFillStyle !== value ) {

			_context.fillStyle = value;
			_contextFillStyle = value;

		}

	}

	function setLineDash( value ) {

		if ( _contextLineDash.length !== value.length ) {

			_context.setLineDash( value );
			_contextLineDash = value;

		}

	}

};

/**
 * @author mrdoob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author julianwa / https://github.com/julianwa
 */

THREE.RenderableObject = function () {

	this.id = 0;

	this.object = null;
	this.z = 0;
	this.renderOrder = 0;

};

//

THREE.RenderableFace = function () {

	this.id = 0;

	this.v1 = new THREE.RenderableVertex();
	this.v2 = new THREE.RenderableVertex();
	this.v3 = new THREE.RenderableVertex();

	this.normalModel = new THREE.Vector3();

	this.vertexNormalsModel = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];
	this.vertexNormalsLength = 0;

	this.color = new THREE.Color();
	this.material = null;
	this.uvs = [ new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2() ];

	this.z = 0;
	this.renderOrder = 0;

};

//

THREE.RenderableVertex = function () {

	this.position = new THREE.Vector3();
	this.positionWorld = new THREE.Vector3();
	this.positionScreen = new THREE.Vector4();

	this.visible = true;

};

THREE.RenderableVertex.prototype.copy = function ( vertex ) {

	this.positionWorld.copy( vertex.positionWorld );
	this.positionScreen.copy( vertex.positionScreen );

};

//

THREE.RenderableLine = function () {

	this.id = 0;

	this.v1 = new THREE.RenderableVertex();
	this.v2 = new THREE.RenderableVertex();

	this.vertexColors = [ new THREE.Color(), new THREE.Color() ];
	this.material = null;

	this.z = 0;
	this.renderOrder = 0;

};

//

THREE.RenderableSprite = function () {

	this.id = 0;

	this.object = null;

	this.x = 0;
	this.y = 0;
	this.z = 0;

	this.rotation = 0;
	this.scale = new THREE.Vector2();

	this.material = null;
	this.renderOrder = 0;

};

//

THREE.Projector = function () {

	var _object, _objectCount, _objectPool = [], _objectPoolLength = 0,
		_vertex, _vertexCount, _vertexPool = [], _vertexPoolLength = 0,
		_face, _faceCount, _facePool = [], _facePoolLength = 0,
		_line, _lineCount, _linePool = [], _linePoolLength = 0,
		_sprite, _spriteCount, _spritePool = [], _spritePoolLength = 0,

		_renderData = { objects: [], lights: [], elements: [] },

		_vector3 = new THREE.Vector3(),
		_vector4 = new THREE.Vector4(),

		_clipBox = new THREE.Box3( new THREE.Vector3( - 1, - 1, - 1 ), new THREE.Vector3( 1, 1, 1 ) ),
		_boundingBox = new THREE.Box3(),
		_points3 = new Array( 3 ),

		_viewMatrix = new THREE.Matrix4(),
		_viewProjectionMatrix = new THREE.Matrix4(),

		_modelMatrix,
		_modelViewProjectionMatrix = new THREE.Matrix4(),

		_normalMatrix = new THREE.Matrix3(),

		_frustum = new THREE.Frustum(),

		_clippedVertex1PositionScreen = new THREE.Vector4(),
		_clippedVertex2PositionScreen = new THREE.Vector4();

	//

	this.projectVector = function ( vector, camera ) {

		console.warn( 'THREE.Projector: .projectVector() is now vector.project().' );
		vector.project( camera );

	};

	this.unprojectVector = function ( vector, camera ) {

		console.warn( 'THREE.Projector: .unprojectVector() is now vector.unproject().' );
		vector.unproject( camera );

	};

	this.pickingRay = function () {

		console.error( 'THREE.Projector: .pickingRay() is now raycaster.setFromCamera().' );

	};

	//

	var RenderList = function () {

		var normals = [];
		var colors = [];
		var uvs = [];

		var object = null;
		var material = null;

		var normalMatrix = new THREE.Matrix3();

		function setObject( value ) {

			object = value;
			material = object.material;

			normalMatrix.getNormalMatrix( object.matrixWorld );

			normals.length = 0;
			colors.length = 0;
			uvs.length = 0;

		}

		function projectVertex( vertex ) {

			var position = vertex.position;
			var positionWorld = vertex.positionWorld;
			var positionScreen = vertex.positionScreen;

			positionWorld.copy( position ).applyMatrix4( _modelMatrix );
			positionScreen.copy( positionWorld ).applyMatrix4( _viewProjectionMatrix );

			var invW = 1 / positionScreen.w;

			positionScreen.x *= invW;
			positionScreen.y *= invW;
			positionScreen.z *= invW;

			vertex.visible = positionScreen.x >= - 1 && positionScreen.x <= 1 &&
					 positionScreen.y >= - 1 && positionScreen.y <= 1 &&
					 positionScreen.z >= - 1 && positionScreen.z <= 1;

		}

		function pushVertex( x, y, z ) {

			_vertex = getNextVertexInPool();
			_vertex.position.set( x, y, z );

			projectVertex( _vertex );

		}

		function pushNormal( x, y, z ) {

			normals.push( x, y, z );

		}

		function pushColor( r, g, b ) {

			colors.push( r, g, b );

		}

		function pushUv( x, y ) {

			uvs.push( x, y );

		}

		function checkTriangleVisibility( v1, v2, v3 ) {

			if ( v1.visible === true || v2.visible === true || v3.visible === true ) return true;

			_points3[ 0 ] = v1.positionScreen;
			_points3[ 1 ] = v2.positionScreen;
			_points3[ 2 ] = v3.positionScreen;

			return _clipBox.intersectsBox( _boundingBox.setFromPoints( _points3 ) );

		}

		function checkBackfaceCulling( v1, v2, v3 ) {

			return ( ( v3.positionScreen.x - v1.positionScreen.x ) *
				    ( v2.positionScreen.y - v1.positionScreen.y ) -
				    ( v3.positionScreen.y - v1.positionScreen.y ) *
				    ( v2.positionScreen.x - v1.positionScreen.x ) ) < 0;

		}

		function pushLine( a, b ) {

			var v1 = _vertexPool[ a ];
			var v2 = _vertexPool[ b ];

			// Clip

			v1.positionScreen.copy( v1.position ).applyMatrix4( _modelViewProjectionMatrix );
			v2.positionScreen.copy( v2.position ).applyMatrix4( _modelViewProjectionMatrix );

			if ( clipLine( v1.positionScreen, v2.positionScreen ) === true ) {

				// Perform the perspective divide
				v1.positionScreen.multiplyScalar( 1 / v1.positionScreen.w );
				v2.positionScreen.multiplyScalar( 1 / v2.positionScreen.w );

				_line = getNextLineInPool();
				_line.id = object.id;
				_line.v1.copy( v1 );
				_line.v2.copy( v2 );
				_line.z = Math.max( v1.positionScreen.z, v2.positionScreen.z );
				_line.renderOrder = object.renderOrder;

				_line.material = object.material;

				if ( object.material.vertexColors === THREE.VertexColors ) {

					_line.vertexColors[ 0 ].fromArray( colors, a * 3 );
					_line.vertexColors[ 1 ].fromArray( colors, b * 3 );

				}

				_renderData.elements.push( _line );

			}

		}

		function pushTriangle( a, b, c ) {

			var v1 = _vertexPool[ a ];
			var v2 = _vertexPool[ b ];
			var v3 = _vertexPool[ c ];

			if ( checkTriangleVisibility( v1, v2, v3 ) === false ) return;

			if ( material.side === THREE.DoubleSide || checkBackfaceCulling( v1, v2, v3 ) === true ) {

				_face = getNextFaceInPool();

				_face.id = object.id;
				_face.v1.copy( v1 );
				_face.v2.copy( v2 );
				_face.v3.copy( v3 );
				_face.z = ( v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z ) / 3;
				_face.renderOrder = object.renderOrder;

				// use first vertex normal as face normal

				_face.normalModel.fromArray( normals, a * 3 );
				_face.normalModel.applyMatrix3( normalMatrix ).normalize();

				for ( var i = 0; i < 3; i ++ ) {

					var normal = _face.vertexNormalsModel[ i ];
					normal.fromArray( normals, arguments[ i ] * 3 );
					normal.applyMatrix3( normalMatrix ).normalize();

					var uv = _face.uvs[ i ];
					uv.fromArray( uvs, arguments[ i ] * 2 );

				}

				_face.vertexNormalsLength = 3;

				_face.material = object.material;

				_renderData.elements.push( _face );

			}

		}

		return {
			setObject: setObject,
			projectVertex: projectVertex,
			checkTriangleVisibility: checkTriangleVisibility,
			checkBackfaceCulling: checkBackfaceCulling,
			pushVertex: pushVertex,
			pushNormal: pushNormal,
			pushColor: pushColor,
			pushUv: pushUv,
			pushLine: pushLine,
			pushTriangle: pushTriangle
		};

	};

	var renderList = new RenderList();

	function projectObject( object ) {

		if ( object.visible === false ) return;

		if ( object instanceof THREE.Light ) {

			_renderData.lights.push( object );

		} else if ( object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points ) {

			if ( object.material.visible === false ) return;
			if ( object.frustumCulled === true && _frustum.intersectsObject( object ) === false ) return;

			addObject( object );

		} else if ( object instanceof THREE.Sprite ) {

			if ( object.material.visible === false ) return;
			if ( object.frustumCulled === true && _frustum.intersectsSprite( object ) === false ) return;

			addObject( object );

		}

		var children = object.children;

		for ( var i = 0, l = children.length; i < l; i ++ ) {

			projectObject( children[ i ] );

		}

	}

	function addObject( object ) {

		_object = getNextObjectInPool();
		_object.id = object.id;
		_object.object = object;

		_vector3.setFromMatrixPosition( object.matrixWorld );
		_vector3.applyMatrix4( _viewProjectionMatrix );
		_object.z = _vector3.z;
		_object.renderOrder = object.renderOrder;

		_renderData.objects.push( _object );

	}

	this.projectScene = function ( scene, camera, sortObjects, sortElements ) {

		_faceCount = 0;
		_lineCount = 0;
		_spriteCount = 0;

		_renderData.elements.length = 0;

		if ( scene.autoUpdate === true ) scene.updateMatrixWorld();
		if ( camera.parent === null ) camera.updateMatrixWorld();

		_viewMatrix.copy( camera.matrixWorldInverse );
		_viewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, _viewMatrix );

		_frustum.setFromMatrix( _viewProjectionMatrix );

		//

		_objectCount = 0;

		_renderData.objects.length = 0;
		_renderData.lights.length = 0;

		projectObject( scene );

		if ( sortObjects === true ) {

			_renderData.objects.sort( painterSort );

		}

		//

		var objects = _renderData.objects;

		for ( var o = 0, ol = objects.length; o < ol; o ++ ) {

			var object = objects[ o ].object;
			var geometry = object.geometry;

			renderList.setObject( object );

			_modelMatrix = object.matrixWorld;

			_vertexCount = 0;

			if ( object instanceof THREE.Mesh ) {

				if ( geometry instanceof THREE.BufferGeometry ) {

					var attributes = geometry.attributes;
					var groups = geometry.groups;

					if ( attributes.position === undefined ) continue;

					var positions = attributes.position.array;

					for ( var i = 0, l = positions.length; i < l; i += 3 ) {

						renderList.pushVertex( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );

					}

					if ( attributes.normal !== undefined ) {

						var normals = attributes.normal.array;

						for ( var i = 0, l = normals.length; i < l; i += 3 ) {

							renderList.pushNormal( normals[ i ], normals[ i + 1 ], normals[ i + 2 ] );

						}

					}

					if ( attributes.uv !== undefined ) {

						var uvs = attributes.uv.array;

						for ( var i = 0, l = uvs.length; i < l; i += 2 ) {

							renderList.pushUv( uvs[ i ], uvs[ i + 1 ] );

						}

					}

					if ( geometry.index !== null ) {

						var indices = geometry.index.array;

						if ( groups.length > 0 ) {

							for ( var g = 0; g < groups.length; g ++ ) {

								var group = groups[ g ];

								for ( var i = group.start, l = group.start + group.count; i < l; i += 3 ) {

									renderList.pushTriangle( indices[ i ], indices[ i + 1 ], indices[ i + 2 ] );

								}

							}

						} else {

							for ( var i = 0, l = indices.length; i < l; i += 3 ) {

								renderList.pushTriangle( indices[ i ], indices[ i + 1 ], indices[ i + 2 ] );

							}

						}

					} else {

						for ( var i = 0, l = positions.length / 3; i < l; i += 3 ) {

							renderList.pushTriangle( i, i + 1, i + 2 );

						}

					}

				} else if ( geometry instanceof THREE.Geometry ) {

					var vertices = geometry.vertices;
					var faces = geometry.faces;
					var faceVertexUvs = geometry.faceVertexUvs[ 0 ];

					_normalMatrix.getNormalMatrix( _modelMatrix );

					var material = object.material;

					var isMultiMaterial = Array.isArray( material );

					for ( var v = 0, vl = vertices.length; v < vl; v ++ ) {

						var vertex = vertices[ v ];

						_vector3.copy( vertex );

						if ( material.morphTargets === true ) {

							var morphTargets = geometry.morphTargets;
							var morphInfluences = object.morphTargetInfluences;

							for ( var t = 0, tl = morphTargets.length; t < tl; t ++ ) {

								var influence = morphInfluences[ t ];

								if ( influence === 0 ) continue;

								var target = morphTargets[ t ];
								var targetVertex = target.vertices[ v ];

								_vector3.x += ( targetVertex.x - vertex.x ) * influence;
								_vector3.y += ( targetVertex.y - vertex.y ) * influence;
								_vector3.z += ( targetVertex.z - vertex.z ) * influence;

							}

						}

						renderList.pushVertex( _vector3.x, _vector3.y, _vector3.z );

					}

					for ( var f = 0, fl = faces.length; f < fl; f ++ ) {

						var face = faces[ f ];

						material = isMultiMaterial === true
							 ? object.material[ face.materialIndex ]
							 : object.material;

						if ( material === undefined ) continue;

						var side = material.side;

						var v1 = _vertexPool[ face.a ];
						var v2 = _vertexPool[ face.b ];
						var v3 = _vertexPool[ face.c ];

						if ( renderList.checkTriangleVisibility( v1, v2, v3 ) === false ) continue;

						var visible = renderList.checkBackfaceCulling( v1, v2, v3 );

						if ( side !== THREE.DoubleSide ) {

							if ( side === THREE.FrontSide && visible === false ) continue;
							if ( side === THREE.BackSide && visible === true ) continue;

						}

						_face = getNextFaceInPool();

						_face.id = object.id;
						_face.v1.copy( v1 );
						_face.v2.copy( v2 );
						_face.v3.copy( v3 );

						_face.normalModel.copy( face.normal );

						if ( visible === false && ( side === THREE.BackSide || side === THREE.DoubleSide ) ) {

							_face.normalModel.negate();

						}

						_face.normalModel.applyMatrix3( _normalMatrix ).normalize();

						var faceVertexNormals = face.vertexNormals;

						for ( var n = 0, nl = Math.min( faceVertexNormals.length, 3 ); n < nl; n ++ ) {

							var normalModel = _face.vertexNormalsModel[ n ];
							normalModel.copy( faceVertexNormals[ n ] );

							if ( visible === false && ( side === THREE.BackSide || side === THREE.DoubleSide ) ) {

								normalModel.negate();

							}

							normalModel.applyMatrix3( _normalMatrix ).normalize();

						}

						_face.vertexNormalsLength = faceVertexNormals.length;

						var vertexUvs = faceVertexUvs[ f ];

						if ( vertexUvs !== undefined ) {

							for ( var u = 0; u < 3; u ++ ) {

								_face.uvs[ u ].copy( vertexUvs[ u ] );

							}

						}

						_face.color = face.color;
						_face.material = material;

						_face.z = ( v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z ) / 3;
						_face.renderOrder = object.renderOrder;

						_renderData.elements.push( _face );

					}

				}

			} else if ( object instanceof THREE.Line ) {

				_modelViewProjectionMatrix.multiplyMatrices( _viewProjectionMatrix, _modelMatrix );

				if ( geometry instanceof THREE.BufferGeometry ) {

					var attributes = geometry.attributes;

					if ( attributes.position !== undefined ) {

						var positions = attributes.position.array;

						for ( var i = 0, l = positions.length; i < l; i += 3 ) {

							renderList.pushVertex( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );

						}

						if ( attributes.color !== undefined ) {

							var colors = attributes.color.array;

							for ( var i = 0, l = colors.length; i < l; i += 3 ) {

								renderList.pushColor( colors[ i ], colors[ i + 1 ], colors[ i + 2 ] );

							}

						}

						if ( geometry.index !== null ) {

							var indices = geometry.index.array;

							for ( var i = 0, l = indices.length; i < l; i += 2 ) {

								renderList.pushLine( indices[ i ], indices[ i + 1 ] );

							}

						} else {

							var step = object instanceof THREE.LineSegments ? 2 : 1;

							for ( var i = 0, l = ( positions.length / 3 ) - 1; i < l; i += step ) {

								renderList.pushLine( i, i + 1 );

							}

						}

					}

				} else if ( geometry instanceof THREE.Geometry ) {

					var vertices = object.geometry.vertices;

					if ( vertices.length === 0 ) continue;

					v1 = getNextVertexInPool();
					v1.positionScreen.copy( vertices[ 0 ] ).applyMatrix4( _modelViewProjectionMatrix );

					var step = object instanceof THREE.LineSegments ? 2 : 1;

					for ( var v = 1, vl = vertices.length; v < vl; v ++ ) {

						v1 = getNextVertexInPool();
						v1.positionScreen.copy( vertices[ v ] ).applyMatrix4( _modelViewProjectionMatrix );

						if ( ( v + 1 ) % step > 0 ) continue;

						v2 = _vertexPool[ _vertexCount - 2 ];

						_clippedVertex1PositionScreen.copy( v1.positionScreen );
						_clippedVertex2PositionScreen.copy( v2.positionScreen );

						if ( clipLine( _clippedVertex1PositionScreen, _clippedVertex2PositionScreen ) === true ) {

							// Perform the perspective divide
							_clippedVertex1PositionScreen.multiplyScalar( 1 / _clippedVertex1PositionScreen.w );
							_clippedVertex2PositionScreen.multiplyScalar( 1 / _clippedVertex2PositionScreen.w );

							_line = getNextLineInPool();

							_line.id = object.id;
							_line.v1.positionScreen.copy( _clippedVertex1PositionScreen );
							_line.v2.positionScreen.copy( _clippedVertex2PositionScreen );

							_line.z = Math.max( _clippedVertex1PositionScreen.z, _clippedVertex2PositionScreen.z );
							_line.renderOrder = object.renderOrder;

							_line.material = object.material;

							if ( object.material.vertexColors === THREE.VertexColors ) {

								_line.vertexColors[ 0 ].copy( object.geometry.colors[ v ] );
								_line.vertexColors[ 1 ].copy( object.geometry.colors[ v - 1 ] );

							}

							_renderData.elements.push( _line );

						}

					}

				}

			} else if ( object instanceof THREE.Points ) {

				_modelViewProjectionMatrix.multiplyMatrices( _viewProjectionMatrix, _modelMatrix );

				if ( geometry instanceof THREE.Geometry ) {

					var vertices = object.geometry.vertices;

					for ( var v = 0, vl = vertices.length; v < vl; v ++ ) {

						var vertex = vertices[ v ];

						_vector4.set( vertex.x, vertex.y, vertex.z, 1 );
						_vector4.applyMatrix4( _modelViewProjectionMatrix );

						pushPoint( _vector4, object, camera );

					}

				} else if ( geometry instanceof THREE.BufferGeometry ) {

					var attributes = geometry.attributes;

					if ( attributes.position !== undefined ) {

						var positions = attributes.position.array;

						for ( var i = 0, l = positions.length; i < l; i += 3 ) {

							_vector4.set( positions[ i ], positions[ i + 1 ], positions[ i + 2 ], 1 );
							_vector4.applyMatrix4( _modelViewProjectionMatrix );

							pushPoint( _vector4, object, camera );

						}

					}

				}

			} else if ( object instanceof THREE.Sprite ) {

				_vector4.set( _modelMatrix.elements[ 12 ], _modelMatrix.elements[ 13 ], _modelMatrix.elements[ 14 ], 1 );
				_vector4.applyMatrix4( _viewProjectionMatrix );

				pushPoint( _vector4, object, camera );

			}

		}

		if ( sortElements === true ) {

			_renderData.elements.sort( painterSort );

		}

		return _renderData;

	};

	function pushPoint( _vector4, object, camera ) {

		var invW = 1 / _vector4.w;

		_vector4.z *= invW;

		if ( _vector4.z >= - 1 && _vector4.z <= 1 ) {

			_sprite = getNextSpriteInPool();
			_sprite.id = object.id;
			_sprite.x = _vector4.x * invW;
			_sprite.y = _vector4.y * invW;
			_sprite.z = _vector4.z;
			_sprite.renderOrder = object.renderOrder;
			_sprite.object = object;

			_sprite.rotation = object.rotation;

			_sprite.scale.x = object.scale.x * Math.abs( _sprite.x - ( _vector4.x + camera.projectionMatrix.elements[ 0 ] ) / ( _vector4.w + camera.projectionMatrix.elements[ 12 ] ) );
			_sprite.scale.y = object.scale.y * Math.abs( _sprite.y - ( _vector4.y + camera.projectionMatrix.elements[ 5 ] ) / ( _vector4.w + camera.projectionMatrix.elements[ 13 ] ) );

			_sprite.material = object.material;

			_renderData.elements.push( _sprite );

		}

	}

	// Pools

	function getNextObjectInPool() {

		if ( _objectCount === _objectPoolLength ) {

			var object = new THREE.RenderableObject();
			_objectPool.push( object );
			_objectPoolLength ++;
			_objectCount ++;
			return object;

		}

		return _objectPool[ _objectCount ++ ];

	}

	function getNextVertexInPool() {

		if ( _vertexCount === _vertexPoolLength ) {

			var vertex = new THREE.RenderableVertex();
			_vertexPool.push( vertex );
			_vertexPoolLength ++;
			_vertexCount ++;
			return vertex;

		}

		return _vertexPool[ _vertexCount ++ ];

	}

	function getNextFaceInPool() {

		if ( _faceCount === _facePoolLength ) {

			var face = new THREE.RenderableFace();
			_facePool.push( face );
			_facePoolLength ++;
			_faceCount ++;
			return face;

		}

		return _facePool[ _faceCount ++ ];


	}

	function getNextLineInPool() {

		if ( _lineCount === _linePoolLength ) {

			var line = new THREE.RenderableLine();
			_linePool.push( line );
			_linePoolLength ++;
			_lineCount ++;
			return line;

		}

		return _linePool[ _lineCount ++ ];

	}

	function getNextSpriteInPool() {

		if ( _spriteCount === _spritePoolLength ) {

			var sprite = new THREE.RenderableSprite();
			_spritePool.push( sprite );
			_spritePoolLength ++;
			_spriteCount ++;
			return sprite;

		}

		return _spritePool[ _spriteCount ++ ];

	}

	//

	function painterSort( a, b ) {

		if ( a.renderOrder !== b.renderOrder ) {

			return a.renderOrder - b.renderOrder;

		} else if ( a.z !== b.z ) {

			return b.z - a.z;

		} else if ( a.id !== b.id ) {

			return a.id - b.id;

		} else {

			return 0;

		}

	}

	function clipLine( s1, s2 ) {

		var alpha1 = 0, alpha2 = 1,

		// Calculate the boundary coordinate of each vertex for the near and far clip planes,
		// Z = -1 and Z = +1, respectively.

			bc1near = s1.z + s1.w,
			bc2near = s2.z + s2.w,
			bc1far = - s1.z + s1.w,
			bc2far = - s2.z + s2.w;

		if ( bc1near >= 0 && bc2near >= 0 && bc1far >= 0 && bc2far >= 0 ) {

			// Both vertices lie entirely within all clip planes.
			return true;

		} else if ( ( bc1near < 0 && bc2near < 0 ) || ( bc1far < 0 && bc2far < 0 ) ) {

			// Both vertices lie entirely outside one of the clip planes.
			return false;

		} else {

			// The line segment spans at least one clip plane.

			if ( bc1near < 0 ) {

				// v1 lies outside the near plane, v2 inside
				alpha1 = Math.max( alpha1, bc1near / ( bc1near - bc2near ) );

			} else if ( bc2near < 0 ) {

				// v2 lies outside the near plane, v1 inside
				alpha2 = Math.min( alpha2, bc1near / ( bc1near - bc2near ) );

			}

			if ( bc1far < 0 ) {

				// v1 lies outside the far plane, v2 inside
				alpha1 = Math.max( alpha1, bc1far / ( bc1far - bc2far ) );

			} else if ( bc2far < 0 ) {

				// v2 lies outside the far plane, v2 inside
				alpha2 = Math.min( alpha2, bc1far / ( bc1far - bc2far ) );

			}

			if ( alpha2 < alpha1 ) {

				// The line segment spans two boundaries, but is outside both of them.
				// (This can't happen when we're only clipping against just near/far but good
				//  to leave the check here for future usage if other clip planes are added.)
				return false;

			} else {

				// Update the s1 and s2 vertices to match the clipped line segment.
				s1.lerp( s2, alpha1 );
				s2.lerp( s1, 1 - alpha2 );

				return true;

			}

		}

	}

};

/**
 * Creates several bindings and useful functions for mouse and touch interactions
 * @param {*} container 
 */
function TouchEventListener(container) {
    var _container = container;

    var _mouseInContainer = false;
    var _leftButtonDown = false;
    var _rightButtonDown = false;
    var _buttonsDown = 0;
    var _suppressContextMenu = false;

    var _screenStartX = 0;
    var _screenStartY = 0;

    var _clientStartX = 0;
    var _clientStartY = 0;

    var _self = this;

    _container.addEventListener('mouseenter', function() {
        _mouseInContainer = true;
    });

    _container.addEventListener('mouseleave', function() {
        _mouseInContainer = false;
    });

    _container.addEventListener('mousedown', function(event) {
        if(event.buttons & 2) _rightButtonDown = true;
        if(event.buttons & 1) _leftButtonDown = true;
        _buttonsDown |= event.buttons;

        _screenStartX = event.screenX;
        _screenStartY = event.screenY;

        var containerBounds = _container.getBoundingClientRect();
        _clientStartX = event.clientX - containerBounds.left;
        _clientStartY = event.clientY - containerBounds.top;
    });

    document.addEventListener('mouseup', function(event) {
        if(event.button === 2) {
            _rightButtonDown = false;
            _buttonsDown &= 11011;
        }
        if(event.button === 0) {
            _leftButtonDown = false;
            _buttonsDown &= 11110;
        }
    });

    _container.addEventListener('contextmenu', function(event) {
        if(_suppressContextMenu) {
            event.preventDefault();
            _suppressContextMenu = false;
        }
    });

    document.addEventListener('mousemove', function(event) {
        if(_leftButtonDown || _rightButtonDown) {
            var containerBounds = _container.getBoundingClientRect();
            var e = {
                screenStartX: _screenStartX,
                screenX: event.screenX,
                screenStartY: _screenStartY,
                screenY: event.screenY,
                clientStartX: _clientStartX,
                clientX: event.clientX - containerBounds.left,
                clientStartY: _clientStartY,
                clientY: event.clientY - containerBounds.top,
                leftButtonDown: _leftButtonDown,
                rightButtonDown: _rightButtonDown,
                buttons: _buttonsDown,
                suppressContextMenu: function() {
                    _suppressContextMenu = true;
                },
                preventDefault: function() {
                    event.preventDefault();
                }
            };
            _self.onpan(e);
        }
    });

    _container.addEventListener('wheel', function(event) {
        var e = {
            amount: event.deltaY,
            suppressScrolling: function() {
                event.preventDefault();
            }
        };
        _self.onzoom(e);
    });

    this.onpan = function() {
        return false;
    };

    this.onzoom = function() {
        return false;
    };
}

/**
 * Creates a scene and a renderer
 * @param {*} container 
 * @param {*} opts 
 */

function Frame(container, opts) {
    /**
     * The type of this object. (Read-only)
     */
    this.type = 'Frame';

    // Make sure the container is a dom element
    if(!container instanceof Element) {
        console.log('Interactive.Axes3D: Invalid container. Must be a DOM Element');
        return null;
    }

    // Avoid null pointer errors later on
    if(opts === undefined) opts = {};

    /**
     * DOM Element which contains the frame
     */
    this.container = container;

    /**
     * Event Listener for touch and mouse events
     */
    this.touchEventListener = new TouchEventListener(this.container);

    /**
     * Width of the viewport derived from the width of the container. (Read-only)
     */
    this.width = container.clientWidth;

    /**
     * Height of the viewport derived from the width of the container. (Read-only)
     */
    this.height = container.clientHeight;

    if(opts.antialias === undefined) opts.antialias = true;

    /**
     * Renderer from Three.js. (Private)
     */
    this.renderer = new THREE.WebGLRenderer(opts);

    // Initialize renderer within container
    this.renderer.setSize(this.width, this.height);
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    /**
     * Scene from Three.js where all the elements lie.
     */    
    this.scene = new THREE.Scene();
}

/**
 * Render the frame
 */
Frame.prototype.render = function(camera) {
    this.renderer.render( this.scene, camera );
};

function Number(value) {
    this.value = value;
} 

Number.prototype.add = function(n) {
    return new Number(this.value + n.value);
};

Number.prototype.sub = function(n) {
    return new Number(this.value - n.value);
};

Number.prototype.mul = function(n) {
    return new Number(this.value * n.value);
};

Number.prototype.div = function(n) {
    return new Number(this.value / n.value);
};

Number.prototype.exp = function(n) {
    return new Number(Math.pow(this.value, n.value));
};

Number.prototype.abs = function() {
    return new Number(Math.abs(this.value));
};

Number.prototype.neg = function() {
    return new Number(-this.value);
};

Number.prototype.compareTo = function(n) {
    if(this.value > n.value) return 1;
    if(this.value < n.value) return -1;
    if(this.value === n.value) return 0;
    return null;
};

for(var i = 0; i < 10; i++) {
    Number[i] = new Number(i);
}

/**
 * Represents a vector with an arbitrary number of dimensions, and of any type that supports adding and scaling. Operations create new instances
 */
function Vector() {
    this.type = 'Vector';

    // Support an arbitrary number of dimensions (Read-only)
    this.dimensions = arguments.length;

    // q is the general term for a coordinate
    this.q = Array.from(arguments);

    this.expr = null;
}

/**
 * Creates a copy of this vector
 */
Vector.prototype.clone = function() {
    var newVec = new Vector();
    newVec.dimensions = this.dimensions;
    newVec.q = this.q.slice();
    return newVec;
};

/**
 * Adds the vector to this vector
 */
Vector.prototype.add = function(v) {
    if(v.dimensions !== this.dimensions) {
        console.log('Interactive.Vector: Dimensions mismatch');
        return null;
    }

    var result = this.clone();
    for(var i = 0; i < this.dimensions; i++) {
        result.q[i] = result.q[i].add(v.q[i]);
    }
    return result;
};

Vector.prototype.sub = function(v) {
    if(v.dimensions !== this.dimensions) {
        console.log('Interactive.Vector: Dimensions mismatch');
        return null;
    }

    var result = this.clone();
    for(var i = 0; i < this.dimensions; i++) {
        result.q[i] = result.q[i].sub(v.q[i]);
    }
    return result;
};

Vector.prototype.crs = function(v) {
    if(v.dimensions !== this.dimensions) {
        console.log('Interactive.Vector: Dimensions mismatch');
        return null;
    }

    if(this.dimensions === 3) {
        return new Vector(this.q[1].mul(v.q[2]).sub(this.q[2].mul(v.q[1])), this.q[2].mul(v.q[0]).sub(this.q[0].mul(v.q[2])), this.q[0].mul(v.q[1]).sub(this.q[1].mul(v.q[0])));
    }
};

Vector.prototype.mul = function(v) {
    var result = this.clone();
    for(var i = 0; i < this.dimensions; i++) {
        result.q[i] = result.q[i].mul(v);
    }
    return result;
};

Vector.prototype.div = function(v) {
    var result = this.clone();
    for(var i = 0; i < this.dimensions; i++) {
        result.q[i] = result.q[i].div(v);
    }
    return result;
};

Vector.prototype.neg = function() {
    var result = this.clone();
    for(var i = 0; i < this.dimensions; i++) {
        result.q[i] = result.q[i].neg();
    }
    return result;
};

Vector.prototype.abs = function() {
    var ss = 0;
    for(var i = 0; i < this.dimensions; i++) {
        ss += this.q[i].value * this.q[i].value;
    }
    return new Number(Math.sqrt(ss))
};

Vector.prototype.norm = function() {
    if(this.abs().value === 0) return this.clone();
    return this.div(this.abs());
};

Vector.prototype.map = function(f) {
    var result = this.clone();
    for(var i = 0; i < this.dimensions; i++) {
        result.q[i] = f(result.q[i]);
    }
    return result;
};

/**
 * Sets this vector's coordinates to the input vector's
 */
Vector.prototype.set = function(v) {
    this.dimensions = v.dimensions;
    this.q = v.q.slice();
    return this;
};

/**
 * Convert this to a THREE vector2
 */
Vector.prototype.toVector2 = function() {
    return new THREE.Vector2(this.q[0], this.q[1]);
};

/**
 * Convert this to a THREE vector3
 */
Vector.prototype.toVector3 = function() {
    if(this.dimensions === 2) return new THREE.Vector3(this.q[0].value, this.q[1].value, 0);
    else return new THREE.Vector3(this.q[0].value, this.q[1].value, this.q[2].value);
};

/**
 * Sets an expression for this vector which can be evalulated with eval
 */
Vector.prototype.setExpression = function(expr) {
    this.expr = expr;
};

/**
 * Sets this vector to the result of the evaulation of expression, or if expression is null, returns self
 */
Vector.prototype.eval = function() {
    if(this.expr !== null) {
        this.set(this.expr.evaluate());
    }
    return this;
};

function Interval(varstr, start, end, steps) {
    this.varstr = varstr; 

    this.start = start;
    this.end = end;
    this.steps = steps;
    this.step = end.sub(start).div(steps);

    this.expr = null;

    this.arr = null;
}

/**
 * Creates an array of evenly distributed values based on start end (inclusive) and steps
 */
Interval.prototype.array = function() {
    if(this.arr === null) {
        var step = (this.end.value - this.start.value) / (this.steps.value - 1);
        var arr = [];
        for(var x = this.start.value; x < this.end.value + step / 2; x += step) {
            arr.push(new Number(x));
        }
        this.arr = arr;
    }
    return this.arr;
};

Interval.prototype.set = function(i) {
    this.start = i.start;
    this.end = i.end;
    this.steps = i.steps;
    this.arr = i.arr;
};

/**
 * Sets an expression for this vector which can be evalulated with eval
 */
Interval.prototype.setExpression = function(expr) {
    this.expr = expr;
};

/**
 * Sets this vector to the result of the evaulation of expression, or if expression is null, returns self
 */
Interval.prototype.eval = function() {
    if(this.expr !== null) {
        this.set(this.expr.evaluate());
    }
    return this;
};

var MathPlus = {};

MathPlus.epsilon = new Number(1e-7);
MathPlus.epsilonx2 = MathPlus.epsilon.mul(new Number(2));

MathPlus.optimalh = function(x) {
    if(x.abs().compareTo(Number[1]) > 0) {
        return MathPlus.epsilon.mul(x.abs());
    } else {
        return MathPlus.epsilon;
    }
};

MathPlus.singleton = function(x) {
    return new Vector(x);
};

MathPlus.derivative = function(X, t) {
    var h = MathPlus.optimalh(t);
    var tph = t.add(h);
    var tmh = t.sub(h);
    var dt = tph.sub(tmh);
    return X(tph).sub(X(tmh)).div(dt)
};

MathPlus.derivative2 = function(X, t) {
    var h = MathPlus.optimalh(t);
    var tph = t.add(h);
    var tmh = t.sub(h);
    var h2 = tph.sub(t).add(t.sub(tmh));
    return MathPlus.derivative(X, tph).sub(MathPlus.derivative(X, tmh)).div(h2)
};

MathPlus.binormal = function(X, t) {
    var h = MathPlus.optimalh(t);
    return MathPlus.derivative(X, t.add(h)).crs(MathPlus.derivative(X, t.sub(h))).norm();
};

MathPlus.normal = function(X,u,v) {
    if(v === undefined) {
        return MathPlus.binormal(X, u).crs(MathPlus.derivative(X, u)).norm();
    } else {
        var dxdu = X(u.add(MathPlus.epsilon), v).sub(X(u.sub(MathPlus.epsilon), v)).div(MathPlus.epsilonx2);
        var dxdv = X(u, v.add(MathPlus.epsilon)).sub(X(u, v.sub(MathPlus.epsilon))).div(MathPlus.epsilonx2);
        return dxdu.crs(dxdv).norm();
    }
};

MathPlus.perp = function(x) {
    if(x.dimensions === 2) {
        return new Vector(x.q[1], x.q[0].neg())
    }
};

MathPlus.interpolate = function(a, b, alpha) {
    return a.mul(alpha).add(b.mul(Number[1].sub(alpha)));
};

MathPlus.norm = function(x) {
    return x.norm();
};

MathPlus.component = function(v,i) {
    return v.q[i.value];
};

MathPlus.cos = function(x) {
    return new Number(Math.cos(x.value));
};

MathPlus.sin = function(x) {
    return new Number(Math.sin(x.value));
};

MathPlus.sign = function(x) {
    return new Number(Math.sign(x.value));
};

MathPlus.signclamp = function(x, lower, upper) {
    if(x.compareTo(Number[0]) < 0) return lower;
    else if(x.compareTo(Number[0]) > 0) return upper;
    else return Number[0]
};

MathPlus.quadrant = function(x) {
    // if(x.q[0].value === 0 && x.q[1].value === 0) return Number[0];
    if(x.q[0].value >= 0 && x.q[1].value >= 0) {
        return Number[1];
    }
    if(x.q[0].value <= 0 && x.q[1].value >= 0) {
        return Number[2];
    }
    if(x.q[0].value <= 0 && x.q[1].value <= 0) {
        return Number[3];
    }
    if(x.q[0].value >= 0 && x.q[1].value <= 0) {
        return Number[4];
    }
};

MathPlus.select = function(i) {
    return arguments[i.value];
};

MathPlus.spectrum = function(x) {
    var y = x.value % 3;
    if(y < 0) y += 3;

    if(y < 1/3) {
        r = 1-y*3;
        g = y*3;
        b = 0;
    } else if (y < 2/3) {
        r = 0;
        g = 2-y*3;
        b = y*3-1;
    } else {
        r = y*3-2;
        g = 0;
        b = 3-y*3;
    }

    return new Vector(new Number(r), new Number(g), new Number(b))
};

MathPlus.abs = function(x) {
    return new Number(Math.abs(x.value));
};

MathPlus.ssign = function(x) {
    return MathPlus.sign(x).mul(MathPlus.abs(x).exp(new Number(0.2)));
};

MathPlus.map= function(v, f) {
    return v.map(f);
};

MathPlus.log = function(x) {
    return new Number(Math.log(x.value))
};

MathPlus.PI = new Number(Math.PI);

function Expression(string, context) {
    this.type = 'Expression';

    this.string = string;   
    
    this.context = context;

    this.variables = [];    
    this.function = this.toJSFunction(this.string);
}

Expression.prototype.getVariables = function() {
    var variables = [];
    for(var i = 0; i < this.variables.length; i++) {
        var v = this.variables[i];
        if(this.context.functions[v] !== undefined && variables.includes(v) === false) {
            variables = variables.concat(this.context.functions[v].getVariables());
        } else {
            variables.push(v);
        }
    }
    return variables;
};

Expression.typeOf = function(string) {

    if(string === '()') return 'null';

    var nestingLevel = 0;
    var isVector = false;
    if(string.charAt(string.length - 1) === '}') {
        if(string.charAt(0) === '{')
            return 'interval'
        else    
            return 'parametric'
    }
    if(string.includes('(') === false && string.includes(')') === false) {
        if(/^[0-9.]+$/.test(string)) {
            return 'constant'
        } else if(string.includes('+')||string.includes('-')||string.includes('*')||string.includes('/')||string.includes('^')) {
            return 'expression'
        } else {
            return 'variable'
        }
    }
    for(var i = 0; i < string.length; i++) {
        if(string.charAt(i) === '(') {
            nestingLevel++;
        } else if (string.charAt(i) === ')') {
            nestingLevel--;
        } else
        if(string.charAt(i) === ',' && nestingLevel === 1) {
            isVector = true;
        }
        if(string.charAt(i) === ';' && nestingLevel === 1) {
            return 'matrix';
        }
        if(nestingLevel === 0 && i !== string.length - 1) {
            return 'expression';
        }
    }
    if(isVector) return 'vector';
    return 'expression';
};

Expression.separate = function(str) {
    // Separate into parts which alternate (expression/operator)
    var parts = [];
    var start = 0;
    var nestingLevel = 0;
    var type = null;
    for(var i = 0; i < str.length; i++) {
        if(type === 'interval') {
            if(str.charAt(i) === '}') {
                parts.push({str: str.substring(start, i + 1), type: type});
                start = i + 1;
                type = null;
            }
        } else if(str.charAt(i) === '{') {
            type = 'interval';
        } else if(str.charAt(i) === '(') {
            nestingLevel++;

            if(type === null) {
                type = 'expression';
            }
            if(type === 'operator' || type === 'uoperator') {
                parts.push({str: str.substring(start, i), type: type});
                start = i;
                type = 'expression';
            } else if (type === 'variable') {
                type = 'function';
                parts.push({str: str.substring(start, i), type: type});
                start = i;
                type = 'expression';
            }
        } else if(str.charAt(i) === ')') {
            nestingLevel--;
        } else if(nestingLevel == 0) {         
            if(str.charAt(i) === '-' && (type === null || type === 'operator')) {
                if(type === 'operator') {
                    parts.push({str: str.substring(start, i), type: type});
                    start = i;
                }
                type = 'uoperator';
            } else if(/[0-9a-zA-Z.]/.test(str.charAt(i)) === false || str.charAt(i) === '^') {
                parts.push({str: str.substring(start, i), type: type});
                start = i;
                type = 'operator';
            } else {
                if(type === null) {
                    type = 'constant';
                }
                if(type === 'operator' || type === 'uoperator') {
                    parts.push({str: str.substring(start, i), type: type});
                    start = i;
                    type = 'constant';
                }
                if(/[0-9.]/.test(str.charAt(i)) === false)
                    type = 'variable';
            }
        }
    }
    if(start != str.length) {
        parts.push({str: str.substring(start, str.length), type:type});
    }

    // Split the expressions if applicable
    for(var i = 0; i < parts.length; i++) {
        if(parts[i].type === 'expression') {
            parts[i].type = Expression.typeOf(parts[i].str);
            if(parts[i].type === 'expression') {
                var newstr = parts[i].str.slice(1,parts[i].str.length-1);
                var newparts = [{str:'(',type:'('}].concat(Expression.separate(newstr));
                newparts.push({str:')',type:')'});
                parts = parts.slice(0,i).concat(newparts).concat(parts.slice(i+1,parts.length));
                i += newparts.length - 1;
            } else if (i > 0 && parts[i].type === 'vector' && parts[i - 1].type === 'function') {
                parts.splice(i ,0,{str:'(',type:'('});
                parts.splice(i+2, 0, {str:')',type:')'});
            } else if(parts[i].type === 'null') {
                parts[i].str='';
                parts.splice(i ,0,{str:'(',type:'('});
                parts.splice(i+2, 0, {str:')',type:')'});
            }
        }
    }
    return parts;
};

Expression.toPostfix = function(parts) {
    var post = [];
    var ops = [];
    var funs = [];
    var precedence = {'+': 0, '-': 0, '*': 1, '/': 1, '^': 2, '(': -1, ')': -1};
    for(var i = 0; i < parts.length; i++) {
        if(parts[i].type === 'operator' || parts[i].type === 'uoperator') {
            while(ops.length > 0 && (ops[ops.length - 1].type === 'uoperator' || precedence[ops[ops.length - 1].str] >= precedence[parts[i].str])) {
                post.push(ops.pop());
            }
            ops.push(parts[i]);
        } else if (parts[i].type === 'function') {
            funs.push(parts[i]);
        } else if (parts[i].type === '(') {
            ops.push(parts[i]);
        } else if (parts[i].type === ')') {
            while(ops[ops.length - 1].type !== '(') {
                post.push(ops.pop());
            }
            if(funs.length > 0) {
                post.push(funs.pop());
            }
            ops.pop();
        } else {
            post.push(parts[i]);
        }
    }
    while(ops.length > 0) {
        post.push(ops.pop());
    }
    return post;
};

Expression.splitTuple = function(string) {
    var str = string.substring(1,string.length - 1);
    var parts = [];
    var start = 0;
    var nestingLevel = 0;
    for(var i = 0; i < str.length; i++) {
        if(str.charAt(i) === '(') {
            nestingLevel++;
        } else if(str.charAt(i) === ')') {
            nestingLevel--;
        } else if(nestingLevel == 0) {                    
            if(str.charAt(i) === ',') {
                parts.push(str.substring(start,i));
                start = i + 1;
            }
        }
    }
    parts.push(str.substring(start, str.length));
    return parts;
};

Expression.splitParametric = function(string) {
    return string.split(/(?={)/);
};

Expression.prototype.toJSExpression = function(string, specials, isparam, variables) {
    var str = string.replace(/\s+/g,'');

    // Expression is an equation:
    if(str.match(/=/g) !== null && str.match(/=/g).length === 1) {
        var left, right;
        left = string.split('=')[0];
        right = string.split('=')[1];
        
        var leftParts = Expression.separate(left);

        // variable assignment
        if(leftParts.length === 1 && leftParts[0].type === 'variable') {
            var expr = 'context["'+ left + '"]='+this.toJSExpression(right);
            return expr;
        }

        // function definition
        if(leftParts[0].type === 'function') {
            if (leftParts[2].type === 'null') {
                var expr = 'context["'+leftParts[0].str+'"]=function(){ return '+this.toJSExpression(right)+'; }';
            } else if(leftParts[2].type === 'vector') {
                var expr = 'context["'+leftParts[0].str+'"]=function' + leftParts[2].str + '{ return '+this.toJSExpression(right, Expression.splitTuple(leftParts[2].str))+'; }';
            } else if (leftParts[2].type === 'variable') {
                var expr = 'context["'+leftParts[0].str+'"]=function(' + leftParts[2].str + '){ return '+this.toJSExpression(right, leftParts[2].str)+'; }';
            }
            this.context.functions[leftParts[0].str] = this;
            return expr;
        }
    } else {
        var type = Expression.typeOf(str);

        if(type === 'expression') {
            var operations = Expression.toPostfix(Expression.separate(str));

            var stack = [];

            for(var i = 0; i < operations.length; i++) {
                switch(operations[i].type) {
                    case 'null':
                        stack.push('');
                        break;
                    case 'variable':
                        if(specials !== undefined && specials.includes(operations[i].str)) {
                            stack.push(operations[i].str);
                        } else {
                            stack.push('context["'+operations[i].str+'"]');
                            if(this.variables.includes(operations[i].str) === false) this.variables.push(operations[i].str);
                        }
                        break;
                    case 'constant':
                        stack.push('new Interactive.Number('+operations[i].str+')');
                        break;     
                    case 'vector':
                        var param = operations[i+1].type === 'function';
                        stack.push(this.toJSExpression(operations[i].str, specials, param));
                        break;                       
                    case 'function':
                        var a = stack.pop();
                        stack.push('context["'+operations[i].str+'"]('+a+')');                        
                        if(this.variables.includes(operations[i].str) === false) this.variables.push(operations[i].str);
                        break;
                    case 'uoperator':
                        var a = stack.pop();
                        stack.push(a+'.neg()');
                        break;
                    case 'operator':
                        var b = stack.pop();
                        var a = stack.pop();
                        switch(operations[i].str) {
                            case '+':
                                stack.push(a+'.add('+b+')');
                                break;
                            case '-':
                                stack.push(a+'.sub('+b+')');
                                break;
                            case '*':
                                stack.push(a+'.mul('+b+')');
                                break;
                            case '/':
                                stack.push(a+'.div('+b+')');
                                break;
                            case '^':
                                stack.push(a+'.exp('+b+')');
                                break;
                            default:
                                console.log('Interactive.Expression: Unknown symbol');                                                       
                        }
                        break;
                    default:
                        console.log('Interactive.Expression: Unknown symbol');
                }
            }

            return stack[0];
        } else if (type === 'vector') {
            var components = Expression.splitTuple(str);
            if(isparam) {
                var expr = '';
                for(var i = 0; i < components.length; i++) {
                    expr += this.toJSExpression(components[i], specials) + ',';
                }
                expr = expr.slice(0, expr.length - 1);
                return expr;
            } else {
                var expr = 'new Interactive.Vector(';
                for(var i = 0; i < components.length; i++) {
                    expr += this.toJSExpression(components[i], specials) + ',';
                }
                expr = expr.slice(0, expr.length - 1) + ')';
                return expr;
            }
        } else if (type === 'interval') {
            var params = Expression.splitTuple(str);

            var expr = 'new Interactive.Interval("'+params[0]+'",';
            for(var i = 1; i < params.length; i++) {
                expr += this.toJSExpression(params[i], specials) + ',';
            }
            expr = expr.slice(0, expr.length - 1) + ')';            
            return expr;
        } else if (type === 'variable') {
            if(specials !== undefined && specials.includes(str)) return str
            var expr = 'context["'+str+'"]';
            if(this.variables.includes(str) === false) this.variables.push(str);
            return expr;
        } else if (type === 'parametric') {
            var params = Expression.splitParametric(str);
            var func = 'function(';
            var intervals = '';

            if(specials === undefined) specials = [];

            for(var i = 1; i < params.length; i++) {
                var arg = Expression.splitTuple(params[i])[0];
                specials.push(arg);
                func += arg+',';

                intervals += ','+this.toJSExpression(params[i]);
            }

            func = func.slice(0, func.length - 1)+') { return '+this.toJSExpression(params[0],specials)+'; }';

            var expr = 'new Interactive.Parametric('+func+intervals+')';
            return expr;
        } else if (type === 'constant') {
            var expr = 'new Interactive.Number('+str+')';
            return expr;
        }
    }
};

Expression.prototype.toJSFunction = function(string) {
    var expr = this.toJSExpression(string);
    return Function('context', 'return '+expr+';');
};

/**
 * Variables from given context will override variables from this context 
 */
Expression.prototype.evaluate = function() {
    return this.function(this.context);
};

Expression.getDefaultContext = function() {
    return Object.assign({functions: {}}, MathPlus);
};

/**
 * Object that represents an arrow in 2d space.
 * @param {*} vector The vector which this object is based on
 * @param {*} opts Options to customize the appearance of the arrow. Includes:
 * origin -- Point at which the arrow starts. Default is (0, 0)
 * hex -- hexadecimal value to define color. Default is 0xffff00.
 * headLength -- The length of the head of the arrow. Default is 0.2.
 * headWidth -- The length of the width of the arrow. Default is 0.05.
 * (Derived from THREE.js)
 */
function Arrow2D(plot, expr, opts) {
    this.opts = opts !== undefined ? opts : {};

    /**
     * (Read-only)
     */
    this.expr = new Expression(expr, plot.context);

    if(this.opts.origin !== undefined) {
        this.opts.origin = new Expression(this.opts.origin, plot.context);
    }

    this.sceneObject = null;

    this.validated = false;
}

Arrow2D.prototype.getVariables = function() {
    if(this.opts.origin !== undefined) return this.expr.getVariables().concat(this.opts.origin.getVariables());
    else return this.expr.getVariables()
};

/**
 * Returns an object that can be added to a THREE.js scene.
 */
Arrow2D.prototype.getSceneObject = function() {
    if(this.validated === false) {
        var vector = this.expr.evaluate();
        var _vector2 = new THREE.Vector3(vector.q[0].value, vector.q[1].value);
        var _dir = _vector2.clone().normalize();
        var _origin = this.opts.origin !== undefined ? this.opts.origin.evaluate().toVector3() : new THREE.Vector3(0,0,0);
        var _length = _vector2.length();
        var _hex = this.opts.hex !== undefined ? this.opts.hex : 0xffffff;
        var _headLength = this.opts.headLength !== undefined ? this.opts.headLength : 0.2;
        var _headWidth = this.opts.headWidth !== undefined ? this.opts.headWidth : 0.05;

        this.sceneObject = new THREE.ArrowHelper(_dir, _origin, _length, _hex, _headLength, _headWidth);
        this.validated = true;
    }
    return this.sceneObject;
};

/**
 * Updates on the next call to render
 */
Arrow2D.prototype.invalidate = function() {
    this.validated = false;
};

function Hotspot2D(plot, expr) {
    this.type = 'Hotspot2D';
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
};

var vert = 'attribute float direction; \nattribute vec3 position;\nattribute vec3 next;\nattribute vec3 previous;\nattribute vec4 color;\nuniform mat4 projectionMatrix;\nuniform mat4 modelMatrix;\nuniform mat4 viewMatrix;\nuniform float aspect;\n\nuniform float thickness;\nuniform int miter;\n\nvarying vec4 vColor;\n\nvoid main() {\n  vColor = color;\n    \n  vec2 aspectVec = vec2(aspect, 1.0);\n  mat4 projViewModel = projectionMatrix * viewMatrix * modelMatrix;\n  vec4 previousProjected = projViewModel * vec4(previous, 1.0);\n  vec4 currentProjected = projViewModel * vec4(position, 1.0);\n  vec4 nextProjected = projViewModel * vec4(next, 1.0);\n\n  \/\/get 2D screen space with W divide and aspect correction\n  vec2 currentScreen = currentProjected.xy \/ currentProjected.w * aspectVec;\n  vec2 previousScreen = previousProjected.xy \/ previousProjected.w * aspectVec;\n  vec2 nextScreen = nextProjected.xy \/ nextProjected.w * aspectVec;\n\n  float len = thickness;\n  float orientation = direction;\n\n  \/\/starting point uses (next - current)\n  vec2 dir = vec2(0.0);\n  if (currentScreen == previousScreen) {\n    dir = normalize(nextScreen - currentScreen);\n  } \n  \/\/ending point uses (current - previous)\n  else if (currentScreen == nextScreen) {\n    dir = normalize(currentScreen - previousScreen);\n  }\n  \/\/somewhere in middle, needs a join\n  else {\n    \/\/get directions from (C - B) and (B - A)\n    vec2 dirA = normalize((currentScreen - previousScreen));\n    if (miter == 1) {\n      vec2 dirB = normalize((nextScreen - currentScreen));\n      \/\/now compute the miter join normal and length\n      vec2 tangent = normalize(dirA + dirB);\n      vec2 perp = vec2(-dirA.y, dirA.x);\n      vec2 miter = vec2(-tangent.y, tangent.x);\n      dir = tangent;\n      len = thickness \/ dot(miter, perp);\n    } else {\n      dir = dirA;\n    }\n  }\n  vec2 normal = vec2(-dir.y, dir.x);\n  normal *= len\/2.0;\n  normal.x \/= aspect;\n\n  vec4 offset = vec4(normal * orientation, 0.0, 0.0);\n  gl_Position = currentProjected + offset;\n  gl_PointSize = 1.0;\n}';
var frag = '#ifdef GL_ES\nprecision mediump float;\n#endif\n\nvarying vec4 vColor;\n\nvoid main() {\n  gl_FragColor = vec4(vColor);\n}';

function LineMaterialCreator(thickness, vwidth, vheight) {
    this.getMaterial = function () {
        return new THREE.RawShaderMaterial({
            uniforms: {
                thickness: { value: thickness / vwidth },
                miter: { value: 0 },
                aspect: { value: vwidth / vheight }
            },
            vertexShader: vert,
            fragmentShader: frag
        });
    };
}

function Parametric2D(parent, expr, opts) {
    this.parent = parent;
    this.plot = parent.parent;

    this.expr = new Expression(expr, this.plot.context);
    this.opts = opts !== undefined? opts: {};

    this.validated = false;
    this.sceneObject = null;

    if(this.opts.color !== undefined) {
        this.color = new Expression(this.opts.color, this.plot.context);
        this.colorf = this.color.evaluate();
    }
    if(this.opts.thick === undefined) this.opts.thick = false;
}

Parametric2D.prototype.getVariables = function() {
    if(this.opts.color !== undefined) return this.expr.getVariables().concat(this.color.getVariables());
    else return this.expr.getVariables();
};

Parametric2D.prototype.createLine = function(par) {
    var geom = new THREE.BufferGeometry();
    var int = par.intervals[0];
    var tarr = int.array();

    var direction = new Float32Array(tarr.length * 2);
    var vertices = new Float32Array(tarr.length * 3 * 2);
    var previous = new Float32Array(tarr.length * 3 * 2);
    var next = new Float32Array(tarr.length * 3 * 2);

    var colors = new Uint8Array(tarr.length * 4 * 2);

    for(var i = 0; i < tarr.length; i++) {
        var t = tarr[i];

        direction[i*2] = 1;
        direction[i*2+1] = -1;

        // geom.vertices.push(par.func(t).toVector3());
        var v = par.func(t).toVector3();
        vertices[i*6] = v.x;
        vertices[i*6+1] = v.y;
        vertices[i*6+2] = v.z;

        vertices[i*6+3] = v.x;
        vertices[i*6+4] = v.y;
        vertices[i*6+5] = v.z;

        if(i > 0) {
            previous[i*6] = vertices[i*6-6];
            previous[i*6+1] = vertices[i*6-5];
            previous[i*6+2] = vertices[i*6-4];
            previous[i*6+3] = vertices[i*6-3];
            previous[i*6+4] = vertices[i*6-2];
            previous[i*6+5] = vertices[i*6-1];

            next[i*6-6] = vertices[i*6];
            next[i*6-5] = vertices[i*6+1];
            next[i*6-4] = vertices[i*6+2];
            next[i*6-3] = vertices[i*6+3];
            next[i*6-2] = vertices[i*6+4];
            next[i*6-1] = vertices[i*6+5];
        }

        if(this.color !== undefined) {
            var color = this.colorf(t);
            // geom.colors[i] = new THREE.Color(color.q[0].value, color.q[1].value, color.q[2].value)
            colors[i*8] = color.q[0].value * 255;
            colors[i*8 + 1] = color.q[1].value * 255;
            colors[i*8 + 2] = color.q[2].value * 255;
            colors[i*8 + 3] = 255;
            colors[i*8 + 4] = color.q[0].value * 255;
            colors[i*8 + 5] = color.q[1].value * 255;
            colors[i*8 + 6] = color.q[2].value * 255;
            colors[i*8 + 7] = 255;
        } else {
            colors[i*8] = 255;
            colors[i*8 + 1] = 255;
            colors[i*8 + 2] = 255;
            colors[i*8 + 3] = 255;
            colors[i*8 + 4] = 255;
            colors[i*8 + 5] = 255;
            colors[i*8 + 6] = 255;
            colors[i*8 + 7] = 255;
        }
    }

    previous[0] = vertices[0];
    previous[1] = vertices[1];
    previous[2] = vertices[2];
    previous[3] = vertices[3];
    previous[4] = vertices[4];
    previous[5] = vertices[5];
    next[tarr.length*6-6] = vertices[tarr.length*6-6];
    next[tarr.length*6-5] = vertices[tarr.length*6-5];
    next[tarr.length*6-4] = vertices[tarr.length*6-4];
    next[tarr.length*6-3] = vertices[tarr.length*6-3];
    next[tarr.length*6-2] = vertices[tarr.length*6-2];
    next[tarr.length*6-1] = vertices[tarr.length*6-1];

    geom.addAttribute('direction', new THREE.BufferAttribute(direction, 1));
    geom.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.addAttribute('previous', new THREE.BufferAttribute(previous, 3));
    geom.addAttribute('next', new THREE.BufferAttribute(next, 3));
    geom.addAttribute('color', new THREE.BufferAttribute(colors, 4, true));

    var mat = new LineMaterialCreator(this.opts.thick === true ? 10 : 5, this.parent.frame.width, this.parent.frame.height).getMaterial();
    var mesh = new THREE.Mesh(geom, mat);
    mesh.drawMode = THREE.TriangleStripDrawMode;
    return mesh
};

Parametric2D.prototype.getSceneObject = function() {
    if(this.validated === false) {
        var par = this.expr.evaluate();
        this.sceneObject = this.createLine(par);
        this.validated = true;
    }
    return this.sceneObject;
};

Parametric2D.prototype.invalidate = function() {
    this.validated = false;
};

/**
 * Renders plots in 2D (not to be confused with the Figure class)
 * TODO: Add functionality to link cameras between figures
 * TODO: Add better control of the viewport
 * @param {*} parent 
 * @param {*} container 
 * @param {*} opts 
 */

function Axes2D(parent, container, opts) {
    /**
     * The type of this object. (Read-only)
     */
    this.type = 'Axes2D';

    /**
     * The plot that generated this figure. (Read-only)
     */
    this.parent = parent;

    /**
     * The frame which will render the axes
     */
    this.frame = new Frame(container, opts);

    // avoid null pointer errors
    if(opts === undefined) opts = {};

    /**
     * The zoom level of the camera. Denotes how many pixels should be one unit
     */
    this.zoom = opts.zoom !== undefined? opts.zoom : 200;

    this.fixedZoom = opts.fixedZoom !== undefined? opts.fixedZoom : false;

    /**
     * Camera which renders the axes. 
     */
    this.camera = new THREE.OrthographicCamera(-this.frame.width / this.zoom, this.frame.width / this.zoom, this.frame.height / this.zoom, -this.frame.height / this.zoom, .01, 50);

    // Initialize camera position
    this.camera.position.z = 10;
    this.camera.lookAt(this.frame.scene.position);

    if(opts.position !== undefined) {
        this.camera.position.add(opts.position);
    }

    // Some test code
    // var mesh = new THREE.Mesh( 
    //     new THREE.BoxGeometry( 1, 1, 1, 1, 1, 1 ), 
    //     new THREE.MeshBasicMaterial( { color : 0xff0000, wireframe: true } 
    // ));
    // this.frame.scene.add( mesh );

    // For closures
    var _self = this;

    /**
     * Objects to plot
     */
    this.objects = [];

    /**
     * Expressions to plot
     */
    this.expressions = {};

    if(opts.showAxes !== false) {
        var arr = new Interactive.BasisVectors2D(this.parent);
        this.addFigure(arr);
    }

    /**
     * Hotspots are draggable points
     */
    this.hotspots = [];

    // Projects from world to client coords
    var project = function(vector) {
        var vector2 = new THREE.Vector2(vector.q[0].value, vector.q[1].value);
        var projected = vector2.clone().sub(_self.camera.position).multiplyScalar(_self.zoom / 2).add(new THREE.Vector2(_self.frame.width / 2, _self.frame.height / 2));
        projected.y = _self.frame.height - projected.y;
        return projected;
    };

    var intersectsHotspot = function(clientX, clientY) {
        var hotspot = null;
        var leastDistance = 1000; // Arbitrarily large number

        var containerBounds = _self.frame.container.getBoundingClientRect();
        var clientCoords = new THREE.Vector2(clientX - containerBounds.left, clientY - containerBounds.top);

        for (var i = 0; i < _self.hotspots.length; i++) {
            var dist2 = project(_self.hotspots[i].position).distanceToSquared(clientCoords);
            if (dist2 <= _self.hotspots[i].size * _self.hotspots[i].size && dist2 < leastDistance * leastDistance) {
                hotspot = _self.hotspots[i];
            }
        }
        return hotspot;
    };

    // Bind events: Panning
    var _cameraOriginX = 0;
    var _cameraOriginY = 0;

    var _hotspot = null;
    var _hotspotpos = null;

    this.frame.container.addEventListener('mousedown', function(event) {
        if (event.button === 0) {
            _hotspot = intersectsHotspot(event.clientX, event.clientY);
            if (_hotspot) {
                _hotspotpos = _hotspot.position.clone();
            }
        }
        if (event.button === 2) {
            _cameraOriginX = _self.camera.position.x;
            _cameraOriginY = _self.camera.position.y;
        }
    });

    this.frame.touchEventListener.onpan = function(event) {
        if (event.leftButtonDown) {
            if (_hotspot !== null) {
                var containerBounds = _self.frame.container.getBoundingClientRect();
                var e = {
                    worldX: _hotspotpos.q[0].add(new Number(2 * (event.screenX - event.screenStartX) / _self.zoom)),
                    worldY: _hotspotpos.q[1].add(new Number(-2 * (event.screenY - event.screenStartY) / _self.zoom))
                };
                _hotspot.ondrag(e);
            }
        }
        if (event.rightButtonDown) {
            // Prevent default if mouse moved significantly
            if ((event.screenX - event.screenStartX) * (event.screenX - event.screenStartX) + (event.screenY - event.screenStartY) * (event.screenY - event.screenStartY) > 25) {
                event.suppressContextMenu();
            }

            // Pan camera
            _self.camera.position.x = -2 * (event.screenX - event.screenStartX) / _self.zoom + _cameraOriginX;
            _self.camera.position.y = 2 * (event.screenY - event.screenStartY) / _self.zoom + _cameraOriginY;
        }
    };

    // Bind Events: Zooming
    this.frame.touchEventListener.onzoom = function(event) {
        if(this.fixedZoom === false) {
            event.suppressScrolling();
            _self.zoom *= Math.pow(0.8, event.amount / 100);
            _self.updateCamera();
        }
    };
}

/**
 * Render the axes
 */
Axes2D.prototype.render = function() {
    this.frame.render(this.camera);
};

/**
 * Plot an expression
 */
Axes2D.prototype.plotExpression = function(expr, type, opts) {
    switch(type) {
        case 'arrow':            
            var figure = new Arrow2D(this.parent, expr, opts);
            this.expressions[expr] = figure;
            this.addFigure(figure);
            return figure;
        case 'hotspot':
            var hotspot = new Hotspot2D(this.parent, expr);
            this.addHotspot(hotspot);
            return hotspot;
        case 'parametric':           
            var par = new Parametric2D(this, expr, opts);
            this.expressions[expr] = par;
            this.addFigure(par);
            return par;
        default:
            console.log('Interactive.Axes2D: Invalid plot type');
            return null;
    }
};

/**
 * Add an object to plot
 * @param {*} object Must be plottable
 */
Axes2D.prototype.addFigure = function(object) {
    this.objects.push(object);
    this.frame.scene.add(object.getSceneObject());
};

/**
 * Remove a plotted object
 */
Axes2D.prototype.removeFigure = function(object) {
    var index = this.objects.indexOf(object);
    if (index === -1) {
        console.log('Interactive.Axes2D: Figure not in axes');
        return null;
    }
    this.objects.splice(index, 1);
    this.frame.scene.remove(object.getSceneObject());
};

/**
 * Force the object to update
 */
Axes2D.prototype.redrawFigure = function(object) {
    var index = this.objects.indexOf(object);
    if (index === -1) {
        console.log('Interactive.Axes2D: Figure not in axes');
        return null;
    }
    this.frame.scene.remove(object.getSceneObject());
    object.invalidate();
    this.frame.scene.add(object.getSceneObject());
};

Axes2D.prototype.redrawExpression = function(expr) {
    this.redrawFigure(this.expressions[expr]);
};

/**
 * Redraw all objects
 */
Axes2D.prototype.refresh = function(expr) {
    for(var i = 0; i < this.objects.length; i++) {
        if(this.objects[i].invalidate !== undefined && (expr === undefined || this.objects[i].getVariables().includes(expr))) {
            this.frame.scene.remove(this.objects[i].getSceneObject());
            this.objects[i].invalidate();
            this.frame.scene.add(this.objects[i].getSceneObject());
        }
    }
};

/**
 * Apply changes to camera
 */
Axes2D.prototype.updateCamera = function() {
    this.camera.left = -this.frame.width / this.zoom;
    this.camera.right = this.frame.width / this.zoom;
    this.camera.top = this.frame.height / this.zoom;
    this.camera.bottom = -this.frame.height / this.zoom;
    this.camera.updateProjectionMatrix();
};

Axes2D.prototype.addHotspot = function(hotspot) {
    if (hotspot.type !== 'Hotspot2D') {
        console.log('Interactive.Axes2D: Parameter is not a Hotspot2D.');
        return null;
    }

    this.hotspots.push(hotspot);
};

/**
 * Object that represents an arrow in 3d space.
 * @param {*} vector The vector which this object is based on
 * @param {*} opts Options to customize the appearance of the arrow. Includes:
 * origin -- Point at which the arrow starts. Default is (0, 0, 0)
 * hex -- hexadecimal value to define color. Default is 0xffff00.
 * headLength -- The length of the head of the arrow. Default is 0.2 * length.
 * headWidth -- The length of the width of the arrow. Default is 0.2 * headLength.
 * (Derived from THREE.js)
 */
function Arrow3D(plot, expr, opts) {
    this.opts = opts !== undefined ? opts : {};

    /**
     * (Read-only)
     */
    this.expr = new Expression(expr, plot.context);

    if(this.opts.origin !== undefined) {
        this.opts.origin = new Expression(this.opts.origin, plot.context);
    }

    this.sceneObject = null;

    this.validated = false;
}

Arrow3D.prototype.getVariables = function() {    
    if(this.opts.origin !== undefined) return this.expr.getVariables().concat(this.opts.origin.getVariables());
    else return this.expr.getVariables()
};

/**
 * Returns an object that can be added to a THREE.js scene.
 */
Arrow3D.prototype.getSceneObject = function() {
    if(this.validated === false) {
        var vector = this.expr.evaluate();
        var _vector3 = new THREE.Vector3(vector.q[0].value, vector.q[1].value, vector.q[2].value);
        var _dir = _vector3.clone().normalize();
        var _origin = this.opts.origin !== undefined ? this.opts.origin.evaluate().toVector3() : new THREE.Vector3(0,0,0);
        var _length = _vector3.length();
        var _hex = this.opts.hex !== undefined ? this.opts.hex : 0xffffff;
        var _headLength = this.opts.headLength !== undefined ? this.opts.headLength : 0.2 * _length;
        var _headWidth = this.opts.headWidth !== undefined ? this.opts.headWidth : 0.2 * _headLength;

        this.sceneObject = new THREE.ArrowHelper(_dir, _origin, _length, _hex, _headLength, _headWidth);
        this.validated = true;
    }
    return this.sceneObject;
};

/**
 * Updates on the next call to render
 */
Arrow3D.prototype.invalidate = function() {
    this.validated = false;
};

function Parametric3D(parent, expr, opts) {
    this.parent = parent;
    this.plot = parent.parent;

    this.expr = new Expression(expr, this.plot.context);
    this.opts = opts !== undefined? opts: {};

    this.validated = false;
    this.sceneObject = null;

    if(this.opts.color !== undefined) {
        this.color = new Expression(this.opts.color, this.plot.context);
        this.colorf = this.color.evaluate();
    }
    if(this.opts.wireframe === undefined) this.opts.wireframe = false;
    if(this.opts.flat === undefined) this.opts.flat = false;
    if(this.opts.smooth === undefined) this.opts.smooth = true;
    if(this.opts.thick === undefined) this.opts.thick = false;
}

Parametric3D.prototype.getVariables = function() {
    if(this.opts.color !== undefined) return this.expr.getVariables().concat(this.color.getVariables());
    else return this.expr.getVariables();
};

Parametric3D.prototype.createLine = function(par) {
 var geom = new THREE.BufferGeometry();
    var int = par.intervals[0];
    var tarr = int.array();

    var direction = new Float32Array(tarr.length * 2);
    var vertices = new Float32Array(tarr.length * 3 * 2);
    var previous = new Float32Array(tarr.length * 3 * 2);
    var next = new Float32Array(tarr.length * 3 * 2);

    var colors = new Uint8Array(tarr.length * 4 * 2);

    for(var i = 0; i < tarr.length; i++) {
        var t = tarr[i];

        direction[i*2] = 1;
        direction[i*2+1] = -1;

        // geom.vertices.push(par.func(t).toVector3());
        var v = par.func(t).toVector3();
        vertices[i*6] = v.x;
        vertices[i*6+1] = v.y;
        vertices[i*6+2] = v.z;

        vertices[i*6+3] = v.x;
        vertices[i*6+4] = v.y;
        vertices[i*6+5] = v.z;

        if(i > 0) {
            previous[i*6] = vertices[i*6-6];
            previous[i*6+1] = vertices[i*6-5];
            previous[i*6+2] = vertices[i*6-4];
            previous[i*6+3] = vertices[i*6-3];
            previous[i*6+4] = vertices[i*6-2];
            previous[i*6+5] = vertices[i*6-1];

            next[i*6-6] = vertices[i*6];
            next[i*6-5] = vertices[i*6+1];
            next[i*6-4] = vertices[i*6+2];
            next[i*6-3] = vertices[i*6+3];
            next[i*6-2] = vertices[i*6+4];
            next[i*6-1] = vertices[i*6+5];
        }

        if(this.color !== undefined) {
            var color = this.colorf(t);
            // geom.colors[i] = new THREE.Color(color.q[0].value, color.q[1].value, color.q[2].value)
            colors[i*8] = color.q[0].value * 255;
            colors[i*8 + 1] = color.q[1].value * 255;
            colors[i*8 + 2] = color.q[2].value * 255;
            colors[i*8 + 3] = 255;
            colors[i*8 + 4] = color.q[0].value * 255;
            colors[i*8 + 5] = color.q[1].value * 255;
            colors[i*8 + 6] = color.q[2].value * 255;
            colors[i*8 + 7] = 255;
        } else {
            colors[i*8] = 255;
            colors[i*8 + 1] = 255;
            colors[i*8 + 2] = 255;
            colors[i*8 + 3] = 255;
            colors[i*8 + 4] = 255;
            colors[i*8 + 5] = 255;
            colors[i*8 + 6] = 255;
            colors[i*8 + 7] = 255;
        }
    }

    previous[0] = vertices[0];
    previous[1] = vertices[1];
    previous[2] = vertices[2];
    previous[3] = vertices[3];
    previous[4] = vertices[4];
    previous[5] = vertices[5];
    next[tarr.length*6-6] = vertices[tarr.length*6-6];
    next[tarr.length*6-5] = vertices[tarr.length*6-5];
    next[tarr.length*6-4] = vertices[tarr.length*6-4];
    next[tarr.length*6-3] = vertices[tarr.length*6-3];
    next[tarr.length*6-2] = vertices[tarr.length*6-2];
    next[tarr.length*6-1] = vertices[tarr.length*6-1];

    geom.addAttribute('direction', new THREE.BufferAttribute(direction, 1));
    geom.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.addAttribute('previous', new THREE.BufferAttribute(previous, 3));
    geom.addAttribute('next', new THREE.BufferAttribute(next, 3));
    geom.addAttribute('color', new THREE.BufferAttribute(colors, 4, true));

    var mat = new LineMaterialCreator(this.opts.thick === true ? 30 : 15, this.parent.frame.width, this.parent.frame.height).getMaterial();
    var mesh = new THREE.Mesh(geom, mat);
    mesh.drawMode = THREE.TriangleStripDrawMode;
    return mesh
};

Parametric3D.prototype.createSurface = function(par) {
    var geom = new THREE.Geometry();
    var uint = par.intervals[0];
    var vint = par.intervals[1];
    var uarr = uint.array();
    var varr = vint.array();
    var colors = [];

    for(var i = 0; i < uarr.length; i++) {
        var u = uarr[i];
        for(var j = 0; j < varr.length; j++) {
            var v = varr[j];

            var vert = par.func(u,v).toVector3();
            geom.vertices.push(vert);

            if(this.color !== undefined) {
                var color = this.colorf(u,v);
                colors.push(new THREE.Color(color.q[0].value, color.q[1].value, color.q[2].value));
            }

            if(i > 0 && j > 0) {
                var v1 = i * varr.length + j;
                var v2 = i * varr.length + j - 1;
                var v3 = (i - 1) * varr.length + j;
                var v4 = (i - 1) * varr.length + j - 1;

                var f1 = new THREE.Face3(v1, v2, v4);
                var f2 = new THREE.Face3(v1, v4, v3);

                if(this.color !== undefined) {
                    f1.vertexColors[0] = colors[v1];
                    f1.vertexColors[1] = colors[v2];
                    f1.vertexColors[2] = colors[v4];

                    f2.vertexColors[0] = colors[v1];
                    f2.vertexColors[1] = colors[v4];
                    f2.vertexColors[2] = colors[v3];
                }

                geom.faces.push(f1);                
                geom.faces.push(f2);
            }
        }
    }
    geom.mergeVertices();
    geom.computeVertexNormals();

    var opts = {};
    if(this.color !== undefined) {
        opts['vertexColors'] = THREE.VertexColors;
    }
    if(this.opts.smooth === false) {
        opts['shading'] = THREE.FlatShading;
    }

    if(this.opts.wireframe === true || this.opts.flat === true) {
        var mat = new THREE.MeshBasicMaterial(opts);
        if(this.wireframe) mat.wireframe = true;
    } else {
        var mat = new THREE.MeshLambertMaterial(opts);
    }
    mat.side = THREE.DoubleSide;
    return new THREE.Mesh( geom, mat );
};

Parametric3D.prototype.getSceneObject = function() {
    if(this.validated === false) {
        var par = this.expr.evaluate();
        if(par.intervals.length === 1) {
            this.sceneObject = this.createLine(par);
        } else {
            this.sceneObject = this.createSurface(par);
        }
        this.validated = true;
    }
    return this.sceneObject;
};

Parametric3D.prototype.invalidate = function() {
    this.validated = false;
};

/**
 * Renders plots (not to be confused with the Figure class)
 * TODO: Add functionality to link cameras between figures
 * @param {*} parent 
 * @param {*} container 
 * @param {*} opts 
 */

function Axes3D(parent, container, opts) {
    /**
     * The type of this object. (Read-only)
     */
    this.type = 'Axes3D';

    /**
     * The plot that generated this figure. (Read-only)
     */
    this.parent = parent;

    // avoid null pointer errors
    if(opts === undefined) opts = {};

    /**
     * The frame which will render the axes
     */
    this.frame = new Frame(container, opts);

    /**
     * The point which the camera will orbit around
     */
    this.corigin = this.frame.scene.position.clone();

    this.fixedZoom = opts.fixedZoom !== undefined? opts.fixedZoom : false;

    /**
     * Camera which renders the axes. 
     */
    this.camera = new THREE.PerspectiveCamera( 50, this.frame.width / this.frame.height, .01, 50);

    // Initialize camera position
    this.camera.position.x = 4;
    this.camera.position.y = 3;
    this.camera.position.z = 2;
    this.camera.lookAt(this.corigin);

    /**
     * Objects to plot
     */
    this.objects = [];

    /**
     * Expressions to plot
     */
    this.expressions = {};

    // Bind events
    var _self = this;

    // Bind Events: Panning and Orbiting
    var _cameraStartPol = 0;
    var _cameraStartAz = 0;
    var _cameraStartR = 1;
    var _cameraStartUp = 1;
    var _cameraStartOr = null;
    var _cameraStartPos = null;
    var _upUnit = null;
    var _rightUnit = null;
    var _self = this;

    this.frame.container.addEventListener('mousedown', function(event) {
        if(event.buttons & 1) {
            var sc = new THREE.Spherical();
            sc.setFromVector3(_self.camera.position.clone().sub(_self.corigin));
            _cameraStartPol = sc.phi;
            _cameraStartAz = sc.theta;
            _cameraStartR = sc.r;
        }
        if(event.buttons & 2) {
            _cameraStartOr = _self.corigin.clone();
            _cameraStartPos = _self.camera.position.clone();
            var nor = _self.camera.getWorldDirection();
            _rightUnit = nor.clone().cross(new THREE.Vector3(0,1,0));
            _upUnit = nor.clone().applyAxisAngle(_rightUnit, Math.PI / 2);
        }
        _cameraStartUp = _self.camera.up.y;
    });

    this.frame.touchEventListener.onpan = function(event) {
        if(event.rightButtonDown) {
            // Prevent default if mouse moved significantly
            if((event.screenX - event.screenStartX) * (event.screenX - event.screenStartX) + (event.screenY - event.screenStartY) * (event.screenY - event.screenStartY) > 25) {
                event.suppressContextMenu();
            }
        
            // Pan camera            
            var r = _self.camera.position.distanceTo(_self.corigin);
            var disp = _upUnit.clone().multiplyScalar((event.screenY - event.screenStartY)).addScaledVector(_rightUnit, -(event.screenX - event.screenStartX));
            var newCamPos = _cameraStartPos.clone().addScaledVector(disp, _cameraStartUp * 0.002 * r);
            var newOrPos = _cameraStartOr.clone().addScaledVector(disp, _cameraStartUp * 0.002 * r);
            _self.camera.position.copy(newCamPos);
            _self.corigin.copy(newOrPos);
            _self.camera.lookAt(_self.corigin);
        }
        if(event.leftButtonDown) {
            event.preventDefault();

            var r = _self.camera.position.distanceTo(_self.corigin);
            var az = _cameraStartAz -  _cameraStartUp * (event.screenX - event.screenStartX) / 100;
            var pol = _cameraStartPol - _cameraStartUp * (event.screenY - event.screenStartY) / 100;

            while(pol > Math.PI) {
                pol -= 2 * Math.PI;
            } 
            while(pol <= -Math.PI) {
                pol += 2 * Math.PI;
            }

            if(pol * _cameraStartUp < 0) {
                _self.camera.up.y = -1;
            }
            if(pol * _cameraStartUp> 0) {
                _self.camera.up.y = 1;
            }

            _self.camera.position.setFromSpherical(new THREE.Spherical(r, pol, az)).add(_self.corigin);
            _self.camera.lookAt(_self.corigin);
        }
    };

    // Bind Events: Zooming
    this.frame.touchEventListener.onzoom = function(event) {
        if(this.fixedZoom === false) {
            event.suppressScrolling();
            var newPos = _self.corigin.clone().addScaledVector(_self.camera.position.clone().sub(_self.corigin), Math.pow(1.25, event.amount / 100));
            _self.camera.position.copy(newPos);
            _self.camera.lookAt(_self.corigin);
        }
    };

    // Setup some 3d scene stuff
    var ambientLight = new THREE.AmbientLight(0x303040);
    var directionalLight1 = new THREE.DirectionalLight(0xffe8d8, .4);
    var directionalLight2 = new THREE.DirectionalLight(0xffe8d8, .2);
    directionalLight2.position.y = -1;

    this.camLight = new THREE.PointLight(0xffffff, .5);

    this.frame.scene.add(ambientLight);
    this.frame.scene.add(directionalLight1);
    this.frame.scene.add(directionalLight2);
}

/**
 * Render the axes
 */
Axes3D.prototype.render = function() {
    this.frame.scene.remove(this.camLight);
    this.camLight.position.copy(this.camera.position);
    this.frame.scene.add(this.camLight);

    this.frame.render( this.camera );
};

/**
 * Plot an expression
 */
Axes3D.prototype.plotExpression = function(expr, type, opts) {
    switch(type) {
        case 'arrow':            
            var figure = new Arrow3D(this.parent, expr, opts);
            this.expressions[expr] = figure;
            this.addFigure(figure);
            return figure;
        case 'parametric':           
            var par = new Parametric3D(this, expr, opts);
            this.expressions[expr] = par;
            this.addFigure(par);
            return par;
        default:
            console.log('Interactive.Axes3D: Invalid plot type');
            return null;
    }
};

/**
 * Add an object to plot
 * @param {*} object Must be plottable
 */
Axes3D.prototype.addFigure = function(object) {
    this.objects.push(object);
    this.frame.scene.add(object.getSceneObject());
};

/**
 * Remove a plotted object
 */
Axes3D.prototype.removeFigure = function(object) {
    var index = this.objects.indexOf(object);
    if(index === -1) {
        console.log('Interactive.Axes3D: Figure not in axes');
        return null;
    }
    this.objects.splice(index, 1);
    this.frame.scene.remove(object.getSceneObject());
};

/**
 * Force the object to update
 */
Axes3D.prototype.redrawFigure = function(object) {
    var index = this.objects.indexOf(object);
    if(index === -1) {
        console.log('Interactive.Axes3D: Figure not in axes');
        return null;
    }
    this.frame.scene.remove(object.getSceneObject());
    object.invalidate();
    this.frame.scene.add(object.getSceneObject());    
};

/**
 * Redraw all objects
 */
Axes3D.prototype.refresh = function(expr) {
    for(var i = 0; i < this.objects.length; i++) {
        if(this.objects[i].invalidate !== undefined && (expr === undefined || this.objects[i].getVariables().includes(expr))) {
            this.frame.scene.remove(this.objects[i].getSceneObject());
            this.objects[i].invalidate();
            this.frame.scene.add(this.objects[i].getSceneObject());
        }
    }
};

function Panel (parent, container) {
    this.parent = parent;

    this.container = container;
}

Panel.prototype.addSlider = function(expr, opts) {
    if(opts === undefined) opts = {};

    var interval = new Expression(expr, this.parent.context).evaluate();

    var slider = document.createElement('input');
    slider.setAttribute('type', 'range');
    slider.min = interval.start.value;
    slider.max = interval.end.value;
    slider.step = interval.step.value;

    if(this.parent.context[interval.varstr] !== undefined) {
        slider.value = this.parent.context[interval.varstr].value;
    }

    var _self = this;
    if(opts.continuous === undefined || opts.continuous === false) {
        slider.onchange = function() {            
            _self.parent.context[interval.varstr] = new Number(parseFloat(slider.value));
            _self.parent.refresh(interval.varstr);
        };
    } else if(opts.continuous === true) {
        slider.oninput = function() {
            _self.parent.context[interval.varstr] = new Number(parseFloat(slider.value));
            _self.parent.refresh(interval.varstr);
        };
    }

    var label = document.createTextNode(interval.varstr + ' = ');
    this.container.appendChild(label);
    this.container.appendChild(slider);
};

function Plot() {
    /**
     * The type of this object. (Read-only)
     */
    this.type = 'Plot';
    this.axes = [];
    this.panels = [];

    /**
     * Create a 3D axis in the context of this plot
     */
    this.createAxes3D = function(container, opts) {
        var ax = new Axes3D(this, container, opts);
        this.axes.push(ax);
        return ax;
    };

    /**
     * Create a 2D axis in the context of this plot
     */
    this.createAxes2D = function(container, opts) {
        var ax = new Axes2D(this, container, opts);
        this.axes.push(ax);
        return ax;
    };

    /**
     * The variables the expressions will reference
     */
    this.context = Expression.getDefaultContext();

    /**
     * Cached expressions
     */
    this.expressions = {};
}

Plot.prototype.execExpression = function(expr) {
    if(this.expressions[expr] === undefined) this.expressions[expr] = new Expression(expr, this.context);
    return this.expressions[expr].evaluate();
};

Plot.prototype.refresh = function(expr) {
    for(var i = 0; i < this.axes.length; i++) {
        this.axes[i].refresh(expr);
    }
};

Plot.prototype.linkCameras = function(from) {
    for(var i = 1; i < arguments.length; i++) {
        arguments[i].camera = from.camera;
    }
};

Plot.prototype.createPanel = function(container, opts) {
    var panel = new Panel(this, container, opts);
    this.panels.push(panel);
    return panel;
};

function Parametric(func, intervals) {
    this.func = func;
    this.intervals = Array.from(arguments).slice(1);
}

/**
 * Object that represents basis axes in 2d space.
 * @param {*} opts Options to customize the appearance of the arrows. Includes:
 * origin -- Point of the origin. Default is (0, 0, 0)
 * hex -- hexadecimal value to define color. Default is 0xffff00.
 * headLength -- The length of the head of the arrow. Default is 0.2.
 * headWidth -- The length of the width of the arrow. Default is 0.04.
 * (Derived from THREE.js)
 */
function BasisVectors2D(plot, opts) {
    var _opts = opts !== undefined ? opts : {};

    this.xBasis = '(1,0)';
    this.yBasis = '(0,1)';

    var _xOpts = Object.assign({},_opts);
    var _yOpts = Object.assign({},_opts);

    if( _opts.headWidth === undefined ) {
        _xOpts.headWidth = 0.04;
        _yOpts.headWidth = 0.04;
    }
    if( _opts.xHex === undefined) {
        _xOpts.hex = 0x880000;
    }
    if( _opts.yHex === undefined) {
        _yOpts.hex = 0x008800;
    }

    this.xArrow = new Arrow2D(plot, this.xBasis, _xOpts);   
    this.yArrow = new Arrow2D(plot, this.yBasis, _yOpts);

    this.sceneObject = null;
}

/**
 * Returns an object that can be added to a THREE.js scene.
 */
BasisVectors2D.prototype.getSceneObject = function() {
    if(this.sceneObject === null) {
        this.sceneObject = new THREE.Group();
        this.sceneObject.add(this.xArrow.getSceneObject());
        this.sceneObject.add(this.yArrow.getSceneObject());
    }
    return this.sceneObject;
};

/**
 * Object that represents basis axes in 3d space.
 * @param {*} opts Options to customize the appearance of the arrows. Includes:
 * origin -- Point of the origin. Default is (0, 0, 0)
 * hex -- hexadecimal value to define color. Default is 0xffff00.
 * headLength -- The length of the head of the arrow. Default is 0.2 * length.
 * headWidth -- The length of the width of the arrow. Default is 0.2 * headLength.
 * (Derived from THREE.js)
 */
function BasisVectors3D(plot, opts) {
    var _opts = opts !== undefined ? opts : {};

    this.xBasis = '(1,0,0)';
    this.yBasis = '(0,1,0)';
    this.zBasis = '(0,0,1)';

    var _xOpts = Object.assign({},_opts);
    var _yOpts = Object.assign({},_opts);
    var _zOpts = Object.assign({},_opts);

    if( _opts.xHex === undefined) {
        _xOpts.hex = 0x880000;
    }
    if( _opts.yHex === undefined) {
        _yOpts.hex = 0x008800;
    }
    if( _opts.zHex === undefined) {
        _zOpts.hex = 0x4444ff;
    }

    this.xArrow = new Arrow3D(plot, this.xBasis, _xOpts);   
    this.yArrow = new Arrow3D(plot, this.yBasis, _yOpts);
    this.zArrow = new Arrow3D(plot, this.zBasis, _zOpts);

    this.sceneObject = null;
}

/**
 * Returns an object that can be added to a THREE.js scene.
 */
BasisVectors3D.prototype.getSceneObject = function() {
    if(this.sceneObject === null) {
        this.sceneObject = new THREE.Group();
        this.sceneObject.add(this.xArrow.getSceneObject());
        this.sceneObject.add(this.yArrow.getSceneObject());
        this.sceneObject.add(this.zArrow.getSceneObject());
    }
    return this.sceneObject;
};

exports.Axes2D = Axes2D;
exports.Axes3D = Axes3D;
exports.Panel = Panel;
exports.Plot = Plot;
exports.TouchEventListener = TouchEventListener;
exports.Expression = Expression;
exports.Interval = Interval;
exports.MathPlus = MathPlus;
exports.Number = Number;
exports.Parametric = Parametric;
exports.Vector = Vector;
exports.Arrow2D = Arrow2D;
exports.Arrow3D = Arrow3D;
exports.BasisVectors2D = BasisVectors2D;
exports.BasisVectors3D = BasisVectors3D;
exports.Hotspot2D = Hotspot2D;
exports.Parametric2D = Parametric2D;
exports.Parametric3D = Parametric3D;
exports.Frame = Frame;

Object.defineProperty(exports, '__esModule', { value: true });

})));
