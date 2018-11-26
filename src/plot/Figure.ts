import { Mesh } from "three";

/**
 * Represents an object that can be plotted on an axes
 */
export abstract class Figure {
    private uid: number;

    protected constructor() {
        this.uid = Figure.uid_counter++;
    }

    /**
     * Creates a mesh that can be rendered on a THREE.Scene
     */
    public abstract getSceneObject(): Mesh;

    // /**
    //  * Returns a string that uniquely identifies this figure.
    //  */
    // public toString(): string {
    //     return '<Figure uid:' + this.uid + '>';
    // }

    private static uid_counter = 0;
}