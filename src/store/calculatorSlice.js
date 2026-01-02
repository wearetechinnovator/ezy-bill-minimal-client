import { createSlice } from "@reduxjs/toolkit";

const calculatorSlice = createSlice({
  name: 'calculator',
  initialState: {
    show: 0 //0=`Close`, 1=`Open`, 2=`Minimize`
  },
  reducers: {
    calcToggle: (state, action) => {
      state.show = action.payload;
    },
  }
})

export const { calcToggle } = calculatorSlice.actions;
export default calculatorSlice.reducer;
