import { ArrowDownIcon, ArrowUpIcon, Button, ExcelColorIcon, Flex, Table, TableRow, Text } from '@fluentui/react-northstar';
import { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { IColumnSort } from '../../common/types/columnSort';
import Loader from '../../components/common/Loader';
import ITTicketRow from '../../features/itTickets/TicketRow';
import { IITTicketModel } from '../../features/itTickets/types';
import exportFromJSON from 'export-from-json'
import { getStatusOptions } from '../../common/utils/formVariables';
import { useTypedSelector, RootState } from '../../store';

const BrowseTickets = (props: { items: IITTicketModel[], isLoading: boolean, onSortChanged: (sort: IColumnSort) => void }): JSX.Element => {
   const { items, isLoading, onSortChanged } = props;
   const { t } = useTranslation();

   const [ sortColumn, setSortColumn ] = useState('');
   const [ sortDirection, setSortDirection ] = useState('asc');
   const ticketCategories = useTypedSelector((state: RootState) => state.ticketCategories);
   const fileName = 'download'  
   const exportType = 'xls' 

   const getColumnHeader = (columnName: string, columnLabel: string) => {
      return <Flex vAlign='center' gap='gap.medium'>
            <Text content={columnLabel}></Text>
            { columnName === sortColumn ? sortDirection === 'asc' ? <ArrowDownIcon size='smaller' /> : <ArrowUpIcon size='smaller' /> : <></> }
         </Flex>
   }

   const onColumnHeaderClick = (e: any, column: any) => {
      if (sortColumn === column) {
         if (sortDirection === 'asc') {
            setSortDirection('desc');
         } else {
            setSortDirection('asc');
         }
      } else {
         setSortColumn(column);
         setSortDirection('asc');
      }
   }
   
   useEffect(() => {
      // Update sort
      onSortChanged( {columnName: sortColumn, sortDirection: sortDirection });
   }, 
   [ sortColumn, sortDirection ])

   const header = { 
      className: 'mmt-header',
      key: 'browseTickets-header',
      items: [
         {
            content: getColumnHeader( 'title', t('common:header.title') ),
            key: 'browseTickets-h-title',
            styles: {
               maxWidth: '350px',
               cursor: 'pointer'
            },
            onClick: (e: any) => onColumnHeaderClick(e, 'title')
         },
         {
            content: getColumnHeader( 'state', t('common:header.status') ),
            key: 'browseTickets-h-status',
            styles: {
               maxWidth: '200px',
               cursor: 'pointer'
            },
            onClick: (e: any) => onColumnHeaderClick(null, 'state')
         },
         {
            content: getColumnHeader( 'category', t('common:header.ticketCategory') ),
            key: 'browseTickets-h-category',
            styles: {
               maxWidth: '200px',
               cursor: 'pointer'
            },
            onClick: (e: any) => onColumnHeaderClick(null, 'category')
         },
         {
            content: getColumnHeader( 'priority', t('common:header.priority') ),
            key: 'browseTickets-h-priority',
            styles: {
               maxWidth: '200px',
               cursor: 'pointer'
            },
            onClick: (e: any) => onColumnHeaderClick(null, 'priority')
         },
         {
            className: 'd-none d-md-flex',
            content: getColumnHeader( 'createdAt', t('common:header.createdAt') ),
            key: 'browseTickets-h-createdAt',
            styles: {
               maxWidth: '200px',
               cursor: 'pointer'
            },
            onClick: (e: any) => onColumnHeaderClick(null, 'createdAt')
         },
         {
            content: t('common:header.viewOrAction'),
            key: 'browseCases-h-actions',
            styles: {
               maxWidth: '100px'
            }
         },
      ],
   }

   const renderTableView = () => {
      return <Table
         className={`mmt-table`}
         compact
         variables={{ cellContentOverflow: 'none' }}
         aria-label='Nested navigation'>
         <TableRow header className='mmt-table-header' items={header.items} />
         {items.map(x => <ITTicketRow item={x} key={`itTicketRow-${x.id}`} />)}
      </Table>
   }

   const exportToExcel = () => {
      const exportItems: any[] = items.map(i => ({
         Id: i.id,
         Title: i.title,
         Description: i.description,
         State: getStatusOptions().find(x => x.status === i.state)?.label,
         ReferenceNumber: i.referenceNo,
         Priority: i.priorityName,
         Category: i.ticketCategory,
         RequestedBy: i.requesterUPN,
         AssignedTo: i.assignedToUPN,
         CreatedAt: i.createdAt,
         LastUpdated: i.lastUpdate
      }) as any);
      exportFromJSON({ data: exportItems, fileName, exportType });
   }

   return (
      <div>
         {isLoading ? <Loader message={t('entity.case', { count: 0 })} />
            :
            (items.length > 0 ?
               <>
                  <Flex vAlign='center' hAlign='end' gap='gap.medium'>
                     <Button primary content={`Export`} onClick={() => exportToExcel()} 
                        style={{ marginTop: '0.7rem' }}
                        icon={<ExcelColorIcon />}
                        iconPosition="before"></Button>
                  </Flex>
                  { renderTableView() }
               </>
               :
               <Flex fill hAlign='center' padding='padding.medium'>
                  <Text content={t('common:error.noItems', { entity: t('common:entity.request', { count: 0 }) })} size='large' weight={'semibold'} />
               </Flex>
            )
         }
      </div>
   );
 }
 
 export default BrowseTickets;