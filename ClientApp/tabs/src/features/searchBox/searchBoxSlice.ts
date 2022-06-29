import { createSlice } from '@reduxjs/toolkit';

const initialState = '';

const searchBoxSlice = createSlice({
	name: 'searchBox',
	initialState,
	reducers: {
		searchQueryChanged(state, action) {
			state = action.payload;
         	return state;
		}
	},
})

export const { searchQueryChanged } = searchBoxSlice.actions;
export default searchBoxSlice.reducer
