"use client";

import {
    BoxSelect,
    LineDotRightHorizontal,
    Menu,
    MouseIcon,
    Pencil,
    Pointer,
    RectangleEllipsis,
    RectangleHorizontal,
    Text,
    Trash2,
    X
} from "lucide-react";
import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { ToolTypes } from "../constants/Types";
import { setElement, setTool } from "../features/whiteboard/whiteboardSlice";
import { emitClearAllElements } from "../socket/socket";
import { RootState } from "../store/store";

function WhiteboardMenu({ roomId }: { roomId: string }) {
    const dispatch = useDispatch();
    const toolTypeSelected = useSelector(
        (state: RootState) => state.whiteboard.tool
    );

    const [mobileOpen, setMobileOpen] = useState(false);

    const handleClick = (toolType: ToolTypes) => {
        dispatch(setTool(toolType));
    };

    const handleClear = () => {
        if (confirm("Are you sure you want to clear the entire canvas?")) {
            dispatch(setElement([]));
            emitClearAllElements({ roomId });
        }
    };

    const tools = [
        {
            type: ToolTypes.None,
            icon: MouseIcon,
            title: "Pan & Zoom",
        },
        {
            type: ToolTypes.Selection,
            icon: BoxSelect,
            title: "Select Area",
        },
        {
            type: ToolTypes.Resize,
            icon: Pointer,
            title: "Move & Resize",
        },
        {
            type: ToolTypes.Rectangle,
            icon: RectangleHorizontal,
            title: "Rectangle",
        },
        {
            type: ToolTypes.FillRectangle,
            icon: RectangleEllipsis,
            title: "Filled Rectangle",
        },
        {
            type: ToolTypes.Line,
            icon: LineDotRightHorizontal,
            title: "Line",
        },
        {
            type: ToolTypes.Pencil,
            icon: Pencil,
            title: "Draw",
        },
        {
            type: ToolTypes.Text,
            icon: Text,
            title: "Text",
        },
    ];

    return (
        <>
            {/* MOBILE MENU BUTTON */}
            <div className="fixed top-4 right-4 z-50 lg:hidden">
                <button
                    name="menu-button"
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-3 rounded-xl bg-white/90 backdrop-blur-md shadow-lg border "
                >
                    {mobileOpen ? (
                        <X className="w-5 h-5" />
                    ) : (
                        <Menu className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* MOBILE TOOLBAR */}
            {mobileOpen && (
                <div
                    className="
                        fixed top-20 left-4 z-50 lg:hidden
                        flex flex-col gap-2 p-3
                        bg-white/90 backdrop-blur-md
                        rounded-2xl shadow-xl border
                    "
                >
                    {tools.map((tool) => {
                        const Icon = tool.icon;
                        const isActive =
                            toolTypeSelected === tool.type;

                        return (
                            <button
                                key={tool.type}
                                title={tool.title}
                                onClick={() => {
                                    handleClick(tool.type);
                                    setMobileOpen(false);
                                }}
                                className={`p-3 rounded-xl transition-all duration-200
                                    ${isActive
                                        ? "bg-black text-white"
                                        : "hover:bg-gray-100"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                            </button>
                        );
                    })}

                    <button
                        onClick={handleClear}
                        className="p-3 rounded-xl text-red-500 hover:bg-red-50"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* DESKTOP TOOLBAR */}
            <div className="hidden lg:flex fixed top-4 left-1/2 -translate-x-1/2 z-50">
                <div
                    className="
                        flex items-center gap-1.5 p-2
                        bg-white/90 backdrop-blur-md
                        border rounded-2xl shadow-xl
                    "
                >
                    {tools.map((tool) => {
                        const Icon = tool.icon;
                        const isActive =
                            toolTypeSelected === tool.type;

                        return (
                            <button
                                key={tool.type}
                                onClick={() => handleClick(tool.type)}
                                title={tool.title}
                                className={`p-2 rounded-xl transition-all duration-200 active:scale-90
                                    ${isActive
                                        ? "bg-black text-white shadow-md scale-105"
                                        : "hover:bg-gray-100 text-gray-600"
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                            </button>
                        );
                    })}

                    <div className="h-6 w-[1px] bg-gray-300 mx-1" />

                    <button
                        onClick={handleClear}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-50"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </>
    );
}

export default WhiteboardMenu;