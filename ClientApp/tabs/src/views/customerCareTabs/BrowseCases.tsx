import { ArrowDownIcon, ArrowUpIcon, Flex, Table, TableRow, Text, Button, ExcelColorIcon } from '@fluentui/react-northstar';
import { useTranslation } from 'react-i18next';
import { useTypedSelector, RootState } from '../../store';
import { ICustomerCaseViewModel } from '../../features/customerCases/types';
import Loader from '../../components/common/Loader';
import CustomerCaseRow from '../../features/customerCases/CustomerCaseRow';
import CustomerCaseCardView from '../../features/customerCases/CustomerCaseCardView';
import "../../components/common/list/List.scss";
import { useEffect, useState } from 'react';
import { IColumnSort } from '../../common/types/columnSort';
import exportFromJSON from 'export-from-json'
import { getStatusOptions } from '../../common/utils/formVariables';

const BrowseCases = (props: { items: ICustomerCaseViewModel[], isLoading: boolean, onSortChanged: (sort: IColumnSort) => void }): JSX.Element => {
   const { items, isLoading, onSortChanged } = props;
   const rootStateSelectedViewType = useTypedSelector((state: RootState) => state.viewType);
   const towns = useTypedSelector((state: RootState) => state.towns);
   const { t } = useTranslation(); 
   const [ sortColumn, setSortColumn ] = useState('');
   const [ sortDirection, setSortDirection ] = useState('asc');
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
      key: 'browseCases-header',
      items: [
         {
            content: getColumnHeader( 'title', t('common:header.title') ),
            key: 'browseCases-h-title',
            styles: {
               maxWidth: '350px',
               cursor: 'pointer'
            },
            onClick: (e: any) => onColumnHeaderClick(e, 'title')
         },
         {
            content: getColumnHeader( 'state', t('common:header.status') ),
            key: 'browseCases-h-status',
            styles: {
               maxWidth: '200px',
               cursor: 'pointer'
            },
            onClick: (e: any) => onColumnHeaderClick(e, 'state')
         },
         {
            className: 'd-none d-sm-flex',
            content: getColumnHeader( 'channelName', t('common:header.assignedChannel') ),
            key: 'browseCases-h-assignedChannel',
            styles: {
               maxWidth: '200px',
               cursor: 'pointer'
            },
            onClick: (e: any) => onColumnHeaderClick(e, 'channelName')
         },
         {
            className: 'd-none d-md-flex',
            content: getColumnHeader( 'createdAt', t('common:header.createdAt') ),
            key: 'browseCases-h-createdAt',
            styles: {
               maxWidth: '200px',
               cursor: 'pointer'
            },
            onClick: (e: any) => onColumnHeaderClick(e, 'createdAt')
         },
         {
            content: t('common:header.viewOrAction'),
            key: 'browseCases-h-actions',
            styles: {
               maxWidth: '100px',
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
         {items.map(x => <CustomerCaseRow item={x} key={`customerCaseRow-${x.id}`} />)}
      </Table>
   }

   const renderCardView = () => {
      return <Flex gap="gap.small" wrap>
         {items.map(x => <CustomerCaseCardView item={x} key={`customerCaseRow-${x.id}`} />)}
      </Flex>
   }

   const exportToExcel = () => {
      const exportItems: any[] = items.map(i => ({
         Id: i.id,
         Title: i.title,
         Description: i.description,
         State: getStatusOptions().find(x => x.status === i.state)?.label,
         ReferenceNumber: i.referenceNo,
         IdNumber: i.idNo,
         Name: i.name,
         Surname: i.surname,
         MobileNumber: i.mobileNo,
         AlternativeNumber: i.alternativeNo,
         PhysicalAddress: i.physicalAddress,
         Town: towns.towns.find(x => x.id === i.town)?.townName,
         PostalCode: i.postalCode,
         LoggingMethod: i.loggingMethod,
         RequestedBy: i.requesterUPN,
         AssignedTo: i.assignToPersonUPN,
         CreatedAt: i.createdAt,
         LastUpdated: i.lastUpdate,
         Directorate: i.channelName
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
                  
                  { rootStateSelectedViewType.selectedViewType === "list" ? renderTableView() : renderCardView() }
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

export default BrowseCases;