import { elementType } from "../../constants/Types";

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
        return !(
            element.x2 < minX ||
            element.x1 > maxX ||
            element.y2 < minY ||
            element.y1 > maxY
        );
    });
};