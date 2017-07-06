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
            previous[i*6] = vertbuff[i*6-6]
            previous[i*6+1] = vertbuff[i*6-5]
            previous[i*6+2] = vertbuff[i*6-4]
            previous[i*6+3] = vertbuff[i*6-3]
            previous[i*6+4] = vertbuff[i*6-2]
            previous[i*6+5] = vertbuff[i*6-1]

            next[i*6-6] = vertbuff[i*6]
            next[i*6-5] = vertbuff[i*6+1]
            next[i*6-4] = vertbuff[i*6+2]
            next[i*6-3] = vertbuff[i*6+3]
            next[i*6-2] = vertbuff[i*6+4]
            next[i*6-1] = vertbuff[i*6+5]
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

    previous[0] = vertbuff[0]
    previous[1] = vertbuff[1]
    previous[2] = vertbuff[2]
    previous[3] = vertbuff[3]
    previous[4] = vertbuff[4]
    previous[5] = vertbuff[5]
    next[vertices.length*6-6] = vertbuff[vertices.length*6-6]
    next[vertices.length*6-5] = vertbuff[vertices.length*6-5]
    next[vertices.length*6-4] = vertbuff[vertices.length*6-4]
    next[vertices.length*6-3] = vertbuff[vertices.length*6-3]
    next[vertices.length*6-2] = vertbuff[vertices.length*6-2]
    next[vertices.length*6-1] = vertbuff[vertices.length*6-1]

    geom.addAttribute('direction', new THREE.BufferAttribute(direction, 1));
    geom.addAttribute('position', new THREE.BufferAttribute(vertbuff, 3));
    geom.addAttribute('previous', new THREE.BufferAttribute(previous, 3));
    geom.addAttribute('next', new THREE.BufferAttribute(next, 3));
    geom.addAttribute('color', new THREE.BufferAttribute(colorbuff, 4, true));

    var mesh = new THREE.Mesh(geom, mat);
    mesh.drawMode = THREE.TriangleStripDrawMode
    return mesh
}

export { Line };