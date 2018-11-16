import { Context } from './context';

/**
 * Represents an expression that will evaluate to a type T
 */
export interface Expression<T> {
    evaluate: (context: Context) => T;
}