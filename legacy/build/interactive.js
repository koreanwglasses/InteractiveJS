(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.Interactive = {})));
}(this, (function (exports) { 'use strict';

    /**
     * Creates several bindings and useful functions for mouse and touch interactions
     * @param {*} container 
     */
    function TouchEventListener(container, opts) {
        var _container = container;
        var _leftButtonDown = false;
        var _rightButtonDown = false;
        var _buttonsDown = 0;
        var _suppressContextMenu = false;

        var _screenStartX = 0;
        var _screenStartY = 0;

        var _clientStartX = 0;
        var _clientStartY = 0;

        var _self = this;

        if(opts === undefined) opts = {};
        if(opts.passive === undefined) opts.passive = true;

        _container.addEventListener('mouseenter', function() {
        });

        _container.addEventListener('mouseleave', function() {
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

        if(opts.passive === false) {
            _container.addEventListener('wheel', function(event) {
                var e = {
                    amount: event.deltaY,
                    suppressScrolling: function() {
                        event.preventDefault();
                    }
                };
                _self.onzoom(e);
            });
        }

        // var _onpan = function(event) {
        //     if (event.rightButtonDown) {
        //         // Prevent default if mouse moved significantly
        //         if ((event.screenX - event.screenStartX) * (event.screenX - event.screenStartX) + (event.screenY - event.screenStartY) * (event.screenY - event.screenStartY) > 25) {
        //             event.suppressContextMenu();
        //         }

        //         // zoom
        //         var e = {
        //             amount: event.screenY - event.screenStartY,
        //             suppressScrolling: function() {
        //                 return;
        //             }
        //         };
        //         _self.onzoom(e);
        //     }
        //     _self.onpan(event);
        // }

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

        // Jquery compatibility
        if('jQuery' in window && container instanceof jQuery) {
            container = container[0];
        }

        // Make sure the container is a dom element
        if(!container instanceof Element) {
            console.log('Interactive.Frame: Invalid container. Must be a jQuery or DOM Element');
            return null;
        }

        // Avoid null pointer errors later on
        this.opts = opts === undefined ? {} : opts;

        /**
         * DOM Element which contains the frame
         */
        this.container = container;

        this.inner = document.createElement('div');
        this.container.appendChild(this.inner);

        /**
         * Event Listener for touch and mouse events
         */
        this.touchEventListener = new TouchEventListener(this.container, opts);

        /**
         * Width of the viewport derived from the width of the container. (Read-only)
         */
        this.width = container.clientWidth;

        /**
         * Height of the viewport derived from the width of the container. (Read-only)
         */
        this.height = container.clientHeight;

        if(this.opts.antialias === undefined) this.opts.antialias = true;

        this.isSleeping = true;

        /**
         * Scene from Three.js where all the elements lie.
         */    
        this.scene = new THREE.Scene();
    }

    Frame.prototype.sleep = function() {
        if(this.isSleeping === false) {
            this.renderer.forceContextLoss();
            this.renderer.context = null;
            this.renderer.domElement = null;        
            this.renderer = null;

            this.isSleeping = true;
        }
    };

    Frame.prototype.wake = function() {
        if(this.isSleeping === true) {
            this.renderer = new THREE.WebGLRenderer(this.opts);

            // Initialize renderer within container
            this.renderer.setSize(this.width, this.height);
            this.inner.innerHTML = '';
            this.inner.appendChild(this.renderer.domElement);
            
            this.isSleeping = false;
        }
    };

    /**
     * Render the frame
     */
    Frame.prototype.render = function(camera) {
        this.renderer.render( this.scene, camera );
    };

    function Plottable(plot, opts) {
        /**
         * (Read-only)
         */
        this.isPlottableInstance = true;

        this.plot = plot;
        
        this.sceneObject = null;
        this.validated = false;

        if(opts === undefined) opts = {};
    }



    /**
     * Returns an object that can be added to a THREE.js scene.
     */
    Plottable.prototype.getSceneObject = function() {
        if(this.validated === false) {
            if(!this.showExpr || this.showExpr.evaluate() != 0) {
                this.sceneObject = this.createSceneObject();
            } else {
                this.sceneObject = null;
            }
            this.validated = true;
        }
        return this.sceneObject;
    };

    /**
     * Creates the sceneObject
     */
    Plottable.prototype.createSceneObject = function() {
        console.log('Interactive.' + this._proto_.constructor.name + ': Method not implemented');
        return null;
    };


    /**
     * Updates on the next call to render
     */
    Plottable.prototype.invalidate = function() {
        this.validated = false;
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
    function Arrow3D(plot, plotInfo, opts) {
        Plottable.call(this, plot, opts);
        
        this.exprs = plotInfo.exprs;
        
        if(opts === undefined) opts = {};
        this.opts = {};
        this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;
        this.opts.headLength = opts.headLength !== undefined ? opts.headLength : 0.2;
        this.opts.headWidth = opts.headWidth !== undefined ? opts.headWidth : 0.2;
    }

    Arrow3D.prototype = Object.create(Plottable.prototype);
    Arrow3D.prototype.constructor = Arrow3D;

    Arrow3D.prototype.getVariables = function() {    
        if(this.opts.origin !== undefined) return Plottable.prototype.getVariables.call(this).concat(this.opts.origin.getVariables());
        else return Plottable.prototype.getVariables.call(this).getVariables()
    };

    Arrow3D.prototype.createSceneObject = function() {
        var _end = this.plot.parser.eval(this.exprs.end);
        var _vector3 = new THREE.Vector3(..._end.toArray());
        var _start = this.plot.parser.eval(this.exprs.start);
        var _origin = new THREE.Vector3(..._start.toArray());
        var _dir = _vector3.clone().sub(_origin).normalize();
        var _length = _vector3.distanceTo(_origin);
        var _hex = this.opts.hex;
        var _headLength = this.opts.headLength * _length;
        var _headWidth = this.opts.headWidth * _headLength;
        
        return new THREE.ArrowHelper(_dir, _origin, _length, _hex, _headLength, _headWidth);
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

    function Parametric3D(parent, plotInfo, opts) {
        Plottable.call(this, parent.parent, opts);
        
        this.parent = parent;
        this.opts = opts !== undefined ? opts : {};
        
        if (this.opts.color === undefined) this.opts.color = false;
        if (this.opts.wireframe === undefined) this.opts.wireframe = false;
        if (this.opts.flat === undefined) this.opts.flat = false;
        if (this.opts.smooth === undefined) this.opts.smooth = true;
        if (this.opts.thick === undefined) this.opts.thick = false;
        
        this.exprs = plotInfo.exprs;
        
        if(!this.exprs.color && this.opts.color) {
            this.exprs.color = this.opts.color;
            this.opts.color = true;
        }
        
        if (this.exprs.tvar) {
            this.exprs.pointFunc = '_tmp(' + this.exprs.tvar + ') = ' + this.exprs.point;
            if (this.exprs.color) {
                this.exprs.colorFunc = '_tmp(' + this.exprs.tvar + ') = ' + this.exprs.color;
            }
        } else if (this.exprs.uvar && this.exprs.vvar) {
            this.exprs.pointFunc = '_tmp(' + this.exprs.uvar + ',' + this.exprs.vvar + ') = ' + this.exprs.point;
            if (this.exprs.color) {
                this.exprs.colorFunc = '_tmp(' + this.exprs.uvar + ',' + this.exprs.vvar + ') = ' + this.exprs.color;
            }
        } 
    }

    Parametric3D.prototype = Object.create(Plottable.prototype);
    Parametric3D.prototype.constructor = Parametric3D;

    Parametric3D.prototype.createLine = function (par) {
        var geom = new THREE.BufferGeometry();
        
        var pointFunc = this.plot.parser.eval(this.exprs.pointFunc);
        var tint = {
            min: this.plot.parser.eval(this.exprs.tmin),
            max: this.plot.parser.eval(this.exprs.tmax),
            steps: this.plot.parser.eval(this.exprs.tsteps),
        };
        var colorFunc = this.plot.parser.eval(this.exprs.colorFunc);
        
        var direction = new Float32Array(tint.steps * 2);
        var vertices = new Float32Array(tint.steps * 3 * 2);
        var previous = new Float32Array(tint.steps * 3 * 2);
        var next = new Float32Array(tint.steps * 3 * 2);
        
        var colors = new Uint8Array(tint.steps * 4 * 2);
        
        for (var i = 0; i < tint.steps; i++) {
            var t = i * (tint.max - tint.min) / (tint.steps - 1) + tint.min;
            
            direction[i * 2] = 1;
            direction[i * 2 + 1] = -1;
            
            var v = new THREE.Vector3(...pointFunc(t).toArray());
            vertices[i * 6] = v.x;
            vertices[i * 6 + 1] = v.y;
            vertices[i * 6 + 2] = v.z;
            
            vertices[i * 6 + 3] = v.x;
            vertices[i * 6 + 4] = v.y;
            vertices[i * 6 + 5] = v.z;
            
            if (i > 0) {
                previous[i * 6] = vertices[i * 6 - 6];
                previous[i * 6 + 1] = vertices[i * 6 - 5];
                previous[i * 6 + 2] = vertices[i * 6 - 4];
                previous[i * 6 + 3] = vertices[i * 6 - 3];
                previous[i * 6 + 4] = vertices[i * 6 - 2];
                previous[i * 6 + 5] = vertices[i * 6 - 1];
                
                next[i * 6 - 6] = vertices[i * 6];
                next[i * 6 - 5] = vertices[i * 6 + 1];
                next[i * 6 - 4] = vertices[i * 6 + 2];
                next[i * 6 - 3] = vertices[i * 6 + 3];
                next[i * 6 - 2] = vertices[i * 6 + 4];
                next[i * 6 - 1] = vertices[i * 6 + 5];
            }
            
            if (this.opts.color) {
                var color = colorFunc(t).toArray();
                colors[i * 8] = color[0] * 255;
                colors[i * 8 + 1] = color[1] * 255;
                colors[i * 8 + 2] = color[2] * 255;
                colors[i * 8 + 3] = 255;
                colors[i * 8 + 4] = color[0] * 255;
                colors[i * 8 + 5] = color[1] * 255;
                colors[i * 8 + 6] = color[2] * 255;
                colors[i * 8 + 7] = 255;
            } else {
                colors[i * 8] = 255;
                colors[i * 8 + 1] = 255;
                colors[i * 8 + 2] = 255;
                colors[i * 8 + 3] = 255;
                colors[i * 8 + 4] = 255;
                colors[i * 8 + 5] = 255;
                colors[i * 8 + 6] = 255;
                colors[i * 8 + 7] = 255;
            }
        }
        
        previous[0] = vertices[0];
        previous[1] = vertices[1];
        previous[2] = vertices[2];
        previous[3] = vertices[3];
        previous[4] = vertices[4];
        previous[5] = vertices[5];
        next[tint.steps * 6 - 6] = vertices[tint.steps * 6 - 6];
        next[tint.steps * 6 - 5] = vertices[tint.steps * 6 - 5];
        next[tint.steps * 6 - 4] = vertices[tint.steps * 6 - 4];
        next[tint.steps * 6 - 3] = vertices[tint.steps * 6 - 3];
        next[tint.steps * 6 - 2] = vertices[tint.steps * 6 - 2];
        next[tint.steps * 6 - 1] = vertices[tint.steps * 6 - 1];
        
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

    Parametric3D.prototype.createSurface = function () {
        var geom = new THREE.Geometry();
        
        var pointFunc = this.plot.parser.eval(this.exprs.pointFunc);
        var uint = {
            min: this.plot.parser.eval(this.exprs.umin),
            max: this.plot.parser.eval(this.exprs.umax),
            steps: this.plot.parser.eval(this.exprs.usteps),
        };
        var vint = {
            min: this.plot.parser.eval(this.exprs.vmin),
            max: this.plot.parser.eval(this.exprs.vmax),
            steps: this.plot.parser.eval(this.exprs.vsteps),
        };
        if(this.opts.color) {
            var colorFunc = this.plot.parser.eval(this.exprs.colorFunc);
        }
        
        var colors = [];
        
        for (var i = 0; i < uint.steps; i++) {
            var u = i * (uint.max - uint.min) / (uint.steps - 1) + uint.min;
            for (var j = 0; j < vint.steps; j++) {
                var v = j * (vint.max - vint.min) / (vint.steps - 1) + vint.min;
                
                var vert = new THREE.Vector3(...pointFunc(u, v).toArray());
                geom.vertices.push(vert);
                
                if (this.opts.color) {
                    var color = colorFunc(u, v).toArray();
                    colors.push(new THREE.Color(...color));
                }
                
                if (i > 0 && j > 0) {
                    var v1 = i * vint.steps + j;
                    var v2 = i * vint.steps + j - 1;
                    var v3 = (i - 1) * vint.steps + j;
                    var v4 = (i - 1) * vint.steps + j - 1;
                    
                    var f1 = new THREE.Face3(v1, v2, v4);
                    var f2 = new THREE.Face3(v1, v4, v3);
                    
                    if (this.opts.color) {
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
        if (this.opts.color) {
            opts['vertexColors'] = THREE.VertexColors;
        }
        if (this.opts.smooth === false) {
            opts['shading'] = THREE.FlatShading;
        }
        
        if (this.opts.wireframe === true || this.opts.flat === true) {
            var mat = new THREE.MeshBasicMaterial(opts);
            if (this.opts.wireframe) mat.wireframe = true;
        } else {
            var mat = new THREE.MeshLambertMaterial(opts);
        }
        mat.side = THREE.DoubleSide;
        return new THREE.Mesh(geom, mat);
    };

    Parametric3D.prototype.createSceneObject = function () {
        if (this.exprs.tvar) {
            return this.createLine();
        } else {
            return this.createSurface();
        }
    };

    function Line(vertices, colors, mat) {

        var geom = new THREE.BufferGeometry();

        var direction = new Float32Array(vertices.length * 2);
        var vertbuff = new Float32Array(vertices.length * 3 * 2);
        var previous = new Float32Array(vertices.length * 3 * 2);
        var next = new Float32Array(vertices.length * 3 * 2);

        var colorbuff = new Uint8Array(vertices.length * 4 * 2);

        for(var i = 0; i < vertices.length; i++) {
            direction[i*2] = 1;
            direction[i*2+1] = -1;

            var v = vertices[i];
            vertbuff[i*6] = v.x;
            vertbuff[i*6+1] = v.y;
            vertbuff[i*6+2] = v.z;

            vertbuff[i*6+3] = v.x;
            vertbuff[i*6+4] = v.y;
            vertbuff[i*6+5] = v.z;

            if(i > 0) {
                previous[i*6] = vertbuff[i*6-6];
                previous[i*6+1] = vertbuff[i*6-5];
                previous[i*6+2] = vertbuff[i*6-4];
                previous[i*6+3] = vertbuff[i*6-3];
                previous[i*6+4] = vertbuff[i*6-2];
                previous[i*6+5] = vertbuff[i*6-1];

                next[i*6-6] = vertbuff[i*6];
                next[i*6-5] = vertbuff[i*6+1];
                next[i*6-4] = vertbuff[i*6+2];
                next[i*6-3] = vertbuff[i*6+3];
                next[i*6-2] = vertbuff[i*6+4];
                next[i*6-1] = vertbuff[i*6+5];
            }

            if(colors !== undefined) {
                var color = colors[i];
                colorbuff[i*8] = color.r * 255;
                colorbuff[i*8 + 1] = color.g * 255;
                colorbuff[i*8 + 2] = color.b * 255;
                colorbuff[i*8 + 3] = 255;
                colorbuff[i*8 + 4] = color.r * 255;
                colorbuff[i*8 + 5]  =color.g * 255;
                colorbuff[i*8 + 6] = color.b * 255;
                colorbuff[i*8 + 7] = 255;
            } else {
                colorbuff[i*8] = 255;
                colorbuff[i*8 + 1] = 255;
                colorbuff[i*8 + 2] = 255;
                colorbuff[i*8 + 3] = 255;
                colorbuff[i*8 + 4] = 255;
                colorbuff[i*8 + 5] = 255;
                colorbuff[i*8 + 6] = 255;
                colorbuff[i*8 + 7] = 255;
            }
        }

        previous[0] = vertbuff[0];
        previous[1] = vertbuff[1];
        previous[2] = vertbuff[2];
        previous[3] = vertbuff[3];
        previous[4] = vertbuff[4];
        previous[5] = vertbuff[5];
        next[vertices.length*6-6] = vertbuff[vertices.length*6-6];
        next[vertices.length*6-5] = vertbuff[vertices.length*6-5];
        next[vertices.length*6-4] = vertbuff[vertices.length*6-4];
        next[vertices.length*6-3] = vertbuff[vertices.length*6-3];
        next[vertices.length*6-2] = vertbuff[vertices.length*6-2];
        next[vertices.length*6-1] = vertbuff[vertices.length*6-1];

        geom.addAttribute('direction', new THREE.BufferAttribute(direction, 1));
        geom.addAttribute('position', new THREE.BufferAttribute(vertbuff, 3));
        geom.addAttribute('previous', new THREE.BufferAttribute(previous, 3));
        geom.addAttribute('next', new THREE.BufferAttribute(next, 3));
        geom.addAttribute('color', new THREE.BufferAttribute(colorbuff, 4, true));

        var mesh = new THREE.Mesh(geom, mat);
        mesh.drawMode = THREE.TriangleStripDrawMode;
        return mesh
    }

    function Isoline3D(parent, plotInfo, opts) {
        Plottable.call(this, parent.parent, opts);
        
        this.parent = parent;
        
        this.opts = opts !== undefined ? opts : {};
        // if(this.opts.axis === undefined) this.opts.axs = 'y';
        this.lineWidth = this.opts.thick === true ? 40 : 15;
     
        this.exprs = plotInfo.exprs;
        
        if(!this.exprs.color && this.opts.color) {
            this.exprs.color = this.opts.color;
            this.opts.color = true;
        }

        if (this.exprs.uvar && this.exprs.vvar) {
            this.exprs.pointFunc = '_tmp(' + this.exprs.uvar + ',' + this.exprs.vvar + ') = ' + this.exprs.point;
            if (this.exprs.color) {
                this.exprs.colorFunc = '_tmp(v) = ' + this.exprs.color;
            }
        } else {
            console.error(new Error('Invalid parameters').stack);
            return null;
        }
        
        this.sfld = [];
        this.sfldValidated = false;
    }

    Isoline3D.prototype = Object.create(Plottable.prototype);
    Isoline3D.prototype.constructor = Isoline3D;

    Isoline3D.prototype.createScalarField = function () {
        var pointFunc = this.plot.parser.eval(this.exprs.pointFunc);
        var uint = {
            min: this.plot.parser.eval(this.exprs.umin),
            max: this.plot.parser.eval(this.exprs.umax),
            steps: this.plot.parser.eval(this.exprs.usteps),
        };
        var vint = {
            min: this.plot.parser.eval(this.exprs.vmin),
            max: this.plot.parser.eval(this.exprs.vmax),
            steps: this.plot.parser.eval(this.exprs.vsteps),
        };
        
        var sfld = [];
        for (var i = 0; i < uint.steps; i++) {
            var u = i * (uint.max - uint.min) / (uint.steps - 1) + uint.min;
            sfld.push([]);
            for (var j = 0; j < vint.steps; j++) {
                var v = j * (vint.max - vint.min) / (vint.steps - 1) + vint.min;
                var vert = pointFunc(u, v);
                sfld[sfld.length - 1].push(vert);
            }
        }
        this.sfld = sfld;
    };

    Isoline3D.prototype.lerp = function (a, b, az, z, bz) {
        var alpha = (z - az) / (bz - az);

        a = new THREE.Vector3(...a);
        b = new THREE.Vector3(...b);
        var result = a.multiplyScalar(1 - alpha).add(b.multiplyScalar(alpha));
        result.y = z;
        return result;
    };

    Isoline3D.prototype.createIsoline = function (isoline) {
        var pointFunc = this.plot.parser.eval(this.exprs.pointFunc);
        var uint = {
            min: this.plot.parser.eval(this.exprs.umin),
            max: this.plot.parser.eval(this.exprs.umax),
            steps: this.plot.parser.eval(this.exprs.usteps),
        };
        var vint = {
            min: this.plot.parser.eval(this.exprs.vmin),
            max: this.plot.parser.eval(this.exprs.vmax),
            steps: this.plot.parser.eval(this.exprs.vsteps),
        };
        
        var lvl = this.plot.parser.eval(this.exprs.level);
        
        if (this.sfldValidated === false) this.createScalarField();
        
        var edges = [];
        
        for (var i = 0; i < uint.steps - 1; i++) {
            for (var j = 0; j < vint.steps - 1; j++) {
                var a = this.sfld[i][j + 1].toArray();
                var b = this.sfld[i + 1][j + 1].toArray();
                var c = this.sfld[i + 1][j].toArray();
                var d = this.sfld[i][j].toArray();
                
                var cse = (d[1] > lvl);
                cse = cse * 2 + (c[1] > lvl);
                cse = cse * 2 + (b[1] > lvl);
                cse = cse * 2 + (a[1] > lvl);
                
                switch (cse) {
                    case 0:
                    case 15:
                    break;
                    case 1:
                    case 14:
                    var v1 = this.lerp(a, d, a[1], lvl, d[1]);
                    var v2 = this.lerp(a, b, a[1], lvl, b[1]);
                    edges.push([v1, v2]);
                    break;
                    case 2:
                    case 13:
                    var v1 = this.lerp(a, b, a[1], lvl, b[1]);
                    var v2 = this.lerp(b, c, b[1], lvl, c[1]);
                    edges.push([v1, v2]);
                    break;
                    case 3:
                    case 12:
                    var v1 = this.lerp(a, d, a[1], lvl, d[1]);
                    var v2 = this.lerp(b, c, b[1], lvl, c[1]);
                    edges.push([v1, v2]);
                    break;
                    case 4:
                    case 11:
                    var v1 = this.lerp(b, c, b[1], lvl, c[1]);
                    var v2 = this.lerp(c, d, c[1], lvl, d[1]);
                    edges.push([v1, v2]);
                    break;
                    case 5:
                    case 10:
                    if ((cse === 10) ^ (a[i] + (b[i]) + c[i] + d[i] > 4 * lvl)) {
                        var v1 = this.lerp(a, d, a[1], lvl, d[1]);
                        var v2 = this.lerp(c, d, c[1], lvl, d[1]);
                        var v3 = this.lerp(a, b, a[1], lvl, b[1]);
                        var v4 = this.lerp(b, c, b[1], lvl, c[1]);
                        edges.push([v1, v2]);
                        edges.push([v3, v4]);
                    } else {
                        var v1 = this.lerp(a, b, a[1], lvl, b[1]);
                        var v2 = this.lerp(a, d, a[1], lvl, d[1]);
                        var v3 = this.lerp(b, c, b[1], lvl, c[1]);
                        var v4 = this.lerp(c, d, c[1], lvl, d[1]);
                        edges.push([v1, v2]);
                        edges.push([v3, v4]);
                    }
                    break;
                    case 6:
                    case 9:
                    var v1 = this.lerp(a, b, a[1], lvl, b[1]);
                    var v2 = this.lerp(c, d, c[1], lvl, d[1]);
                    edges.push([v1, v2]);
                    break;
                    case 7:
                    case 8:
                    var v1 = this.lerp(a, d, a[1], lvl, d[1]);
                    var v2 = this.lerp(c, d, c[1], lvl, d[1]);
                    edges.push([v1, v2]);
                    break;
                }
            }
        }
        
        // merge vertices
        
        var equiv = function(a,b) {
            return a.distanceTo(b) < 0.000005;
        };
        
        var curves = [];
        while(edges.length > 0) {
            var e = edges.pop();
            (function() {
                for(var i = 0; i < edges.length; i++) {
                    var edge = edges[i];
                    if (equiv(edge[0], e[0])) {
                        e.reverse();
                        edges[i] = e.concat(edge.slice(1));
                        return;
                    } else if (equiv(edge[0], e[e.length - 1])) {
                        edges[i] = e.concat(edge.slice(1));
                        return;
                    } else if (equiv(edge[edge.length - 1], e[0])) {
                        edges[i] = edge.concat(e.slice(1));
                        return;
                    } else if (equiv(edge[edge.length - 1], e[e.length - 1])) {
                        e.reverse();
                        edges[i] = edge.concat(e.slice(1));
                        return;
                    }
                }
                curves.push(e);
                return;
            })();
        }
        
        var objct = new THREE.Group();
        
        var mat = new LineMaterialCreator(this.lineWidth, this.parent.frame.width, this.parent.frame.height).getMaterial();
        for(var i = 0; i < curves.length; i++) {
            var colors = undefined;
            if(this.opts.color) {
                var colorFunc = this.plot.parser.eval(this.exprs.colorFunc);
                colors = [];
                for(var j = 0; j < curves[i].length; j++) {
                    var v = curves[i][j].toArray();
                    var color = colorFunc(v).toArray();
                    colors.push(new THREE.Color(color[0], color[1], color[2]));
                }
            }
            objct.add(Line(curves[i],colors,mat));
        }
        return objct
    };

    Isoline3D.prototype.createSceneObject = function() {
        return this.createIsoline();
    };

    Isoline3D.prototype.invalidate = function () {
        // if (this.parExpr.getVariables().indexOf(expr) !== -1) this.sfldValidated = false;
        this.sfldValidated = false;
        this.validated = false;
    };

    var PlotInfo = function() {
        
    };

    var splitTuple = function(string) {
        var level = 0;
        var strip = false;
        var parts = [''];
        for(var i = 0; i < string.length; i++) {
            if(string[i] == '(' || string[i] == '[' || string[i] == '{') {
                level++;
                if(i == 0) {
                    strip = true;
                } else {
                    parts[parts.length - 1] += string[i];
                }
            } else if (string[i] == ')' || string[i] == ']' || string[i] == '}') {
                level--;
                if(i != string.length - 1 || !strip) {
                    parts[parts.length - 1] += string[i];
                }
            } else if (((strip && level == 1) || (!strip && level == 0)) && string[i] == ',') {
                parts.push('');
            } else {
                parts[parts.length - 1] += string[i];
            }
        }
        return parts;
    };

    PlotInfo.AngleArc2D = function(exprs) {
        this.exprs = {
            // Vector or Null
            offset: '[0,0]',

            // Vector
            v1: null,

            // Vector
            v2: null
        };

        if(exprs.offset) {
            this.exprs.offset = exprs.offset;
        }

        if(exprs.v1) {
            this.exprs.v1 = exprs.v1;
        } else {
            throw new Error('Invalid expressions for AngleArc2D plot info: missing .v1');
        }

        if(exprs.v2) {
            this.exprs.v2 = exprs.v2;
        } else {
            throw new Error('Invalid expressions for AngleArc2D plot info: missing .v2');
        }
    };
    PlotInfo.AngleArc2D.fromString = function(string) {
        string = string.replace(/\s/g, '');
        var parts = splitTuple(string);

        var exprs = {};
        if(parts.length == 2) {
            exprs.v1 = parts[0];        exprs.v2 = parts[1];
        } else if (parts.length == 3) {
            exprs.offset = parts[0];
            exprs.v1 = parts[1];
            exprs.v2 = parts[2];
        } else {
            throw new Error('Invalid syntax for AngleArc2D expression');
        }

        return new PlotInfo.Parallelogram2D(exprs);
    };

    PlotInfo.Arrow2D = function(exprs) {
       this.exprs = {
            // Vector or null
            start: '[0,0]',

            // Vector
            end: null,
        };

        // Object.assign(this.exprs, exprs);

        if(exprs.start) {
            this.exprs.start = exprs.start;
        }

        if(exprs.end) {
            this.exprs.end = exprs.end;
        } else {
            throw new Error('Invalid expressions for Arrow2D plot info: missing .end');
        }
    };
    PlotInfo.Arrow2D.fromString = function(string) {
        string = string.replace(/\s/g, '');
        var parts = splitTuple(string);

        var exprs = {};

        if(parts.length == 1) {
            exprs.end = parts[0];
        } else if(parts.length == 2) {
            exprs.start = parts[0];
            exprs.end = parts[1];
        } else {
            throw new Error('Invalid syntax for Arrow2D expression');
        }

        return new PlotInfo.Arrow2D(exprs);
    };

    PlotInfo.Arrow3D = function(exprs) {
       this.exprs = {
            // Vector or null
            start: '[0,0,0]',

            // Vector
            end: null,
        };

        // Object.assign(this.exprs, exprs);

        if(exprs.start) {
            this.exprs.start = exprs.start;
        }

        if(exprs.end) {
            this.exprs.end = exprs.end;
        } else {
            throw new Error('Invalid expressions for Arrow3D plot info: missing .end');
        }
    };
    PlotInfo.Arrow3D.fromString = function(string) {
        string = string.replace(/\s/g, '');
        var parts = splitTuple(string);

        var exprs = {};
        if(parts.length == 2) {
            exprs.end = parts[0];
        } else if(parts.length == 4) {
            exprs.start = parts[0];
            exprs.end = parts[1];
        } else {
            throw new Error('Invalid syntax for Arrow3D expression');
        }

        return new PlotInfo.Arrow3D(exprs);
    };

    PlotInfo.Isoline3D = function(exprs) {
        // Default values
        this.exprs = {
            // Vector
            point: null,
            
            // Variable
            level: null,
            
            // String
            uvar: null,
            // Variable
            umin: null,
            // Variable
            umax: null,
            // Variable
            usteps: null,
            
            // String or Null
            vvar: null,
            // Variable or Null
            vmin: null,
            // Variable or Null
            vmax: null,
            // Variable or Null
            vsteps: null,
            
            // Vector3 or Null
            color: null
        };
        
        // Object.assign(this.exprs, exprs);
        
        if(exprs.point) {
            this.exprs.point = exprs.point;
        } else {
            throw new Error('Invalid expressions for Isoline3D plot info: missing .point');
        }

        if(exprs.level) {
            this.exprs.level = exprs.level;
        } else {
            throw new Error('Invalid expressions for Isoline3D plot info: missing .level');
        }
        
        if ((exprs.uvar && exprs.umin && exprs.umax && exprs.usteps) 
        && (exprs.vvar && exprs.vmin && exprs.vmax && exprs.vsteps) ) {
            this.exprs.uvar = exprs.uvar;
            this.exprs.umin = exprs.umin;
            this.exprs.umax = exprs.umax;
            this.exprs.usteps = exprs.usteps;
            
            this.exprs.vvar = exprs.vvar;
            this.exprs.vmin = exprs.vmin;
            this.exprs.vmax = exprs.vmax;
            this.exprs.vsteps = exprs.vsteps;
        } else {
            throw new Error('Invalid expressions for Isoline3D plot info: invalid parameterization');
        }
        
        if(exprs.color) {
            this.exprs.color = exprs.color;
        }
    };
    PlotInfo.Isoline3D.fromString = function(string) {
        string = string.replace(/\s/g, '');
        var parts = string.split(/(?:{|}|\|)+/g);
        
        var exprs = {};
        exprs.point = parts[0];
        
        var uint = parts[1].split(',');
        var vint = parts[2].split(',');
        var level = parts[3].split('=');
        
        exprs.uvar = uint[0];
        exprs.umin = uint[1];
        exprs.umax = uint[2];
        exprs.usteps = uint[3];
        
        exprs.vvar = vint[0];
        exprs.vmin = vint[1];
        exprs.vmax = vint[2];
        exprs.vsteps = vint[3];
        
        exprs.level = level[1];

        return new PlotInfo.Isoline3D(exprs);
    };

    PlotInfo.Isoline2D = PlotInfo.Isoline3D;

    PlotInfo.Parallelogram2D = function(exprs) {
        this.exprs = {
            // Vector or Null
            offset: '[0,0]',

            // Vector
            v1: null,

            // Vector
            v2: null
        };

        if(exprs.offset) {
            this.exprs.offset = exprs.offset;
        }

        if(exprs.v1) {
            this.exprs.v1 = exprs.v1;
        } else {
            throw new Error('Invalid expressions for Parallelogram2D plot info: missing .v1');
        }

        if(exprs.v2) {
            this.exprs.v2 = exprs.v2;
        } else {
            throw new Error('Invalid expressions for Parallelogram2D plot info: missing .v2');
        }
    };
    PlotInfo.Parallelogram2D.fromString = function(string) {
        string = string.replace(/\s/g, '');
        var parts = splitTuple(string);

        var exprs = {};
        if(parts.length == 2) {
            exprs.v1 = parts[0];        exprs.v2 = parts[1];
        } else if (parts.length == 3) {
            exprs.offset = parts[0];
            exprs.v1 = parts[1];
            exprs.v2 = parts[2];
        } else {
            throw new Error('Invalid syntax for Parallelogram2D expression');
        }

        return new PlotInfo.Parallelogram2D(exprs);
    };

    PlotInfo.Polygon2D = function(exprs) {
       this.exprs = {
            // Array of vectors
            vertices: []
        };

        if(exprs.vertices && exprs.vertices.length > 1) {
            this.exprs.vertices = exprs.vertices;
        } else {
            throw new Error('Invalid expressions for Arrow3D plot info: missing .vertices');
        }
    };
    PlotInfo.Polygon2D.fromString = function(string) {
        string = string.replace(/\s/g, '');
        var parts = splitTuple(string);

        var exprs = {};
        if(parts.length > 1) {
            exprs.vertices = parts;
        } else {
            throw new Error('Invalid syntax for Polygon2D expression');
        }

        return new PlotInfo.Polygon2D(exprs);
    };

    PlotInfo.Parametric2D = function(exprs) {
        // Default values
        this.exprs = {
            // Vector
            point: null,
            
            // String
            tvar: null,
            // Variable
            tmin: null,
            // Variable
            tmax: null,
            // Variable
            tsteps: null,
            
            // Vector3 or Null
            color: null
        };
        
        // Object.assign(this.exprs, exprs);
        
        if(exprs.point) {
            this.exprs.point = exprs.point;
        } else {
            throw new Error('Invalid expressions for Parametric3D plot info: missing .point');
        }
        
        if( exprs.tvar && exprs.tmin && exprs.tmax && exprs.tsteps ) {
            this.exprs.tvar = exprs.tvar;
            this.exprs.tmin = exprs.tmin;
            this.exprs.tmax = exprs.tmax;
            this.exprs.tsteps = exprs.tsteps;
        } else {
            throw new Error('Invalid expressions for Parametric3D info: invalid parameterization');
        }
        
        if(exprs.color) {
            this.exprs.color = exprs.color;
        }
    };
    PlotInfo.Parametric2D.fromString = function(string) {
        string = string.replace(/\s/g, '');
        var parts = string.split(/(?:{|})+/g);
        
        var exprs = {};
        exprs.point = parts[0];
        
        if(parts.length == 3) {
            var interval = parts[1].split(',');
            exprs.tvar = interval[0];
            exprs.tmin = interval[1];
            exprs.tmax = interval[2];
            exprs.tsteps = interval[3];
        } else {
            console.error('Invalid syntax for Parametric3D expression');
        }
        
        return new PlotInfo.Parametric2D(exprs);
    };

    PlotInfo.Parametric3D = function(exprs) {
        // Default values
        this.exprs = {
            // Vector
            point: null,
            
            // String
            tvar: null,
            // Variable
            tmin: null,
            // Variable
            tmax: null,
            // Variable
            tsteps: null,
            
            // String
            uvar: null,
            // Variable
            umin: null,
            // Variable
            umax: null,
            // Variable
            usteps: null,
            
            // String or Null
            vvar: null,
            // Variable or Null
            vmin: null,
            // Variable or Null
            vmax: null,
            // Variable or Null
            vsteps: null,
            
            // Vector3 or Null
            color: null
        };
        
        // Object.assign(this.exprs, exprs);
        
        if(exprs.point) {
            this.exprs.point = exprs.point;
        } else {
            throw new Error('Invalid expressions for Parametric3D plot info: missing .point');
        }
        
        if( (exprs.tvar && exprs.tmin && exprs.tmax && exprs.tsteps)
        && (!exprs.uvar && !exprs.umin && !exprs.umax && !exprs.usteps) 
        && (!exprs.vvar && !exprs.vmin && !exprs.vmax && !exprs.vsteps) ) {
            this.exprs.tvar = exprs.tvar;
            this.exprs.tmin = exprs.tmin;
            this.exprs.tmax = exprs.tmax;
            this.exprs.tsteps = exprs.tsteps;
        } else if ( (!exprs.tvar && !exprs.tmin && !exprs.tmax && !exprs.tsteps)
        && (exprs.uvar && exprs.umin && exprs.umax && exprs.usteps) 
        && (exprs.vvar && exprs.vmin && exprs.vmax && exprs.vsteps) ) {
            this.exprs.uvar = exprs.uvar;
            this.exprs.umin = exprs.umin;
            this.exprs.umax = exprs.umax;
            this.exprs.usteps = exprs.usteps;
            
            this.exprs.vvar = exprs.vvar;
            this.exprs.vmin = exprs.vmin;
            this.exprs.vmax = exprs.vmax;
            this.exprs.vsteps = exprs.vsteps;
        } else {
            throw new Error('Invalid expressions for Parametric3D info: invalid parameterization');
        }
        
        if(exprs.color) {
            this.exprs.color = exprs.color;
        }
    };
    PlotInfo.Parametric3D.fromString = function(string) {
        string = string.replace(/\s/g, '');
        var parts = string.split(/(?:{|})+/g);
        
        var exprs = {};
        exprs.point = parts[0];
        
        if(parts.length == 3) {
            var interval = parts[1].split(',');
            exprs.tvar = interval[0];
            exprs.tmin = interval[1];
            exprs.tmax = interval[2];
            exprs.tsteps = interval[3];
        } else if(parts.length == 4) {
            var interval1 = parts[1].split(',');
            var interval2 = parts[2].split(',');
            
            exprs.uvar = interval1[0];
            exprs.umin = interval1[1];
            exprs.umax = interval1[2];
            exprs.usteps = interval1[3];
            
            exprs.vvar = interval2[0];
            exprs.vmin = interval2[1];
            exprs.vmax = interval2[2];
            exprs.vsteps = interval2[3];
        } else {
            console.error('Invalid syntax for Parametric3D expression');
        }
        
        return new PlotInfo.Parametric3D(exprs);
    };

    function Axes3D(parent, container, opts) {
        Axes.call(this, parent, container, opts);

        /**
         * Used internally for optimization (Read-only)
         */
        this.isAxes3DInstance = true;

        /**
         * The point which the camera will orbit around
         */
        this.corigin = this.frame.scene.position.clone();

        /**
         * Camera which renders the axes. 
         */
        this.camera = new THREE.PerspectiveCamera( 50, this.frame.width / this.frame.height, .01, 50);

        if(opts === undefined) opts = {};
        if(opts.zoom === undefined) opts.zoom = 1;

        // Initialize camera position
        this.camera.position.x = 4 / opts.zoom;
        this.camera.position.y = 3 / opts.zoom;
        this.camera.position.z = 2 / opts.zoom;
        this.camera.lookAt(this.corigin);

        // Bind events
        var _self = this;

        // Bind Events: Panning and Orbiting
        var _cameraStartPol = 0;
        var _cameraStartAz = 0;
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
            if(_self.fixedZoom === false) {
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

    Axes3D.prototype = Object.create(Axes.prototype);
    Axes3D.prototype.constructor = Axes3D;

    /**
     * Render the axes
     */
    Axes3D.prototype.render = function() {
        this.frame.scene.remove(this.camLight);
        this.camLight.position.copy(this.camera.position);
        this.frame.scene.add(this.camLight);

        Axes.prototype.render.call(this);
    };

    /**
     * Plot an expression
     */
    Axes3D.prototype.plotExpression = function(exprs, type, opts) {
        var expr = null;
        if(typeof exprs == 'string') {
            expr = exprs;
        }

        switch(type) {
            case 'arrow':            
                if(expr) exprs = PlotInfo.Arrow3D.fromString(expr);
                var figure = new Arrow3D(this.parent, exprs, opts);
                this.addFigure(figure);
                return figure;
            case 'parametric':  
                if(expr) exprs = PlotInfo.Parametric3D.fromString(expr);
                var par = new Parametric3D(this, exprs, opts);
                this.addFigure(par);
                return par;
            case 'isoline':
                if(expr) exprs = PlotInfo.Isoline3D.fromString(expr);
                var iso = new Isoline3D(this, exprs, opts);
                this.addFigure(iso);
                return iso;
            default:
                console.log('Interactive.Axes3D: Invalid plot type');
                return null;
        }
    };

    function AngleArc2D(plot, plotInfo, opts) {
        Plottable.call(this, plot, opts);

        this.exprs = plotInfo.exprs;

        if(opts === undefined) opts = {};
        this.opts = {};
        this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;
        this.opts.radius = opts.radius !== undefined ? opts.radius : 0.2;
        this.opts.tolerance = opts.tolerance !== undefined ? opts.tolerance : 0.01;
    }

    AngleArc2D.prototype = Object.create(Plottable.prototype);
    AngleArc2D.prototype.constructor = AngleArc2D;

    AngleArc2D.prototype.createSceneObject = function() {
        var _a = new THREE.Vector3(...this.plot.parser.eval(this.exprs.v1).toArray());
        var _b = new THREE.Vector3(...this.plot.parser.eval(this.exprs.v2).toArray());

        var _thetaA = Math.atan2(_a.y, _a.x);
        var _thetaB = Math.atan2(_b.y, _b.x);
        var _clockwise = _thetaA-_thetaB < Math.PI && _thetaA-_thetaB >= 0;

        var _hex = this.opts.hex;
        var _radius = this.opts.radius;
        var _tolerance = this.opts.tolerance;

        if(Math.abs(_a.dot(_b)) < _tolerance) {
            var v1 = _a.clone().normalize().multiplyScalar(_radius);
            var v3 = _b.clone().normalize().multiplyScalar(_radius);
            var v2 = v1.clone().add(v3);
            var points = [v1, v2, v3];
        } else {
            var curve = new THREE.EllipseCurve(
                0, 0,             // ax, aY
                _radius, _radius, // xRadius, yRadius
                _thetaA, _thetaB, // aStartAngle, aEndAngle
                _clockwise        // aClockwise
            );
            
            var points = curve.getSpacedPoints( 20 );
        }
        
        var path = new THREE.Path();
        var geometry = path.createGeometry( points );
        
        var material = new THREE.LineBasicMaterial( { color : _hex } );
        
        var line = new THREE.Line( geometry, material );
        
        return line;
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
    function Arrow2D(plot, plotInfo, opts) {
        Plottable.call(this, plot, opts);

        this.exprs = plotInfo.exprs;

        if(opts === undefined) opts = {};
        this.opts = {};
        this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;
        this.opts.headLength = opts.headLength !== undefined ? opts.headLength : 0.2;
        this.opts.headWidth = opts.headWidth !== undefined ? opts.headWidth : 0.05;
    }

    Arrow2D.prototype = Object.create(Plottable.prototype);
    Arrow2D.prototype.constructor = Arrow2D;

    Arrow2D.prototype.getVariables = function() {
        return Plottable.prototype.getVariables.call(this).concat(this.opts.origin.getVariables());
    };

    Arrow2D.prototype.createSceneObject = function() {
        var _end = this.plot.parser.eval(this.exprs.end);
        var _vector2 = new THREE.Vector3(..._end.toArray());
        var _start = this.plot.parser.eval(this.exprs.start);
        var _origin = new THREE.Vector3(..._start.toArray());
        var _dir = _vector2.clone().sub(_origin).normalize();
        var _length = _vector2.distanceTo(_origin);
        var _hex = this.opts.hex;
        var _headLength = this.opts.headLength;
        var _headWidth = this.opts.headWidth;

        return new THREE.ArrowHelper(_dir, _origin, _length, _hex, _headLength, _headWidth);
    };

    function Hotspot2D(plot, expr) {
        this.isHotspot2DInstance = true;
        
        this.plot = plot;
        this.expr = expr;
        this.position = this.plot.parser.eval(expr);
        this.size = 20;
    }

    Hotspot2D.prototype.ondrag = function(event) {
        this.position._data[0] = event.worldX;
        this.position._data[1] = event.worldY;

        // this.plot.context[this.expr.string].q[0] = event.worldX;
        // this.plot.context[this.expr.string].q[1] = event.worldY;
        this.plot.parser.set(this.expr, math.matrix([event.worldX, event.worldY]));

        this.plot.refresh();
    };

    function Label2D(ax, text, opts) {
        this.plot = ax.parent;
        this.ax = ax;
        this.text = text;

        if(opts === undefined) opts = {};
        this.opts = {};
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
    };

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
        };

        var coords = project(_origin);

        this.label.style.top = window.scrollY + coords.y + rect.top + 'px';
        this.label.style.left = window.scrollX + coords.x + rect.left + 'px';
    };

    function Parallelogram2D(plot,plotInfo, opts) {
        Plottable.call(this, plot, opts);

        if(opts === undefined) opts = {};

        this.opts = {};
        this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;
        this.opts.opacity = opts.opacity !== undefined ? opts.opacity : 1;

        this.exprs = plotInfo.exprs;
    }

    Parallelogram2D.prototype = Object.create(Plottable.prototype);
    Parallelogram2D.prototype.constructor = Parallelogram2D;

    Parallelogram2D.prototype.createSceneObject = function() {
        var _vector1 = new THREE.Vector3(...this.plot.parser.eval(this.exprs.v1).toArray());
        var _vector2 = new THREE.Vector3(...this.plot.parser.eval(this.exprs.v2).toArray());
        var _origin = new THREE.Vector3(...this.plot.parser.eval(this.exprs.offset).toArray());
        
        var geom = new THREE.Geometry();
        geom.vertices.push(_origin);
        geom.vertices.push(_origin.clone().add(_vector1));
        geom.vertices.push(_origin.clone().add(_vector2));
        geom.vertices.push(_origin.clone().add(_vector1).add(_vector2));
        
        var f1 = new THREE.Face3(3, 1, 0);
        var f2 = new THREE.Face3(0, 2, 3);

        geom.faces.push(f1);                
        geom.faces.push(f2);

        var mat = new THREE.MeshBasicMaterial({color: this.opts.hex, side: THREE.DoubleSide, opacity: this.opts.opacity, transparent: true});

        return new THREE.Mesh( geom, mat );
    };

    function Parametric2D(parent, plotInfo, opts) {
        Plottable.call(this, parent.parent, opts);

        this.parent = parent;
        this.opts = opts !== undefined ? opts : {};
        
        if (this.opts.thick === undefined) this.opts.thick = false;

        this.exprs = plotInfo.exprs; 

        if(!this.exprs.color && this.opts.color) {
            this.exprs.color = this.opts.color;
            this.opts.color = true;
        }

        this.exprs.pointFunc = '_tmp(' + this.exprs.tvar + ') = ' + this.exprs.point;
        if (this.exprs.color) {
            this.exprs.colorFunc = '_tmp(' + this.exprs.tvar + ') = ' + this.exprs.color;
        }
    }

    Parametric2D.prototype = Object.create(Plottable.prototype);
    Parametric2D.prototype.constructor = Parametric2D;

    Parametric2D.prototype.getVariables = function () {
        if (this.opts.color !== undefined) return this.expr.getVariables().concat(this.color.getVariables());
        else return this.expr.getVariables();
    };

    Parametric2D.prototype.createLine = function () {
        var geom = new THREE.BufferGeometry();
        
        var pointFunc = this.plot.parser.eval(this.exprs.pointFunc);
        var tint = {
            min: this.plot.parser.eval(this.exprs.tmin),
            max: this.plot.parser.eval(this.exprs.tmax),
            steps: this.plot.parser.eval(this.exprs.tsteps),
        };
        if(this.opts.color) {
            var colorFunc = this.plot.parser.eval(this.exprs.colorFunc);
        }
        
        var direction = new Float32Array(tint.steps * 2);
        var vertices = new Float32Array(tint.steps * 3 * 2);
        var previous = new Float32Array(tint.steps * 3 * 2);
        var next = new Float32Array(tint.steps * 3 * 2);
        
        var colors = new Uint8Array(tint.steps * 4 * 2);
        
        for (var i = 0; i < tint.steps; i++) {
            var t = i * (tint.max - tint.min) / (tint.steps - 1) + tint.min;
            
            direction[i * 2] = 1;
            direction[i * 2 + 1] = -1;
            
            var v = new THREE.Vector3(...pointFunc(t).toArray());
            vertices[i * 6] = v.x;
            vertices[i * 6 + 1] = v.y;
            vertices[i * 6 + 2] = v.z;
            
            vertices[i * 6 + 3] = v.x;
            vertices[i * 6 + 4] = v.y;
            vertices[i * 6 + 5] = v.z;
            
            if (i > 0) {
                previous[i * 6] = vertices[i * 6 - 6];
                previous[i * 6 + 1] = vertices[i * 6 - 5];
                previous[i * 6 + 2] = vertices[i * 6 - 4];
                previous[i * 6 + 3] = vertices[i * 6 - 3];
                previous[i * 6 + 4] = vertices[i * 6 - 2];
                previous[i * 6 + 5] = vertices[i * 6 - 1];
                
                next[i * 6 - 6] = vertices[i * 6];
                next[i * 6 - 5] = vertices[i * 6 + 1];
                next[i * 6 - 4] = vertices[i * 6 + 2];
                next[i * 6 - 3] = vertices[i * 6 + 3];
                next[i * 6 - 2] = vertices[i * 6 + 4];
                next[i * 6 - 1] = vertices[i * 6 + 5];
            }
            
            if (this.opts.color) {
                var color = colorFunc(t).toArray();
                colors[i * 8] = color[0] * 255;
                colors[i * 8 + 1] = color[1] * 255;
                colors[i * 8 + 2] = color[2] * 255;
                colors[i * 8 + 3] = 255;
                colors[i * 8 + 4] = color[0] * 255;
                colors[i * 8 + 5] = color[1] * 255;
                colors[i * 8 + 6] = color[2] * 255;
                colors[i * 8 + 7] = 255;
            } else {
                colors[i * 8] = 255;
                colors[i * 8 + 1] = 255;
                colors[i * 8 + 2] = 255;
                colors[i * 8 + 3] = 255;
                colors[i * 8 + 4] = 255;
                colors[i * 8 + 5] = 255;
                colors[i * 8 + 6] = 255;
                colors[i * 8 + 7] = 255;
            }
        }
        
        previous[0] = vertices[0];
        previous[1] = vertices[1];
        previous[2] = vertices[2];
        previous[3] = vertices[3];
        previous[4] = vertices[4];
        previous[5] = vertices[5];
        next[tint.steps * 6 - 6] = vertices[tint.steps * 6 - 6];
        next[tint.steps * 6 - 5] = vertices[tint.steps * 6 - 5];
        next[tint.steps * 6 - 4] = vertices[tint.steps * 6 - 4];
        next[tint.steps * 6 - 3] = vertices[tint.steps * 6 - 3];
        next[tint.steps * 6 - 2] = vertices[tint.steps * 6 - 2];
        next[tint.steps * 6 - 1] = vertices[tint.steps * 6 - 1];
        
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

    Parametric2D.prototype.createSceneObject = function () {
        return this.createLine();
    };

    function Point2D(plot, expr, opts) {
        Plottable.call(this, plot, opts);

        this.expr = expr;

        if(opts === undefined) opts = {};
        this.opts = {};
        this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;
        this.opts.radius = opts.radius !== undefined ? opts.radius : 0.05;
    }

    Point2D.prototype = Object.create(Plottable.prototype);
    Point2D.prototype.constructor = Point2D;

    Point2D.prototype.createSceneObject = function() {
        var _vector2 = new THREE.Vector3(...this.plot.parser.eval(this.expr).toArray());
        var _hex = this.opts.hex;
        var _radius = this.opts.radius;

        var geometry = new THREE.CircleBufferGeometry( _radius, 32 );
        var material = new THREE.MeshBasicMaterial( { color: _hex } );
        var circle = new THREE.Mesh( geometry, material );
        circle.position.copy(_vector2);
        return circle;
    };

    function Polygon2D(plot, plotInfo, opts) {
        Plottable.call(this, plot, opts);

        if(opts === undefined) opts = {};

        this.opts = {};
        this.opts.hex = opts.hex !== undefined ? opts.hex : 0xffffff;
        this.opts.opacity = opts.opacity !== undefined ? opts.opacity : 1;

        this.exprs = plotInfo.exprs;
    }

    Polygon2D.prototype = Object.create(Plottable.prototype);
    Polygon2D.prototype.constructor = Polygon2D;

    Polygon2D.prototype.createSceneObject = function() {
        var _self = this;
        var _vectors = this.exprs.vertices.map((expr) => {
            return _self.plot.parser.eval(expr);
        });
        
        var geom = new THREE.Geometry();
        for(var i = 0; i < _vectors.dimensions; i++) {
            geom.vertices.push(new THREE.Vector3(..._vectors.toArray()));
            if(i > 1) {
                var f = new THREE.Face3(0,i,i-1);
                geom.faces.push(f);
            }
        }

        var mat = new THREE.MeshBasicMaterial({color: this.opts.hex, side: THREE.DoubleSide, opacity: this.opts.opacity, transparent: true});

        return new THREE.Mesh( geom, mat );
    };

    function Isoline2D(parent, expr, opts) {
        Isoline3D.call(this, parent, expr, opts);
        
        this.lineWidth = this.opts.thick === true ? 10 : 5;
    }

    Isoline2D.prototype = Object.create(Isoline3D.prototype);
    Isoline2D.prototype.constructor = Isoline2D;

    Isoline2D.prototype.lerp = function(a, b, az, z, bz) {
        var alpha = (z - az) / (bz - az);
        
        a = new THREE.Vector3(...a);
        b = new THREE.Vector3(...b);
        var result = a.multiplyScalar(1 - alpha).add(b.multiplyScalar(alpha));
        
        var temp = result.y;
        result.y = result.z;
        result.z = temp;
        
        return result;
    };

    function Axes2D(parent, container, opts) {
        Axes.call(this, parent, container, opts);

        /**
         * Used internally for optimization (Read-only)
         */
        this.isAxes2DInstance = true;

        if(opts === undefined) opts = {};

        /**
         * The zoom level of the camera. Denotes how many pixels should be one unit
         */
        this.zoom = opts.zoom !== undefined? opts.zoom : 200;

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

        // For closures
        var _self = this;

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
            var vector2 = new THREE.Vector2(...vector.toArray());
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
                        worldX: _hotspotpos._data[0] + 2 * (event.screenX - event.screenStartX) / _self.zoom,
                        worldY: _hotspotpos._data[1] + -2 * (event.screenY - event.screenStartY) / _self.zoom
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

    Axes2D.prototype = Object.create(Axes.prototype);
    Axes2D.prototype.constructor = Axes2D;

    Axes2D.prototype.plotExpression = function(exprs, type, opts) {
        var expr = null;
        if(typeof exprs == 'string') {
            expr = exprs;
        }

        switch(type) {
            case 'angle':
                if(expr) exprs = PlotInfo.AngleArc2D.fromString(expr);
                var arc = new AngleArc2D(this.parent, exprs, opts);
                this.addFigure(arc);
                return arc;
            case 'arrow':            
                if(expr) exprs = PlotInfo.Arrow2D.fromString(expr);
                var figure = new Arrow2D(this.parent, exprs, opts);
                this.addFigure(figure);
                return figure;
            case 'hotspot':
                var hotspot = new Hotspot2D(this.parent, expr);
                this.addHotspot(hotspot);
                return hotspot;
            case 'parametric':           
                if(expr) exprs = PlotInfo.Parametric2D.fromString(expr);
                var par = new Parametric2D(this, exprs, opts);
                this.addFigure(par);
                return par;
            case 'isoline':           
                if(expr) exprs = PlotInfo.Isoline2D.fromString(expr);
                var iso = new Isoline2D(this, exprs, opts);
                this.addFigure(iso);
                return iso;
            case 'polygon':
                if(expr) exprs = PlotInfo.Polygon2D.fromString(expr);
                var pgon = new Polygon2D(this.parent, exprs, opts);
                this.addFigure(pgon);
            case 'parallelogram':
            case 'pgram':
                if(expr) exprs = PlotInfo.Parallelogram2D.fromString(expr);
                var par = new Parallelogram2D(this.parent, exprs, opts);
                this.addFigure(par);
                return par;
            case 'point':
                var point = new Point2D(this.parent, expr, opts);
                this.addFigure(point);
                return point;
            case 'label':
                var label = new Label2D(this, expr, opts);
                label.show();
                this.nonJSObjects.push(label);
                return label;
            default:
                console.log('Interactive.Axes2D: Invalid plot type');
                return null;
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
     
    /**
     * Special function to add a hotspot
     * @param {Hotspot2D} hotspot Hotspot to add
     */
    Axes2D.prototype.addHotspot = function(hotspot) {
        if (hotspot.isHotspot2DInstance !== true) {
            console.log('Interactive.Axes2D: Parameter is not a Hotspot2D.');
            return null;
        }

        this.hotspots.push(hotspot);
    };

    function Panel (parent, container) {
        this.parent = parent;
        
        this.container = container;
        
        this.readOuts = [];
    }

    Panel.prototype.addConsole = function(opts) {
        var textBox = document.createElement('textarea');
        var refresh = document.createElement('input');
        refresh.setAttribute('type', 'button');
        refresh.setAttribute('value', 'refresh');
        this.container.appendChild(textBox);
        this.container.appendChild(refresh);
        
        refresh.onclick = () => {
            var lines = textBox.value.split('\n');
            lines.forEach((line) => {
                this.parent.execExpression(line);
            });
        };
    }; 

    Panel.prototype.addSlider = function(expr, opts) {
        if(opts === undefined) opts = {};
        
        var parts = expr.split(/(?:{|}|,)+/g);
        var interval = {
            varstr: parts[1],
            start: parts[2],
            end: parts[3],
            steps: parts[4]
        };
        
        var slider = document.createElement('input');
        slider.setAttribute('type', 'range');
        slider.min = this.parent.parser.eval(interval.start);
        slider.max = this.parent.parser.eval(interval.end);
        slider.step = (slider.max - slider.min) / this.parent.parser.eval(interval.steps);
        
        if(this.parent.parser.get(interval.varstr) !== undefined) {
            slider.value = this.parent.parser.get(interval.varstr);
        }
        
        var valueLabel = document.createTextNode(slider.value);
        
        var _self = this;
        var update = function() {      
            _self.parent.parser.set(interval.varstr, parseFloat(slider.value));
            if(opts.updateAxes) {
                opts.updateAxes.forEach((axes) => {
                    axes.refresh();
                });
            } else {
                _self.parent.refresh();
            }
            
            valueLabel.nodeValue = slider.value;
        };
        if(opts.continuous) {
            slider.oninput = update;
        } else {
            slider.onchange = update;
        }
        
        var label = document.createTextNode(interval.varstr + ':');
        
        var div = document.createElement('div');
        
        this.container.appendChild(div);
        div.appendChild(label);
        div.appendChild(slider);
        // div.appendChild(valueLabel);
    };

    Panel.prototype.addReadout = function(expr, opts) {
        // TODO-ERR: Check if expr exists 
        
        if(opts === undefined) opts = {};
        
        var textBox = document.createElement('input');
        textBox.setAttribute('type', 'text');
        textBox.setAttribute('disabled', 'true');
        
        // var _self = this;
        // textBox.onchange = function() {            
        //     _self.parent.context[expr] = new Expression(textBox.value, _self.parent.context);
        //     _self.parent.refresh(interval.varstr);
        // }
        
        var label = document.createTextNode(expr + '=');
        
        var div = document.createElement('div');
        
        this.container.appendChild(div);
        div.appendChild(label);
        div.appendChild(textBox);
        
        this.readOuts.push({exprLabel: expr, expr: expr, div: div, textBox: textBox});
    };

    Panel.prototype.addCheckBox = function(expr, opts) {
        if(opts == undefined) opts = {};
        var variable = expr;
        
        var chkBox = document.createElement('input');
        chkBox.setAttribute('type', 'checkbox');
        
        chkBox.checked = this.parent.parser.get(variable) != 0;
        
        var _self = this;
        chkBox.onchange = function() {
            _self.parent.parser.set(variable, chkBox.checked ? 1 : 0);
            _self.parent.refresh();
        };
        
        var label = document.createTextNode(opts.label);
        var div = document.createElement('div');
        
        this.container.appendChild(div);
        div.appendChild(label);
        div.appendChild(chkBox);
    };

    Panel.prototype.update = function() {
        for(var i = 0; i < this.readOuts.length; i++) {
            var readOut = this.readOuts[i];
            readOut.textBox.value = math.round(this.parent.parser.eval(readOut.expr), 6).toString();
        }
    };

    function Plot() {
        /**
        * The type of this object. (Read-only)
        */
        this.type = 'Plot';
        this.axes = {};
        this.panels = [];
        
        this.parser = math.parser();
        this.parser.set('diffh', function(f, x, h) {
            return math.divide(math.subtract(f(x + h/2), f(x - h/2)), h);
        });
        this.parser.eval('diff(f, x) = diffh(f, x, 0.0000001)');
        this.parser.set('diff2h', function(f, x, h) {
            return math.divide(math.add(f(x + h), f(x - h), math.multiply(f(x), -2)), math.multiply(h, h));
        });
        this.parser.eval('diff2(f, x) = diff2h(f, x, 0.0000001)');
        this.parser.eval('interpolate(a, b, alpha) = a * (1 - alpha) + b * alpha');
        this.parser.set('normalh', function(X, u, v, h) {
            var du = math.divide(math.subtract(X(u + h/2, v), X(u - h/2, v)), h);
            var dv = math.divide(math.subtract(X(u, v + h/2), X(u, v - h/2)), h);
            return math.cross(du, dv);
        });
        this.parser.eval('normal(X, u, v) = normalh(X, u, v, 0.0000001)');
        this.parser.eval('normalize(b) = b / norm(b)');
        this.parser.set('quadrant', function(v) {
            var arr = v.toArray();
            if(arr[0] < 0 && arr[1] < 0) return 3;
            if(arr[0] < 0 && arr[1] == 0) return 2.5;
            if(arr[0] < 0 && arr[1] > 0) return 2;
            if(arr[0] == 0 && arr[1] < 0) return 3.5;
            if(arr[0] == 0 && arr[1] == 0) return 0;
            if(arr[0] == 0 && arr[1] > 0) return 1.5;
            if(arr[0] > 0 && arr[1] < 0) return 4;
            if(arr[0] > 0 && arr[1] == 0) return 0.5;
            if(arr[0] > 0 && arr[1] > 0) return 1;
        });
        this.parser.set('select', function(i) {
            if(!Number.isInteger(i) || !(1 <= i && i <= arguments.length)) {
                throw new Error('Invalid argument "' + i + '"!')
            }
            return arguments[i];
        });
        this.parser.set('spectrum', function(h) {
            h = h % 1;
            if(h < 0) h = h + 1;

            var r, g, b, i, f, q;
            i = Math.floor(h * 6);
            f = h * 6 - i;
            q = 1 - f;
            switch (i % 6) {
                case 0: r = 1, g = f, b = 0; break;
                case 1: r = q, g = 1, b = 0; break;
                case 2: r = 0, g = 1, b = f; break;
                case 3: r = 0, g = q, b = 1; break;
                case 4: r = f, g = 0, b = 1; break;
                case 5: r = 1, g = 0, b = q; break;
            }
            return math.matrix([r, g, b]);
        });    
    }

    Plot.prototype.execExpression = function(expr) {
        var result;
        try {
            result = this.parser.eval(expr);
        } catch (err) {
            result = err;
        } 
        return result;
    };

    Plot.prototype.refresh = function() {
        for(var key in this.axes) {
            this.axes[key].refresh();
        }
    };

    Plot.prototype.linkCameras = function(from) {
        for(var i = 1; i < arguments.length; i++) {
            arguments[i].camera = from.camera;
        }
    };

    /**
    * Create a 3D axis in the context of this plot
    */
    Plot.prototype.createAxes3D = function(container, opts) {
        var ax = new Axes3D(this, container, opts);
        this.axes[ax.uid] = ax;
        return ax;
    };

    /**
    * Create a 2D axis in the context of this plot
    */
    Plot.prototype.createAxes2D = function(container, opts) {
        var ax = new Axes2D(this, container, opts);
        this.axes[ax.uid] = ax;
        return ax;
    };

    Plot.prototype.dropAxes = function(axes) {
        axes.sleep();
        delete this.axes[axes.uid];
    };

    Plot.prototype.createPanel = function(container, opts) {
        var panel = new Panel(this, container, opts);
        this.panels.push(panel);
        return panel;
    };

    Plot.prototype.resetContext = function() {
        this.parser = math.parser();
    };

    Plot.prototype.sleep = function() {
        for(var key in this.axes) {
            this.axes[key].sleep();
        }
    };

    Plot.prototype.render = function() {
        function checkVisible(el) {
            var elemTop = el.getBoundingClientRect().top;
            var elemBottom = el.getBoundingClientRect().bottom;
            
            var isVisible = (elemBottom >= 0) && (elemTop <= window.innerHeight);
            return isVisible;
        }
        
        for(var key in this.axes) {
            var ax = this.axes[key];
            if(checkVisible(ax.frame.container)) {
                if(ax.frame.isSleeping) ax.wake();
                ax.render();
            } else if(!ax.frame.isSleeping) ax.sleep();
        }
        
        this.panels.forEach(function(pan) {
            pan.update();
        });
    };

    var uid = {};
    uid.counter = 0;
    uid.getUid = function() {
        return uid.counter++;
    };

    /**
     * The base for rendering plots
     * @param {Plot} parent 
     * @param {Element} container 
     * @param {*} opts 
     */

    function Axes(parent, container, opts) {
        /**
         * Used internally for optimization (Read-only)
         */
        this.isAxesInstance = true;

        /**
         * Used to identify this particular axes;
         */
        this.uid = uid.getUid();

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

        this.fixedZoom = opts.fixedZoom !== undefined? opts.fixedZoom : false;

        /**
         * Objects to plot
         */
        this.objects = [];

        // Keeps a roll of sceneobjects to faciliate removal
        this.sceneObjects = [];

        // Objects not rendered by THREE that still need to refreshed
        this.nonJSObjects = [];

        if(opts.showControls === true) this.showControls();
    }

    Axes.prototype.sleep = function() {
        this.frame.sleep();
    };

    Axes.prototype.wake = function() {
        this.frame.wake();
    };

    /**
     * Render all plots contained in this axes
     */
    Axes.prototype.render = function() {
        if(this.frame.isSleeping) return;

        for(var i = 0; i < this.objects.length; i++ ) {
            var object = this.objects[i];
            if(object.validated === false) {
                var sceneObject = object.getSceneObject();
                if(this.sceneObjects[i] !== undefined) {
                    this.frame.scene.remove(this.sceneObjects[i]);
                }
                if(sceneObject != null) {
                    this.frame.scene.add(sceneObject);
                }
                this.sceneObjects[i] = sceneObject;
            }
        }

        this.frame.render(this.camera);

        for(var i = 0; i < this.nonJSObjects.length; i++) {
            this.nonJSObjects[i].refresh();
        }
    };

    /**
     * Plot an expression
     * @param {Expression} expr Expression to plot
     * @param {String} type Type of plot
     * @param {*} opts Options
     */
    Axes.prototype.plotExpression = function(exprs, type, opts) {
        console.log('Interactive.' + this._proto_.constructor.name + ': Method not implemented');
        return null;
    };

    /**
     * Add an object to plot
     * @param {Plottable} object Object to plot
     */
    Axes.prototype.addFigure = function(object) {
        if(object.isPlottableInstance !== true) {
            console.log('Interactive.' + this._proto_.constructor.name + ': Object is not a Plottable');
            return;
        }

        this.objects.push(object);
    };

    /**
     * Remove a plotted object
     * @param {Plottable} object Object to remove
     */
    Axes.prototype.removeFigure = function(object) {
        var index = this.objects.indexOf(object);
        if (index === -1) {
            console.log('Interactive.' + this._proto_.constructor.name + ': Figure not in axes');
            return null;
        }
        this.objects.splice(index, 1);
        this.frame.scene.remove(this.sceneObjects[index]);
        this.sceneObjects.splice(index, 1);
    };

    /**
     * Force the object to update
     * @param {Plottable} object Object to redraw
     */
    Axes.prototype.redrawFigure = function(object) {
        var index = this.objects.indexOf(object);
        if (index === -1) {
            console.log('Interactive.' + this._proto_.constructor.name + ': Figure not in axes');
            return null;
        }
        object.invalidate();
    };

    // /**
    //  * Redraw an existing expression
    //  * @param {Expression} expr Expression to redraw
    //  */
    // Axes.prototype.redrawExpression = function(expr) {
    //     this.redrawFigure(this.expressions[expr]);
    // }

    /**
     * Redraw all objects
     */
    Axes.prototype.refresh = function() {
        for(var i = 0; i < this.objects.length; i++) {
            if(this.objects[i].invalidate !== undefined) {
                this.objects[i].invalidate();
            }
        }
    };

    /** 
     * Shows controls for the axes (requires jQuery)
     */
    Axes.prototype.showControls = function() {
        if(jQuery === undefined) {
            console.error('Error: jQuery required to draw controls!');
            return;
        }

        var $frame = $(this.frame.container);
        
        var plotMenuHeader = $('<span>Plot</span>');
        plotMenuHeader.css('width', '100px');
        plotMenuHeader.css('position', 'relative');
        plotMenuHeader.css('display', 'inline-block');
        
        var plotMenu = $('<div></div>');
        plotMenu.css('display', 'none');
        plotMenu.css('position', 'absolute');
        plotMenu.css('width', '100px');
        plotMenu.css('height', '100px');
        plotMenu.css('z-index', '1');
        plotMenuHeader.append(plotMenu);

        plotMenuHeader.on('mouseenter', () => {
            plotMenu.css('display', 'block');
        });
        plotMenuHeader.on('mouseleave', () => {
            plotMenu.css('display', 'none');
        });

        var plotMenuAddPlot = $('<div>Add Plot</div>');
        plotMenu.append(plotMenuAddPlot);


        var menuBar = $('<div></div>');
        menuBar.css('width', '100%');
        menuBar.css('height', '20px');
        menuBar.append(plotMenuHeader);

        $frame.append(menuBar);
    };

    function DynPlot(info) {
        this.plot = new Interactive.Plot();
        
        this.aid = 0;
        this.axesInfo = {};
        
        this.eid = 0;
        this.expressionsInfo = {};
        
        this.pid = 0;
        this.plotInfo = {};
        
        /**
         * Auxilliary html functions
         */
        this.resetContainer = null;
        this.createAxesContainer = null;
        this.removeAxesContainer = null;
        this.onCreateExpression = null;
        this.onRemoveExpression = null;
        
        if(info) reload(info);
    }

    DynPlot.prototype.compile = function() {
        var self_ = this;
        
        var plotInitCode = [
            'plot = new Interactive.Plot();',
        ];
        
        var compileAxesInitCode = function(ai) {
            var initCode = 'ax' + ai.id + ' = ';
            if(ai.type == '2D') initCode += 'plot.createAxes2D('; 
            if(ai.type == '3D') initCode += 'plot.createAxes3D('; 
            initCode += 'document.getElementById("ax' +  ai.id + '")';
            // other properties will go here
            initCode += ');';
            return initCode;
        };
        
        var compileAxesDrawCode = function(ai, pi) {
            var plotCode = 'ax' + ai.id + '.plotExpression("';
            if(pi.values.expr) {
                plotCode += pi.values.expr;
            }
            if(pi.values.interval) {
                plotCode += '{';
                plotCode += pi.values.interval.variable;
                plotCode += ',';
                plotCode += pi.values.interval.start;
                plotCode += ',';
                plotCode += pi.values.interval.end;
                plotCode += ',';
                plotCode += pi.values.interval.steps;
                plotCode += '}';
            }
            plotCode += '"';
            plotCode += ',';
            switch(pi.type) {
                case 'Parametric Curve': 
                case 'Parametric Surface':
                plotCode += '"parametric"';
                break;
            }
            plotCode += ',{';
            if(pi.values.useColor) {
                plotCode += 'color:"';
                plotCode += pi.values.color;
                plotCode += '",'; 
            }
            // other properties will go here
            plotCode += '});';
            return plotCode;
        };
        
        var axInitCode = [
            
        ];
        var axDrawCode = [
            
        ];
        
        for(var key in this.axesInfo) {
            var ai = this.axesInfo[key];
            var initCode = compileAxesInitCode(ai);
            axInitCode.push(initCode);
            
            ai.plotIds.forEach((pid) => {
                var pi = self_.plotInfo[pid];
                if(pi.valid) {
                    var plotCode = compileAxesDrawCode(ai, pi);
                    axDrawCode.push(plotCode);
                }
            });
        }
        
        var compileExpressionCode = function(ex) {
            var code = 'ex' + ex.id + ' = ';
            code += 'plot.execExpression("';
            code += ex.expr;
            code += '");';
            return code;
        };
        
        var expressionCode = [
            
        ];
        
        var exprInfoSortedKeys = Object.keys(this.expressionsInfo);
        exprInfoSortedKeys.sort((a, b) => self_.expressionsInfo[a].priority < self_.expressionsInfo[b].priority);
        exprInfoSortedKeys.forEach((key) => {
            var ex = self_.expressionsInfo[key];
            var exCode = compileExpressionCode(ex);
            expressionCode.push(exCode);
        });
        
        var code = '';
        code += plotInitCode.join('\n');
        code = code.trim();
        code += '\n\n';
        code += axInitCode.join('\n');
        code = code.trim();
        code += '\n\n';
        code += expressionCode.join('\n');
        code = code.trim();
        code += '\n\n';
        code += axDrawCode.join('\n');
        code = code.trim();
        code += '\n';
        return code;
    };

    DynPlot.prototype.reload = function(info) {
        var self_ = this;
        
        var reset = function() {
            var removeAllExpressions = function() {
                for(var key in self_.expressionsInfo) {
                    var ei = self_.expressionsInfo[key];
                    self_.removeExpression(ei);
                }
            };
            var removeAllAxes = function() {
                for(var key in self_.axesInfo) {
                    var ai = self_.axesInfo[key];
                    self_.removeAxes(ai);
                }
            };
            var removeAllPlots = function() {
                for(var key in self_.plotInfo) {
                    var pi = self_.plotInfo[key];
                    self_.removePlot(pi);
                }
            };
            
            if(self_.plot) self_.plot.sleep();
            
            removeAllPlots();
            removeAllAxes();
            removeAllExpressions();
            
            if(self_.resetContainer) self_.resetContainer();
        };
        
        var loadInfo = function(info) {
            self_.aid = info.aid;
            self_.axesInfo = info.axesInfo;
            self_.eid = info.eid;
            self_.expressionsInfo = info.expressionsInfo;
            self_.pid = info.pid;
            self_.plotInfo = info.plotInfo;
        };
        
        var prepareExpressionContainers = function() {
            for(var key in self_.expressionsInfo) {
                var ei = self_.expressionsInfo[key];
                self_.addExpression(ei);
            }
        };
        
        var prepareAxesContainers = function() {
            for(var key in self_.axesInfo) {
                var ai = self_.axesInfo[key];
                self_.addAxes(ai);
            }
        };
        
        var loadPlot = function() {
            self_.plot = new Interactive.Plot();
            
            self_.updateExpressions();
            
            for(var key in self_.axesInfo) {
                var ai = self_.axesInfo[key];
                self_.updateAxes(ai);
            }
            
            for(var key in self_.plotInfo) {
                var pi = self_.plotInfo[key];
                self_.updatePlot(pi); 
            }
        };
        
        reset();
        loadInfo(info);
        prepareExpressionContainers();
        prepareAxesContainers();
        loadPlot();
        this.plot.render();
    };

    DynPlot.prototype.addAxes = function(ai) {
        if(ai === undefined) ai = {};
        if(ai.id === undefined) ai.id = this.aid++;
        if(ai.title === undefined) ai.title = 'Axes ' + ai.id;
        if(ai.type === undefined) ai.type = '2D';
        if(ai.plotIds === undefined) ai.plotIds = [];
        
        if(this.createAxesContainer) {
            ai.container = this.createAxesContainer(ai); 
        }
        
        this.updateAxes(ai);
        
        this.axesInfo[ai.id] = ai;
        return ai;
    };

    DynPlot.prototype.updateAxes = function(ai) {
        if(ai.obj) {
            this.plot.dropAxes(ai.obj);
            ai.obj = null;
        }
        
        if(ai.type == "2D") {
            ai.obj = this.plot.createAxes2D(ai.container);
        } 
        if(ai.type == "3D") {
            ai.obj = this.plot.createAxes3D(ai.container);
        }
        
        this.axesInfo[ai.id] = ai;
    };

    DynPlot.prototype.removeAxes = function(ai) {
        var self_ = this;
        ai.plotIds.slice().forEach((pid) => {
            var pi = self_.plotInfo[pid];
            self_.removePlot(pi);
        });
        
        if(ai.container && this.removeAxesContainer) {
            this.removeAxesContainer(ai);
        } 

        if(ai.obj) this.plot.dropAxes(ai.obj);

        delete this.axesInfo[ai.id];
    };

    DynPlot.prototype.addPlot = function(pi) {
        // Add entry to the global this.plot info set
        if(pi === undefined) pi = {};
        if(pi.id === undefined) pi.id = this.pid++;
        if(pi.type === undefined) return null;
        if(pi.axesId === undefined) return null;
        if(pi.valid === undefined) pi.valid = false;
        if(pi.values === undefined) pi.values = {};
        if(pi.opts === undefined) pi.opts = {};
        
        // Add a reference from the axes it is
        // embedded in
        this.axesInfo[pi.axesId].plotIds.push(pi.id);
        
        // Add the this.plot to the axes
        this.updatePlot(pi);
        
        this.plotInfo[pi.id] = pi;
        return pi;
    };

    DynPlot.prototype.updatePlot = function(pi) {
        var ai = this.axesInfo[pi.axesId];
        
        if(pi.obj) {
            ai.obj.removeFigure(pi.obj);    
            pi.obj = null;
        }

        if(pi.valid) {
            switch(pi.type) {
                case 'Parametric Curve':
                case 'Parametric Surface':
                pi.obj = ai.obj.plotExpression(pi.values, 'parametric', pi.opts);
                break;
            }
        }
        
        this.plotInfo[pi.id] = pi;
    };

    DynPlot.prototype.removePlot = function(pi) {
        // Remove reference to this this.plot from the axes
        // it is embedded in
        var ai = this.axesInfo[pi.axesId];
        var index = ai.plotIds.indexOf(pi.id);
        ai.plotIds.splice(index, 1);
        this.axesInfo[pi.axesId] = ai;
        
        // Remove this this.plot from the axes object
        if(pi.obj) ai.obj.removeFigure(pi.obj);
        
        // Remove reference to this this.plot from the global
        // this.plot info set
        delete this.plotInfo[pi.id];
    };

    DynPlot.prototype.addExpression = function(ei) {
        
        if(ei === undefined) ei = {};
        if(ei.id === undefined) ei.id = this.eid++;
        if(ei.expr === undefined) ei.expr = '';
        if(ei.valid === undefined) ei.valid = false;
        if(ei.priority === undefined) ei.priority = ei.id;
        
        if(this.onCreateExpression) this.onCreateExpression(ei);

        this.updateExpressions();
        
        this.expressionsInfo[ei.id] = ei;
        return ei;
    };

    DynPlot.prototype.updateExpressions = function() {
        this.plot.resetContext();
        
        for(var key in this.expressionsInfo) {
            var ei = this.expressionsInfo[key];
            if(ei.valid) {
                this.plot.execExpression(ei.expr);
            }
        }
        
        this.plot.refresh();
        
        // Redraw all plots
        for(var key in this.plotInfo) {
            var pi = this.plotInfo[key];
            if(pi.obj) this.updatePlot(pi);
        }
    };

    DynPlot.prototype.removeExpression = function(ei) {
        if(this.onRemoveExpression) this.onRemoveExpression(ei);
        delete this.expressionsInfo[ei.id];
    };

    DynPlot.prototype.save = function() {
        var info = {};
        info.aid = this.aid;
        info.axesInfo = this.axesInfo;
        info.eid = this.eid;
        info.expressionsInfo = this.expressionsInfo;
        info.pid = this.pid;
        info.plotInfo = this.plotInfo;
        
        var replacer = function(key, value) {
            if(key == 'container') return undefined;
            if(key == 'obj') return undefined;
            return value;
        };
        
        var str = JSON.stringify(info, replacer);
        return str;
    };

    DynPlot.prototype.render = function() {
        this.plot.render();
    };

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
        Plottable.call(this, plot, null, opts);

        var _opts = opts !== undefined ? opts : {};

        this.xBasis = '[1,0]';
        this.yBasis = '[0,1]';

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
        this.xArrow = new Arrow2D(plot, new PlotInfo.Arrow2D({end: this.xBasis}), _xOpts);   
        this.yArrow = new Arrow2D(plot, new PlotInfo.Arrow2D({end: this.yBasis}), _yOpts);
    }

    BasisVectors2D.prototype = Object.create(Plottable.prototype);
    BasisVectors2D.prototype.constructor = BasisVectors2D;

    BasisVectors2D.prototype.createSceneObject = function() {
        var sceneObject = new THREE.Group();
        sceneObject.add(this.xArrow.getSceneObject());
        sceneObject.add(this.yArrow.getSceneObject());
        return sceneObject;
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
        Plottable.call(this, plot, null, opts);

        var _opts = opts !== undefined ? opts : {};

        this.xBasis = '[1,0,0]';
        this.yBasis = '[0,1,0]';
        this.zBasis = '[0,0,1]';

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

        this.xArrow = new Arrow3D(plot, new PlotInfo.Arrow3D({end: this.xBasis}), _xOpts);   
        this.yArrow = new Arrow3D(plot, new PlotInfo.Arrow3D({end: this.yBasis}), _yOpts);
        this.zArrow = new Arrow3D(plot, new PlotInfo.Arrow3D({end: this.zBasis}), _zOpts);
    }

    BasisVectors3D.prototype = Object.create(Plottable.prototype);
    BasisVectors3D.prototype.constructor = BasisVectors3D;

    BasisVectors3D.prototype.createSceneObject = function() {
        var sceneObject = new THREE.Group();
        sceneObject.add(this.xArrow.getSceneObject());
        sceneObject.add(this.yArrow.getSceneObject());
        sceneObject.add(this.zArrow.getSceneObject());
        return sceneObject;
    };

    exports.Hotspot2D = Hotspot2D;
    exports.Arrow3D = Arrow3D;
    exports.Axes3D = Axes3D;
    exports.Axes = Axes;
    exports.Axes2D = Axes2D;
    exports.Parametric2D = Parametric2D;
    exports.Arrow2D = Arrow2D;
    exports.Panel = Panel;
    exports.Isoline2D = Isoline2D;
    exports.TouchEventListener = TouchEventListener;
    exports.Parametric3D = Parametric3D;
    exports.Plottable = Plottable;
    exports.Parallelogram2D = Parallelogram2D;
    exports.Isoline3D = Isoline3D;
    exports.Label2D = Label2D;
    exports.BasisVectors3D = BasisVectors3D;
    exports.Plot = Plot;
    exports.DynPlot = DynPlot;
    exports.Frame = Frame;
    exports.BasisVectors2D = BasisVectors2D;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
