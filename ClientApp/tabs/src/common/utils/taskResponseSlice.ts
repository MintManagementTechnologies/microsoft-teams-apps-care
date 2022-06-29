import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    viewRequiresRefresh: false
};

const taskResponseSlice = createSlice({
    name: 'TaskResponse',
    initialState,
    reducers: {
        setViewRequireRefresh(state, action) {
            state.viewRequiresRefresh = action.payload;
            return state
        }
    }
});

export const { setViewRequireRefresh } = taskResponseSlice.actions;
export default taskResponseSlice.reducer
