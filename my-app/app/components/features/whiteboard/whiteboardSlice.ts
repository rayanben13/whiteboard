import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import { elementType, ToolTypes } from "../../constants/Types";

interface State {
  tool: ToolTypes;
  elements: elementType[];
  past: elementType[][];
  future: elementType[][];
  color: string;
}
const initialState: State = {
  tool: ToolTypes.None,
  color: '',
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
      if (!state.elements) {
        state.elements = [];
      }

      const plainState = current(state);
      const plainElements = plainState.elements;

      state.past.push(structuredClone(plainElements));
      state.future = [];

      const { id } = action.payload;
      const index = state.elements.findIndex(el => el.id === id);

      if (index === -1) {
        state.elements.push(action.payload);
      } else {
        state.elements[index] = action.payload;
      }
    },
    setElement(state, action) {
      state.elements = action.payload;
    },
    setColor(state, action) {
      state.color = action.payload;
    },
    changeSelectedElementsColor(state, action) {
      const { ids, color } = action.payload;


      state.elements = state.elements.map((el) =>
        ids.includes(el.id)
          ? { ...el, color }
          : el
      );
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
        // emitUndo(state.elements)
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

      // emitRedo(state.elements)
    }
  },
});

export const { setTool, updateElement, setElement, undo, redo, saveHistory, setColor, changeSelectedElementsColor } = whiteboardSlice.actions;

export default whiteboardSlice.reducer;