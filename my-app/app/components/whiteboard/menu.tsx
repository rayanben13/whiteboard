"use client"
import { Delete, LineDotRightHorizontal, Pencil, Pointer, RectangleHorizontal, Text } from "lucide-react";
import { useDispatch } from "react-redux";
import { ToolTypes } from "../constants/Types";
import { setElement, setTool } from "../features/whiteboard/whiteboardSlice";
import { emitClearAllElements } from "../socket/socket";

function WhiteboardMenu() {
    const dispatch = useDispatch()

    const handleClick = (toolType: ToolTypes) => {
        dispatch(setTool(toolType));
    }
    const handleClear = () => {
        dispatch(setElement([]));
        emitClearAllElements();
    }
    return (

        <div className=" flex justify-center ">
            <div className="w-2xs h-11 bg-gray-200 rounded-md my-3">
                <button onClick={() => handleClick(ToolTypes.Rectangle)} name="rect" className="hover:bg-amber-300 p-2">
                    <RectangleHorizontal />
                </button>
                <button onClick={() => handleClick(ToolTypes.Line)} name="line" className="hover:bg-amber-300 p-2">
                    <LineDotRightHorizontal />
                </button>
                <button onClick={handleClear} name="delete" className="hover:bg-amber-300 p-2">
                    <Delete />
                </button>
                <button onClick={() => handleClick(ToolTypes.Pencil)} name="pencil" className="hover:bg-amber-300 p-2">
                    <Pencil />
                </button>
                <button onClick={() => handleClick(ToolTypes.Text)} name="text" className="hover:bg-amber-300 p-2">
                    <Text />
                </button>
                <button onClick={() => handleClick(ToolTypes.Resize)} name="resize" className="hover:bg-amber-300 p-2">
                    <Pointer />
                </button>
            </div>
        </div>
    )
}

export default WhiteboardMenu