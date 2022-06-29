import { createSelector, createSlice } from '@reduxjs/toolkit';
import { ICaseViewModel, blankCase } from './types';

const initialState: ICaseViewModel = {
   model: blankCase,
   isValid: false,
   isLoading: false,
   formAction: 'new'
}

const caseSlice = createSlice({
   name: 'case',
   initialState,
   reducers: {
      caseSelected(state, action) {
         state.model = action.payload;
         return state;
      },
      caseUpdated(state, action) {
         state.model = action.payload;
         return state;
      },
      caseViewModelUpdated(state, action) {
         const { model, isValid, formAction } = action.payload;
         state.model = model || state.model;
         state.isValid = isValid || state.isValid;
         state.formAction = formAction || state.formAction;
         return state;
      },
      caseIsLoading(state, action) {
         const { isLoading } = action.payload;
         state.isLoading = isLoading;
      },
   }
})

export const { caseSelected, caseUpdated, caseViewModelUpdated, caseIsLoading } = caseSlice.actions;
export default caseSlice.reducer

export const selectCaseViewModel = createSelector(
   [(state: any) => state.case],
   (caseViewModel: ICaseViewModel) => caseViewModel
);

export const selectCase = createSelector(
   [(state: any) => state.case],
   (caseViewModel: ICaseViewModel) => caseViewModel.model
);