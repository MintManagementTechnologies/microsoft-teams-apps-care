export interface IUpdateActionModel {
   parentId: string,
   id: string,
   createdByUPN: string,
   message: string,
   state: number,
   timestamp?: string
   referredTo: string
}

export const blankAction: IUpdateActionModel = {
   parentId: "",
   id: "",
   createdByUPN: "",
   message: "",
   state: 0,
   timestamp: "",
   referredTo: ""
}