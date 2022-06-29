import { Alert, Button, Flex, FormInput, Text, TextArea } from "@fluentui/react-northstar";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import * as microsoftTeams from "@microsoft/teams-js";
import { getLocaleDate, newId } from "../../common/utils/sharedFunctions";
import { useCreateStatusActionMutation, useUpdateCaseStatusMutation } from "./caseService";
import Loader from "../../components/common/Loader";
import { ICaseModel } from "./types";
import { useCallback, useState } from "react";
import { RootState, useTypedSelector } from "../../store";
import PopupModalFooter from "../popupModal/PopupModalFooter";
import Attachments from "../attachment/Attachments";
import StatusPillGroup from "../../components/common/statusPill/StatusPillGroup";
import { IUpdateActionModel } from "../../components/common/actionLog/types";
import { useSendNotificationJsonMutation } from "../../services/notificationService";
import { getCaseTypeOptions } from "../../common/utils/formVariables";
import { findMemberByUpnFromChannels, getChannelMemberIdsFromUpns, isChannelOwnerById } from "../../common/utils/teamsChannelHelper";
import { IAdaptiveCardTemplateDataCustomerCare } from "../../common/types/adaptiveCardTemplateData";
import { buildStatusChangeCustomerCaseCard } from "../../common/adaptivecards/adaptiveCardBuilderCustomerCare";

const CaseAction = (props: { item: ICaseModel, notifyChannel: boolean, notifyRequestor: boolean, notifyAssignedPerson: boolean }): JSX.Element => {
   const { item } = props;
   const { t } = useTranslation();
   const { groupId, id } = useParams<{ action: string, view: string, groupId: string, id: string }>(); 
   const [currentState, setCurrentState] = useState(item.state);
   const [comments, setComments] = useState('');
   const [errorMsg, setErrorMsg] = useState('');
   const [referredTo, setReferredTo] = useState(() => {
      if (item.updates === undefined || item.updates === null || item.updates.length === 0) return '';
      var sortedItems = item.updates.slice().sort((a, b) => a.timestamp < b.timestamp ? -1 : 1);
      return sortedItems.at(-1)!.referredTo;
   });
   const currentUser = useTypedSelector((state: RootState) => state.currentUser);
   const teamChannels = useTypedSelector((state: RootState) => state.teamChannels);
   const [createStatusAction, { isLoading: isLoadingCreateStatusAction, isError: isErrorCreateStatusAction }] = useCreateStatusActionMutation();
   const [sendNotification, { isLoading: isLoadingSendNotification, isError: isErrorSendNotification }] = useSendNotificationJsonMutation();
   const [updateCaseStatus, { isLoading: isLoadingUpdateCaseStatus, isError: isErrorUpdateCaseStatus }] = useUpdateCaseStatusMutation();
   

   const allowResolve = (item.assignToPersonUPN.toLowerCase() === currentUser.upn.toLowerCase() || item.requesterUPN.toLowerCase() === currentUser.upn.toLowerCase());
   const allowClose = (isChannelOwnerById(teamChannels.channels, item.channelId, currentUser.id));

   const submitNewStatusAction = async () => {
      const newAction: IUpdateActionModel = {
         parentId: item.id,
         
         id: newId(),
         createdByUPN: currentUser.upn,
         message: comments,
         state: currentState,
         timestamp: new Date().toISOString(),
         referredTo: referredTo
      }
      await createStatusAction(newAction).unwrap();
   }

   const submitUpdatedCaseStatus = async () => {
      if (currentState === item.state) return;
      const updatedCaseStatus: { id: string, groupId: string, state: number } = {
         id: item.id,
         groupId: item.groupId,
         state: currentState
      }
      await updateCaseStatus(updatedCaseStatus).unwrap();
      await submitSendNotifications(item);
   }
   
   const getApdaptiveCardData = (caseModel: ICaseModel): IAdaptiveCardTemplateDataCustomerCare => {
      return {
         assignedTo: teamChannels.channels.find(x => x.id === item.channelId)?.displayName || "error",
         caseNumber: caseModel.referenceNo,
         caseType: getCaseTypeOptions().find(x => x.key === caseModel.category)?.header || "error",
         requestor: findMemberByUpnFromChannels(teamChannels.channels, caseModel.channelId, caseModel.requesterUPN)?.displayName ?? caseModel.requesterUPN,
         status: currentState,
         id: item.id,
         groupId: groupId || '',
         channelName: teamChannels.channels.find(x => x.id === item.channelId)?.displayName || "error",
         changedBy: currentUser.title
      }
   }

   const submitSendNotifications = async (caseModel: ICaseModel) => {
      try
      {
         let users: string[] = [];
         const channels: string[] = [];
         const templateData = getApdaptiveCardData(caseModel);
         // If there is an assigned person, do not send the update to the channel as a notification
         if (caseModel.assignToPersonUPN === '' && props.notifyChannel) {
            channels.push(caseModel.channelId);
         }
         
         if (props.notifyRequestor && props.notifyAssignedPerson && caseModel.assignToPersonUPN !== '') {
            users = getChannelMemberIdsFromUpns(teamChannels.channels, caseModel.channelId, [ caseModel.requesterUPN, caseModel.assignToPersonUPN ]);
         } else if (props.notifyAssignedPerson && caseModel.assignToPersonUPN !== '') {
            users = getChannelMemberIdsFromUpns(teamChannels.channels, caseModel.channelId, [ caseModel.assignToPersonUPN ]);
         } else if (props.notifyRequestor) {
            users = getChannelMemberIdsFromUpns(teamChannels.channels, caseModel.channelId, [ caseModel.requesterUPN ]);
         }
   
         let payloadJson: string = '';
         payloadJson = buildStatusChangeCustomerCaseCard(templateData);
   
         await sendNotification({ adaptiveCardJson: payloadJson, users: users, channels: channels });
      }
      catch (err) {
         console.log(`CaseAction: Error sending Assigned to notification: ${err}`);
      }
   }

   const handleOnSubmit = async (event: any) => {
      event.preventDefault();
      try {
         await submitNewStatusAction();
         await submitUpdatedCaseStatus();
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
   const isLoading = isLoadingCreateStatusAction || isLoadingUpdateCaseStatus || isLoadingSendNotification;
   const isError = (isErrorCreateStatusAction || isErrorUpdateCaseStatus) && errorMsg.length > 0;
   return (
      <>
         {isLoading ? <><br /><Loader /></> :
            <>
               <Flex gap="gap.small" className={`mmt-customercase-details-status`} fill column>
                  <Flex className={`mmt-customercase-details-header`} fill column>
                     <Text content={`${t('shared:form:caseNumber:label')}: ${item.referenceNo}`} weight={'semibold'} color={'brand'} size="large" />
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
                  <Flex gap="gap.smaller" column fill className={`mmt-inputGroup mmt-message mmt-textArea mmt-textArea-100`}>
                     <FormInput
                           defaultValue={referredTo}
                           fluid
                           label={`${t('form.referredTo.label')}`}
                           placeholder={t('form.referredTo.placeholder')}
                           onChange={(event, ctrl) =>
                              setReferredTo(ctrl?.value || '')
                           }
                        />
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

export default CaseAction;