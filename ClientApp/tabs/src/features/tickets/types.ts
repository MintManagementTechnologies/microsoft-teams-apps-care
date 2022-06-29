import { newId } from "../../common/utils/sharedFunctions";
import { IAction } from "../cases/types";

export interface ITicketAction {
    id: string,
    createdByUPN: string,
    message: string,
    referredTo: string,
    state: number,
    timestamp: number
}

export interface ITicketModel {
    groupId: string,
    id: string,
    title: string,
    description: string,
    category: string,
    state: number,
    referenceNo: string,
    requesterUPN: string,
    assignedToUPN: string,
    attachments: string[],
    priority: number,
    createdAt?: string,
    lastUpdate?: string,
    isVisible: boolean,
    updates?: IAction[]
}

export interface ITicketViewModel {
    model: ITicketModel,
    isValid: boolean,
    isLoading?: boolean,
    formAction: string
 }

 export const blankTicket: ITicketModel = {
    id: '',
    title: '',
    description: '',
    category: '',
    state: 0,
    referenceNo: '',
    requesterUPN: '',
    groupId: '',
    updates: [],
    assignedToUPN: '',
    attachments: [],
    createdAt: '',
    isVisible: true,
    lastUpdate: '',
    priority: 0
 };