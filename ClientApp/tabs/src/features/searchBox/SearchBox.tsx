import * as React from 'react';
import { Input, SearchIcon } from "@fluentui/react-northstar";
import { useAppDispatch } from '../../store';
import { searchQueryChanged } from './searchBoxSlice';

import "./SearchBox.scss";
import { useEffect } from 'react';
import { log } from '../../common/utils/customConsoleLog';
import { useTranslation } from 'react-i18next';

const SearchBox = (props: {disabled?: boolean}): JSX.Element => {
   const { disabled } = props;
   const { t, i18n } = useTranslation();
    const dispatch = useAppDispatch();
    

   useEffect(() => {
      if (disabled) {
         log('useEffect - SearchBox', 'success');
         dispatch(searchQueryChanged(''));
      }
   }, [dispatch, disabled]);

    return (
        <Input inverted fluid role="search"
            placeholder={t('common:filter.placeholder.searchBy', {entity: t('common:header.title')})}
            icon={<SearchIcon />}
            onChange={(event: any) => dispatch(searchQueryChanged(event.target.value.toLowerCase()))}
            disabled={props.disabled} 
        // onChange={(event: any) => dispatch({ type: 'SEARCHTEXT_FILTERS', searchText: event.target.value.toLowerCase() })}
        />
    );
}

export default SearchBox;