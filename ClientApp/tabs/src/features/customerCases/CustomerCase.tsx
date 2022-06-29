import * as microsoftTeams from "@microsoft/teams-js";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { getRouteParams } from "../../common/utils/sharedFunctions";
import ErrorMessage from "../../components/common/ErrorMessage";
import SearchCustomer from "../customers/SearchCustomer";
import { getDimensions } from "../popupModal/popupModalDimensions";
import { useLazyGetCustomerCaseQuery } from "./customerCaseService";
import Loader from "../../components/common/Loader";
import { ICustomerCaseModel } from "./types";
import CustomerCaseDetails from "./CustomerCaseDetails";
import CustomerCaseForm from "./CustomerCaseForm";
import CaseAction from "../cases/CaseAction";
import CaseAssign from "../cases/CaseAssign";
import CaseEscalate from "../cases/CaseEscalate";

const CustomerCase = (): JSX.Element => {
   const { view } = getRouteParams(window.location.hash);
   const { t } = useTranslation();
   const { action, id, groupId } = useParams<{ action: string, view: string, groupId: string, id: string }>(); 

   const [trigger, { data: dataGetCustomerCase, isLoading: isLoadingGetCustomerCase, isFetching: isFetchingGetCustomerCase }] = useLazyGetCustomerCaseQuery();
   const item = dataGetCustomerCase as ICustomerCaseModel;
   const renderActionView = () => {
      let newSize = getDimensions(view, action);
      microsoftTeams.tasks.updateTask(newSize);
      switch (action) {
         case 'search':
            return <SearchCustomer />;
         case 'edit':
         case 'new':
            return <CustomerCaseForm />;
         case 'view':
            return <CustomerCaseDetails />;
         case 'action':
            if(!dataGetCustomerCase)
               trigger({ groupId: groupId || '', id : id || '' });
            return <CaseAction item={item} notifyAssignedPerson={true} notifyChannel={true} notifyRequestor={true} />;
         case 'assign':
            return <CaseAssign />;
         // case 'escalate':
         //    return <CaseEscalate />;
         default:
            return <ErrorMessage message={t('error.modal.action')} messageDetails={`Could not find the action ${action} in for the CustomerCase`} />;
      }
   }

   const isLoading = isFetchingGetCustomerCase || isLoadingGetCustomerCase;
   return (
      <>
         {isLoading ? <><br /><Loader /></> :
            renderActionView()
         }
      </>
   );
}

export default CustomerCase;