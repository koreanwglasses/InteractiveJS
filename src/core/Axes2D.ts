import { Axes, AxesArgs } from "./internal";
import * as THREE from "three";

export class Axes2D extends Axes {
    private camera : THREE.Camera;
    public constructor(args: Axes2DArgs) {
        super(args);
        this.camera = new THREE.OrthographicCamera(args.left, args.right, args.top, args.bottom);
    }

    protected getCamera() : THREE.Camera {
        return this.camera;
    }
}

export class Axes2DArgs extends AxesArgs {
    public left : number;
    public right : number;
    public top : number;
    public bottom : number;

    public constructor(args: any) {
        super(args);
        this.left = args.left;
        this.right = args.right;
        this.top = args.top;
        this.bottom = args.bottom;
    }

    public validate() : boolean {
        super.validate();
        if(this.right !== undefined && this.left !== undefined && this.right - this.left <= 0) {
            throw new Error("Invalid arguments: left >= right.");
        }

        if(this.top !== undefined && this.bottom !== undefined && this.top - this.bottom <= 0) {
            throw new Error("Invalid arguments: top <= bottom.");
        }
        return true;
    }

    public default() : void {
        super.default();
        if(this.left === undefined) {
            this.left = -10;
        }
        if(this.right=== undefined) {
            this.right = 10;
        }
        if(this.top === undefined) {
            this.top = 10;
        }
        if(this.bottom === undefined) {
            this.bottom = -10;
        }
    }
}