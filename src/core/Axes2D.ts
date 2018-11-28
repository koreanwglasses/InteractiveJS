import { Axes, AxesArgs } from "./internal";
import * as THREE from "three";
import { Vector2, Vector3 } from "three";

/**
 * An axes where 2D elementds can be plotted.
 * 
 * Controls:
 * -    Left click and drag to pan
 */
export class Axes2D extends Axes {
    private camera : THREE.Camera;
    private left: number;
    private right: number;
    private top: number;
    private bottom: number;

    public constructor(args: Axes2DArgs) {
        super(args);
        this.camera = new THREE.OrthographicCamera(args.left, args.right, args.top, args.bottom, 0, 20);
        this.camera.position.z = 10;
        this.camera.lookAt(this.getScene().position);

        this.left = args.left;
        this.right = args.right;
        this.top = args.top;
        this.bottom = args.bottom;

        let self_ = this;

        let clientPosStart : Array<number> = null;
        let cameraPosStart : Vector3 = null
        let onPanStart = function(clientX: number, clientY: number) {
            clientPosStart = [clientX, clientY];
            cameraPosStart = self_.camera.position.clone();
        }

        let onPan = function(clientX: number, clientY: number) {
            let clientBounds = self_.getContainer().getBoundingClientRect();
            let clientDiff = [clientX - clientPosStart[0], clientY - clientPosStart[1]];
            
            let cameraDim = [self_.right - self_.left, self_.top - self_.bottom];
            let cameraDiff = [clientDiff[0] / clientBounds.width * cameraDim[0], clientDiff[1] / clientBounds.height * cameraDim[1]];

            self_.camera.position.x = cameraPosStart.x - cameraDiff[0];
            self_.camera.position.y = cameraPosStart.y + cameraDiff[1];

            self_.camera.updateMatrix();
        }

        let onPanEnd = function(clientX: number, clientY: number) {
            clientPosStart = null;
            cameraPosStart = null;
        }

        this.getContainer().addEventListener('mousedown', (e) => {
            if(e.buttons & 1) {
                onPanStart(e.clientX, e.clientY);
            }
        });

        this.getContainer().addEventListener('mousemove', (e) => {
            if(e.buttons & 1) {
                onPan(e.clientX, e.clientY);
            }
        })

        this.getContainer().addEventListener('mouseup', (e) => {
            if(e.buttons & 1) {
                onPanEnd(e.clientX, e.clientY);
            }
        })
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