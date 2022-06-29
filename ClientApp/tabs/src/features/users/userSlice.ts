import { createSelector, createSlice } from '@reduxjs/toolkit';
import { currentUserUPN } from '../../common/utils/commonVariables';
import { getLocale } from '../../common/utils/sharedFunctions';

const initialState = {
   title: '',
   upn: currentUserUPN,
   id: '',
   locale: getLocale(),
   groupId: '',
   channelId: '',
};

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		userDetailsChanged(state, action) {
         const { title, upn, id, groupId, channelId, locale } = action.payload;
         state.title = title || state.title;
         state.upn = upn || state.upn;
         state.id = id || state.id;
         state.locale = locale || state.locale;
         state.groupId = groupId || state.groupId;
         state.channelId = channelId || state.channelId;
         return state;
		}
	},
})

export const { userDetailsChanged } = userSlice.actions;
export default userSlice.reducer

export const selectCurrentUser = createSelector(
   [(state: any) => state.user],
   (user) => user
);