import { createSlice } from "@reduxjs/toolkit"

type otherCusorType = {
    cursor: { x: number, y: number, userId: string }[]
}
const initialState: otherCusorType = {
    cursor: []
}
export const cursorSlice = createSlice({
    name: "cursor",
    initialState,
    reducers: {
        setCursor: (state, action) => {
            const index = state.cursor.findIndex((cursor) => cursor.userId === action.payload.userId)
            if (index === -1) {
                state.cursor.push(action.payload)
            } else {
                state.cursor[index] = action.payload
            }
        },
        deleteCursor: (state, action) => {
            state.cursor = state.cursor.filter((cursor) => cursor.userId !== action.payload)
        }
    }
})

export const { setCursor, deleteCursor } = cursorSlice.actions
export default cursorSlice.reducer