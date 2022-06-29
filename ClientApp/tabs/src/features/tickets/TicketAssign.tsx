import * as microsoftTeams from "@microsoft/teams-js";
import { Button, Dropdown, Flex, FormTextArea, Text } from "@fluentui/react-northstar";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { IAdaptiveCardTemplateDataITCare } from "../../common/types/adaptiveCardTemplateData";
import { ITeamChannelMember } from "../../common/types/user";
import { getChannelMembers, getPrimaryChannel } from "../../common/utils/teamsChannelHelper";
import Loader from "../../components/common/Loader";
import { useSendNotificationJsonMutation } from "../../services/notificationService";
import { useTypedSelector, RootState } from "../../store";
import { useGetTicketQuery } from "../itTickets/ticketsService";
import { useUpdateTicketAssignmentMutation } from "./ticketService";
import { ITicketModel } from "./types";
import PopupModalFooter from "../popupModal/PopupModalFooter";
import { getLocaleDate } from "../../common/utils/sharedFunctions";
import { buildTicketAssignedCard } from "../../common/adaptivecards/adaptiveCardBuilderITCare";
import { useLazySearchGraphUsersQuery } from "../../services/msGraph/graphApiService";

const TicketAssign = (): JSX.Element => {
   const { t } = useTranslation();
   const { action, groupId, id } = useParams<{ action: string, groupId: string, id: string, mode: string }>();

   const currentCtx = useTypedSelector((state: RootState) => state.currentUser);
   const teamChannels = useTypedSelector((state: RootState) => state.teamChannels);
   const ticketCategories = useTypedSelector((state: RootState) => state.ticketCategories);
   const [ errorMsg, setErrorMsg ] = useState('');
   const [ channelIdState, setChannelIdState ] = useState('');
   const [ channelMembers, setChannelMembers ] = useState<ITeamChannelMember[]>([]); 
   const [ channelMembersDropDown, setChannelMembersDropDown ] = useState<{ header: string, key:string}[]>([]);
   const [ assignToPersonUPNState, setAssignToPersonUPNState ] = useState('');
   const { data: dataGetTicket, isLoading: isLoadingGetTicket, isFetching: isFetchingGetTicket } = useGetTicketQuery({ groupId: groupId || '', id: id || skipToken.toString() });
   const [searchGraphUser, { data: graphUser, isLoading: isLoadingGraphUser, isFetching: isFetchingGraphUser }] = useLazySearchGraphUsersQuery();
   const [ updateTicketAssignment, { isLoading: isLoadingUpdateTicketAssignment, isError: isErrorUpdateTicketAssignment }] = useUpdateTicketAssignmentMutation();
   const [ sendNotification, { isLoading: isLoadingSendNotification, isError: isErrorSendNotification }] = useSendNotificationJsonMutation();
   const item = dataGetTicket as ITicketModel;
   const [ticketClosed, setTicketClosed] = useState(true);

   // Store initial channelId
   useEffect(() => {
   if (!(dataGetTicket && teamChannels && teamChannels.channels.length)) return;
      const primaryChannel = getPrimaryChannel(teamChannels.channels);
      if (primaryChannel != null) {
         setChannelIdState(primaryChannel.id);
      }
      setTicketClosed(dataGetTicket.state === 3);
   }, [ dataGetTicket, teamChannels ]);

   useEffect(() => {
      if (!channelIdState || !dataGetTicket) return;
      // Load the channel members
      var members = getChannelMembers(teamChannels.channels, channelIdState);
      setChannelMembers(members);
      setAssignToPersonUPNState(dataGetTicket.assignedToUPN);
   }, [channelIdState]);

   useEffect(() => {
      setChannelMembersDropDown(channelMembers.map(x => ({ header: x.displayName, key: x.upn })));
   }, [ channelMembers ])

   const submitUpdatedTicketAssignment = async () => {
      if(!dataGetTicket) return;
      if (dataGetTicket.assignedToUPN.toLowerCase() === assignToPersonUPNState.toLowerCase()) return;

      const updatedCaseAssignment: ITicketModel = 
      { 
         ...dataGetTicket,
         id: item.id,
         groupId: item.groupId,
         assignedToUPN: assignToPersonUPNState
      } 
      await updateTicketAssignment(updatedCaseAssignment).unwrap();
   }
 
   const handleOnSubmit = async (event: any) => {
      try {
         await submitUpdatedTicketAssignment();

         await sendNotifications();
         
         microsoftTeams.tasks.submitTask("refresh");
         microsoftTeams.tasks.submitTask();
      } catch (error: any) {
         if (error.data && error.data.title) {
            setErrorMsg(`${error.status} - ${error.data.title}`);
            console.log(error.data);
         } else {
            setErrorMsg('TicketAssign - Unknown error occured in handleOnSubmit')
         }
      }
   }

   const handleOnCancel = (event: any) => {
      microsoftTeams.tasks.submitTask("cancel");
      microsoftTeams.tasks.submitTask();
   }

   const handleOnMemberChange = (event: any, value: any) => {
      if (event !== null) event.preventDefault();
      setAssignToPersonUPNState(value.key);
   }
 
   const sendNotifications = async () => {
      if(!dataGetTicket) return;
      if (dataGetTicket.assignedToUPN.toLowerCase() === assignToPersonUPNState.toLowerCase()) return;
      try {
         await searchGraphUser(assignToPersonUPNState, false).unwrap().then(async (data) => {
            if (!(!!data && data.length > 0)) return;
            const users: string[] = [ data[0].id ]; 
            const channels: string[] = [];
            const templateData = getApdaptiveCardData();
            let payloadJson: string = buildTicketAssignedCard(templateData);
            
            await sendNotification({ adaptiveCardJson: payloadJson, users: users, channels: channels });
         }) 
      } 
      catch (err) {
         console.log(`TicketAssign: Error sending Assigned to notification: ${err}`);
      }
   }
 
   const getApdaptiveCardData = (): IAdaptiveCardTemplateDataITCare => {
      const lastComment = dataGetTicket!.updates?.at(-1)?.message || 'N/A';

      return {
         category: ticketCategories.ticketCategories.find(x => x.id === dataGetTicket!.category)?.categoryName || 'Error', 
         id: dataGetTicket!.id,
         priority: dataGetTicket!.priority,
         referenceNumber: dataGetTicket!.referenceNo,
         status: dataGetTicket!.state,
         title: dataGetTicket!.title,
         groupId: dataGetTicket!.groupId,
         technicianComment: lastComment
      }
   }

   const formIsValid = (channelIdState) || (assignToPersonUPNState);
   const isLoading = isLoadingGetTicket || isFetchingGetTicket || !item ||
      isLoadingUpdateTicketAssignment || isLoadingSendNotification;
   const isLoadingMembers = false;
   return (
      <>{isLoading ? <><Loader /></> :
         <>
            <Flex gap="gap.small" className={`mmt-customercase-details-status`} fill column>
               <Flex className={`mmt-customercase-details-header`} fill column>
                  <Text content={`${ticketCategories.ticketCategories.find(x => x.id === dataGetTicket?.category)?.categoryName} : ${dataGetTicket?.title}`} weight={'semibold'} color={'brand'} size="large" />
                  <Text content={`${t('shared:form:assignTo:created')} ${getLocaleDate(new Date(item.createdAt || ''))}`} size="small" timestamp />
               </Flex>
               <Flex className={`mmt-customercase-details-header`} fill column>
                  <Text content={`${item.description}`} className={`mmt-field mmt-value`} />
               </Flex>
               <Flex gap="gap.smaller" column fill className={`mmt-inputGroup mmt-assignTo`}>
                  <Text content={`${t('form.assignTo.labelEntity', { entity: t('entity.teamMember', { count: 1 }) })}`} className={`mmt-field mmt-label`} weight={'semibold'} />
                  {isLoadingMembers ? <Loader label='' size="smaller" /> :
                     <Dropdown
                        placeholder={t('form.assignTo.memberPlaceholder')}
                        fluid
                        value={channelMembersDropDown.find(x => x.key.toLowerCase() === assignToPersonUPNState.toLowerCase())}
                        items={channelMembersDropDown}
                        onChange={(event, { value }) => handleOnMemberChange(event, value)}
                        disabled={!channelIdState || ticketClosed }
                     />}
               </Flex> 
            </Flex>
            <PopupModalFooter>
               <Text
                     content={t('shared:form.ticketClosed.label')}
                     hidden={ !ticketClosed }
                  />
               <Button
                  content={t('common:button.cancel')}
                  onClick={(event) => handleOnCancel(event)}
               />
               <Button
                  content={t(`common:button.assign`)}
                  onClick={(event) => handleOnSubmit(event)}
                  disabled={!formIsValid || isLoading || ticketClosed}
                  loading={isLoading}
                  primary
               />
            </PopupModalFooter>
         </>}
      </>
   );
 }
 
 export default TicketAssign;