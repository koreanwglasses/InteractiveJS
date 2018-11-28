import { Mesh } from "three";

/**
 * Represents an object that can be plotted on an axes
 */
export interface Figure {
    /**
     * Creates a mesh that can be rendered on a THREE.Scene
     */
    getSceneObject: () => Mesh;
}