import { Axes, AxesArgs } from "./internal";
import * as THREE from "three";

export class Axes3D extends Axes {
    private camera : THREE.Camera;
    public constructor(args: Axes3DArgs) {
        super(args);
        this.camera = new THREE.PerspectiveCamera();
    }

    public getCamera(): THREE.Camera {
        throw new Error("Method not implemented.");
    }
}

export class Axes3DArgs extends AxesArgs {
}