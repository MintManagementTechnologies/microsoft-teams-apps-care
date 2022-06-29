import { Text, Flex, Button, Dropdown } from "@fluentui/react-northstar";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { t } from "i18next";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { getLocaleDate, isTeamsScope } from "../../common/utils/sharedFunctions";
import Loader from "../../components/common/Loader";
import { useGetCustomerCaseQuery } from "../customerCases/customerCaseService";
import { ICustomerCaseModel } from "../customerCases/types";
import PopupModalFooter from "../popupModal/PopupModalFooter";
import { useUpdateCaseAssignmentMutation } from "./caseService";
import * as microsoftTeams from "@microsoft/teams-js";
import { ICaseModel } from "./types";
import { useTypedSelector, RootState } from "../../store";
import { getChannelMemberIdsFromUpns, getChannelOwners } from "../../common/utils/teamsChannelHelper";
import { getCaseTypeOptions } from "../../common/utils/formVariables";
import { useSendNotificationJsonMutation } from "../../services/notificationService";
import { ITeamChannelMember } from "../../common/types/user";
import { IAdaptiveCardTemplateDataCustomerCare } from "../../common/types/adaptiveCardTemplateData";
import { buildCaseEscalatedCard } from "../../common/adaptivecards/adaptiveCardBuilderCustomerCare";
import { useLazyGetTeamMemberManagerQuery } from "../../services/msGraph/graphApiService";

const CaseEscalate = (): JSX.Element => {
    const { t } = useTranslation();
    const { action, groupId, id } = useParams<{ action: string, groupId: string, id: string, mode: string }>();
 
    const currentCtx = useTypedSelector((state: RootState) => state.currentUser);
    const teamChannels = useTypedSelector((state: RootState) => state.teamChannels);
    const [ errorMsg, setErrorMsg ] = useState('');
    const [ channelIdState, setChannelIdState ] = useState('');
 
    const [ channelMembers, setChannelMembers ] = useState<ITeamChannelMember[]>([]); 
    const [ channelMembersDropDown, setChannelMembersDropDown ] = useState<{ header: string, key:string}[]>([]);
    const [ assignToPersonUPNState, setAssignToPersonUPNState ] = useState('');
 
    const { data: dataGetCustomerCase, isLoading: isLoadingGetCustomerCase, isFetching: isFetchingGetCustomerCase } = useGetCustomerCaseQuery({ groupId: groupId || '', id: id || skipToken.toString() });
    const [ getManager, { data: dataGetManager, isLoading: isLoadingGetManager, isFetching: isFetchingGetManager }] = useLazyGetTeamMemberManagerQuery();
    const [ updateCaseAssignment, { isLoading: isLoadingUpdateCaseAssignment, isError: isErrorUpdateCaseAssignment }] = useUpdateCaseAssignmentMutation();
    const [ sendNotification, { isLoading: isLoadingSendNotification, isError: isErrorSendNotification }] = useSendNotificationJsonMutation();
    const item = dataGetCustomerCase as ICustomerCaseModel;
 
    // Store initial channelId
    useEffect(() => {
       if (!(dataGetCustomerCase && dataGetCustomerCase.channelId)) return;
       setChannelIdState(dataGetCustomerCase.channelId);
    }, [dataGetCustomerCase]);

    useEffect(() => {
        if (!channelIdState || !dataGetCustomerCase) return;
        // Load the channel members
        //var members = getChannelOwners(teamChannels.channels, channelIdState);
        getManager({ id: currentCtx.id });
        
     }, [channelIdState]);
     
     useEffect(() => {
      if (!!dataGetManager) {
         setChannelMembers([dataGetManager]);
      }
     }, [dataGetManager] )

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

     const sendNotifications = async () => {
        // Find the assigned user Id from the assigned Upn
      const users: string[] = getChannelMemberIdsFromUpns(teamChannels.channels, channelIdState, [ assignToPersonUPNState ]);
      const templateData = getApdaptiveCardData();
      let payloadJson: string = '';
           
      payloadJson = buildCaseEscalatedCard(templateData);
      await sendNotification({ adaptiveCardJson: payloadJson, users: users, channels: [] });
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
  
     const handleOnCancel = (event: any) => {
        microsoftTeams.tasks.submitTask("cancel");
        microsoftTeams.tasks.submitTask();
     }
  
     const handleOnMemberChange = (event: any, value: any) => {
        if (event !== null) event.preventDefault();
        setAssignToPersonUPNState(value.key);
     }

    const formIsValid = (channelIdState) || (assignToPersonUPNState);
    const isLoading = isLoadingGetCustomerCase || isFetchingGetCustomerCase || !item ||
    isLoadingUpdateCaseAssignment || isLoadingSendNotification;
    const isLoadingMembers = false;
    
    return (
        <>{isLoading ? <><Loader /></> :
           <>
              <Flex gap="gap.small" className={`mmt-customercase-details-status`} fill column>
                 <Flex className={`mmt-customercase-details-header`} fill column>
                    <Text content={`${t('shared:form:caseNumber:label')}: ${item.referenceNo}`} weight={'semibold'} color={'brand'} size="large" />
                    <Text content={`${t('shared:form:assignTo:created')} ${getLocaleDate(new Date(item.createdAt || ''))}`} size="small" timestamp />
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
                          disabled={!channelIdState}
                       />}
                 </Flex> 
              </Flex>
              <PopupModalFooter>
                 <Button
                    content={t('common:button.cancel')}
                    onClick={(event) => handleOnCancel(event)}
                 />
                 <Button
                    content={t(`common:button.assign`)}
                    onClick={(event) => handleOnSubmit(event)}
                    disabled={!formIsValid || isLoading}
                    loading={isLoading}
                    primary
                 />
              </PopupModalFooter>
           </>}
        </>
     );
}

export default CaseEscalate;