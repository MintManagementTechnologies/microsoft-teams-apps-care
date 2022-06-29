import { createSlice } from '@reduxjs/toolkit';
import { ITown } from '../types/town';

interface townState {
    towns: ITown[]
}

const initialState : townState = {
    towns: []
};

const townsSlice = createSlice({
    name: 'Towns',
    initialState,
    reducers: {
        setTowns(state, action) {
            state.towns = action.payload;
            return state
        }
    }
});

export const { setTowns } = townsSlice.actions;
export default townsSlice.reducer
