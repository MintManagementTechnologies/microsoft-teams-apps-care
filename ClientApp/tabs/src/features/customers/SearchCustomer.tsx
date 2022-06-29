import { Button, Flex, Input } from "@fluentui/react-northstar";
import { getRouteParams } from '../../common/utils/sharedFunctions';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { customerViewModelUpdated } from './customerSlice';
import { blankCustomer, ICustomerModel, ICustomerViewModel } from './types';
import { useLazyGetCustomerQuery } from './customerService';
import * as microsoftTeams from "@microsoft/teams-js";
import PopupModalFooter from '../popupModal/PopupModalFooter';


const SearchCustomer = (): JSX.Element => {
   const { userScope, view } = getRouteParams(window.location.hash);
   const { action, id, groupId } = useParams<{ action: string, view: string, groupId: string, id: string }>();
   const { t } = useTranslation();
   const navigate = useNavigate();
   const dispatch = useAppDispatch();
   const [customerIdNo, setCustomerIdNo] = useState('');

   const [trigger, { isLoading: isLoadingGetCustomer, isFetching: isFetchingGetCustomer }] = useLazyGetCustomerQuery();

   const handleOnSubmit = (event: any) => {
      let customerViewModel:ICustomerViewModel  = {
         model: { ...blankCustomer, idNo: `${customerIdNo}` },
         isValid: false,
         formAction: ''
      }
      trigger(customerIdNo).unwrap().then((result: ICustomerModel) => {
         customerViewModel = {
            model: result,
            isValid: true, 
            formAction: 'edit'
         }
      }).catch((err: { status: number, data: any }) => {
         if (err.status === 404) {
            customerViewModel.isValid = false;
            customerViewModel.formAction = 'new';
         }
      }).finally(() => {
         if (customerViewModel.formAction !== '') {
            const nxtAction = 'new';
            const nxtPath = `/${userScope}/${view}/${nxtAction}/${groupId}/${id}`;
            dispatch(customerViewModelUpdated(customerViewModel));
            navigate(`${nxtPath}?customerIdNo=${customerIdNo}`);
         }
      })
   }

   const handleOnCancel = (event: any) => {
      microsoftTeams.tasks.submitTask("cancel");
      microsoftTeams.tasks.submitTask();
   }

   const formIsValid = customerIdNo && customerIdNo.length > 0;
   const isLoading = isLoadingGetCustomer || isFetchingGetCustomer;
   return (
      <>
         <Flex className='mmt-customer-search' column>
            <Input
               label={`${t('form.customerIdNo.label')}`}
               placeholder={t('form.customerIdNo.placeholder')}
               onChange={(event, ctrl) => setCustomerIdNo(ctrl?.value || '')}
               fluid
            />
         </Flex>
         <PopupModalFooter>
               <Button
                  content={t('common:button.cancel')}
                  onClick={(event) => handleOnCancel(event)}
               />
               <Button
                  content={t(`common:button.searchEntity`, { entity: t(`entity.customer`, { count: 1 }) })}
                  onClick={(event) => handleOnSubmit(event)}
                  disabled={!formIsValid || isLoading}
                  loading={isLoading}
                  primary
               />
         </PopupModalFooter>
      </>
   );
}

export default SearchCustomer;