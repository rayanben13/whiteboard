import { elementType, TextElement } from "../../constants/Types";

export const drawSelection = (ctx: CanvasRenderingContext2D | null, element: elementType | TextElement) => {
    if (!ctx) return;
    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    ctx.setLineDash([9, 9]);

    ctx.strokeRect(
        element.x1,
        element.y1,
        (element as elementType).x2 - element.x1,
        (element as elementType).y2 - element.y1
    );

    ctx.setLineDash([]);
}