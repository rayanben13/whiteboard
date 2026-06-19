
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
  handleUpdateElement(client: Socket, elementData: any) {
    const existingElementIndex = elements.findIndex((el: any) => el.id === elementData.id);

    if (existingElementIndex !== -1) {
      elements[existingElementIndex] = elementData;
    } else {
      elements.push(elementData);
    }
    client.broadcast.emit("update-element", elementData);
  }

  @SubscribeMessage("clear-all-elements")
  handleClearAllElements(client: Socket) {
    elements = [];
    client.broadcast.emit("clear-all-elements", elements);
  }

  @SubscribeMessage("cursor-move")
  handleCursorMove(client: Socket, cursorData: any) {
    client.broadcast.emit("cursor-move", cursorData);
  }

  @SubscribeMessage("undo")
  handleUndo(client: Socket, newElements: any) {
    elements = newElements;
    client.broadcast.emit("undo", elements);
  }

  @SubscribeMessage("redo")
  handleRedo(client: Socket, newElements: any) {
    elements = newElements;
    client.broadcast.emit("redo", elements);
  }

  @SubscribeMessage(
    "delete-cursor"
  )
  handleCursorDelete(
    client: Socket
  ) {
    client.broadcast.emit(
      "cursor-delete",
      client.id
    );
  }
}