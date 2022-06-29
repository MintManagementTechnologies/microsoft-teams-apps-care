/*

   Flow Explanation
   1) Wait for the teams to intialise before fetching the data. The teams from the state is used to check if the 
      channel that we are currently in is for the all directorates or not. This is then applied to the filter on the 
      backend call to limit the number of items. This will set the cases filter state that in turn call the fetch data

   2) Once the data is fetched from the backend, the data is enriched with the channel name. This is then sent to the pre-filtered state 

   3) If the pre-filtered items change, this is the time where the top filter is applied on the backend items, after the filtering is applied
      it will set the filtered items to be used in the view

*/
import { Flex } from '@fluentui/react-northstar';
import { useLazyGetAllCustomerCasesFilteredQuery } from '../../features/customerCases/customerCaseService';
import BrowseCases from './BrowseCases';
import { useTypedSelector, RootState, useAppDispatch } from '../../store';
import { useEffect, useState } from 'react';
import { setViewRequireRefresh } from '../../common/utils/taskResponseSlice';
import { ICustomerCaseViewModel } from '../../features/customerCases/types';
import { ICustomerCaseFilter } from '../../common/types/customerCaseFilter';
import { getChannelName, isAllDirectoratesChannel } from '../../common/utils/teamsChannelHelper';
import { filterCustomerCareCaseChannel, filterCustomerCareCaseStatus, filterCustomerCareCaseTitle } from '../../common/utils/customerCareFilter';
import { sortBy } from '../../common/utils/sharedFunctions';
import { IColumnSort } from '../../common/types/columnSort';

const TeamCasesWrapper = (): JSX.Element => {
   const dispatch = useAppDispatch();
   const currentCtx = useTypedSelector((state: RootState) => state.currentUser);
   const groupId = currentCtx?.groupId; // ON MY TAB SEND IN PROCESS VARIABLE
   const rootStateTaskResponse = useTypedSelector((state: RootState) => state.taskResponse);
   const teamChannels = useTypedSelector((state: RootState) => state.teamChannels);
   
   const searchFilter = useTypedSelector((state: RootState) => state.search);
   const viewFilter = useTypedSelector((state: RootState) => state.filters);
   const selectedFilterDate = useTypedSelector((state: RootState) => state.dateRangeFilter);
   const [casesFilter, setCasesFilter] = useState<ICustomerCaseFilter>({}); 

   const [ loadAllCustomerCases, { data: dataGetAllCustomerCases, isLoading: isLoadingGetAllCustomerCases, isFetching: isFetchingGetAllCustomerCases}] = useLazyGetAllCustomerCasesFilteredQuery();
   const [ preFilterItems, setPreFilterItems ] = useState<ICustomerCaseViewModel[]>([]) ;
   const [ filteredItems, setFilteredItems ] = useState<ICustomerCaseViewModel[]>([]);
   const [ sort, setSort ] = useState<IColumnSort|undefined>();
   
   // Refresh State Changed
   useEffect(() => {
      if (rootStateTaskResponse.viewRequiresRefresh === true) {
         fetchData();
         dispatch(setViewRequireRefresh(false));
      }
   }
   , [rootStateTaskResponse]);

   // Teams Channels: This is the start of the initial load and will 
   // check if the current team is all directorates to display the relevant cases
   useEffect(() => {
      if (teamChannels?.channels?.length > 0) {
         const initialFilter: ICustomerCaseFilter = 
         { 
            channelId: isAllDirectoratesChannel(teamChannels.channels, currentCtx.channelId) ? null : currentCtx.channelId,
            from: (selectedFilterDate.fromDate === undefined) ? null : selectedFilterDate.fromDate,
            to: (selectedFilterDate.toDate === undefined) ? null : selectedFilterDate.toDate,
         };
         setCasesFilter(initialFilter);
      }
   }, [teamChannels, selectedFilterDate]);

   // When the case filter changed, fetch the data from the backend
   useEffect(() => {
      fetchData();
   }, 
   [casesFilter])

   // The items from the Api has returned, set the additional properties on them
   useEffect(() => {
      expandCurrentItems();
   }, [dataGetAllCustomerCases]);

   useEffect(() => {

      var filteredItems = preFilterItems;
      for (let filter of viewFilter) {
         if (filter.field === 'status' && filter.value.length) {
            filteredItems = filterCustomerCareCaseStatus(filteredItems, filter.value);
         } else if (filter.field === 'channel' && filter.value.length) {
            filteredItems = filterCustomerCareCaseChannel(filteredItems, filter.value);
         }
      }
      filteredItems = filterCustomerCareCaseTitle(filteredItems, searchFilter);
      if (!!sort && sort.columnName !== '') {
         if (sort.sortDirection === 'asc') {
            // @ts-ignore
            filteredItems = filteredItems.sort((a,b) => (a[sort.columnName]?.toString() || '').toUpperCase() > (b[sort.columnName]?.toString() || '').toUpperCase() ? 1 : -1);
         } else {
            // @ts-ignore
            filteredItems = filteredItems.sort((a,b) => (a[sort.columnName]?.toString() || '').toUpperCase() > (b[sort.columnName]?.toString() || '').toUpperCase() || '' ? -1 : 1);
         }
      } else {
         filteredItems = filteredItems.sort((a,b) => sortBy(a.createdAt || '', b.createdAt || ''));
      }
      setFilteredItems(filteredItems);
   }, [preFilterItems, viewFilter, searchFilter , sort])

   const fetchData = async () => {
      loadAllCustomerCases({ groupId: groupId, filter: casesFilter });
   }

   const expandCurrentItems = () => {
      if ((dataGetAllCustomerCases || []).length == 0) return;
      var mappedItems = dataGetAllCustomerCases!.map(item => (
         {
            ...item, channelName: getChannelName(teamChannels.channels, item.channelId)
         } as ICustomerCaseViewModel));
      setPreFilterItems(mappedItems);
   }

   const onSortChanged = (sort: IColumnSort) => {
      setSort(sort);
   }


   const isLoading = isLoadingGetAllCustomerCases || isFetchingGetAllCustomerCases;
   return (
      <>
         <Flex fill column gap="gap.small">
            <BrowseCases onSortChanged={onSortChanged} items={filteredItems} isLoading={isLoading} />
         </Flex>
      </>
   );
}

export default TeamCasesWrapper;