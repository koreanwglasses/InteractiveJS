import { MeshLine, MeshLineMaterial } from 'three.meshline';
import { Object3D, Vector3, CylinderBufferGeometry, BufferGeometry, BufferAttribute, Mesh, Color, Geometry, ArrowHelper } from "three";

export class LineArrowHelper extends Object3D {
    constructor(dir: Vector3, origin?: Vector3, length?: number, hex?: number, headLength?: number, headWidth?: number, width?: number) {
        super();    
        
        if ( dir === undefined ) dir = new Vector3( 0, 0, 1 );
        if ( origin === undefined ) origin = new Vector3( 0, 0, 0 );
        if ( length === undefined ) length = 1;
        if ( hex === undefined ) hex = 0xffff00;
        if ( headLength === undefined ) headLength = 0.2 * length;
        if ( headWidth === undefined ) headWidth = 0.2 * headLength;
        if ( width === undefined ) width = 0.01;
        
        let end = origin.clone().add(dir.clone().multiplyScalar(length - headLength));
        
        let geom = new Geometry();
        geom.vertices.push(origin);
        geom.vertices.push(end);
        
        let line = new MeshLine();
        line.setGeometry(geom);
        
        let material = new MeshLineMaterial({lineWidth: width, color: new Color( hex ) });
        this.add(new Mesh(line.geometry, material))

        this.add(new ArrowHelper(dir, origin, length, hex, headLength, headWidth));
    }
}