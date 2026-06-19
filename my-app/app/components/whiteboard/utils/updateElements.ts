import { elementType, otherElementsType, ToolTypes } from "@/app/components/constants/Types";
import { setElement } from "../../features/whiteboard/whiteboardSlice";
import { store } from "../../store/store";
import CreateElement from "./createElement";

const updatedElement = ({
    index,
    id,
    toolType,
    x1,
    y1,
    x2,
    y2
}: {
    index: number;
    id: string;
    toolType: ToolTypes;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}, elements: elementType[] | otherElementsType[]) => {

    const elementsCopy = [...elements]

    switch (toolType) {
        case ToolTypes.Rectangle:
            const updateElement = CreateElement({
                x1, y1, x2, y2, toolType, id
            })
            elementsCopy[index] = updateElement
            store.dispatch(setElement(elementsCopy))
            break
        default:
            throw new Error("No tool type")
    }
    return elementsCopy;

}