import * as microsoftTeams from "@microsoft/teams-js";
import { Alert, Button, Flex, Text } from "@fluentui/react-northstar";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { newId, newReferenceNumber } from "../../common/utils/sharedFunctions";
import { useSendNotificationJsonMutation } from "../../services/notificationService";
import { useTypedSelector, RootState } from "../../store";
import PopupModalFooter from "../popupModal/PopupModalFooter";
import { ITicketModel, ITicketViewModel } from "../tickets/types";
import { useCreateTicketMutation, useLazyGetTicketQuery, useUpdateTicketMutation } from "./ticketsService";
import Loader from "../../components/common/Loader";
import TicketForm from "../tickets/TicketForm"; 
import { IAdaptiveCardTemplateDataITCare } from "../../common/types/adaptiveCardTemplateData";
import { buildNewTicketChannelCard, buildNewTicketRequestorCard, buildTicketAssignedCard, buildUpdatedTicketChannelCard, buildUpdatedTicketRequestorCard } from "../../common/adaptivecards/adaptiveCardBuilderITCare";
import { useLazySearchGraphUsersQuery } from "../../services/msGraph/graphApiService";
import { IDetailedUserModel } from "../../common/types/user";
import { getPrimaryChannel } from "../../common/utils/teamsChannelHelper";

const ITTicketForm = (): JSX.Element => {
   const { t } = useTranslation();
   const { action, groupId, id } = useParams<{ action: string, groupId: string, id: string }>();
   const [ ticketIsValid, setTicketIsValid ] = useState(false);
   const [ errorMsg, setErrorMsg ] = useState('');

   const currentCtx = useTypedSelector((state: RootState) => state.currentUser);
   const ticketViewModel: ITicketViewModel = useTypedSelector((state: RootState) => state.ticket);
   const ticketCategories = useTypedSelector((state: RootState) => state.ticketCategories);
   const teamChannels = useTypedSelector((state: RootState) => state.teamChannels);

   const [trigger, { data: dataGetTicket, isLoading: isLoadingTicket, isFetching: isFetchingTicket }] = useLazyGetTicketQuery();
   const [searchGraphUser, { data: graphUser, isLoading: isLoadingGraphUser, isFetching: isFetchingGraphUser }] = useLazySearchGraphUsersQuery();
   const [createTicket, { isLoading: isLoadingCreateTicket, isError: isErrorCreateTicket }] = useCreateTicketMutation();
   const [updateTicket, { isLoading: isLoadingUpdateTicket, isError: isErrorUpdateTicket }] = useUpdateTicketMutation();
   const [sendNotification, { isLoading: isLoadingSendNotification, isError: isErrorSendNotification }] = useSendNotificationJsonMutation();
   const [ticketClosed, setTicketClosed] = useState(false);
   const [newTicketRef, setNewTicketRef] = useState(() => {
      return newReferenceNumber();
   })
   const [newTicketId, setNewTicketId] = useState(() => {
      return newId();
   })

   const ticketItem: ITicketModel = (dataGetTicket || 
   { 
      ...ticketViewModel.model, 
      referenceNo: newTicketRef,
      requesterUPN: currentCtx.upn,
      id: id || ''
   });
 
   useEffect(() => {
      if (!dataGetTicket) return;
      setTicketClosed(dataGetTicket.state === 3);
   }, 
   [dataGetTicket])

   // Query existing case if in edit mode 
   useEffect(() => {
      if (action === 'new' || !id) return;
      if (id === 'new') return;
      trigger({groupId : groupId || '', id});
   }, [action, id, trigger]);
 
   // Customer Validation
   useEffect(() => {
      if (!ticketViewModel) return;
      const newIsValid = [
         ticketViewModel.model.category,
         ticketViewModel.model.description,
         ticketViewModel.model.priority >= 0,
         ticketViewModel.model.state >= 0,
         ticketViewModel.model.title
      ].every(Boolean);
      if (ticketIsValid !== newIsValid) {
         setTicketIsValid(newIsValid);
      }
   }, [ticketViewModel, ticketIsValid]);
 
   const submitNewTicket = async (formData: ITicketModel) => {
      if (action !== 'new') return;
      let ticket: ITicketModel = {
         ...formData,
         groupId: groupId || '',
         createdAt: undefined,
         lastUpdate: undefined,
         updates: undefined,
         id: newTicketId
      }
      await createTicket(ticket).unwrap();
   }
 
   const submitUpdatedTicket = async () => {
      if (action !== 'edit') return;
      let ticket: ITicketModel = {
         ...ticketViewModel.model
      }

      await updateTicket(ticket).unwrap();
   }
 
   const getApdaptiveCardData = (model: ITicketModel): IAdaptiveCardTemplateDataITCare => {
      const lastComment = model.updates?.at(-1)?.message || 'N/A';
      const cardId = (action === 'new' ? newTicketId : model.id);
      return {
         category: ticketCategories.ticketCategories.find(x => x.id === model.category)?.categoryName || 'Error', 
         id: cardId,
         priority: model.priority,
         referenceNumber: model.referenceNo,
         status: model.state,
         title: model.title,
         groupId: model.groupId,
         technicianComment: lastComment
      }
   }

   const submitSendNotifications = async (model: ITicketModel) => { 
   
      await submitRequestorNotification(model);

      // Check if there is a technician assigned
      if (model.assignedToUPN === '') {
         // Notify the channel
         await submitChannelNotification(model);
      } else {
         // Notify the assigned person
         await submitTicketAssignedNotification(model);
      }
   }

   const submitRequestorNotification = async (model: ITicketModel) => {
      try {
         await searchGraphUser(model.requesterUPN, false).unwrap().then(async (data) => {
            if (!(!!data && data.length > 0)) return;

            const users: string[] = [ data[0].id ]; 
            const channels: string[] = [ ];
            const templateData = getApdaptiveCardData(model);
      
            let payloadJson: string = '';
            if (action === 'new') {
               payloadJson = buildNewTicketRequestorCard(templateData);
            } else {
               payloadJson = buildUpdatedTicketRequestorCard(templateData);
            }
            await sendNotification({ adaptiveCardJson: payloadJson, users: users, channels: channels });
         });
      } catch (err) {
         console.log(`ITTicketForm: Error sending requester notification: ${err}`);
      }
   
   }

   const submitTicketAssignedNotification = async (model: ITicketModel) => {
      try {
         await searchGraphUser(model.assignedToUPN, false).unwrap().then(async (data) => {
            if (!(!!data && data.length > 0)) return;
            const users: string[] = [ data[0].id ]; 
            const channels: string[] = [ ];
            const templateData = getApdaptiveCardData(model);
            let payloadJson: string = buildTicketAssignedCard(templateData);
            
            await sendNotification({ adaptiveCardJson: payloadJson, users: users, channels: channels });
         })    
      } catch (err) {
         console.log(`ITTicketForm: Error sending requester notification: ${err}`);
      }
   }

   const submitChannelNotification = async (model: ITicketModel) => {
      const primaryChannel = getPrimaryChannel(teamChannels.channels);
      if (primaryChannel == null) return;
      try
      {
         const users: string[] = [ ]; 
         const channels: string[] = [ primaryChannel.id ];
         const templateData = getApdaptiveCardData(model);
         let payloadJson: string = '';
         if (action === 'new') {
            payloadJson = buildNewTicketChannelCard(templateData);
         } else {
            payloadJson = buildUpdatedTicketChannelCard(templateData);
         }
         await sendNotification({ adaptiveCardJson: payloadJson, users: users, channels: channels });
      }
      catch (err)
      {
         console.log(`ITTicketForm: Error sending requester notification: ${err}`);
      }
   }

   const handleOnSubmit = async (event: any) => {
      try {
         let ticket: ITicketModel = {
            ...ticketViewModel.model,
            groupId: groupId || '',
            state: 0,
            id: id || newId()
         }
         await submitNewTicket(ticket);
         await submitUpdatedTicket();
         await submitSendNotifications(ticket);
         microsoftTeams.tasks.submitTask("refresh");
         microsoftTeams.tasks.submitTask();
      } catch (error: any) {
         if (error.data && error.data.title) {
            setErrorMsg(`${error.status} - ${error.data.title}`);
            console.log(error.data);
         } else {
            setErrorMsg('TicketForm - Unknown error occured in handleOnSubmit');
            console.log(error);
         }
      }
   }

   const handleOnCancel = (event: any) => {
      microsoftTeams.tasks.submitTask("cancel");
      microsoftTeams.tasks.submitTask();
   }

   const formMode = (!action || action === 'new') ? ticketViewModel.formAction : action;
   const caseFormMode = action || 'new';
   const formIsValid = ticketViewModel && ticketIsValid;
   const isLoading = isFetchingTicket || isLoadingTicket || 
                     isLoadingCreateTicket || isLoadingUpdateTicket || 
                     isLoadingSendNotification ||
                     isLoadingGraphUser || isFetchingGraphUser;
   const isError = (isErrorCreateTicket || isErrorUpdateTicket) && errorMsg.length > 0;
   const btnText = action === 'new' ? `create` : 'update';
   return (
      <>
         {isLoading ? <><br /><Loader /></> :
            <>
               <TicketForm item={ticketItem} formMode={caseFormMode} />
               
               <PopupModalFooter>
                  {isError ? <Alert content={errorMsg} variables={{ urgent: true, }} dismissible visible={isError}
                     dismissAction={{ onClick: (event: any) => setErrorMsg('') }} /> :
                     <>
                     <Flex vAlign="center" gap="gap.medium">
                        <Text
                           content={t('shared:form.invalidForm.label')}
                           hidden={ !(!formIsValid || isLoading)}
                        />
                        <Text
                           content={t('shared:form.ticketClosed.label')}
                           hidden={ !ticketClosed }
                        />

                        <Button
                           content={t('common:button.cancel')}
                           onClick={(event) => handleOnCancel(event)}
                        />
                        <Button
                           content={t(`common:button.${btnText}Entity`, { entity: t(`entity.request`, { count: 1 }) })}
                           onClick={(event) => handleOnSubmit(event)}
                           disabled={!formIsValid || isLoading || ticketClosed}
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
 
 export default ITTicketForm;