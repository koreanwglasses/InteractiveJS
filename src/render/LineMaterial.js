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
    }
}

export { LineMaterialCreator };