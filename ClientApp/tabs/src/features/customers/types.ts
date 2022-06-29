export interface ICustomerModel {
   idNo: string,
   name: string,
   surname: string,
   town: string,
   postalCode: string,
   physicalAddress: string,
   mobileNo: string,
   alternativeNo: string
 }

export interface ICustomerViewModel {
   model: ICustomerModel,
   isValid: boolean,
   isLoading?: boolean,
   formAction: string
}

export const blankCustomer:ICustomerModel = {
   idNo: "",
   name: "",
   surname: "",
   town: "",
   postalCode: "",
   physicalAddress: "",
   mobileNo: "",
   alternativeNo: ""
};