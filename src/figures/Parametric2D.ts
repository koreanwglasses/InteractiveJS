import { Figure } from '../core/Figure';
import { MeshLine, MeshLineMaterial } from 'three.meshline';
import { Object3D } from 'three';

export class Parametric2D implements Figure {

    public getSceneObject(scope?: any) : Object3D {
        new MeshLine();
        return null;
    }

}