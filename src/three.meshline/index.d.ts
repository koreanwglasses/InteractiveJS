declare module 'three.meshline' {
    export class MeshLine {
        constructor();
        /**
         * Set the geometry to the specified geometry. This also accepts a
         * second parameter, which is a function to define the width in each
         * point along the line. By default that value is 1, making the line
         * width 1 * lineWidth.
         * @param g geometry
         * @param c width callback
         */
        setGeometry(g: THREE.Geometry | THREE.BufferGeometry | Float32Array | Array<number>, c : Function): void;
    }

    export class MeshLineMaterial {
        constructor(OPTIONS?: {map?: THREE.Texture, useMap?: number,
            alphaMap?: THREE.Texture, useAlphaMap?: number,
            repeat?: THREE.Vector2, color?: THREE.Color, opacity?: number,
            alphaTest?: number, dashArray?: number, dashOffset?: number,
            dashRatio?: number, resolution?: THREE.Vector2, 
            sizeAttenuation?: number, lineWidth?: number, near?: number,
            far?: number
        });
    }
}