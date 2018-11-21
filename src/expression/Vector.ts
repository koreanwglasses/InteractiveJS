
/**
 * Represents an immutable vector.
 */
export class Vector {
    /**
     * Constructs a new vector from specified data
     * @param data 
     */
    public constructor(data: Array<number> | Vector) {
        if(data instanceof Array) {
            throw new Error('Method not implemented.');
        } else if (data instanceof Vector) {
            throw new Error('Method not implemented.');
        }
    }

    /**
     * Adds this vector to x, if possible.
     * @param x 
     * @throws An error if dimensions of the vectors do not match
     */
    public add(x: Vector): Vector {
        throw new Error('Method not implemented.');
    }

    /**
     * Takes the difference this - x, if possible.
     * @param x 
     * @throws An error if dimensions of the vectors do not match
     */
    public sub(x: Vector): Vector {
        throw new Error('Method not implemented.');
    }

    /**
     * Scales this vector by x
     * @param x 
     */
    public mul(x: number): Vector {
        throw new Error('Method not implemented.');
    }

    /**
     * Scales this vector by 1 / x
     * @param x 
     */
    public div(x: number): Vector {
        throw new Error('Method not implemented.');
    }

    /**
     * Returns the components of this vector as an array
     */
    public toArray() : number[] {
        throw new Error('Method not implemented.');
    }
}