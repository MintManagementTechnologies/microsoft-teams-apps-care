import * as microsoftTeams from "@microsoft/teams-js";
import { Button, Divider, Flex, FlexItem, Text } from "@fluentui/react-northstar";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { getRouteParams } from "../../common/utils/sharedFunctions";
import Loader from "../../components/common/Loader";
import { useAppDispatch, useTypedSelector, RootState } from "../../store";
import PopupModalFooter from "../popupModal/PopupModalFooter";
import TicketDetails from "../tickets/TicketDetails";
import TicketForm from "../tickets/TicketForm";
import { blankTicket, ITicketModel } from "../tickets/types";
import { useGetTicketQuery } from "./ticketsService";
import { getPrimaryChannel } from "../../common/utils/teamsChannelHelper";

const ITTicketDetails = (): JSX.Element => {
   const { userScope, view } = getRouteParams(window.location.hash);
   const currentCtx = useTypedSelector((state: RootState) => state.currentUser);
   const teamChannels = useTypedSelector((state: RootState) => state.teamChannels);

   const { id, groupId } = useParams<{ action: string, view: string, groupId: string, id: string }>();
   const [ currentUserIsTech, setCurrentUserIsTech ] = useState(false);
   const { t } = useTranslation();
   const navigate = useNavigate();
   const dispatch = useAppDispatch();

   const { data: dataGetTicket, isLoading: isLoadingTicket, isFetching: isFetchingTicket } = useGetTicketQuery({ groupId: groupId || '', id: id || skipToken.toString() });
   const item = dataGetTicket as ITicketModel || blankTicket;
   const [ticketClosed, setTicketClosed] = useState(true);

   useEffect(() => {
      if (!dataGetTicket) return;

      setTicketClosed(dataGetTicket.state === 3);

   }, [dataGetTicket, dispatch]);

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
 
 
   const handleOnEditStatus = async (event: any) => {
      event.preventDefault();
      const nxtAction = 'action';
      const nxtPath = `/${userScope}/${view}/${nxtAction}/${groupId}/${id}`;
      navigate(`${nxtPath}`);
   }

   const handleOnEditEntity = async (event: any) => {
      event.preventDefault();
      const nxtAction = 'edit';
      const nxtPath = `/${userScope}/${view}/${nxtAction}/${groupId}/${id}`;
      navigate(`${nxtPath}`);
   }

   const handleOnCancel = (event: any) => {
      event.preventDefault();
      microsoftTeams.tasks.submitTask("cancel");
      microsoftTeams.tasks.submitTask();
   }

   const isLoading = isFetchingTicket || isLoadingTicket;
    
    
   return (
      <>
         {isLoading ? <><br /><Loader /></> :
            <>
               <Flex gap="gap.small" className={`mmt-customercase-details`} fill column>
                  <Flex>
                     <FlexItem>
                        <Text content={`${item.title}`} weight={'semibold'} color={'brand'} size="large" />
                     </FlexItem>
                  </Flex>
                  <Divider size={0} color="brand" />
                  <TicketForm item={item} formMode={"view"} />
                  <Divider size={0} color="brand" />
                  <TicketDetails item={item} />
               </Flex>
               <PopupModalFooter>
                  <Button
                     content={t('common:button.cancel')}
                     onClick={(event) => handleOnCancel(event)}
                  />
                  {currentUserIsTech ? <>
                  <Text
                        content={t('shared:form.ticketClosed.label')}
                        hidden={ !ticketClosed }
                     />
                  <Button
                     content={t(`common:button.editEntity`, { entity: t(`common:entity.request_one`)  })}
                     onClick={(event) => handleOnEditEntity(event)}
                     disabled={ticketClosed}
                     loading={isLoading}
                    />
                   <Button
                     content={t(`common:button.editEntity`, { entity: t(`status.label`) })}
                     onClick={(event) => handleOnEditStatus(event)}
                     disabled={ticketClosed}
                     loading={isLoading}
                     primary
                  />
                  </> : <></> }
               </PopupModalFooter>
            </>
         }
      </>
   );
 }
 
 export default ITTicketDetails;