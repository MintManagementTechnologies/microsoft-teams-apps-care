import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedViewType: 'list'
};

const viewTypeSlice = createSlice({
    name: 'ViewType',
    initialState,
    reducers: {
        viewTypeChanged(state, action) {
            state.selectedViewType = action.payload;
            return state
        }
    }
});

export const { viewTypeChanged } = viewTypeSlice.actions;
export default viewTypeSlice.reducer
