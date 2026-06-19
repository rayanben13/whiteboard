import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import { elementType, ToolTypes } from "../../constants/Types";
import { emitRedo, emitUndo } from "../../socket/socket";

interface State {
  tool: ToolTypes;
  elements: elementType[];
  past: elementType[][];
  future: elementType[][];
}
const initialState: State = {
  tool: ToolTypes.None,
  past: [],
  future: [],
  elements: [],

};

const whiteboardSlice = createSlice({
  name: "whiteboard",
  initialState,

  reducers: {
    setTool: (state, action: PayloadAction<ToolTypes>) => {
      state.tool = action.payload;
    },
    updateElement(state, action) {
      const plainElements =
        current(state.elements);

      state.past.push(
        structuredClone(
          plainElements
        )
      );

      state.future = [];

      const { id } =
        action.payload;

      const index =
        state.elements.findIndex(
          el => el.id === id
        );

      if (index === -1) {
        state.elements.push(
          action.payload
        );
      } else {
        state.elements[index] =
          action.payload;
      }
    },
    setElement(state, action) {
      state.elements = action.payload;
    },

    saveHistory(state) {
      console.log("save")
      const plainElements =
        current(state.elements);

      state.past.push(
        structuredClone(
          plainElements
        )
      );

      state.future = [];
    },
    undo(state) {
      if (state.past.length === 0)
        return;

      const plainElements = current(state.elements);

      state.future.push(structuredClone(plainElements));
      const previous = state.past.pop();
      if (previous) {
        state.elements = previous;
        emitUndo(state.elements)
      }
    },
    redo(state) {
      if (
        state.future.length === 0
      ) return;

      const plainElements =
        current(state.elements);
      state.past.push(
        structuredClone(
          plainElements
        )
      );

      const next =
        state.future.pop();

      if (next) {
        state.elements = next;
      }

      emitRedo(state.elements)
    }
  },
});

export const { setTool, updateElement, setElement, undo, redo, saveHistory } = whiteboardSlice.actions;

export default whiteboardSlice.reducer;