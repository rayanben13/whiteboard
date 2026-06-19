import { elementType, TextElement } from "../../constants/Types";

export const getResizeHandlePosition = (
    x: number,
    y: number,
    element: elementType | TextElement | null,
    resizeHandle: string | null
): elementType | TextElement | null => {
    if (!element || !resizeHandle) return null;

    switch (resizeHandle) {
        case "tl":
            return {
                ...element,
                x1: x,
                y1: y,
            };

        case "tr":
            return {
                ...element,
                x2: x,
                y1: y,
            };

        case "bl":
            return {
                ...element,
                x1: x,
                y2: y,
            };

        case "br":
            return {
                ...element,
                x2: x,
                y2: y,
            };

        default:
            return null;
    }
};