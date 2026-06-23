
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway
} from "@nestjs/websockets";

import { Socket } from "socket.io";

let elements: any[] = [];

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})

export class WhiteboardGateway implements OnGatewayConnection, OnGatewayDisconnect {

  handleConnection(client: Socket) {
    console.log(client.id, "user connected");
    client.emit("whiteboard-elements", elements);
  }

  handleDisconnect(client: Socket) {
    console.log(client.id, "user disconnected");
  }

  @SubscribeMessage("update-element")
  handleUpdateElement(client: Socket, { elementData, roomId }: any) {
    const existingElementIndex = elements.findIndex((el: any) => el.id === elementData.id);

    if (existingElementIndex !== -1) {
      elements[existingElementIndex] = elementData;
    } else {
      elements.push(elementData);
    }
    client.to(roomId).emit("update-element", elementData);
  }

  @SubscribeMessage("clear-all-elements")
  handleClearAllElements(client: Socket, roomId: string) {
    elements = [];
    client.to(roomId).emit("clear-all-elements", elements);
  }

  @SubscribeMessage("cursor-move")
  handleCursorMove(client: Socket, cursorData: any) {
    if (cursorData?.userId !== client.id) {
      client.to(cursorData.roomId).emit("cursor-move", cursorData);
    }
  }

  @SubscribeMessage("undo")
  handleUndo(client: Socket, { newElements, roomId }: { newElements: any[], roomId: string }) {
    elements = newElements;
    client.to(roomId).emit("undo", elements);
  }

  @SubscribeMessage("redo")
  handleRedo(client: Socket, { newElements, roomId }: { newElements: any[], roomId: string }) {
    elements = newElements;
    client.to(roomId).emit("redo", elements);
  }

  @SubscribeMessage(
    "delete-cursor"
  )
  handleCursorDelete(
    client: Socket,
    roomId: string
  ) {
    client.to(roomId).emit(
      "cursor-delete",
      client.id
    );
  }


  @SubscribeMessage("room-join")
  handleRoomJoin(client: Socket, roomId: string) {
    client.join(roomId);
    console.log(client.id, "joined room", roomId);
  }
}