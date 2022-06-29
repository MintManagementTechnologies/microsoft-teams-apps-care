import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button, GridIcon, CalendarAgendaIcon, Flex, FlexItem, Text } from "@fluentui/react-northstar";
import { viewTypeChanged } from './ViewTypeSlice'
import { useAppDispatch, useTypedSelector, RootState } from '../../store';
import "./ViewType.scss";


const ViewType = (props: {}): JSX.Element => {
    const dispatch = useAppDispatch();
    const { t, i18n } = useTranslation();
    const rootStateSelectedViewType = useTypedSelector((state: RootState) => state.viewType);
    const [isGridViewSelected, setIsGridViewSelected] = useState((rootStateSelectedViewType.selectedViewType == 'grid'));

    const onViewTypeChangedHandler = (viewType: string) => {
        const isGridButtonClicked = (viewType === 'grid');
        setIsGridViewSelected(isGridButtonClicked);
    }

    useEffect(() => {
        dispatch(viewTypeChanged(isGridViewSelected ? 'grid': 'list'));
    }, 
    [isGridViewSelected]);


    return (<Flex className="mnt-view-type-container" vAlign='center'>
        <FlexItem>
            <Button icon={<GridIcon />} iconOnly tinted={isGridViewSelected} primary={isGridViewSelected}
                    onClick={(e) => onViewTypeChangedHandler('grid')} title={t('common:header:gridViewtype')} />
                    
        </FlexItem>
        <FlexItem>
            <Button icon={<CalendarAgendaIcon />} iconOnly tinted={!isGridViewSelected} primary={!isGridViewSelected}
                    onClick={(e) => onViewTypeChangedHandler('list')} title={t('common:header:listViewtype')} />
        </FlexItem>
    </Flex>);
    
}

export default ViewType;