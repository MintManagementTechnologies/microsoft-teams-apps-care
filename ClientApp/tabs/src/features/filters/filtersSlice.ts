import { createSlice } from '@reduxjs/toolkit';


export interface IFilterGroupOption {
   label: string,
   value: string
}
export interface IFilterGroup {

   title: string,
   fieldName: string
   options: IFilterGroupOption[]
}

export const FilterStatus : IFilterGroup = {
   title: 'status',
   fieldName: 'status',
   options: [
      { value: '0', label: 'common:filter.value.opened'}, 
      { value: "1", label: 'common:filter.value.in-progress'}, 
      { value: "2", label: 'common:filter.value.resolved' }, 
      { value: "3", label: 'common:filter.value.closed' }],
}

export const FilterChannel : IFilterGroup = {
   title: 'channel',
   fieldName: 'channel',
   options: [],
}

export const FilterCategory : IFilterGroup = {
   title: 'category',
   fieldName: 'category',
   options: [
       
   ],
}

export const FilterVisibility : IFilterGroup = {
   title: 'isVisible',
   fieldName: 'isVisible',
   options: [
      { value : 'false', label: 'common:filter.value.no'  },
      { value : 'true', label: 'common:filter.value.yes'  }
   ],
}

export const FilterPriority : IFilterGroup = {
   title: 'priority',
   fieldName: 'priority',
   options: [
      { value: '0', label: 'common:filter.value.low'}, 
      { value: '1', label: 'common:filter.value.medium'}, 
      { value: '2', label: 'common:filter.value.high'}, 
      { value: '3', label: 'common:filter.value.critical'}, 
   ],
} 

const initialState = [
   {
      field: 'status',
      value: ['0', '1', '2']
   },
   {
      field: 'channel',
      value: []
   },
   {
      field: 'category',
      value: []
   },
   {
      field: 'priority',
      value: []
   }

] as {field: string, value: string[]}[];

const filtersSlice = createSlice({
   name: 'filters',
   initialState,
   reducers: {
      filterChanged: {
         reducer(state, action) {
            let { fieldName, fieldValue, changeType } = action.payload
            const filtersState = state;
            const filterType = state.find(x => x.field === fieldName) as {field: string, value: string[]};
            switch (changeType) {
               case 'add': {
                  if (!filterType.value.includes(fieldValue)) {
                     filterType.value.push(fieldValue)
                  }
                  break;
               }
               case 'remove': {
                  //@ts-ignore
                  filterType.value = filterType?.value.filter((x) => x !== fieldValue );
                  break;
               }
               case 'clear': {
                  state = initialState;
                  break;
               }
               default:
                  return
            }
            return state;
         },
         prepare(fieldName, fieldValue, changeType): any {
            return {
               payload: { fieldName, fieldValue, changeType },
            }
         },
      },
      // filterChanged: {
      //    reducer(state, action) {
      //       let { selectedFilterKey,
      //          selectedFilterValue,
      //          isArray,
      //          changeType
      //       } = action.payload as { selectedFilterKey: string, selectedFilterValue: filterTypeOption, isArray: boolean, changeType: string };
      //       let filtersState = state
      //       switch (changeType) {
      //          case 'add': {
      //             if (!filtersState.has(selectedFilterKey)) {
      //                let filterValue = filtersState.get(selectedFilterKey);
      //                if (isArray) {
      //                   if (filterValue && !(filterValue as Array<typeof selectedFilterValue>).includes(selectedFilterValue)) {
      //                      (filterValue as Array<typeof selectedFilterValue>).push(selectedFilterValue);
      //                      filtersState.set(selectedFilterKey, filterValue);
      //                   }
      //                } else {
      //                   filtersState.set(selectedFilterKey, selectedFilterValue);
      //                }
      //             }
      //             break;
      //          }
      //          case 'remove': {
      //             if (!filtersState.has(selectedFilterKey)) {
      //                let filterValue = filtersState.get(selectedFilterKey);
      //                if (isArray) {
      //                   if (filterValue) {
      //                      let filterArray = (filterValue as Array<any>).filter(
      //                         (existingFilter) => existingFilter !== selectedFilterValue
      //                      );
      //                      filtersState.set(selectedFilterKey, filterArray);
      //                   }
      //                } else {
      //                   filtersState.delete(selectedFilterKey);
      //                }
      //             }
      //             state = filtersState;
      //             break;
      //          }
      //          case 'clear': {
      //             state.clear();
      //             break;
      //          }
      //          default:
      //             return
      //       }
      //    },
      //    prepare(selectedFilterKey: string, selectedFilterValue: filterTypeOption, allowMultiple: boolean, changeType: string): any {
      //       return {
      //          payload: { selectedFilterKey, selectedFilterValue, allowMultiple, changeType },
      //       }
      //    },
      //},
   },
})

export const { filterChanged } = filtersSlice.actions;
export default filtersSlice.reducer
