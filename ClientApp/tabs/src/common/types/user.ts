import { IBaseModel } from ".";

export interface IBaseUserModel extends IBaseModel {
   upn: string,
}

export interface ITeamChannelMember {
   id: string,
   upn: string,
   displayName: string
}

export interface ITeamChannelDetail {
   owners: ITeamChannelMember[],
   members: ITeamChannelMember[],
   id: string,
   displayName: string,
   actualName: string
}

export interface ISimpleUserModel extends IBaseUserModel {
   image?: string,
   availability?: string,
   activity?: string,
}

export interface IDetailedUserModel extends ISimpleUserModel {
   firstName: string,
   lastName: string,
   jobTitle: string,
   department: string,
}

export interface IUserModel extends IDetailedUserModel {
   personaTypes: string[],
}

export interface IActorUserModel extends IDetailedUserModel {
   personaType: string,
}

export const newUser: IActorUserModel = {
   upn: '',
   firstName: '',
   lastName: '',
   jobTitle: '',
   department: '',
   personaType: 'author',
   active: false,
   id: '',
   title: '',
   createdTimestamp: new Date().getTime(),
   modifiedTimestamp: new Date().getTime()
}