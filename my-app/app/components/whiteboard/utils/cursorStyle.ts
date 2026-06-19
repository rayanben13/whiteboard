import { elementType } from "../../constants/Types";

interface ElementsWithResizeHandle {
    element: elementType;
    resizeHandle: string | null;
}

export const getCursorStyle = (element: ElementsWithResizeHandle | null) => {
    if (!element) return "default";
    switch (element.resizeHandle) {
        case "tl":
        case "br":
            return "nwse-resize";
        case "tr":
        case "bl":
            return "nesw-resize";
        case "inside":
            return "move";
        default:
            return "default";
    }
}