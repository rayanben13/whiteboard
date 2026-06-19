import {
    elementType,
    ToolTypes
} from "../../constants/Types";

const getResizeHandle = (
    x: number,
    y: number,
    element: elementType
) => {
    const size = 5;

    const handles = {
        tl: {
            x: element.x1,
            y: element.y1,
        },
        tr: {
            x: element.x2,
            y: element.y1,
        },
        bl: {
            x: element.x1,
            y: element.y2,
        },
        br: {
            x: element.x2,
            y: element.y2,
        },
    };

    for (const key in handles) {
        const h =
            handles[
            key as keyof typeof handles
            ];

        if (
            Math.abs(
                x - h.x
            ) < size &&
            Math.abs(
                y - h.y
            ) < size
        ) {
            return key;
        }
    }

    return null;
};

const isInsideElement = (
    x: number,
    y: number,
    element: elementType
) => {

    // line
    if (element.toolType === ToolTypes.Line) {
        return isPointNearLine(
            x,
            y,
            element.x1,
            element.y1,
            element.x2,
            element.y2
        );
    }

    // text
    else if (element.toolType === ToolTypes.Text) {
        const width =
            element.text!.length * 8;

        const height = 24;

        return (
            x >= element.x1 &&
            x <=
            element.x1 + width + 12 &&
            y >=
            element.y1 - height &&
            y <= element.y1
        );
    }

    // pencil
    else if (element.toolType === ToolTypes.Pencil) {
        const points = element.points;
        if (!points) return false;

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            if (isPointNearLine(x, y, p1.x, p1.y, p2.x, p2.y)) {
                return true;
            }
        }
        return false;
    }

    // rect
    return (
        x >= element.x1 &&
        x <= element.x2 &&
        y >= element.y1 &&
        y <= element.y2
    );
};

export function getElementAtPosition(
    x: number,
    y: number,
    elements: elementType[]
) {
    for (
        let i =
            elements.length - 1;
        i >= 0;
        i--
    ) {
        const element = elements[i];
        const resizeHandle = getResizeHandle(x, y, element);

        if (resizeHandle) {
            return { element, resizeHandle };
        }

        if (isInsideElement(x, y, element)) {
            return { element, resizeHandle: "inside" };
        }
    }

    return null;
}


const isPointNearLine = (
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
) => {
    const threshold = 8;

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    let param = -1;

    if (lenSq !== 0) {
        param =
            dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (
        param > 1
    ) {
        xx = x2;
        yy = y2;
    } else {
        xx =
            x1 +
            param * C;

        yy =
            y1 +
            param * D;
    }

    const dx =
        x - xx;

    const dy =
        y - yy;

    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    return (
        distance <
        threshold
    );
};