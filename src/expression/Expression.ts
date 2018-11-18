import { Context } from './Context';

/**
 * Represents an expression that will evaluate to a type T
 */
export interface Expression<T> {
    /**
     * Evaluates the expression without modifying the context. A null context 
     * can be provided if no variables need be defined.
     * @throws An error if required variables are not defined.
     */
    evaluate: (context?: Context) => T;

    /**
     * Evaluates the expression and modifies the context as neccessary.
     * @throws An error if required variables are not defined.
     */
    execute: (context: Context) => T;

    /**
     * Gets the variables that this expression depends on. If a variable is
     * another expression, then the variables required for that will be
     * included as well
     * @returns Variables as a set
     */
    getVariables: (context: Context) => Set<string>;
}