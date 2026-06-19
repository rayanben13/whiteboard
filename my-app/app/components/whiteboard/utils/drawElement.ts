import getStroke from "perfect-freehand";
import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import { elementType, TextElement, ToolTypes } from "../../constants/Types";
import { getSvgPathFromStroke } from "./getsvg";

export const drawElement = (ctx: CanvasRenderingContext2D | null, rc: RoughCanvas, element: elementType | TextElement) => {

    const generator = rough.generator()

    const createRectangle = (x1: number, y1: number, x2: number, y2: number) => {
        return generator.rectangle(x1, y1, x2 - x1, y2 - y1, { roughness: 0 })
    }

    const createLine = (x1: number, y1: number, x2: number, y2: number) => {
        return generator.line(x1, y1, x2, y2, { roughness: 0 })
    }


    switch (element.toolType) {
        case ToolTypes.Rectangle:
            rc.draw(createRectangle(element.x1, element.y1, element.x2, element.y2))
            break;
        case ToolTypes.Line:
            rc.draw(createLine(element.x1, element.y1, element.x2, element.y2))
            break;
        case ToolTypes.Pencil: {
            if (
                !element.points ||
                !ctx
            )
                return;

            const stroke =
                getStroke(
                    element.points.map(
                        (p) => [p.x, p.y]
                    ),
                    {
                        size: 8,
                        thinning: 0.6,
                        smoothing: 0.5,
                        streamline: 0.5,
                    }
                );

            const pathData = getSvgPathFromStroke(stroke);

            const path = new Path2D(pathData);

            ctx.fill(path);

            break;
        }
        case ToolTypes.Text:
            if (!ctx) return;

            ctx.font =
                "24px Arial";

            ctx.fillStyle =
                "black";

            ctx.fillText(
                element.text,
                element.x1,
                element.y1
            );

            break;
        default:
            return { message: "element not found" }

    }
}

