import { Object3D } from "three";
import * as math from 'mathjs';
import { Axes } from "./Axes";

/**
 * Represents an object that can be plotted on an axes
 */
export interface Figure {
    /**
     * Creates a mesh that can be rendered on a THREE.Scene. Should not alter the scope.
     * @param scope The scope to evaluate any mathjs expressions with.
     */
    render: (scope? : any, axes? : Axes) => Object3D;
}