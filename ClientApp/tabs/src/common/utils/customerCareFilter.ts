import { ICustomerCaseViewModel } from "../../features/customerCases/types";

export const filterCustomerCareCaseStatus = (cases: ICustomerCaseViewModel[], selectedCases: string[]) : ICustomerCaseViewModel[] => {
    if (!selectedCases?.length) return cases;
    const convertedCases: number[] = selectedCases.map(c => 
        {
            return Number(c)
        })
    return cases.filter(x => (convertedCases.indexOf(x.state) >= 0));
} 

export const filterCustomerCareCaseChannel = (cases: ICustomerCaseViewModel[], selectedChannels: string[]) : ICustomerCaseViewModel[] => {
    if (!selectedChannels?.length) return cases;
    return cases.filter(x => (selectedChannels.indexOf(x.channelId) >= 0));
}

export const filterCustomerCareCaseTitle = (cases: ICustomerCaseViewModel[], searchText: string) : ICustomerCaseViewModel[] => {
    if (searchText.trim() === '') return cases;
    return cases.filter(x => x.title.toLowerCase().indexOf(searchText) >= 0 || x.referenceNo.toLowerCase().indexOf(searchText) >= 0);
}