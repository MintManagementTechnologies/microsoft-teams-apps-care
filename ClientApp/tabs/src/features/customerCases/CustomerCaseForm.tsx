import { Alert, Button, Flex, Label, Text } from "@fluentui/react-northstar";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { newId, newReferenceNumber } from "../../common/utils/sharedFunctions";
import CustomerForm from "../customers/CustomerForm";
import CaseForm from "../cases/CaseForm";
import * as microsoftTeams from "@microsoft/teams-js";
import PopupModalFooter from "../popupModal/PopupModalFooter";
import { useCreateCustomerCaseMutation, useLazyGetCustomerCaseQuery, useUpdateCustomerCaseMutation } from "./customerCaseService";
import Loader from "../../components/common/Loader";
import { ICustomerCaseModel } from "./types";
import { useTypedSelector, RootState } from "../../store";
import { ICaseModel, ICaseViewModel } from "../cases/types";
import { ICustomerModel, ICustomerViewModel } from "../customers/types";
import { useEffect, useState } from "react";
import { useSendNotificationJsonMutation } from "../../services/notificationService";
import { getCaseTypeOptions } from "../../common/utils/formVariables";
import { IAdaptiveCardTemplateDataCustomerCare } from "../../common/types/adaptiveCardTemplateData";
import { buildNewCustomerCaseCard, buildUpdatedCustomerCaseCard } from "../../common/adaptivecards/adaptiveCardBuilderCustomerCare";


const CustomerCaseForm = (): JSX.Element => {
   const { t } = useTranslation();
   const { action, groupId, id } = useParams<{ action: string, groupId: string, id: string }>();
   const [ customerIsValid, setCustomerIsValid ] = useState(false);
   const [ caseIsValid, setCaseIsValid ] = useState(false);
   const [ errorMsg, setErrorMsg ] = useState(''); 

   const currentCtx = useTypedSelector((state: RootState) => state.currentUser);
   const teamChannels = useTypedSelector((state: RootState) => state.teamChannels);

   const customerViewModel: ICustomerViewModel = useTypedSelector((state: RootState) => state.customer);
   const caseViewModel: ICaseViewModel = useTypedSelector((state: RootState) => state.case);

   const [trigger, { data: dataGetCustomerCase, isLoading: isLoadingGetCustomerCase, isFetching: isFetchingGetCustomerCase }] = useLazyGetCustomerCaseQuery();
   const [createCustomerCase, { isLoading: isLoadingCreateCustomerCase, isError: isErrorCreateCustomerCase }] = useCreateCustomerCaseMutation();
   const [updateCustomerCase, { isLoading: isLoadingUpdateCustomerCase, isError: isErrorUpdateCustomerCase }] = useUpdateCustomerCaseMutation();
   const [sendNotification, { isLoading: isLoadingSendNotification, isError: isErrorSendNotification }] = useSendNotificationJsonMutation();
   const [ caseClosed, setCaseClosed ] = useState(false);
   const [newTicketRef, setNewTicketRef] = useState(() => {
      return newReferenceNumber();
   })
   
   // This is put in place so the whole of the customer case model is not used to for the patching of the 
   // customer case
   const customerItem: ICustomerModel = (dataGetCustomerCase || customerViewModel.model);
   const caseItem: ICaseModel = (dataGetCustomerCase || caseViewModel.model);

   // Query existing case if in edit mode 
   useEffect(() => {
      if (action === 'new' || !id) return;
      if (id === 'new') return;
      trigger({groupId : groupId || '', id});
   }, [action, id, trigger]);

   // Customer Validation
   useEffect(() => {
      if (!customerViewModel) return;
      const newIsValid = [
         customerViewModel.model.idNo,
         customerViewModel.model.name,
         customerViewModel.model.surname,
         customerViewModel.model.town,
         customerViewModel.model.postalCode,
         customerViewModel.model.physicalAddress,
         customerViewModel.model.mobileNo
      ].every(Boolean);
      if (customerIsValid !== newIsValid) {
         setCustomerIsValid(newIsValid);
      }
   }, [customerViewModel, customerIsValid]);

   // Case Validation
   useEffect(() => {
      if (!caseViewModel) return;
      const newIsValid = [
         caseViewModel.model.title,
         caseViewModel.model.description,
         caseViewModel.model.category > -1,
         caseViewModel.model.loggingMethod,
         caseViewModel.model.channelId
      ].every(Boolean);
      if (caseIsValid !== newIsValid) {
         setCaseIsValid(newIsValid);
      }
   }, [caseViewModel, caseIsValid]);

   useEffect(() => {
    if (!dataGetCustomerCase) return;
    setCaseClosed(dataGetCustomerCase.state === 3);  
   }, 
   [dataGetCustomerCase])

   const submitNewCustomerCase = async (_customerCase: ICustomerCaseModel) => {
      if (action !== 'new') return;
      let customerCase: ICustomerCaseModel = {
         ...caseViewModel.model,
         alternativeNo: customerViewModel.model.alternativeNo,
         idNo: customerViewModel.model.idNo,
         mobileNo: customerViewModel.model.mobileNo,
         name: customerViewModel.model.name,
         physicalAddress: customerViewModel.model.physicalAddress,
         postalCode: customerViewModel.model.postalCode,
         surname: customerViewModel.model.surname,
         town: customerViewModel.model.town,
         requesterUPN: currentCtx.upn,
         groupId: groupId || '',
         assignToPersonUPN: '',
         state: 0,
         referenceNo: newTicketRef,
         id: id || newId()
      }
      await createCustomerCase(customerCase).unwrap();
   }

   const submitUpdatedCustomerCase = async () => {
      if (action !== 'edit') return;
      let customerCase: ICustomerCaseModel = {
         ...caseViewModel.model,
         alternativeNo: customerViewModel.model.alternativeNo,
         idNo: customerViewModel.model.idNo,
         mobileNo: customerViewModel.model.mobileNo,
         name: customerViewModel.model.name,
         physicalAddress: customerViewModel.model.physicalAddress,
         postalCode: customerViewModel.model.postalCode,
         surname: customerViewModel.model.surname,
         town: customerViewModel.model.town
      }
      await updateCustomerCase(customerCase).unwrap();
   }

   const getApdaptiveCardData = (_customerCase: ICustomerCaseModel): IAdaptiveCardTemplateDataCustomerCare => {
      let referenceNo = (_customerCase.referenceNo === '' ? newTicketRef : _customerCase.referenceNo);
      return {
         assignedTo: teamChannels.channels.find(x => x.id === _customerCase.channelId)?.displayName || "error",
         caseNumber: referenceNo,
         caseType: getCaseTypeOptions().find(x => x.key === _customerCase.category)?.header || "error",
         requestor: currentCtx.title,
         status: _customerCase.state,
         id: _customerCase.id,
         groupId: groupId || '',
         channelName: teamChannels.channels.find(x => x.id === _customerCase.channelId)?.displayName || "error",
         changedBy: currentCtx.title
      }
   }

   const submitSendNotifications = async (_customerCase: ICustomerCaseModel) => {
      try
      {
         const users: string[] = [ currentCtx.id ]; 
         const channels: string[] = [ _customerCase.channelId ];
         const templateData = getApdaptiveCardData(_customerCase);
   
         let payloadJson: string = '';
         if (action === 'new') {
            payloadJson = buildNewCustomerCaseCard(templateData);
         } else {
   
            payloadJson = buildUpdatedCustomerCaseCard(templateData);
         }
         await sendNotification({ adaptiveCardJson: payloadJson, users: users, channels: channels });
      }
      catch (err) {
         console.log(`CustomerCaseForm: Error sending notification: ${err}`);
      }
   }

   const handleOnSubmit = async (event: any) => {
      //event.preventDefault();
      try {
         let customerCase: ICustomerCaseModel = {
            ...caseViewModel.model,
            alternativeNo: customerViewModel.model.alternativeNo,
            idNo: customerViewModel.model.idNo,
            mobileNo: customerViewModel.model.mobileNo,
            name: customerViewModel.model.name,
            physicalAddress: customerViewModel.model.physicalAddress,
            postalCode: customerViewModel.model.postalCode,
            surname: customerViewModel.model.surname,
            town: customerViewModel.model.town,
            requesterUPN: currentCtx.upn,
            groupId: groupId || '',
            assignToPersonUPN: '',
            state: 0,
            id: id || newId()
         }
         await submitNewCustomerCase(customerCase);
         await submitUpdatedCustomerCase();
         await submitSendNotifications(customerCase);
         microsoftTeams.tasks.submitTask("refresh");
         microsoftTeams.tasks.submitTask();
      } catch (error: any) {
         if (error.data && error.data.title) {
            setErrorMsg(`${error.status} - ${error.data.title}`);
            console.log(error.data);
         } else {
            setErrorMsg('CustomerCaseForm - Unknown error occured in handleOnSubmit')
         }
      }
   }

   const handleOnCancel = (event: any) => {
      microsoftTeams.tasks.submitTask("cancel");
      microsoftTeams.tasks.submitTask();
   }

   const customerFormMode = (!action || action === 'new') ? customerViewModel.formAction : action;
   const caseFormMode = action || 'new';
   const formIsValid = customerViewModel && caseViewModel && customerIsValid && caseIsValid;
   const isLoading = isFetchingGetCustomerCase || isLoadingGetCustomerCase || isLoadingCreateCustomerCase || isLoadingUpdateCustomerCase || isLoadingSendNotification;
   const isError = (isErrorCreateCustomerCase || isErrorUpdateCustomerCase) && errorMsg.length > 0;
   const btnText = action === 'new' ? `create` : 'update';
   return (
      <>
         {isLoading ? <><br /><Loader /></> :
            <>
               <CustomerForm item={customerItem} formMode={customerFormMode} />
               <CaseForm item={caseItem} formMode={caseFormMode} />
               <PopupModalFooter>
                  {isError ? <Alert content={errorMsg} variables={{ urgent: true, }} dismissible visible={isError}
                     dismissAction={{ onClick: (event: any) => setErrorMsg('') }} /> :
                     <>
                        <Flex vAlign="center" gap="gap.medium">
                           <Text
                              content={t('shared:form.invalidForm.label')}
                              hidden={ !(!formIsValid || isLoading) || caseClosed }
                           /> 
                           <Text
                              content={t('shared:form.caseClosed.label')}
                              hidden={ !caseClosed }
                           />

                           <Button
                              content={t('common:button.cancel')}
                              onClick={(event) => handleOnCancel(event)}
                           />
                           <Button
                              content={t(`common:button.${btnText}Entity`, { entity: t(`entity.case`, { count: 1 }) })}
                              onClick={(event) => handleOnSubmit(event)}
                              disabled={!formIsValid || isLoading || caseClosed}
                              loading={isLoading}
                              primary
                           />

                        </Flex>
                     </>
                  }
               </PopupModalFooter>
            </>
         }
      </>
   );
}

export default CustomerCaseForm;