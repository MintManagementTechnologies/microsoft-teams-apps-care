import { Flex } from '@fluentui/react-northstar';
import { useEffect, useState } from 'react';
import { IColumnSort } from '../../common/types/columnSort';
import { ITicketFilter } from '../../common/types/ticketFilter';
import { getPriorityOptions } from '../../common/utils/formVariables';
import { filterITTicketCategory, filterITTicketPriority, filterITTicketStatus, filterITTicketTitle, filterITTicketVisibility } from '../../common/utils/itTicketFilter';
import { sortBy } from '../../common/utils/sharedFunctions';
import { setViewRequireRefresh } from '../../common/utils/taskResponseSlice';
import { useLazyGetAllTicketsFilteredQuery } from '../../features/itTickets/ticketsService';
import { IITTicketModel } from '../../features/itTickets/types';
import { useAppDispatch, useTypedSelector, RootState } from '../../store';
import BrowseTickets from './BrowseTickets';

const TeamRequestsWrapper = (): JSX.Element => {
   const dispatch = useAppDispatch();
   const currentCtx = useTypedSelector((state: RootState) => state.currentUser);
   const groupId = (currentCtx?.groupId == '' ? process.env.REACT_APP_ITSUPPORT_GROUPID ?? '' : currentCtx?.groupId); 
   const rootStateTaskResponse = useTypedSelector((state: RootState) => state.taskResponse);
   
   const searchFilter = useTypedSelector((state: RootState) => state.search);
   const viewFilter = useTypedSelector((state: RootState) => state.filters);
   const selectedFilterDate = useTypedSelector((state: RootState) => state.dateRangeFilter);
   const ticketCategory = useTypedSelector((state: RootState) => state.ticketCategories);

   const [ ticketFilter, setTicketFilter ] = useState<ITicketFilter>({}); 

   const [ loadAllTickets, { data: dataGetAll, isLoading: isLoadingData, isFetching: isFetchingData }] = useLazyGetAllTicketsFilteredQuery();
   const [ preFilterItems, setPreFilterItems ] = useState<IITTicketModel[]>([]) ;
   const [ filteredItems, setFilteredItems ] = useState<IITTicketModel[]>([]);
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
      const initialFilter: ITicketFilter = 
      { 
         from: (selectedFilterDate.fromDate === undefined) ? null : selectedFilterDate.fromDate,
         to: (selectedFilterDate.toDate === undefined) ? null : selectedFilterDate.toDate,
      };
      setTicketFilter(initialFilter);
   }, [selectedFilterDate]);

   useEffect(() => {
      fetchData();
   }, 
   [ ticketFilter ]) 


   useEffect(() => {
      expandCurrentItems();
   }, [dataGetAll]);

   // When the case filter changed, fetch the data from the backend
   const expandCurrentItems = () => {
      if ((dataGetAll || []).length == 0) return;
      var mappedItems = dataGetAll!.map(item => (
         {
            ...item, 
            ticketCategory: ticketCategory.ticketCategories.find(x => x.id === item.category)?.categoryName || 'Error',
            priorityName: getPriorityOptions().find(x => x.key === item.priority)?.header || 'Error'
         } as IITTicketModel));
      setPreFilterItems(mappedItems);
   }

   useEffect(() => {
      var processItems = preFilterItems;
      for (let filter of viewFilter) {
         if (filter.field === 'status' && filter.value.length) {
            processItems = filterITTicketStatus(processItems, filter.value);
         } else if (filter.field === 'category' && filter.value.length) {
            processItems = filterITTicketCategory(processItems, filter.value);
         } else if (filter.field === 'priority' && filter.value.length) {
            processItems = filterITTicketPriority(processItems, filter.value);
         } 
         // else if (filter.field === 'isVisible' && filter.value.length) {
         //    processItems = filterITTicketVisibility(processItems, filter.value);
         // }
      }
      
      processItems = filterITTicketTitle(processItems, searchFilter);
      
      if (!!sort && sort.columnName !== '') {
         if (sort.sortDirection === 'asc') {
            // @ts-ignore
            processItems = processItems.sort((a,b) => (a[sort.columnName]?.toString() || '').toUpperCase() > (b[sort.columnName]?.toString() || '').toUpperCase() ? 1 : -1);
         } else {
            // @ts-ignore
            processItems = processItems.sort((a,b) => (a[sort.columnName]?.toString() || '').toUpperCase() > (b[sort.columnName]?.toString() || '').toUpperCase() || '' ? -1 : 1);
         }
      } else {
         processItems = processItems.sort((a,b) => sortBy(a.createdAt || '', b.createdAt || ''));
      }

      setFilteredItems(processItems);
   },  [ preFilterItems, viewFilter, searchFilter, dataGetAll, sort ])
   
   const onSortChanged = (sort: IColumnSort) => {
      setSort(sort);
   }

   const fetchData = async () => {
      loadAllTickets({ groupId: groupId, filter: ticketFilter });
   }

   const isLoading = isLoadingData || isFetchingData;

   return (
      <>
         <Flex fill column gap="gap.small">
            <BrowseTickets onSortChanged={onSortChanged} items={filteredItems} isLoading={isLoading} />
         </Flex>
      </>
   );
}

export default TeamRequestsWrapper;