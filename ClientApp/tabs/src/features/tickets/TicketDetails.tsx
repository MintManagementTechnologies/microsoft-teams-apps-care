import { Flex, Text } from "@fluentui/react-northstar";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { getRouteParams } from "../../common/utils/sharedFunctions";
import ActionLog from "../../components/common/actionLog/ActionLog";
import { useTypedSelector, RootState } from "../../store";
import { ITicketModel } from "./types";

const TicketDetails = (props: { item: ITicketModel }): JSX.Element => {
    const { item } = props;
    const { userScope, view } = getRouteParams(window.location.hash);
    const teamChannels = useTypedSelector((state: RootState) => state.teamChannels);
    const currentCtx = useTypedSelector((state: RootState) => state.currentUser);
    
    const { id, groupId } = useParams<{ action: string, view: string, groupId: string, id: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();
 
    const handleOnEdit = (event: any) => {
       const nxtAction = 'edit';
       const nxtPath = `/${userScope}/${view}/${nxtAction}/${groupId}/${id}`;
       navigate(`${nxtPath}`);
    }
 
    return (
       <Flex className={`mmt-case-details`} fill column>
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
 
 export default TicketDetails;