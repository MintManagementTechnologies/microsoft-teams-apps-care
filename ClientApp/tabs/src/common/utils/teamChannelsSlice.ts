import { createSlice } from '@reduxjs/toolkit';
import { ITeamChannelDetail } from '../types/user';


interface teamChannelState {
    channels: ITeamChannelDetail[]
}

const initialState : teamChannelState = {
    channels: []
};

const teamChannelsSlice = createSlice({
    name: 'TeamChannels',
    initialState,
    reducers: {
        setTeamChannels(state, action) {
            state.channels = action.payload;
            state.channels = state.channels
                .map(i => ({ id: i.id, displayName: (i.displayName === 'General' ? 'All Directorates' : i.displayName), owners: i.owners, members: i.members, actualName: i.actualName }))
                .sort((a, b) => {
                    if (a.displayName > b.displayName) return 1;
                    if (a.displayName < b.displayName) return -1;
                    return 0;
                });
            return state
        }
    }
});

export const { setTeamChannels } = teamChannelsSlice.actions;
export default teamChannelsSlice.reducer
