import { createSlice } from "@reduxjs/toolkit";

const deleteModalSlice = createSlice({
    name: "deleteSlice",
    initialState: {show: false},
    reducers: {
        toggleModal: (state, action)=>{
            state.show = action.payload;
        }
    }
})


export const {toggleModal} = deleteModalSlice.actions;
export default deleteModalSlice.reducer;
