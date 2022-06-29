import * as React from 'react';
import { gridCellWithFocusableElementBehavior, Pill, TableRow, Text } from '@fluentui/react-northstar';
import { differenceInDays, formatDistance } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getLocaleDate } from '../../common/utils/sharedFunctions';
import StatusPill from '../../components/common/statusPill/StatusPill';
import { IITTicketModel } from './types';
import ListItemActions from './actions/ListItemActions';


const ITTicketRow = (props: { item: IITTicketModel }): JSX.Element => {
   const { item } = props;

   const cellItems = [
      {
         content: item.title,
         truncateContent: true,
         key: `col-title-${item.id}`, 
         styles: {
            maxWidth: '350px',
         }
      },
      {
         content: <StatusPill stateEnum={item.state} />,
         truncateContent: true,
         key: `col-status-index-${item.id}`,
         styles: {
            maxWidth: '200px',
         }
      },
      {
         content: <Text content={ item.ticketCategory } />,
         truncateContent: true,
         key: `col-category-${item.id}`,
         styles: {
            maxWidth: '200px',
         }
      },
      {
         content: <Text content={ item.priorityName } />,
         truncateContent: true,
         key: `col-priority-${item.id}`,
         styles: {
            maxWidth: '200px',
         }
      },
      {
         className: 'd-none d-lg-flex',
         content: <Text content={getLocaleDate(new Date(item.createdAt || '').getTime(), 'dd MMMM yyyy')} timestamp/>,
         truncateContent: true,
         key: `col-createdTimestamp-${item.id}`,
         styles: {
            maxWidth: '200px',
         }
      },
      {
         content: <ListItemActions item={item} />,
         key: `col-actions-${item.id}`,
         styles: {
            maxWidth: '100px',
         },
         accessibility: gridCellWithFocusableElementBehavior,
         onClick: (e: any) => {
            e.stopPropagation()
         }
      },
   ]

   return <TableRow className='mmt-table-row' items={cellItems} />;
}

export default ITTicketRow;