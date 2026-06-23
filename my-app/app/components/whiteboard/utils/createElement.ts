import { ToolTypes } from '@/app/components/constants/Types';

function CreateElement({
    x1,
    y1,
    x2,
    y2,
    toolType,
    id,
    color
}: {
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    toolType: ToolTypes,
    id: string,
    color?: string
}) {

    switch (toolType) {
        case ToolTypes.FillRectangle:
        case ToolTypes.Rectangle:
            return {
                toolType,
                x1: Math.min(x1, x2),
                y1: Math.min(y1, y2),
                x2: Math.max(x1, x2),
                y2: Math.max(y1, y2),
                id,
                color,
            }
        case ToolTypes.Line:
            return {
                toolType,
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                id,
                color,
            }
        default:
            return { message: "Please select a tool" }
    }
}

export default CreateElement