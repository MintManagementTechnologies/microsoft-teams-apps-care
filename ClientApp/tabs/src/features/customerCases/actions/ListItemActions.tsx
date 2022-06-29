import { ApprovalsAppbarIcon, BellIcon, Button, EditIcon, EyeFriendlierIcon, Flex, MoreIcon, Popup, TaskListIcon } from "@fluentui/react-northstar";
import { getBaseUrl, getRouteParams, isTeamsScope, sortBy, upperFirstLetter } from "../../../common/utils/sharedFunctions";
import * as microsoftTeams from "@microsoft/teams-js";
import { ICustomerCaseModel } from "../types";
import { useState } from "react";
import { useAppDispatch, useTypedSelector, RootState } from "../../../store";
import { setViewRequireRefresh } from '../../../common/utils/taskResponseSlice';
import { isChannelOwnerById } from "../../../common/utils/teamsChannelHelper";
import { t } from "i18next";

const ListItemActions = (props: { item: ICustomerCaseModel }): JSX.Element => {
   const { item } = props;
   const currentCtx = useTypedSelector((state: RootState) => state.currentUser);
   const teamChannels = useTypedSelector((state: RootState) => state.teamChannels);
   const { userScope, view } = getRouteParams(window.location.hash); 
   const isInTeamScope = isTeamsScope();
   
	const [open, setOpen] = useState(false);
   const dispatch = useAppDispatch();
   const canUpdateCase = (): boolean => {
      if (item.state === 3) return false;
      if (item.assignToPersonUPN.toLowerCase() === currentCtx.upn.toLowerCase() || item.requesterUPN.toLowerCase() === currentCtx.upn.toLowerCase()) {
         return true;
      }
      return isChannelOwnerById(teamChannels.channels, item.channelId, currentCtx.id);
   }
   const isUpdateButtonDisabled = !canUpdateCase();

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

   const buttons = [{
      icon: <EyeFriendlierIcon />,
      key: `view-${item.id}`,
      iconOnly: true,
      text: true,
      disabled: false,
      content: t('common:button:viewDetails'),
      title: t('common:button:viewDetails'),
      onClick: (event: any) => { setOpen(false); handleOnActionClick(event, 'view', item.groupId, item.id) }
   }];
   // Edit button
   if (canUpdateCase()) {
      buttons.push({
         icon: <TaskListIcon />,
         key: `status-${item.id}`,
         iconOnly: true,
         content: t('common:button:updateStatus'),
         text: true,
         disabled: isUpdateButtonDisabled,
         title: t('common:button:updateStatus'),
         onClick: (event: any) => { setOpen(false); handleOnActionClick(event, 'action', item.groupId, item.id) }
      });
   }
   if (canUpdateCase()) {
      // Assign To Button, in user context the user can still assign to channel ?
      buttons.push({
         icon: <ApprovalsAppbarIcon />,
         key: `assign-${item.id}`,
         iconOnly: true,
         content: t('common:button:assignCase'),
         text: true,
         disabled: isUpdateButtonDisabled,
         title:  t('common:button:assignCase'),
         onClick: (event: any) => { setOpen(false); handleOnActionClick(event, 'assign', item.groupId, item.id) }
      });
   }
   // Edit button
   if (canUpdateCase()) {
      buttons.push({
         icon: <EditIcon />,
         key: `edit-${item.id}`,
         iconOnly: true,
         text: true,
         disabled: isUpdateButtonDisabled,
         content: t('common:button:editCase'),
         title: t('common:button:editCase'),
         onClick: (event: any) => { setOpen(false); handleOnActionClick(event, 'edit', item.groupId, item.id) }
      });
   }
   
   // Escalations
   // buttons.push({
   //    icon: <BellIcon />,
   //    key: `escalate-${item.id}`,
   //    iconOnly: true,
   //    text: true,
   //    disabled: isUpdateButtonDisabled,
   //    content: t('common:button:escalateCase'),
   //    title: t('common:button:escalateCase'),
   //    onClick: (event: any) => { setOpen(false); handleOnActionClick(event, 'escalate', item.groupId, item.id) }
   // });
   const sortedButtons = buttons.sort((a,b) => sortBy(a.content, b.content)) ;

   return (<Popup
      on="focus"
      key={`lisitem-popup-${item.id}`}
      content={
         <Flex column key={`commands-content-${item.id}`} hAlign="start">
            {sortedButtons.map((x) => <Button {...x} />)}
         </Flex>
      }
      trigger={<Button icon={<MoreIcon />} text iconOnly title="More" />}
      onOpenChange={(e, { open }: any) => setOpen(open)}
      open={open}
   />);
}

export default ListItemActions;

