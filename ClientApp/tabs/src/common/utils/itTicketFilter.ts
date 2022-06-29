import { IITTicketModel } from "../../features/itTickets/types";

export const filterITTicketStatus = (items: IITTicketModel[], selectedStatus: string[]) : IITTicketModel[] => {
    if (!selectedStatus?.length) return items;
    const convertedStatus: number[] = selectedStatus.map(c => 
        {
            return Number(c)
        })
    return items.filter(x => (convertedStatus.indexOf(x.state) >= 0));
} 

export const filterITTicketCategory = (items: IITTicketModel[], selectedCategory: string[]) : IITTicketModel[] => {
    if (!selectedCategory?.length) return items;

    return items.filter(x => (selectedCategory.indexOf(x.category) >= 0));
} 

export const filterITTicketPriority = (items: IITTicketModel[], selectedPriority: string[]) : IITTicketModel[] => {
    if (!selectedPriority?.length) return items;
    const convertedPriorities: number[] = selectedPriority.map(c => 
        {
            return Number(c)
        })
    return items.filter(x => (convertedPriorities.indexOf(x.priority) >= 0));
} 

export const filterITTicketVisibility = (items: IITTicketModel[], selectedVisibility: string[]) : IITTicketModel[] => {
    if (!selectedVisibility?.length) return items;
    const convertedPriorities: boolean[] = selectedVisibility.map(c => 
        {
            return c === 'true'
        })
    return items.filter(x => (convertedPriorities.indexOf(x.isVisible) >= 0));
} 

export const filterITTicketTitle = (items: IITTicketModel[], searchText: string) : IITTicketModel[] => {
    if (searchText.trim() === '') return items;
    return items.filter(x => x.title.toLowerCase().indexOf(searchText) >= 0 || x.referenceNo.toLowerCase().indexOf(searchText) >= 0);
}