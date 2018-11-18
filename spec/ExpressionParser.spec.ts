import "jasmine";
import { ExpressionParser } from "../src/expression/ExpressionParser";
import { Context } from "../src/expression/Context";

describe("An expression", () => {
    it("should return numerical constants as is", () => {
        let expr = ExpressionParser.parseString('23');
        expect(expr.evaluate()).toBe(23);
    });

    it("should return numerical constants as is", () => {
        let expr = ExpressionParser.parseString('-100');
        expect(expr.evaluate()).toBe(-100);
    });

    it("should return numerical constants as is", () => {
        let expr = ExpressionParser.parseString('0');
        expect(expr.evaluate()).toBe(0);
    });

    it("should add numbers", () => {
        let expr = ExpressionParser.parseString('23 + 35');
        expect(expr.evaluate()).toBe(58);
    });

    it("should add numbers", () => {
        let expr = ExpressionParser.parseString('12 + 24 + 39');
        expect(expr.evaluate()).toBe(72);
    });

    it("should add numbers", () => {
        let expr = ExpressionParser.parseString('-32 + 15');
        expect(expr.evaluate()).toBe(-16);
    });

    it("should subtract numbers", () => {
        let expr = ExpressionParser.parseString('16 - 32');
        expect(expr.evaluate()).toBe(-16);
    });

    it("should subtract numbers", () => {
        let expr = ExpressionParser.parseString('64 - 32 - 16');
        expect(expr.evaluate()).toBe(16);
    });

    it("should multiply numbers", () => {
        let expr = ExpressionParser.parseString('16 * 32');
        expect(expr.evaluate()).toBe(512);
    });

    it("should multiply numbers", () => {
        let expr = ExpressionParser.parseString('16 * 32 * 2');
        expect(expr.evaluate()).toBe(1024);
    });

    it("should obey order of operations", () => {
        let expr = ExpressionParser.parseString('1 + 2 * 3 - 4');
        expect(expr.evaluate()).toBe(3);
    });

    it("should obey order of operations", () => {
        let expr = ExpressionParser.parseString('1 + 2 * 3 - 4');
        expect(expr.evaluate()).toBe(3);
    });

    it("should obey order of operations", () => {
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

    it("should return the value of the variable", () => {
        let ctxt = new Context();
        ctxt.defineVariable('a', 12);
        let expr = ExpressionParser.parseString('a');
        expect(expr.evaluate(ctxt)).toBe(12);
    });

    it("should do arithmetic with the value of the variable", () => {
        let ctxt = new Context();
        ctxt.defineVariable('a', 12);
        let expr = ExpressionParser.parseString('1 + 3 * (a - 2)');
        expect(expr.evaluate(ctxt)).toBe(31);
    });

    it("should do arithmetic with several variables", () => {
        let ctxt = new Context();
        ctxt.defineVariable('a', 12);
        ctxt.defineVariable('b', 3);
        let expr = ExpressionParser.parseString('1 + b * (a - 2)');
        expect(expr.evaluate(ctxt)).toBe(31);
    });
});