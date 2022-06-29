import { IBaseFile } from "../../components/common/fileUploader/types";

export interface IAttachmentModel extends IBaseFile {
   title: string,
   parentId: string,
}