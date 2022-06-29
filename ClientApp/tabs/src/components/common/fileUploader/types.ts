import { IBaseModel } from "../../../common/types";

export interface IFileResult {
   id: string,
   downloadUrl: string,
   webUrl: string
}

export interface IBaseFile {
   id: string,
   file: File,
   uploaded: boolean,
   progress: number
}

export interface ISharePointFile extends IBaseFile, IBaseModel {
   fileId: string,
   parentId: string,
   docType: string,
   downloadUrl: string,
   webUrl: string
}