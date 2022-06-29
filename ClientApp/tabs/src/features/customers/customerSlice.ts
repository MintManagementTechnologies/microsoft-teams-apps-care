import { createSelector, createSlice } from '@reduxjs/toolkit';
import { ICustomerViewModel, blankCustomer } from './types';

const initialState: ICustomerViewModel = {
   model: blankCustomer,
   isValid: false,
   isLoading: false,
   formAction: 'new'
}

const customerSlice = createSlice({
   name: 'customer',
   initialState,
   reducers: {
      customerSelected(state, action) {
         state.model = action.payload;
         return state;
      },
      customerUpdated(state, action) {
         state.model = action.payload;
         return state;
      },
      customerViewModelUpdated(state, action) {
         const { model, isValid, formAction } = action.payload;
         state.model = model || state.model;
         state.isValid = isValid || state.isValid;
         state.formAction = formAction || state.formAction;
         return state;
      },
      customerIdNoUpdated(state, action) {
         const { idNo } = action.payload;
         state.model.idNo = idNo || state.model.idNo;
         return state;
      },
      customerIsLoading(state, action) {
         const { isLoading } = action.payload;
         state.isLoading = isLoading;
      },
   },
})

export const { customerSelected, customerUpdated, customerViewModelUpdated, customerIdNoUpdated, customerIsLoading } = customerSlice.actions;
export default customerSlice.reducer

export const selectCustomerViewModel = createSelector(
   [(state: any) => state.customer],
   (customerViewModel: ICustomerViewModel) => customerViewModel
);

export const selectCustomer = createSelector(
   [(state: any) => state.customer],
   (customerViewModel: ICustomerViewModel) => customerViewModel.model
);