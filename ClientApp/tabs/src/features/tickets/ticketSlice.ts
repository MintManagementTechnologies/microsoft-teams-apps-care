import { createSelector, createSlice } from '@reduxjs/toolkit';
import { blankTicket, ITicketViewModel } from './types';

const initialState: ITicketViewModel = {
   model: blankTicket,
   isValid: false,
   isLoading: false,
   formAction: 'new'
}

const ticketSlice = createSlice({
   name: 'ticket',
   initialState,
   reducers: {
      ticketSelected(state, action) {
         state.model = action.payload;
         return state;
      },
      ticketUpdated(state, action) {
         state.model = action.payload;
         return state;
      },
      ticketViewModelUpdated(state, action) {
         const { model, isValid, formAction } = action.payload;
         state.model = model || state.model;
         state.isValid = isValid || state.isValid;
         state.formAction = formAction || state.formAction;
         return state;
      },
      ticketIsLoading(state, action) {
         const { isLoading } = action.payload;
         state.isLoading = isLoading;
      },
   }
})

export const { ticketSelected, ticketUpdated, ticketViewModelUpdated, ticketIsLoading } = ticketSlice.actions;
export default ticketSlice.reducer

export const selectCaseViewModel = createSelector(
   [(state: any) => state.case],
   (caseViewModel: ITicketViewModel) => caseViewModel
);

export const selectCase = createSelector(
   [(state: any) => state.case],
   (caseViewModel: ITicketViewModel) => caseViewModel.model
);