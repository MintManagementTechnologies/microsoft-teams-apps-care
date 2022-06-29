import { Flex, Button, Text } from "@fluentui/react-northstar";
import { Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { getDirectorateOptions } from "../../common/utils/formVariables";
import { getRouteParams } from "../../common/utils/sharedFunctions";
import { isChannelOwnerById } from "../../common/utils/teamsChannelHelper";
import ActionLog from "../../components/common/actionLog/ActionLog";
import { useTypedSelector, RootState } from "../../store";
import { ICaseModel } from "./types";

const CaseDetails = (props: { item: ICaseModel }): JSX.Element => {
   const { item } = props;
   const { userScope, view } = getRouteParams(window.location.hash);
   const teamChannels = useTypedSelector((state: RootState) => state.teamChannels);
   const currentCtx = useTypedSelector((state: RootState) => state.currentUser);
   
   const { id, groupId } = useParams<{ action: string, view: string, groupId: string, id: string }>();
   const { t } = useTranslation();
   const navigate = useNavigate();
   const getAssignedToDirectorate = () => {
      return teamChannels.channels.find(x => x.id === item.channelId)?.displayName ||
             getDirectorateOptions().find(x => x.key === item.channelId)?.header || 
             'error';
   }
   const assignedTo = getAssignedToDirectorate();
   
   
   const canEditCase = (): boolean => {
      if (item.state === 3) return false;
      if (item.assignToPersonUPN.toLowerCase() === currentCtx.upn.toLowerCase() || item.requesterUPN.toLowerCase() === currentCtx.upn.toLowerCase()) {
         return true;
      }
      return isChannelOwnerById(teamChannels.channels, item.channelId, currentCtx.id);
   }

   const handleOnEdit = (event: any) => {
      const nxtAction = 'edit';
      const nxtPath = `/${userScope}/${view}/${nxtAction}/${groupId}/${id}`;
      navigate(`${nxtPath}`);
   }

   return (
      <Flex className={`mmt-case-details`} fill column>
         <Flex column fill className={`mmt-fieldviewGroup mmt-caseDescription`}>
            <Text content={`${t('form.caseDescription.label')}`} className={`mmt-field mmt-label`} weight={'semibold'} />
            <Text content={`${item.description}`} className={`mmt-field mmt-value`} />
         </Flex>
         <Flex fill className={`mmt-fieldviewGroup mmt-assignTo-editBtn`}>
            <Flex column fill className={`mmt-fieldviewGroup mmt-assignTo`}>
               <Text content={`${t('form.assignTo.pastTenselabel')}`} className={`mmt-field mmt-label`} weight={'semibold'} />
               <Text content={`${assignedTo}`} className={`mmt-field mmt-value`} timestamp />
            </Flex>
         </Flex>
         <Flex column fill className={`mmt-actions mmt-edit`} hAlign='end' >
            <Button disabled={!canEditCase()} content={`${t('common:button.edit')} ${t('common:button.details')}`} tinted onClick={(event) => handleOnEdit(event)} />
         </Flex>
         <Flex column fill gap="gap.small" className={`mmt-fieldviewGroup mmt-caseDescription`}>
            <Text content={`${t('form.progress.label')}`} className={`mmt-field mmt-label`} weight={'semibold'} />
            <ActionLog parentId={item.id} items={item.updates || []} />
         </Flex>
         <Flex column fill className={`mmt-fieldviewGroup mmt-tmp`} padding="padding.medium">
            <br/>
         </Flex>
      </Flex>
   );
}

export default CaseDetails;