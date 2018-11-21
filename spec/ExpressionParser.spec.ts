import "jasmine";
import { ExpressionParser } from "../src/expression/ExpressionParser";
import { Context } from "../src/expression/Context";
import { Vector } from "../src/expression/Vector";

describe("Basic functionality of expressions", () => {
    it("should return numerical constants as is (23 => 23)", () => {
        let expr = ExpressionParser.parseString('23');
        expect(expr.evaluate()).toBe(23);
    });

    it("should return numerical constants as is (-100 => -100)", () => {
        let expr = ExpressionParser.parseString('-100');
        expect(expr.evaluate()).toBe(-100);
    });

    it("should return numerical constants as is (0 => 0)", () => {
        let expr = ExpressionParser.parseString('0');
        expect(expr.evaluate()).toBe(0);
    });

    it("should add numbers (23 + 35 => 58)", () => {
        let expr = ExpressionParser.parseString('23 + 35');
        expect(expr.evaluate()).toBe(58);
    });

    it("should add numbers (12 + 24 + 39 => 72)", () => {
        let expr = ExpressionParser.parseString('12 + 24 + 39');
        expect(expr.evaluate()).toBe(72);
    });

    it("should add numbers (-32 + 15 => -16)", () => {
        let expr = ExpressionParser.parseString('-32 + 15');
        expect(expr.evaluate()).toBe(-16);
    });

    it("should subtract numbers (16 - 32 => -16)", () => {
        let expr = ExpressionParser.parseString('16 - 32');
        expect(expr.evaluate()).toBe(-16);
    });

    it("should subtract numbers (64 - 32 - 16 => 16)", () => {
        let expr = ExpressionParser.parseString('64 - 32 - 16');
        expect(expr.evaluate()).toBe(16);
    });

    it("should multiply numbers (16 * 32 => 512)", () => {
        let expr = ExpressionParser.parseString('16 * 32');
        expect(expr.evaluate()).toBe(512);
    });

    it("should multiply numbers (16 * 32 * 2 => 1024)", () => {
        let expr = ExpressionParser.parseString('16 * 32 * 2');
        expect(expr.evaluate()).toBe(1024);
    });

    it("should divide numbers (3 / 4 => .75)", () => {
        let expr = ExpressionParser.parseString('3 / 4');
        expect(expr.evaluate()).toBe(.75);
    });

    it("should exponentiate numbers (3 ^ 4 => 81)", () => {
        let expr = ExpressionParser.parseString('3 ^ 4');
        expect(expr.evaluate()).toBe(81);
    });

    it("should obey order of operations (1 + 2 * 3 - 4 => 3)", () => {
        let expr = ExpressionParser.parseString('1 + 2 * 3 - 4');
        expect(expr.evaluate()).toBe(3);
    });
    it("should obey order of operations (1 + 2 * (3 - 4) => -1)", () => {
        let expr = ExpressionParser.parseString('1 + 2 * (3 - 4)');
        expect(expr.evaluate()).toBe(-1);
    });

    it("should throw an error is variables are not appriopriately defined", () => {
        let ctxt = new Context();
        let expr = ExpressionParser.parseString('a');
        expect( function() { expr.evaluate(ctxt); } ).toThrow();
    });

    it("should throw an error is variables are not appriopriately defined", () => {
        let ctxt: Context = null;
        let expr = ExpressionParser.parseString('a');
        expect( function() { expr.evaluate(ctxt); } ).toThrow();
    });

    it("should return the value of the variable (a: a = 12 => 12)", () => {
        let ctxt = new Context();
        ctxt.defineVariable('a', 12);
        let expr = ExpressionParser.parseString('a');
        expect(expr.evaluate(ctxt)).toBe(12);
    });

    it("should do arithmetic with the value of the variable (1 + 3 * (a - 2); a = 12 => 31)", () => {
        let ctxt = new Context();
        ctxt.defineVariable('a', 12);
        let expr = ExpressionParser.parseString('1 + 3 * (a - 2)');
        expect(expr.evaluate(ctxt)).toBe(31);
    });

    it("should do arithmetic with several variables (1 + b * (a - 2); a = 12, b = 3 => 31)", () => {
        let ctxt = new Context();
        ctxt.defineVariable('a', 12);
        ctxt.defineVariable('b', 3);
        let expr = ExpressionParser.parseString('1 + b * (a - 2)');
        expect(expr.evaluate(ctxt)).toBe(31);
    });

    it("should parse vectors with constants ([1, 2, 3] => [1, 2, 3])", () => {
        let expr = ExpressionParser.parseString('[1, 2, 3]');
        let result = expr.evaluate() as Vector;
        expect(result.toArray()).toBe([1,2,3]);
    });

    it("should parse vectors with arithmetic ([1, 2, 3+2] => [1, 2, 5])", () => {
        let expr = ExpressionParser.parseString('[1, 2, 3+2]');
        let result = expr.evaluate() as Vector;
        expect(result.toArray()).toBe([1,2,5]);
    });

    it("should parse vectors with variables ([1, 2, a]: a = 3 => [1, 2, 3])", () => {
        let ctxt = new Context();
        ctxt.defineVariable('a', 3);
        let expr = ExpressionParser.parseString('[1, 2, a]');
        let result = expr.evaluate() as Vector;
        expect(result.toArray()).toBe([1,2,3]);
    });

    it("should parse vectors with variable and arithmetic ([1, 2, a + 2]: a = 3 => [1, 2, 5])", () => {
        let ctxt = new Context();
        ctxt.defineVariable('a', 3);
        let expr = ExpressionParser.parseString('[1, 2, a + 2]');
        let result = expr.evaluate() as Vector;
        expect(result.toArray()).toBe([1,2,5]);
    });

    it("should NOT parse vectors with undefined variabled", () => {
        let ctxt = new Context();
        let expr = ExpressionParser.parseString('[1, 2, a]');
        expect(function() { expr.evaluate(ctxt) }).toThrow();
    });

    it("should add vectors ([1, 2, 3] + [2, 3, 4] => [3, 5, 7])", () => {
        let expr = ExpressionParser.parseString('[1, 2, 3] + [2, 3, 4]');
        let result = expr.evaluate() as Vector;
        expect(result.toArray()).toBe([3,5,7]);
    });

    it("should subtract vectors ([1, 2, 3] - [2, 3, 4] => [-1, -1, -1])", () => {
        let expr = ExpressionParser.parseString('[1, 2, 3] - [2, 3, 4]');
        let result = expr.evaluate() as Vector;
        expect(result.toArray()).toBe([-1,-1,-1]);
    });

    it("should add vectors with variables ([1, 2, a] + [2, 3, b]: a = 3, b = 4 => [3, 5, 7])", () => {
        let ctxt = new Context();
        ctxt.defineVariable('a', 3);
        ctxt.defineVariable('b', 4);
        let expr = ExpressionParser.parseString('[1, 2, a] + [2, 3, b]');
        let result = expr.evaluate() as Vector;
        expect(result.toArray()).toBe([3,5,7]);
    });

    it("should multiply vectors by a scalar (2 * [1, 2, 3] => [2, 4, 6])", () => {
        let expr = ExpressionParser.parseString('2 * [1, 2, 3]');
        let result = expr.evaluate() as Vector;
        expect(result.toArray()).toBe([2,4,6]);
    });

    it("should multiply vectors by a scalar ([1, 2, 3] * 2 => [2, 4, 6]) ", () => {
        let expr = ExpressionParser.parseString('[1, 2, 3] * 2');
        let result = expr.evaluate() as Vector;
        expect(result.toArray()).toBe([2,4,6]);
    });

    it("should subscript a vector ([1, 2, 3][1] => 1) ", () => {
        let expr = ExpressionParser.parseString('[1, 2, 3][1]');
        expect(expr.evaluate()).toBe(1);
    });

    it("should assign new variables", () => {
        let ctxt = new Context();
        let expr = ExpressionParser.parseString('a = 12');
        expect(expr.evaluate(ctxt)).toBe(12);
        expect(ctxt.getVariable('a')).toBe(12);
    });

    it("should assign new variables", () => {
        let ctxt = new Context();
        let expr = ExpressionParser.parseString('a = [1, 2, 3]');
        let result1 = expr.evaluate(ctxt) as Vector;
        expect(result1.toArray()).toBe([1, 2, 3]);
        let result2 = ctxt.getVariable('a') as Vector;
        expect(result2.toArray()).toBe([1, 2, 3]);
    });

    it("should overwrite old variables", () => {
        let ctxt = new Context();
        let expr1 = ExpressionParser.parseString('a = 12');
        let expr2 = ExpressionParser.parseString('a = 6');
        expect(expr1.evaluate(ctxt)).toBe(12);
        expect(expr2.evaluate(ctxt)).toBe(6);
        expect(ctxt.getVariable('a')).toBe(6);
    });

    it("should do arithmetic with assigned variables", () => {
        let ctxt = new Context();
        let expr1 = ExpressionParser.parseString('a = 12');
        let expr2 = ExpressionParser.parseString('1 + a * 3 ');
        expect(expr1.evaluate(ctxt)).toBe(12);
        expect(expr2.evaluate(ctxt)).toBe(37);
    });

    it("should do arithmetic with assigned variables", () => {
        let ctxt = new Context();
        let expr1 = ExpressionParser.parseString('a = [1, 2, 3]');
        let expr2 = ExpressionParser.parseString('b = [3, 4, 5]');
        let expr3 = ExpressionParser.parseString('a + b');

        expr1.evaluate(ctxt);
        expr2.evaluate(ctxt);
        let result = expr3.evaluate(ctxt) as Vector;
        expect(result.toArray()).toBe([4, 6, 8]);
    });

    it("should create functions", () => {
        let ctxt = new Context();
        let expr1 = ExpressionParser.parseString('f(x) = x + 1');
        let expr2 = ExpressionParser.parseString('f(2)');

        expr1.evaluate(ctxt);
        expect(expr2.evaluate(ctxt)).toBe('3');
    });

    it("should create functions", () => {
        let ctxt = new Context();
        let expr1 = ExpressionParser.parseString('f(x) = [x + 1, x + 2, x ^ 2]');
        let expr2 = ExpressionParser.parseString('f(2)');

        expr1.evaluate(ctxt);
        let result = expr2.evaluate(ctxt) as Vector;
        expect(result.toArray()).toBe([3, 4, 4]);
    });

    it("should create functions with multiple parameters", () => {
        let ctxt = new Context();
        let expr1 = ExpressionParser.parseString('f(x, y) = x - y');
        let expr2 = ExpressionParser.parseString('f(2, 3)');

        expr1.evaluate(ctxt);
        expect(expr2.evaluate(ctxt)).toBe(-1);
    });

    it("should work with vectors or numbers as parameters", () => {
        let ctxt = new Context();
        let expr1 = ExpressionParser.parseString('f(x) = 2 * x');
        let expr2 = ExpressionParser.parseString('f(2)');
        let expr3 = ExpressionParser.parseString('f([1, 2])');

        expr1.evaluate(ctxt);
        expect(expr2.evaluate(ctxt)).toBe(4);
        let result = expr3.evaluate(ctxt) as Vector;
        expect(result.toArray()).toBe([2,4]);
    });
});