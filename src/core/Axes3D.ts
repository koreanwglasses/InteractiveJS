import { Axes, AxesArgs } from "./internal";
import * as THREE from "three";
import { Vector3, Vector2 } from "three";
import { Arrow3D } from '../figures/Arrow3D';
import { Label3D } from "../figures/Label3D";
import { Hotspot3D } from "../figures/Hotspot3D";
import { Figure } from "./Figure";
import { Point3D } from "../figures/Point3D";
import { bracketAwareSplit } from "../utils/Utils";
import { Polygon3D, AngleArc3D } from "..";

export class Axes3D extends Axes {
    private camera : THREE.Camera;

    private pointOfInterest: Vector3;

    private hotspots: Hotspot3D[];
    private activeHotspot: Hotspot3D;
    
    public constructor(args: Axes3DArgs) {
        super(args);
        this.camera = new THREE.PerspectiveCamera(30);
        this.camera.position.copy(args.cameraPosition);
        this.camera.up.copy(args.cameraUp);
        this.camera.lookAt(args.pointOfInterest);

        this.pointOfInterest = args.pointOfInterest;

        this.hotspots = [];
        this.activeHotspot = null;

        let clientPosStart : [number, number] = null;

        let cameraStartPol = 0;
        let cameraStartAz = 0;
        let cameraStartR = 1;
        let cameraStartUp = 1;
        let cameraStartOr: Vector3 = null;
        let cameraStartPos: Vector3 = null;
        let upUnit: Vector3 = null;
        let rightUnit: Vector3 = null;

        let onOrbitStart = () => {

            var sc = new THREE.Spherical();
            sc.setFromVector3(this.camera.position.clone().sub(this.pointOfInterest));
            cameraStartPol = sc.phi;
            cameraStartAz = sc.theta;
            cameraStartR = sc.radius;
        }

        let onOrbit = (clientX: number, clientY: number) => {
            let r = this.camera.position.distanceTo(this.pointOfInterest);
            let az = cameraStartAz - cameraStartUp * (clientX - clientPosStart[0]) / 100;
            let pol = cameraStartPol - cameraStartUp * (clientY - clientPosStart[1]) / 100;

            while(pol > Math.PI) {
                pol -= 2 * Math.PI;
            } 
            while(pol <= -Math.PI) {
                pol += 2 * Math.PI;
            }

            if(pol * cameraStartUp < 0) {
                this.camera.up.y = -1;
            }
            if(pol * cameraStartUp> 0) {
                this.camera.up.y = 1;
            }

            this.camera.position.setFromSpherical(new THREE.Spherical(r, pol, az)).add(this.pointOfInterest);
            this.camera.lookAt(this.pointOfInterest);
         
            this.getPlot().requestFrame();
        }

        let onMoveStart = () => {
            cameraStartOr = this.pointOfInterest.clone();
            cameraStartPos = this.camera.position.clone();
            let nor = new Vector3();
            this.camera.getWorldDirection(nor);
            rightUnit = nor.clone().cross(new THREE.Vector3(0,1,0));
            upUnit = nor.clone().applyAxisAngle(rightUnit, Math.PI / 2)
        }

        let onMove = (clientX: number, clientY: number) => {
            // Pan camera            
            let r = this.camera.position.distanceTo(this.pointOfInterest);
            let disp = upUnit.clone().multiplyScalar((clientY - clientPosStart[1])).addScaledVector(rightUnit, -(clientX - clientPosStart[0]))
            let newCamPos = cameraStartPos.clone().addScaledVector(disp, cameraStartUp * 0.002 * r)
            let newOrPos = cameraStartOr.clone().addScaledVector(disp, cameraStartUp * 0.002 * r)
            this.camera.position.copy(newCamPos);
            this.pointOfInterest.copy(newOrPos);
            this.camera.lookAt(this.pointOfInterest);

            this.getPlot().requestFrame();

            return (clientX - clientPosStart[0]) * (clientX - clientPosStart[0]) 
              + (clientY - clientPosStart[1]) * (clientY - clientPosStart[1]) > 25;
        }

        let findActiveHotspot = (clientX: number, clientY: number) => {
            let leastDistance = 1000; // Arbitrarily large number

            let containerBounds = this.getContainer().getBoundingClientRect();
            let screenCoords = new THREE.Vector2(clientX - containerBounds.left, clientY - containerBounds.top);

            this.activeHotspot = null;
            for(let hotspot of this.hotspots) {
                let hsPos = this.project(hotspot.getPosition());
                hsPos.x = hsPos.x * containerBounds.width;
                hsPos.y = (1 - hsPos.y) * containerBounds.height;
                let dist2 = hsPos.distanceToSquared(screenCoords);
                if (dist2 <= 20 * 20 && dist2 < leastDistance * leastDistance) {
                    this.activeHotspot = hotspot;
                }
            }
        }

        let hotspotStartPos : Vector3 = null;
        let onHotspotStart = () => {
            hotspotStartPos = this.activeHotspot.getPosition();

            let nor = new Vector3();
            this.camera.getWorldDirection(nor);
            rightUnit = nor.clone().cross(new THREE.Vector3(0,1,0)).normalize();
            upUnit = nor.clone().applyAxisAngle(rightUnit, Math.PI / 2).normalize();
        }

        let onHotspotDrag = (clientX: number, clientY: number) => {
            let r = this.camera.position.distanceTo(hotspotStartPos);
            let disp = upUnit.clone().multiplyScalar(-(clientY - clientPosStart[1])).addScaledVector(rightUnit, (clientX - clientPosStart[0]))
            let newHSPos = hotspotStartPos.clone().addScaledVector(disp, cameraStartUp * 0.0022 * r)

            this.activeHotspot.setPosition(newHSPos);
        }

        this.getContainer().addEventListener('mousedown', (e) => {
            clientPosStart = [e.clientX, e.clientY];

            if(e.buttons & 1) {
                findActiveHotspot(e.clientX, e.clientY); 
                if(this.activeHotspot == null) {
                    onOrbitStart();
                } else {
                    onHotspotStart();
                }
            } else if(e.buttons & 2) {
                onMoveStart();
            }
        });

        let suppressContextMenu = false;
        this.getContainer().addEventListener('mousemove', (e) => {
            if(e.buttons & 1) {
                if(this.activeHotspot == null) {
                    onOrbit(e.clientX, e.clientY);
                } else {
                    onHotspotDrag(e.clientX, e.clientY);
                }
            } else if(e.buttons & 2) {
                suppressContextMenu = onMove(e.clientX, e.clientY);
            }
        });

        this.getContainer().addEventListener('contextmenu', (e) => {
            if(suppressContextMenu) {
                e.preventDefault();
                suppressContextMenu = false;
            }
        });
    }

    public getCamera(): THREE.Camera {
        return this.camera;
    }

    public addFigure(figure: Figure): boolean {
        if(figure instanceof Hotspot3D) {
            this.hotspots.push(figure);
        }
        return super.addFigure(figure);
    }

    public removeFigure(figure: Figure): boolean {
        if(figure instanceof Hotspot3D) {
            let i = this.hotspots.indexOf(figure);
            if(i >= 0) {
                this.hotspots.splice(i, 1);
            }
        }
        return super.removeFigure(figure);
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
                let angleArc = new AngleArc3D(args);
                this.addFigure(angleArc);
                break;
            case 'arrow':
                args.end = expr;
                let arrow = new Arrow3D(args);
                this.addFigure(arrow);
                break;
            case 'label':
                args.axes = this;
                args.label = expr;
                let label = new Label3D(args);
                this.addFigure(label);
                break;
            case 'point':
                args.position = expr;
                let point = new Point3D(args);
                this.addFigure(point);
                break;
            case 'hotspot':
                args.plot = this.getPlot();
                args.variable = expr;
                let hotspot = new Hotspot3D(args);
                this.addFigure(hotspot);
                break;
            case 'polygon':
                let verts = bracketAwareSplit(expr.slice(1, expr.length - 1), ',');
                args.vertices = verts;
                let poly = new Polygon3D(args);
                this.addFigure(poly);
                break;
            default:
                throw new Error("Unknown figure type!");
        }
    }

    /**
     * Returns a vector whose x,y coordinates are in the range [0,1]
     * @param worldCoords 
     */
    public project(worldCoords: Vector3): Vector2 {
        this.camera.updateMatrixWorld(true);
        let result = worldCoords.clone().project(this.camera).multiplyScalar(0.5).add(new Vector3(0.5, 0.5, 0));
        return new Vector2(result.x, result.y);
    }
}

export class Axes3DArgs extends AxesArgs {
    public pointOfInterest: Vector3;
    public cameraPosition: Vector3;
    public cameraUp: Vector3;

    public constructor(args: any) {
        super(args);
        this.pointOfInterest = args.pointOfInterest;
        this.cameraPosition = args.cameraPosition;
        this.cameraUp = args.cameraUp;
    }

    public validate(): boolean {
        return super.validate();
    }

    public default() : void {
        super.default();
        if(this.pointOfInterest === undefined) {
            this.pointOfInterest = new Vector3(0, 0, 0);
        }
        if(this.cameraPosition === undefined) {
            this.cameraPosition = new Vector3(1, 2, 2);
        }
        if(this.cameraUp === undefined) {
            this.cameraUp = new Vector3(0, 1, 0);
        }
    }
}