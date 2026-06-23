import { elementType, ToolTypes } from "../../constants/Types";

export const getSelectedElements = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    elements: elementType[]
) => {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    return elements.filter((element) => {
        let bounds;

        if (element.toolType === ToolTypes.Pencil) {
            bounds = getPencilBounds(element.points);
        } else {
            bounds = element;
        }

        return !(
            bounds.x2 < minX ||
            bounds.x1 > maxX ||
            bounds.y2 < minY ||
            bounds.y1 > maxY
        );
    });
};

const getPencilBounds = (points: { x: number, y: number }[] | undefined) => {
    if (!points) return { x1: 0, y1: 0, x2: 0, y2: 0 };
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);

    return {
        x1: Math.min(...xs),
        y1: Math.min(...ys),
        x2: Math.max(...xs),
        y2: Math.max(...ys),
    };
};