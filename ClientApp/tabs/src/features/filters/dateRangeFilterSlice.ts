import { createSlice } from '@reduxjs/toolkit';

export interface IDateRange {
    fromDate: Date|undefined
    toDate: Date|undefined
}

const getDefaultFromDate = (): Date => {
    var date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
}

const initialState : IDateRange = {
    fromDate: getDefaultFromDate(),
    toDate: undefined
};

const dateRangeFilterSlice = createSlice({
    name: 'dateRangeFilters',
    initialState,
    reducers: {
        setFromDateFilter(state, action) {
            state.fromDate = action.payload;
            return state;
        },
        setToDateFilter(state, action) {
            state.toDate = action.payload;
            return state;
        },
        clearDateFilter(state, action) {
            state.toDate = undefined;
            state.fromDate = undefined;
            return state;
        }
    }
})

export const { setFromDateFilter, setToDateFilter, clearDateFilter } = dateRangeFilterSlice.actions;
export default dateRangeFilterSlice.reducer