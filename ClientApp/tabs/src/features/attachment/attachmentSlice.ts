import {
   createSelector,
   createSlice,
} from '@reduxjs/toolkit';
import { RootState } from '../../store';

const initialState: {isValid: boolean} = {
   isValid: false,
}

const attachmentSlice = createSlice({
   name: 'attachment',
   initialState,
   reducers: {
      attachmentValidated(state, action) {
         const { isValid } = action.payload
         state.isValid = isValid;
      },
   },
   // extraReducers(builder) {
   //   builder
   //     .addCase(addNewLevel.fulfilled, (state, action) => {
   //       // Add any fetched posts to the array
   //       actorLevelsAdapter.addOne(state, action.payload)
   //     })
   // },
})

export const { attachmentValidated } = attachmentSlice.actions;
export default attachmentSlice.reducer