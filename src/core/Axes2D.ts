import { Axes, AxesArgs } from "./internal";
import * as THREE from "three";
import { Vector2, Vector3 } from "three";
import { Hotspot2D } from "../figures/Hotspot2D";
import { Figure } from "./Figure";
import { Label2D } from "../figures/Label2D";
import { Arrow2D } from "../figures/Arrow2D";
import { Point2D } from "../figures/Point2D";
import { Parametric2D } from "../figures/Parametric2D";
import { AngleArc2D } from "../figures/AngleArc2D";
import { bracketAwareSplit } from "../utils/Utils";
import { Polygon2D } from "../figures/Polygon2D";

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

    private hotspots: Hotspot2D[];
    private activeHotspot: Hotspot2D;

    public constructor(args: Axes2DArgs) {
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

        let clientPosStart : [number, number] = null;
        let cameraPosStart : Vector3 = null
        let onPanStart = (clientX: number, clientY: number) => {
            clientPosStart = [clientX, clientY];
            cameraPosStart = this.camera.position.clone();
        }

        let onPan = (clientX: number, clientY: number) => {
            let clientBounds = this.getContainer().getBoundingClientRect();
            let clientDiff = [clientX - clientPosStart[0], clientY - clientPosStart[1]];
            
            let cameraDim = [this.right - this.left, this.top - this.bottom];
            let cameraDiff = [clientDiff[0] / clientBounds.width * cameraDim[0], clientDiff[1] / clientBounds.height * cameraDim[1]];

            this.camera.position.x = cameraPosStart.x - cameraDiff[0];
            this.camera.position.y = cameraPosStart.y + cameraDiff[1];

            this.camera.updateMatrix();

            this.getPlot().requestFrame();
        }

        let onHotspotDrag = (clientX: number, clientY: number) => {
            let containerBounds = this.getContainer().getBoundingClientRect();
            let screenCoords = new THREE.Vector2(clientX - containerBounds.left, clientY - containerBounds.top);
            let worldCoords = unproject(screenCoords);
            this.activeHotspot.setPosition(worldCoords);
        }

        let onPanEnd = (clientX: number, clientY: number) => {
            clientPosStart = null;
            cameraPosStart = null;
        }

        var unproject = (screenCoords: Vector2) => {
            let ratioX = screenCoords.x / this.getContainer().clientWidth;
            let ratioY = screenCoords.y / this.getContainer().clientHeight;
            let worldX = this.left + ratioX * (this.right - this.left) + this.camera.position.x;
            let worldY = this.top - ratioY * (this.top - this.bottom) + this.camera.position.y;
            return new Vector2(worldX, worldY);
        }

        var findActiveHotspot = (clientX: number, clientY: number) => {
            let leastDistance = 1000; // Arbitrarily large number

            let containerBounds = this.getContainer().getBoundingClientRect();
            let screenCoords = new THREE.Vector2(clientX - containerBounds.left, clientY - containerBounds.top);

            this.activeHotspot = null;
            for(let hotspot of this.hotspots) {
                let dist2 = this.project(hotspot.getPosition()).distanceToSquared(screenCoords);
                if (dist2 <= 20 * 20 && dist2 < leastDistance * leastDistance) {
                    this.activeHotspot = hotspot;
                }
            }
        }

        this.getContainer().addEventListener('mousedown', (e) => {
            if(e.buttons & 1) {
                findActiveHotspot(e.clientX, e.clientY); 
                if(this.activeHotspot == null) {
                    onPanStart(e.clientX, e.clientY);
                }
            }
        });

        this.getContainer().addEventListener('mousemove', (e) => {
            if(e.buttons & 1) {
                if(this.activeHotspot == null) {
                    onPan(e.clientX, e.clientY);
                } else {
                    onHotspotDrag(e.clientX, e.clientY);
                }
            }
        })

        this.getContainer().addEventListener('mouseup', (e) => {
            if(e.buttons & 1) {
                if(this.activeHotspot == null) {
                    onPanEnd(e.clientX, e.clientY);
                }
            }
        })
    }

    public addFigure(figure: Figure): boolean {
        if(figure instanceof Hotspot2D) {
            this.hotspots.push(figure);
        }
        return super.addFigure(figure);
    }

    public removeFigure(figure: Figure): boolean {
        if(figure instanceof Hotspot2D) {
            let i = this.hotspots.indexOf(figure);
            if(i >= 0) {
                this.hotspots.splice(i, 1);
            }
        }
        return super.removeFigure(figure);
    }

    protected getCamera() : THREE.Camera {
        return this.camera;
    }

    public project(worldCoords: Vector2): Vector2 {
        let ratioX = (worldCoords.x - this.camera.position.x - this.left) / (this.right - this.left);
        let ratioY = (worldCoords.y - this.camera.position.y - this.bottom) / (this.top - this.bottom);
        let screenX = ratioX * this.getContainer().clientWidth;
        let screenY = (1 - ratioY) * this.getContainer().clientHeight;
        return new Vector2(screenX, screenY)
    }

    /**
     * Supports legacy way of creating figures
     */
    public plotExpression(expr: string, type: string, opts: any) {

        let args = Object.assign({}, opts);

        switch(type) {
            case 'angle':
                var parts = expr.split(/{|,|}/g);
                args.a = parts[1]
                args.b = parts[2]
                let angleArc = new AngleArc2D(args);
                this.addFigure(angleArc);
                break;
            case 'arrow':
                args.end = expr;
                let arrow = new Arrow2D(args);
                this.addFigure(arrow);
                break;
            case 'label':
                args.axes = this;
                args.label = expr;
                let label = new Label2D(args);
                this.addFigure(label);
                break;
            case 'point':
                args.position = expr;
                let point = new Point2D(args);
                this.addFigure(point);
                break;
            case 'hotspot':
                args.plot = this.getPlot();
                args.variable = expr;
                let hotspot = new Hotspot2D(args);
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
                let param = new Parametric2D(args);
                this.addFigure(param);
                break;
            case 'polygon':
                let verts = bracketAwareSplit(expr.slice(1, expr.length - 1), ',');
                args.vertices = verts;
                let poly = new Polygon2D(args);
                this.addFigure(poly);
                break;
            default:
                throw new Error("Unknown figure type!");
        }
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