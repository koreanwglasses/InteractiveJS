import { Axes, AxesArgs } from "./Axes";
import { Figure } from "./Figure";
import { Plot } from "./Plot";

export class Axes3D extends Axes {
    public addFigure(figure: Figure): boolean {
        throw new Error("Method not implemented.");
    }

    public removeFigure(figure: Figure): boolean {
        throw new Error("Method not implemented.");
    }

    public refresh(): void {
        throw new Error("Method not implemented.");
    }

    public render(): void {
        throw new Error("Method not implemented.");
    }

    public sleep(): void {
        throw new Error("Method not implemented.");
    }

    public wake(): void {
        throw new Error("Method not implemented.");
    }

    public getPlot(): Plot {
        throw new Error("Method not implemented.");
    }
}

export class Axes3DArgs extends AxesArgs {
}