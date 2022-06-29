import { Button, Divider, Flex, FlexItem, Text } from "@fluentui/react-northstar";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { getRouteParams } from "../../common/utils/sharedFunctions";
import { useGetCustomerCaseQuery } from "./customerCaseService";
import Loader from "../../components/common/Loader";
import { blankCustomerCase, ICustomerCaseModel } from "./types";
import CustomerDetails from "../customers/CustomerDetails";
import CaseDetails from "../cases/CaseDetails";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { getCaseTypeOptions } from "../../common/utils/formVariables";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../store";
import { ICaseViewModel } from "../cases/types";
import { ICustomerViewModel } from "../customers/types";
import { caseViewModelUpdated } from "../cases/caseSlice";
import { customerViewModelUpdated } from "../customers/customerSlice";
import PopupModalFooter from "../popupModal/PopupModalFooter";
import * as microsoftTeams from "@microsoft/teams-js";

const CustomerCaseDetails = (): JSX.Element => {
   const { userScope, view } = getRouteParams(window.location.hash);
   const { id, groupId } = useParams<{ action: string, view: string, groupId: string, id: string }>();
   const [ caseClosed, setCaseClosed ] = useState(true);
   const { t } = useTranslation();
   const navigate = useNavigate();
   const dispatch = useAppDispatch();

   const { data: dataGetCustomerCase, isLoading: isLoadingGetCustomerCase, isFetching: isFetchingGetCustomerCase } = useGetCustomerCaseQuery({ groupId: groupId || '', id: id || skipToken.toString() });
   const item = dataGetCustomerCase as ICustomerCaseModel || blankCustomerCase;

   useEffect(() => {
      if (!dataGetCustomerCase) return;
      setCaseClosed(dataGetCustomerCase.state === 3);
      let customerViewModel: ICustomerViewModel = {
         model: {
            idNo: dataGetCustomerCase.idNo,
            name: dataGetCustomerCase.name,
            surname: dataGetCustomerCase.surname,
            town: dataGetCustomerCase.town,
            postalCode: dataGetCustomerCase.postalCode,
            physicalAddress: dataGetCustomerCase.physicalAddress,
            mobileNo: dataGetCustomerCase.mobileNo,
            alternativeNo: dataGetCustomerCase.alternativeNo
         },
         isValid: true,
         formAction: 'edit'
      }
      let caseViewModel: ICaseViewModel = {
         model: {
            id: dataGetCustomerCase.id,
            title: dataGetCustomerCase.title,
            description: dataGetCustomerCase.description,
            category: dataGetCustomerCase.category,
            state: dataGetCustomerCase.state,
            referenceNo: dataGetCustomerCase.referenceNo,
            loggingMethod: dataGetCustomerCase.loggingMethod,
            assignToPersonUPN: dataGetCustomerCase.assignToPersonUPN,
            requesterUPN: dataGetCustomerCase.requesterUPN,
            groupId: dataGetCustomerCase.groupId,
            channelId: dataGetCustomerCase.channelId,
         },
         isValid: true,
         formAction: 'edit'
      }
      dispatch(caseViewModelUpdated(caseViewModel));
      dispatch(customerViewModelUpdated(customerViewModel));


   }, [dataGetCustomerCase, dispatch]);


   const handleOnEditStatus = async (event: any) => {
      event.preventDefault();
      const nxtAction = 'action';
      const nxtPath = `/${userScope}/${view}/${nxtAction}/${groupId}/${id}`;
      navigate(`${nxtPath}`);
   }

   const handleOnCancel = (event: any) => {
      microsoftTeams.tasks.submitTask("cancel");
      microsoftTeams.tasks.submitTask();
   }

   const isLoading = isFetchingGetCustomerCase || isLoadingGetCustomerCase;
   const caseType = getCaseTypeOptions().find(x => x.key === item.category)?.header || 'error';
   const loggingMethod = t(`form.loggingMethod.value.${item.loggingMethod}`);
   return (
      <>
         {isLoading ? <><br /><Loader /></> :
            <>
               <Flex gap="gap.small" className={`mmt-customercase-details`} fill column>
                  <Flex>
                     <FlexItem>
                        <Text content={`${t("shared:form:caseNumber:label")}: ${item.referenceNo}`} weight={'semibold'} color={'brand'} size="large" />
                     </FlexItem>
                     <FlexItem push>
                        <Text content={`${caseType} (${loggingMethod})`} weight={'semibold'} color={'brand'} size="large" />
                     </FlexItem>
                  </Flex>
                  <Divider size={0} color="brand" />
                  <CustomerDetails item={item} />
                  <CaseDetails item={item} />
               </Flex>
               <PopupModalFooter>
                  <Text
                     content={t('shared:form.caseClosed.label')}
                     hidden={ !caseClosed }
                  />
                  <Button
                     content={t('common:button.cancel')}
                     onClick={(event) => handleOnCancel(event)}
                  />
                  <Button
                     content={t(`common:button.editEntity`, { entity: t(`status.label`) })}
                     onClick={(event) => handleOnEditStatus(event)}
                     loading={isLoading}
                     disabled={caseClosed}
                     primary
                  />
               </PopupModalFooter>
            </>
         }
      </>
   );
}

export default CustomerCaseDetails;