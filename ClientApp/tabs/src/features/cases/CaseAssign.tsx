import { Text, Flex, Button, Dropdown } from "@fluentui/react-northstar";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { t } from "i18next";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { getLocaleDate, isTeamsScope } from "../../common/utils/sharedFunctions";
import ChannelPicker from "../../components/common/channelPicker/ChannelPicker";
import Loader from "../../components/common/Loader";
import { useGetCustomerCaseQuery } from "../customerCases/customerCaseService";
import { ICustomerCaseModel } from "../customerCases/types";
import PopupModalFooter from "../popupModal/PopupModalFooter";
import { useUpdateCaseAssignmentMutation } from "./caseService";
import * as microsoftTeams from "@microsoft/teams-js";
import { ICaseModel } from "./types";
import { useTypedSelector, RootState } from "../../store";
import { getChannelMemberIdsFromUpns, getChannelMembers, isAllDirectoratesChannel, isChannelOwnerByUpn } from "../../common/utils/teamsChannelHelper";
import { getCaseTypeOptions } from "../../common/utils/formVariables";
import { useSendNotificationJsonMutation } from "../../services/notificationService";
import { ITeamChannelMember } from "../../common/types/user";
import { IAdaptiveCardTemplateDataCustomerCare } from "../../common/types/adaptiveCardTemplateData";
import { buildCaseAssignedAllDirectoratesCard, buildCaseAssignedChannelCard, buildCaseAssignedPersonCard } from "../../common/adaptivecards/adaptiveCardBuilderCustomerCare";


const CaseAssign = (): JSX.Element => {
   const { t } = useTranslation();
   const { action, groupId, id } = useParams<{ action: string, groupId: string, id: string, mode: string }>();

   const currentCtx = useTypedSelector((state: RootState) => state.currentUser);
   const teamChannels = useTypedSelector((state: RootState) => state.teamChannels);
   const [ errorMsg, setErrorMsg ] = useState('');
   const [ channelIdState, setChannelIdState ] = useState('');

   const [ displayDirectorateSelector, setDisplayDirectorateSelector ] = useState(false);
   const [ displayPersonSelector, setDisplayPersonSelector ] = useState(false);
   const [ channelMembers, setChannelMembers ] = useState<ITeamChannelMember[]>([]); 
   const [ channelMembersDropDown, setChannelMembersDropDown ] = useState<{ header: string, key:string}[]>([]);
   const [ assignToPersonUPNState, setAssignToPersonUPNState ] = useState('');
   const [ caseClosed, setCaseClosed ] = useState(true);

   const { data: dataGetCustomerCase, isLoading: isLoadingGetCustomerCase, isFetching: isFetchingGetCustomerCase } = useGetCustomerCaseQuery({ groupId: groupId || '', id: id || skipToken.toString() });
   // const [ trigger, { data: dataGetAllChannelMembers, isLoading: isLoadingGetAllChannelMembers, isFetching: isFetchingGetAllChannelMembers }] = useLazyGetAllChannelMembersQuery();
   const [ updateCaseAssignment, { isLoading: isLoadingUpdateCaseAssignment, isError: isErrorUpdateCaseAssignment }] = useUpdateCaseAssignmentMutation();
   const [ sendNotification, { isLoading: isLoadingSendNotification, isError: isErrorSendNotification }] = useSendNotificationJsonMutation();
   const item = dataGetCustomerCase as ICustomerCaseModel;

   // Store initial channelId
   useEffect(() => {
      if (!(dataGetCustomerCase && dataGetCustomerCase.channelId)) return;
      setChannelIdState(dataGetCustomerCase.channelId);
      setCaseClosed(dataGetCustomerCase.state === 3);
   }, [dataGetCustomerCase]);

   useEffect(() => {
      if (!channelIdState || !dataGetCustomerCase) return;
      // Load the channel members
      var members = getChannelMembers(teamChannels.channels, channelIdState);
      const isInTeamsContext = isTeamsScope();
      
      if (isInTeamsContext === true) {
         const allDirectoratesChannel = isAllDirectoratesChannel(teamChannels.channels, currentCtx.channelId);
         const isChannelOwner = isChannelOwnerByUpn(teamChannels.channels, currentCtx.channelId, currentCtx.upn);

        
         if (isChannelOwner) {
            setChannelMembers(members);
         } else {
            setChannelMembers(members.filter(x => x.id === currentCtx.id));
         }

         setDisplayDirectorateSelector(allDirectoratesChannel);
         setDisplayPersonSelector(true);
      } else {
         // Display only me in the list
         setChannelMembers(members.filter(x => x.id === currentCtx.id));

         setDisplayDirectorateSelector(false);
         setDisplayPersonSelector(true);
      }

      // If it is the same channel as the original assignment, load the user
      if (dataGetCustomerCase.channelId === channelIdState) {
         setAssignToPersonUPNState(dataGetCustomerCase.assignToPersonUPN);
      } else {
         setAssignToPersonUPNState('');
      }     
   }, [channelIdState]);

   useEffect(() => {
      setChannelMembersDropDown(channelMembers.map(x => ({ header: x.displayName, key: x.upn })));
   }, [ channelMembers ])


   const submitUpdatedCaseAssignment = async () => {
      if(!dataGetCustomerCase) return;
      if (dataGetCustomerCase.channelId === channelIdState && 
         dataGetCustomerCase.assignToPersonUPN.toLowerCase() === assignToPersonUPNState.toLowerCase()) return;

      const updatedCaseAssignment: ICaseModel = 
      { 
         ...dataGetCustomerCase,
         id: item.id,
         groupId: item.groupId,
         channelId: channelIdState,
         assignToPersonUPN: assignToPersonUPNState
      } 
      await updateCaseAssignment(updatedCaseAssignment).unwrap();
   }

   const handleOnSubmit = async (event: any) => {
      try {
         await submitUpdatedCaseAssignment();

         await sendNotifications();
         microsoftTeams.tasks.submitTask("refresh");
         microsoftTeams.tasks.submitTask();
      } catch (error: any) {
         if (error.data && error.data.title) {
            setErrorMsg(`${error.status} - ${error.data.title}`);
            console.log(error.data);
         } else {
            setErrorMsg('CaseAssign - Unknown error occured in handleOnSubmit')
         }
      }
   }

   const handleOnCancel = (event: any) => {
      microsoftTeams.tasks.submitTask("cancel");
      microsoftTeams.tasks.submitTask();
   }

   const handleOnChannelChange = useCallback((_channelId: string) => {
      setChannelIdState(_channelId);
   }, []);

   const handleOnMemberChange = (event: any, value: any) => {
      if (event !== null) event.preventDefault();
      setAssignToPersonUPNState(value.key);
   }

   const sendNotifications = async () => {
      // if the assigned person has been allocated
      if (assignToPersonUPNState !== '') {
         await sendAssignedToPersonNotification();
      } else {
         await sendNotificationsChannel();
      }
   }

   const getApdaptiveCardData = (): IAdaptiveCardTemplateDataCustomerCare => {
      return {
         assignedTo: teamChannels.channels.find(x => x.id === channelIdState)?.displayName || "error",
         caseNumber: item.referenceNo,
         caseType: getCaseTypeOptions().find(x => x.key === item.category)?.header || "error",
         requestor: currentCtx.title,
         status: item.state,
         id: item.id,
         groupId: groupId || '',
         channelName: teamChannels.channels.find(x => x.id === channelIdState)?.displayName || "error",
         changedBy: currentCtx.title
      }
   }

   const sendNotificationsChannel = async () => {
      try 
      {
         // Find the assigned user Id from the assigned Upn
         const channels: string[] = [ channelIdState ];
         const templateData = getApdaptiveCardData();
         let payloadJson: string = '';

         if (isAllDirectoratesChannel(teamChannels.channels, item.channelId)) {
            payloadJson = buildCaseAssignedAllDirectoratesCard(templateData);
         } else {
            payloadJson = buildCaseAssignedChannelCard(templateData);
         }

         await sendNotification({ adaptiveCardJson: payloadJson, users: [ ], channels: channels });
      }
      catch (err) {
         console.log(`CaseAssign: Error sending Assigned to notification: ${err}`);
      }
      
   }

   const sendAssignedToPersonNotification = async () => {
      try
      {
         // Find the assigned user Id from the assigned Upn
         const users: string[] = getChannelMemberIdsFromUpns(teamChannels.channels, channelIdState, [ assignToPersonUPNState ]);
         const templateData = getApdaptiveCardData();
         let payloadJson: string = '';
            
         payloadJson = buildCaseAssignedPersonCard(templateData);
         await sendNotification({ adaptiveCardJson: payloadJson, users: users, channels: [] });
      }
      catch (err) {
         console.log(`CaseAssign: Error sending Assigned to notification: ${err}`);
      }
   }

   const formIsValid = (channelIdState) || (assignToPersonUPNState);
   const isLoading = isLoadingGetCustomerCase || isFetchingGetCustomerCase || !item ||
   isLoadingUpdateCaseAssignment || isLoadingSendNotification;;
   const isLoadingMembers = false;
   return (
      <>{isLoading ? <><Loader /></> :
         <>
            <Flex gap="gap.small" className={`mmt-customercase-details-status`} fill column>
               <Flex className={`mmt-customercase-details-header`} fill column>
                  <Text content={`${t('shared:form:caseNumber:label')}: ${item.referenceNo}`} weight={'semibold'} color={'brand'} size="large" />
                  <Text content={`${t('shared:form:assignTo:created')} ${getLocaleDate(new Date(item.createdAt || ''))}`} size="small" timestamp />
               </Flex>
               { displayDirectorateSelector ? <Flex gap="gap.smaller" column fill className={`mmt-inputGroup mmt-assignTo`}>
                  <Text content={`${t('form.assignTo.label')}`} className={`mmt-field mmt-label`} weight={'semibold'} />
                  <ChannelPicker onChange={handleOnChannelChange} channelId={channelIdState} />
               </Flex> : <></> }
               
               { displayPersonSelector ? <Flex gap="gap.smaller" column fill className={`mmt-inputGroup mmt-assignTo`}>
                  <Text content={`${t('form.assignTo.labelEntity', { entity: t('entity.teamMember', { count: 1 }) })}`} className={`mmt-field mmt-label`} weight={'semibold'} />
                  {isLoadingMembers ? <Loader label='' size="smaller" /> :
                     <Dropdown
                        placeholder={t('form.assignTo.memberPlaceholder')}
                        fluid
                        value={channelMembersDropDown.find(x => x.key.toLowerCase() === assignToPersonUPNState.toLowerCase())}
                        items={channelMembersDropDown}
                        onChange={(event, { value }) => handleOnMemberChange(event, value)}
                        disabled={!channelIdState || caseClosed}
                     />}
               </Flex> : <></> }
            </Flex>
            <PopupModalFooter>
               <Text
                     content={t('shared:form.caseClosed.label')}
                     hidden={ !caseClosed }
                  />
               <Button
                  content={t('common:button.cancel')}
                  onClick={(event) => handleOnCancel(event)}
               />
               <Button
                  content={t(`common:button.assign`)}
                  onClick={(event) => handleOnSubmit(event)}
                  disabled={!formIsValid || isLoading || caseClosed}
                  loading={isLoading}
                  primary
               />
            </PopupModalFooter>
         </>}
      </>
   );
}

export default CaseAssign;