import * as microsoftTeams from "@microsoft/teams-js";
import { Alert, Button, Checkbox, Dropdown, Flex, FormTextArea, Text } from "@fluentui/react-northstar";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { IAdaptiveCardTemplateDataITCare } from "../../common/types/adaptiveCardTemplateData";
import Loader from "../../components/common/Loader";
import { useSendNotificationJsonMutation } from "../../services/notificationService";
import { useTypedSelector, RootState } from "../../store";
import { useUpdateTicketStatusMutation } from "./ticketService";
import { useCreateStatusActionMutation } from "../itTickets/ticketsService";
import { ITicketModel } from "./types";
import PopupModalFooter from "../popupModal/PopupModalFooter";
import { getLocaleDate, getRouteParams, newId } from "../../common/utils/sharedFunctions";
import { buildTicketAssignedCard, buildUpdatedTicketAssignedCard, buildUpdatedTicketChannelCard, buildUpdatedTicketRequestorCard } from "../../common/adaptivecards/adaptiveCardBuilderITCare";
import { useLazySearchGraphUsersQuery } from "../../services/msGraph/graphApiService";
import { IUpdateActionModel } from "../../components/common/actionLog/types";
import { getPrimaryChannel } from "../../common/utils/teamsChannelHelper";


const TicketClose = (props: { item: ITicketModel }): JSX.Element => {
   const { item } = props;
   const { t } = useTranslation();
   const navigate = useNavigate();
   const { userScope, view } = getRouteParams(window.location.hash);
   const { groupId, id } = useParams<{ action: string, view: string, groupId: string, id: string }>(); 
   const [ ticketTested, setTicketTested ] = useState(false);
   const [ errorMsg, setErrorMsg ] = useState('');
   const [ comments, setComments ] = useState('');
   const currentUser = useTypedSelector((state: RootState) => state.currentUser);
   const ticketCategories = useTypedSelector((state: RootState) => state.ticketCategories);
   const teamChannels = useTypedSelector((state: RootState) => state.teamChannels);

   const [createStatusAction, { isLoading: isLoadingCreateStatusAction, isError: isErrorCreateStatusAction }] = useCreateStatusActionMutation();
   const [sendNotification, { isLoading: isLoadingSendNotification, isError: isErrorSendNotification }] = useSendNotificationJsonMutation();
   const [updateTicketStatus, { isLoading: isLoadingupdateTicketStatus, isError: isErrorupdateTicketStatus }] = useUpdateTicketStatusMutation();
   const [searchGraphUser, { data: graphUser, isLoading: isLoadingGraphUser, isFetching: isFetchingGraphUser }] = useLazySearchGraphUsersQuery();

   useEffect(() => {
        if (ticketTested === true) {
            setComments(`Resolution has been tested by requester and request has been closed by ${currentUser.title}`);
        } else {
            setComments(`Request has been closed by ${currentUser.title}`);
        }
    }, 
   [ currentUser, ticketTested ])

   const submitNewStatusAction = async () => {
        const newAction: IUpdateActionModel = {
           parentId: item.id,
           id: newId(),
           createdByUPN: currentUser.upn,
           message: comments,
           state: 3,
           timestamp: new Date().toISOString(),
           referredTo: ''
        }
        await createStatusAction({ ...newAction, groupId: groupId || '' }).unwrap(); 
   }
  
   const submitUpdatedTicketStatus = async () => {
      const newStatus: { id: string, groupId: string, state: number } = {
         id: item.id,
         groupId: item.groupId,
         state: 3
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
         status: 3,
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
            setErrorMsg('CloseRequest - Unknown error occured in handleOnSubmit')
         }
      }
   }

   const handleOnCancel = (event: any) => {
      event.preventDefault();
      microsoftTeams.tasks.submitTask("cancel");
      microsoftTeams.tasks.submitTask();
   }

   const handleViewDetails = (event: any) => {
      const nxtAction = 'view';
      const nxtPath = `/${userScope}/${view}/${nxtAction}/${groupId}/${id}`;
      navigate(`${nxtPath}`);
   }
   
   const isLoading = isLoadingCreateStatusAction || isLoadingupdateTicketStatus || isLoadingSendNotification || isLoadingGraphUser || isFetchingGraphUser;
   const isError = (isErrorCreateStatusAction || isErrorupdateTicketStatus) && errorMsg.length > 0;
   return (
      <>
         {isLoading ? <><br /><Loader /></> :
            <>
               <Flex gap="gap.small" className={`mmt-customercase-details-status`} fill column>
                  <Flex className={`mmt-customercase-details-header`} fill column>
                     <Text content={`${ticketCategories.ticketCategories.find(x => x.id === item?.category)?.categoryName} : ${item?.title}`} weight={'semibold'} color={'brand'} size="large" />
                     <Text content={`${t('shared:form:assignTo:created')} ${getLocaleDate(new Date(item.createdAt || ''))}`} size="small" timestamp />
                  </Flex>
                  <Flex className={`mmt-customercase-details-header`} fill column>
                     <Text content={`${item.description}`} className={`mmt-field mmt-value`} />
                  </Flex>
                  <Flex column hAlign="end" fill className={`mmt-inputGroup mmt-status`}>
                     <Checkbox 
                           label={`${t('form.testedByRequester.label')}`}
                           checked={ ticketTested }
                           onChange={(event, checked) => { 
                              const isChecked =  (!!checked ? checked.checked : false);
                              setTicketTested(isChecked) 
                           }}
         
                     />
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
                           content={t(`common:button.viewDetails`)}
                           onClick={(event) => handleViewDetails(event)}
                           loading={isLoading}
                           disabled={isLoading}
                        />
                        <Button
                           content={t(`common:button.close`)}
                           onClick={(event) => handleOnSubmit(event)}
                           loading={isLoading}
                           disabled={isLoading}
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
 
export default TicketClose;