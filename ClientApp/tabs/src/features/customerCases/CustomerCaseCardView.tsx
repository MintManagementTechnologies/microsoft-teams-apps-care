import * as microsoftTeams from "@microsoft/teams-js";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardFooter, CardHeader, Popup, Flex, FlexItem, Button, Pill, Text, MoreIcon, EyeFriendlierIcon, TaskListIcon, ApprovalsAppbarIcon, EditIcon } from '@fluentui/react-northstar';
import { ICustomerCaseViewModel } from "./types";
import { useState } from "react";
import { useAppDispatch } from "../../store";
import { setViewRequireRefresh } from "../../common/utils/taskResponseSlice";
import { getBaseUrl, getLocaleDate, getRouteParams, upperFirstLetter } from "../../common/utils/sharedFunctions";
import ListItemActions from './actions/ListItemActions';
import { getDirectorateOptions, getCaseTypeOptions } from "../../common/utils/formVariables";
import StatusPill from "../../components/common/statusPill/StatusPill";
import "./CustomerCaseCardView.scss";

const CustomerCaseCardView = (props: { item: ICustomerCaseViewModel }): JSX.Element => {
    const { item } = props;
    const { userScope, view } = getRouteParams(window.location.hash); 
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const directorate: string = item.channelName || getDirectorateOptions().find(x => x.key === item.channelId)?.header || 'error';
    const caseType: string = getCaseTypeOptions().find(x => x.key === item.category)?.header || 'Unknown';
    const [caseClosed, setCaseClosed] = useState(item.state === 3);
    
    const handleOnActionClick = (_event: any, _action: string, _groupId: string, _id: string) => {
        const submitHandler = (err: any, result: any) => {
           if (result === "refresh") {
              dispatch(setViewRequireRefresh(true));
           }
        };
        const taskInfo = {
           url: getBaseUrl() + `/${userScope}/${view}/${_action}/${_groupId}/${_id}`, 
           title: `${upperFirstLetter(_action)} Request`,
           height: microsoftTeams.TaskModuleDimension.Small,
           width: microsoftTeams.TaskModuleDimension.Small,
        };
        microsoftTeams.tasks.startTask(taskInfo, submitHandler);
     }

    return (<>
        <Card className={`mnt-customercase-card`} >
            <CardHeader>
                <Flex vAlign="center" fill>
                    <FlexItem grow>
                        <Text content={`${t("shared:form:caseNumber:label")}: ${item.referenceNo}`} weight={'semibold'} color={'brand'} size="large" />
                    </FlexItem>
                    <ListItemActions item={item}></ListItemActions>  
                </Flex>
                <Flex vAlign="center" fill>
                    <Text content={`${t('common:header:createdAt')} ${getLocaleDate(new Date(item.createdAt || ''))}`} size="small" timestamp />
                </Flex>
            </CardHeader>
            <CardBody>
                <div className={`card-body-wrapper`} >
                    <Flex>
                        <FlexItem grow>
                            <Text content={`${caseType}`} weight={'semibold'} color={'brand'} />
                        </FlexItem>
                        <StatusPill stateEnum={item.state} />
                    </Flex>
                    <Text className={`label-text`} content={`${item.name} ${item.surname}`} weight={'semibold'}  />
                    <br />
                    <Text className={`label-text`} content={`${t('form.caseDescription.label')}`} weight={'semibold'} />
                    <div className={`description-text`}>
                        <Text content={`${item.description}`}  />
                    </div>
                    <Flex className={`mmt-fieldviewGroup mmt-assignTo`}>
                        <Text content={`${t('form.assignTo.pastTenselabel')}`} className={"inline-label"} weight={'semibold'} />
                        <Text content={`${(directorate)}`}   />
                    </Flex>
                </div>

            </CardBody>
            <CardFooter>
                <Flex fill gap='gap.medium' vAlign="center" hAlign="end">
                    <Button content={`${t('common:button.respond')}`} tinted onClick={(event) => handleOnActionClick(event, 'action', item.groupId, item.id)}
                    disabled={caseClosed} />
                    <Button content={`${t('common:button.viewDetails')}`} tinted onClick={(event) => handleOnActionClick(event, 'view', item.groupId, item.id)} />
                </Flex>
            </CardFooter>
        </Card>
    </>);
}

export default CustomerCaseCardView;