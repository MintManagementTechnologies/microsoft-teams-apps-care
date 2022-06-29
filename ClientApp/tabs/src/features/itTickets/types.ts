import { ITicketModel } from "../tickets/types";

export interface IITTicketModel extends ITicketModel {

    ticketCategory: string,
    priorityName: string

}