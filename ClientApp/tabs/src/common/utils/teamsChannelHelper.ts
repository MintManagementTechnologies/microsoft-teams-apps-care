import { ITeamChannelDetail, ITeamChannelMember } from "../types/user";


export const getChannelName = (teamChannels: ITeamChannelDetail[], channelId: string): string => {
    const teamChannel = getTeamChannel(teamChannels, channelId);
    if (teamChannel === null) return '';
    return teamChannel.displayName;
}

export const getPrimaryChannel = (teamChannels: ITeamChannelDetail[]) : ITeamChannelDetail | null => {
    if (teamChannels === null || teamChannels.length === 0) return null;
    const teamChannel = teamChannels.find(item => item.actualName === 'General');
    if (teamChannel === undefined) return null;
    return teamChannel;
}

export const isAllDirectoratesChannel = (teamChannels: ITeamChannelDetail[], channelId: string): boolean => {
    const teamChannel = getTeamChannel(teamChannels, channelId);
    if (teamChannel === null) return false;
    return teamChannel.displayName === 'All Directorates';
}

export const isChannelOwnerByUpn = (teamChannels: ITeamChannelDetail[], channelId: string, upn: string): boolean => {
    const teamChannel = getTeamChannel(teamChannels, channelId);
    if (teamChannel === null) return false;
    const owner = findOwnerByUpn(teamChannel, upn);
    return (owner !== null);
}

export const isChannelOwnerById = (teamChannels: ITeamChannelDetail[], channelId: string, id: string): boolean => {
    const teamChannel = getTeamChannel(teamChannels, channelId);
    if (teamChannel === null) return false;
    const owner = findOwnerById(teamChannel, id);
    return (owner !== null);
}

export const getChannelOwners = (teamChannels: ITeamChannelDetail[], channelId: string): ITeamChannelMember[] => {
    const teamChannel = getTeamChannel(teamChannels, channelId);
    if (teamChannel === null) return [];
    return teamChannel.owners;
}

export const getChannelMembers = (teamChannels: ITeamChannelDetail[], channelId: string): ITeamChannelMember[] => {
    const teamChannel = getTeamChannel(teamChannels, channelId);
    if (teamChannel === null) return [];
    return teamChannel.members;
}

export const getChannelMemberIdsFromUpns = (teamChannels: ITeamChannelDetail[], channelId: string, upns: string[]): string[] => {
    const teamChannel = getTeamChannel(teamChannels, channelId);
    if (teamChannel === null) return [];
    const result: string[] = [];

    upns.forEach(upn => {
        const member = findMemberByUpn(teamChannel, upn);
        if (member !== null) {
            if (result.indexOf(member.id) < 0) {
                result.push(member.id);
            }
        }
    });

    return result;
}

export const findOwnerByUpn = (teamChannel: ITeamChannelDetail, upn: string): ITeamChannelMember | null => {
    if (upn === null || upn === '') return null;
    const member = teamChannel.owners?.find(m => m.upn.toLowerCase() === upn.toLowerCase());
    if (member === undefined) return null;
    return member;
}

export const findOwnerById = (teamChannel: ITeamChannelDetail, id: string): ITeamChannelMember | null => {
    if (id === null || id === '') return null;
    const member = teamChannel.owners?.find(m => m.id === id);
    if (member === undefined) return null;
    return member;
}

export const findMemberByUpnFromChannels = (teamChannels: ITeamChannelDetail[], channelId: string, upn: string): ITeamChannelMember | null => {
    const teamChannel = getTeamChannel(teamChannels, channelId);
    if (teamChannel === null) return null;
    if (upn === null || upn === '') return null;
    const member = teamChannel.members?.find(m => m.upn.toLowerCase() === upn.toLowerCase());
    if (member === undefined) return null;
    return member;
}

export const findMemberByIdFromChannels = (teamChannels: ITeamChannelDetail[], channelId: string, id: string): ITeamChannelMember | null => {
    const teamChannel = getTeamChannel(teamChannels, channelId);
    if (teamChannel === null) return null;
    if (id === null || id === '') return null;
    const member = teamChannel.members?.find(m => m.id === id);
    if (member === undefined) return null;
    return member;
}

export const findMemberByUpn = (teamChannel: ITeamChannelDetail, upn: string): ITeamChannelMember | null => {
    if (upn === null || upn === '') return null;
    const member = teamChannel.members?.find(m => m.upn.toLowerCase() === upn.toLowerCase());
    if (member === undefined) return null;
    return member;
}

export const findMemberById = (teamChannel: ITeamChannelDetail, id: string): ITeamChannelMember | null => {
    if (id === null || id === '') return null;
    const member = teamChannel.members?.find(m => m.id === id);
    if (member === undefined) return null;
    return member;
}

export const getTeamChannel = (teamChannels: ITeamChannelDetail[], channelId: string): ITeamChannelDetail | null => {
    if (teamChannels === null || teamChannels.length === 0) return null;
    const teamChannel = teamChannels.find(item => item.id === channelId);
    if (teamChannel === undefined) return null;
    return teamChannel;
}