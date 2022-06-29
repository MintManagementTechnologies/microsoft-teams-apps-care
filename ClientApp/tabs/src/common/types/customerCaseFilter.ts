export interface ICustomerCaseFilter {
    from?: Date | null,
    to?: Date | null,
    category?: number | null,
    status?: number | null,
    channelId?: string | null
}