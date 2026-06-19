import { configureStore } from "@reduxjs/toolkit";
import cursorReducer from "../features/cursor/cursorSlice";
import whiteboardReducer from "../features/whiteboard/whiteboardSlice";

export const store = configureStore({
  reducer: {
    whiteboard: whiteboardReducer,
    cursor: cursorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

// Types for TypeScript
export type RootState = ReturnType<
  typeof store.getState
>;

export type AppDispatch =
  typeof store.dispatch;