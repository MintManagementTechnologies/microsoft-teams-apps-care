import { Alert, Button, Flex, Text, TextArea } from "@fluentui/react-northstar";
import * as microsoftTeams from "@microsoft/teams-js";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { buildUpdatedTicketAssignedCard, buildUpdatedTicketChannelCard, buildUpdatedTicketRequestorCard } from "../../common/adaptivecards/adaptiveCardBuilderITCare";
import { IAdaptiveCardTemplateDataITCare } from "../../common/types/adaptiveCardTemplateData";
import { getLocaleDate, newId } from "../../common/utils/sharedFunctions";
import { getPrimaryChannel, isChannelOwnerById } from "../../common/utils/teamsChannelHelper";
import { IUpdateActionModel } from "../../components/common/actionLog/types";
import Loader from "../../components/common/Loader";
import StatusPillGroup from "../../components/common/statusPill/StatusPillGroup";
import { useLazySearchGraphUsersQuery } from "../../services/msGraph/graphApiService";
import { useSendNotificationJsonMutation } from "../../services/notificationService";
import { useTypedSelector, RootState } from "../../store";
import Attachments from "../attachment/Attachments";
import { useCreateStatusActionMutation } from "../itTickets/ticketsService";
import PopupModalFooter from "../popupModal/PopupModalFooter";
import { useUpdateTicketStatusMutation } from "./ticketService";

import { ITicketModel } from "./types";

const TicketAction = (props: { item: ITicketModel, notifyChannel: boolean, notifyRequestor: boolean, notifyAssignedPerson: boolean }): JSX.Element => {
   const { item } = props;
   const { t } = useTranslation();
   const { groupId, id } = useParams<{ action: string, view: string, groupId: string, id: string }>(); 
   const [currentState, setCurrentState] = useState(item.state);
   const [comments, setComments] = useState('');
   const [errorMsg, setErrorMsg] = useState('');

   const currentUser = useTypedSelector((state: RootState) => state.currentUser);
   const teamChannels = useTypedSelector((state: RootState) => state.teamChannels);
   const ticketCategories = useTypedSelector((state: RootState) => state.ticketCategories);

   const [createStatusAction, { isLoading: isLoadingCreateStatusAction, isError: isErrorCreateStatusAction }] = useCreateStatusActionMutation();
   const [sendNotification, { isLoading: isLoadingSendNotification, isError: isErrorSendNotification }] = useSendNotificationJsonMutation();
   const [updateTicketStatus, { isLoading: isLoadingupdateTicketStatus, isError: isErrorupdateTicketStatus }] = useUpdateTicketStatusMutation();
   const [searchGraphUser, { data: graphUser, isLoading: isLoadingGraphUser, isFetching: isFetchingGraphUser }] = useLazySearchGraphUsersQuery();

   const allowResolve = (item.assignedToUPN.toLowerCase() === currentUser.upn.toLowerCase() || item.requesterUPN.toLowerCase() === currentUser.upn.toLowerCase());
   const allowClose = (isChannelOwnerById(teamChannels.channels, getPrimaryChannel(teamChannels.channels)?.id || '', currentUser.id));
 
   const submitNewStatusAction = async () => {
      const newAction: IUpdateActionModel = {
         parentId: item.id,
         id: newId(),
         createdByUPN: currentUser.upn,
         message: comments,
         state: currentState,
         timestamp: new Date().toISOString(),
         referredTo: ''
      }
      await createStatusAction({ ...newAction, groupId: groupId || '' }).unwrap();
   }

   const submitUpdatedTicketStatus = async () => {
      if (currentState === item.state) return;
      const newStatus: { id: string, groupId: string, state: number } = {
         id: item.id,
         groupId: item.groupId,
         state: currentState
      }
      await updateTicketStatus(newStatus).unwrap();
     
      await submitSendRequestorNotifications(item);
      await submitSendUpdatedToAssignedNotifications(item);
      await submitSendUpdatedToChannelNotifications(item);

   }
   
   const getApdaptiveCardData = (model: ITicketModel): IAdaptiveCardTemplateDataITCare => {
      return {
         category: ticketCategories.ticketCategories.find(x => x.id === model.category)?.categoryName || 'Error', 
         id: model.id,
         priority: model.priority,
         referenceNumber: model.referenceNo,
         status: currentState,
         title: model.title,
         groupId: model.groupId,
         technicianComment: comments
      }
   }

   const submitSendRequestorNotifications = async (model: ITicketModel) => {
      // Always send the requestor notification
      try
      {
         await searchGraphUser(model.requesterUPN, false).unwrap().then(async (data) => {
            if (!(!!data && data.length > 0)) return;
   
            const users: string[] = [ data[0].id ]; 
            const channels: string[] = [ ];
            const templateData = getApdaptiveCardData(model);
   
            let payloadJson: string = '';
            payloadJson = buildUpdatedTicketRequestorCard(templateData);
            await sendNotification({ adaptiveCardJson: payloadJson, users: users, channels: channels });
         });
      }
      catch (err) {
         console.log(`TicketAction: Error sending requestor notification: ${err}`);
      }
   }

   const submitSendUpdatedToAssignedNotifications = async (model: ITicketModel) => {
      // Check if the current user is the requester, then there is no need for the card
      if (model.assignedToUPN !== '' && currentUser.upn.toLowerCase() === model.assignedToUPN.toLowerCase()) return;
      try
      {
         await searchGraphUser(model.assignedToUPN, false).unwrap().then(async (data) => {
            if (!(!!data && data.length > 0)) return;
   
            const users: string[] = [ data[0].id ]; 
            const channels: string[] = [ ];
            const templateData = getApdaptiveCardData(model);
   
            let payloadJson: string = '';
            payloadJson = buildUpdatedTicketAssignedCard(templateData);
            await sendNotification({ adaptiveCardJson: payloadJson, users: users, channels: channels });
         });
      }
      catch (err) {
         console.log(`TicketAction: Error sending Assigned to notification: ${err}`);
      }
   }

   const submitSendUpdatedToChannelNotifications = async (model: ITicketModel) => {
      // If there is no assigned tech, send the notification to the channel
      if (model.assignedToUPN === '') return;
      try 
      {
         const primaryChannel = getPrimaryChannel(teamChannels.channels);
         if (primaryChannel == null) return;
         
         const users: string[] = [ ]; 
         const channels: string[] = [ primaryChannel.id ];
         const templateData = getApdaptiveCardData(model);
         const payloadJson = buildUpdatedTicketChannelCard(templateData);
         await sendNotification({ adaptiveCardJson: payloadJson, users: users, channels: channels });
      }  
      catch (err) {
         console.log(`TicketAction: Error sending channel notification: ${err}`);
      }
   }

   const handleOnSubmit = async (event: any) => {
      event.preventDefault();
      try {
         await submitNewStatusAction();
         await submitUpdatedTicketStatus();
         microsoftTeams.tasks.submitTask("refresh");
         microsoftTeams.tasks.submitTask();
      } catch (error: any) {
         if (error.data && error.data.title) {
            setErrorMsg(`${error.status} - ${error.data.title}`);
            console.log(error.data);
         } else {
            setErrorMsg('CaseAction - Unknown error occured in handleOnSubmit')
         }
      }
   }

   const handleOnCancel = (event: any) => {
      event.preventDefault();
      microsoftTeams.tasks.submitTask("cancel");
      microsoftTeams.tasks.submitTask();
   }

   const stateChanged = useCallback((newState) => {
      setCurrentState(newState);
   }, []);

   const formIsValid = (currentState === 2 ? comments.length > 0 : true);
   const isLoading = isLoadingCreateStatusAction || isLoadingupdateTicketStatus || isLoadingSendNotification || isLoadingGraphUser || isFetchingGraphUser;
   const isError = (isErrorCreateStatusAction || isErrorupdateTicketStatus) && errorMsg.length > 0;
   return (
      <>
         {isLoading ? <><br /><Loader /></> :
            <>
               <Flex gap="gap.small" className={`mmt-customercase-details-status`} fill column>
                  <Flex className={`mmt-customercase-details-header`} fill column>
                     <Text content={`${t('shared:form:referenceNo:label')}: ${item.referenceNo}`} weight={'semibold'} color={'brand'} size="large" />
                     <Text content={`${t('common:header:createdAt')} ${getLocaleDate(new Date(item.createdAt || ''))}`} size="small" timestamp />
                  </Flex>
                  <br />
                  <Flex column fill className={`mmt-inputGroup mmt-status`}>
                     <Flex gap="gap.smaller" fill vAlign="center">
                        <Text content={`${t('common:button.updateEntity', { entity: t('form.status.label') })}`} className={`mmt-field mmt-label`} weight={'semibold'} />
                        <Text content={`${t('shared:message:caseActionHelpText')}`} className={`mmt-field mmt-value`} timestamp size='small' />
                     </Flex>
                     <StatusPillGroup allowClose={allowClose} allowResolve={allowResolve} stateEnum={item.state} onStateChange={stateChanged} />
                  </Flex>
                  <Flex gap="gap.smaller" column fill className={`mmt-inputGroup mmt-message mmt-textArea mmt-textArea-100`}>
                     <Text content={`${t('form.comments.label')}`} className={`mmt-field mmt-label`} weight={'semibold'} />
                     <TextArea
                        fluid
                        placeholder={t('form.comments.placeholder')}
                        onChange={(event, ctrl) => setComments(ctrl?.value || '')}
                     />
                  </Flex>
                  <Flex gap="gap.smaller" column fill className={`mmt-inputGroup mmt-message mmt-textArea mmt-textArea-100`}>
                     <Attachments canDelete={true} parentId={id || ''} items={item.attachments || []} maxAttachments={10} />
                  </Flex>
                  
                  <Flex column fill className={`mmt-fieldviewGroup mmt-tmp`} padding="padding.medium">
                     <br />
                  </Flex>
               </Flex>
               <PopupModalFooter>
                  {isError ? <Alert content={errorMsg} variables={{ urgent: true, }} dismissible visible={isError}
                     dismissAction={{ onClick: (event: any) => setErrorMsg('') }} /> :
                     <>
                        <Button
                           content={t('common:button.cancel')}
                           onClick={(event) => handleOnCancel(event)}
                        />
                        <Button
                           content={t(`common:button.update`)}
                           onClick={(event) => handleOnSubmit(event)}
                           loading={isLoading}
                           disabled={!formIsValid || isLoading}
                           primary
                        />
                     </>
                  }
               </PopupModalFooter>
            </>
         }
      </>
   );
 }
 
 export default TicketAction;