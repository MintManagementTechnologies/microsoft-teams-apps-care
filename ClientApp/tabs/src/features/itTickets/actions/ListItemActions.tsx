import { ApprovalsAppbarIcon, BellIcon, Button, EditIcon, EyeFriendlierIcon, Flex, MoreIcon, Popup, TaskListIcon } from "@fluentui/react-northstar";
import { getBaseUrl, getRouteParams, sortBy, upperFirstLetter } from "../../../common/utils/sharedFunctions";
import * as microsoftTeams from "@microsoft/teams-js";
import { useEffect, useState } from "react";
import { useAppDispatch, useTypedSelector, RootState } from "../../../store";
import { setViewRequireRefresh } from '../../../common/utils/taskResponseSlice';
import { t } from "i18next";
import { IITTicketModel } from "../types";
import { getPrimaryChannel } from "../../../common/utils/teamsChannelHelper";


const ListItemActions = (props: { item: IITTicketModel }): JSX.Element => {
   const { item } = props;
   const currentCtx = useTypedSelector((state: RootState) => state.currentUser);
   const teamChannels = useTypedSelector((state: RootState) => state.teamChannels);
   const { userScope, view } = getRouteParams(window.location.hash); 
   const [ currentUserIsTech, setCurrentUserIsTech ] = useState(false);
   
   const [open, setOpen] = useState(false);
   const dispatch = useAppDispatch();
   const canUpdateCase = (): boolean => {
      if (item.state === 3) return false;
      if (item.assignedToUPN.toLowerCase() === currentCtx.upn.toLowerCase() || item.requesterUPN.toLowerCase() === currentCtx.upn.toLowerCase()) {
         return true;
      }
      return true;
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
   
   useEffect(() => {
      if ((teamChannels?.channels?.length ?? -1 > 0) && !!currentCtx) {
         const primaryChannel = getPrimaryChannel(teamChannels.channels);
         let checkCurrentTech: boolean = false;
         if (primaryChannel != null) {
            checkCurrentTech =  (primaryChannel.members.find(x => x.id === currentCtx.id) !== undefined)
         }
         setCurrentUserIsTech(checkCurrentTech);
      }
   }, [ teamChannels, currentCtx ])

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
   if (currentUserIsTech === true) {
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

   // Assign To Button, in user context the user can still assign to channel ?
   if (currentUserIsTech === true) {
      buttons.push({
         icon: <ApprovalsAppbarIcon />,
         key: `assign-${item.id}`,
         iconOnly: true,
         content: t('common:button:assignRequest'),
         text: true,
         disabled: isUpdateButtonDisabled,
         title:  t('common:button:assignRequest'),
         onClick: (event: any) => { setOpen(false); handleOnActionClick(event, 'assign', item.groupId, item.id) }
      });
   }

   // Edit button
   if (currentUserIsTech === true) {
      buttons.push({
         icon: <EditIcon />,
         key: `edit-${item.id}`,
         iconOnly: true,
         text: true,
         disabled: isUpdateButtonDisabled,
         content: t('common:button:editRequest'),
         title: t('common:button:editRequest'),
         onClick: (event: any) => { setOpen(false); handleOnActionClick(event, 'edit', item.groupId, item.id) }
      });
   }

   if (currentUserIsTech) {
      const isDisabled: boolean = (item.state !== 2);
      buttons.push({
         icon: <EditIcon />,
         key: `close-${item.id}`,
         iconOnly: true,
         text: true,
         disabled: isDisabled,
         content: t('common:button:closeRequest'),
         title: t('common:button:closeRequest'),
         onClick: (event: any) => { setOpen(false); handleOnActionClick(event, 'close', item.groupId, item.id) }
      });
   }
   
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

