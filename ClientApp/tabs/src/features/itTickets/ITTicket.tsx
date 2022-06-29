import * as microsoftTeams from "@microsoft/teams-js";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { getRouteParams } from "../../common/utils/sharedFunctions";
import ErrorMessage from "../../components/common/ErrorMessage";
import { getDimensions } from "../popupModal/popupModalDimensions";
import Loader from "../../components/common/Loader";
import ITTicketForm from "./ITTicketForm";
import { ITicketModel } from "../tickets/types";
import { useLazyGetTicketQuery } from "./ticketsService";
import ITTicketDetails from "./ITTicketDetails";
import TicketAction from "../tickets/TicketAction";
import TicketAssign from "../tickets/TicketAssign";
import TicketClose from "../tickets/TicketClose";


const ITTicket = (): JSX.Element => {
   const { view } = getRouteParams(window.location.hash);
   const { t } = useTranslation();
   const { action, id, groupId } = useParams<{ action: string, view: string, groupId: string, id: string }>(); 

   const [trigger, { data: dataGetTicket, isLoading: isLoadingGetTicket, isFetching: isFetchingGetTicket }] = useLazyGetTicketQuery();
   const item = dataGetTicket as ITicketModel;
   const renderActionView = () => {
      let newSize = getDimensions(view, action);
      microsoftTeams.tasks.updateTask(newSize);
      switch (action) {
         case 'edit':
         case 'new':
            return <ITTicketForm />;
         case 'view':
            return <ITTicketDetails />;
         case 'action':
            if(!dataGetTicket)
               trigger({ groupId: groupId || '', id : id || '' });
            return <TicketAction item={item} notifyAssignedPerson={true} notifyChannel={true} notifyRequestor={true} />;
         case 'close':
            if(!dataGetTicket)
               trigger({ groupId: groupId || '', id : id || '' });
            return <TicketClose item={item} />;
         case 'assign':
            return <TicketAssign />;
         default:
            return <ErrorMessage message={t('error.modal.action')} messageDetails={`Could not find the action ${action} in for the CustomerCase`} />;
      }
   }

   const isLoading = isLoadingGetTicket || isFetchingGetTicket;
   return (
      <>
         {isLoading ? <><br /><Loader /></> :
            renderActionView()
         }
      </>
   );
}

export default ITTicket;