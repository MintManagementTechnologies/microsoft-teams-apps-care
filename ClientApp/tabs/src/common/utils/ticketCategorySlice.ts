import { createSlice } from '@reduxjs/toolkit';
import { ITicketCategory } from '../types/ticketCategory';


interface ITicketCategoryState {
    ticketCategories: ITicketCategory[]
}

const initialState : ITicketCategoryState = {
    ticketCategories: []
};

const ticketCategoriesSlice = createSlice({
    name: 'TicketCategories',
    initialState,
    reducers: {
        setTicketCategories(state, action) {
            state.ticketCategories = action.payload;
            return state
        }
    }
});

export const { setTicketCategories } = ticketCategoriesSlice.actions;
export default ticketCategoriesSlice.reducer
