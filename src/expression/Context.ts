/**
 * Represents a context in which an expression can be evaluated. Contains variable values, functions, etc.
 */
export class Context {
    /**
     * Creates a new context
     */
    public constructor() {
        throw new Error("Method not implemented.")
    }

    /**
     * Defines the specified variable in this context, and assigns its value. Updates the value if variable already exists.
     * @param name Name of the variable to define
     * @param value Value to assign to variable
     */
    public defineVariable(name: string, value: any) {
        throw new Error("Method not implemented.")
    }

    /**
     * Frees the specified variable (now acts as a free variable
     * @param name Name of the variable to free
     */
    public freeVariable(name: string) {
        throw new Error("Method not implemented.")
    }

    /**
     * Gets the value specified variable. Returns undefined if it is a free variable.
     * @param name Name of variable to get
     * @returns The value of the variable
     */
    public getVariable(name: string) : any {
        throw new Error("Method not implemented.")
    }
}