
import { configureStore, ConfigureStoreOptions } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import taskResponseSlice from './common/utils/taskResponseSlice';
import teamChannelsSlice from './common/utils/teamChannelsSlice';
import ticketCategorySlice from './common/utils/ticketCategorySlice';
import townSlice from './common/utils/townSlice';
import caseSlice from './features/cases/caseSlice';
import customerSlice from './features/customers/customerSlice';
import dateRangeFilterSlice from './features/filters/dateRangeFilterSlice';
import filtersSlice from './features/filters/filtersSlice';
import searchBoxSlice from './features/searchBox/searchBoxSlice';
import ticketSlice from './features/tickets/ticketSlice';
import userSlice from './features/users/userSlice';
import viewTypeSlice from './features/viewType/ViewTypeSlice';
import { baseApi, baseGraphApi } from './services';

export const createStore = (options?: ConfigureStoreOptions['preloadedState'] | undefined) =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      [baseGraphApi.reducerPath]: baseGraphApi.reducer,
      filters: filtersSlice,
      search: searchBoxSlice,
      currentUser: userSlice,
      customer: customerSlice,
      case: caseSlice,
      viewType: viewTypeSlice,
      taskResponse: taskResponseSlice,
      teamChannels: teamChannelsSlice,
      towns: townSlice,
      dateRangeFilter: dateRangeFilterSlice,
      ticket: ticketSlice,
      ticketCategories: ticketCategorySlice
    },
    //middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware, baseGraphApi.middleware),
    ...options,
  });

export const store = createStore();

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export type RootState = ReturnType<typeof store.getState>;
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;