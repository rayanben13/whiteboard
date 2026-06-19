import { io, Socket } from "socket.io-client";
import { elementType } from "../constants/Types";
import { deleteCursor, setCursor } from "../features/cursor/cursorSlice";
import { setElement, updateElement } from "../features/whiteboard/whiteboardSlice";
import { store } from "../store/store";



let socket: Socket | null;
export const connectToWhiteboardServer = () => {
    if (socket?.connected) return;


    socket = io("http://localhost:3001");

    socket.on("connect", () => {
        if (!socket) return;
        console.log("connected to whiteboard server", socket.id);
    });

    socket.on("whiteboard-elements", (elements: elementType[]) => {
        store.dispatch(setElement(elements))
    })

    socket.on("update-element", (elementData: any) => {
        store.dispatch(updateElement(elementData))
    })

    socket.on("clear-all-elements", () => {
        store.dispatch(setElement([]));
    })

    socket.on("cursor-move", (cursorData: any) => {
        store.dispatch(setCursor(cursorData));
    })

    socket.on(
        "cursor-delete",
        (userId: any) => {
            store.dispatch(
                deleteCursor(userId)
            );
        }
    );

    socket.on("undo", (newElements: elementType[]) => {
        store.dispatch(setElement(newElements))
    })

    socket.on("redo", (newElements: elementType[]) => {
        store.dispatch(setElement(newElements))
    })
}

export const emitUpdateElement = (elementData: any) => {
    if (!socket) return;
    socket.emit("update-element", elementData)
}

export const emitClearAllElements = () => {
    if (!socket) return;
    socket.emit("clear-all-elements")
}

export const emitUndo = (newElements: elementType[]) => {
    if (!socket) return;
    socket.emit("undo", newElements)
}

export const emitRedo = (newElements: elementType[]) => {
    if (!socket) return;
    socket.emit("redo", newElements)
}

export const handleMouseMoveSocket = (
    x: number,
    y: number
) => {
    if (!socket) return;

    socket.emit(
        "cursor-move",
        {
            x,
            y,
            userId: socket.id,
        }
    );
};

export const handleDeleteCursor = () => {
    if (!socket) return;
    socket.emit("delete-cursor");
}