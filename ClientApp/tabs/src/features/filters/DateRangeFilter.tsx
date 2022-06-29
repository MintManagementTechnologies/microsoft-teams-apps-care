import * as React from 'react';
import {
   Flex, Button, FilterIcon, Text, Popup, FlexItem, DateRangeType, Datepicker
} from "@fluentui/react-northstar";
import { useAppDispatch, useTypedSelector, RootState  } from '../../store';
import { useTranslation } from 'react-i18next';

import { clearDateFilter, setFromDateFilter, setToDateFilter } from './dateRangeFilterSlice';

const DateRangeFilter = (props: { disabled?: boolean }): JSX.Element => {
    const { t, i18n } = useTranslation();
    const dispatch = useAppDispatch();
    const selectedFilterDate = useTypedSelector((state: RootState) => state.dateRangeFilter);
  
    const handleClear = (event: any) => {
        event.preventDefault();
        dispatch(clearDateFilter(''));
    }
 
    return (
       <Popup
          trigger={<Button disabled={props.disabled} className='mmt-filters-btn' text icon={<FilterIcon />} content={`${t(`common:filter.label.dateRange`)}`} />}
          content={
             <Flex column>
                <Flex vAlign='center'>
                   <Text content={`${t(`common:filter.label.dateRange`)}`} weight='bold' />
                   <FlexItem push>
                      <Button className='mmt-filtersClear-btn' as={Text} text primary content={`${t(`common:filter.clear`)}`}
                         onClick={(event) => handleClear(event)} />
                   </FlexItem>
                </Flex>
                <Flex column>
                    <Flex column>
                        <Text content={`${t(`common:filter.label.fromDate`)}`} weight='bold' />
                        <Datepicker input={{ clearable: true, }}
                            selectedDate={ selectedFilterDate.fromDate }
                            dateRangeType={DateRangeType.Day} 
                            onDateChange={(e, v) => { dispatch(setFromDateFilter(v?.value || null)); }}></Datepicker>
                    </Flex>
                    
                    <Flex column>
                        <Text content={`${t(`common:filter.label.toDate`)}`} weight='bold' />
                        <Datepicker 
                            input={{ clearable: true, }}
                            selectedDate={ selectedFilterDate.toDate }
                            dateRangeType={DateRangeType.Day} 
                            onDateChange={(e, v) => { dispatch(setToDateFilter(v?.value || null)); }}></Datepicker>
                    </Flex>     

                </Flex>
             </Flex>
          }
       />
    );
 }
 
 export default DateRangeFilter;