import { ICaseModel } from "../cases/types";
import { ICustomerModel } from "../customers/types";

export interface ICustomerCaseViewModel extends ICustomerCaseModel {
   channelName: string | null
}

export interface ICustomerCaseModel extends ICaseModel, ICustomerModel {

}

export const blankCustomerCase:ICustomerCaseModel = {
   id: '',
   title: '',
   description: '',
   category: -1,
   state: 0,
   referenceNo: '',
   loggingMethod: '',
   assignToPersonUPN: '',
   requesterUPN: '',
   groupId: '',
   channelId: '',
   idNo: "",
   name: "",
   surname: "",
   town: "",
   postalCode: "",
   physicalAddress: "",
   mobileNo: "",
   alternativeNo: "",
   updates: [],
};