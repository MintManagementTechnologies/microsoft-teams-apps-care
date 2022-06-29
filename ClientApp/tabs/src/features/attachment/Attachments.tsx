import { Flex, Text } from '@fluentui/react-northstar';
import { useTranslation } from 'react-i18next';
import Loader from '../../components/common/Loader';
import FileList from '../../components/common/fileUploader/FileList';
import FileUploader from '../../components/common/fileUploader/FileUploader';
import { useUploadAttachmentMutation, useDeleteAttachmentMutation } from './attachmentService';
import { attachmentDownloadService } from '../../services/attachmentDownloadService';
import { useState } from 'react';
import { newId } from '../../common/utils/sharedFunctions';
import { IAttachmentModel } from './types';

import "./Attachments.scss";
const Attachments = (props: { parentId: string, items: string[], maxAttachments: number, canDelete?: boolean }): JSX.Element => {
   const { parentId, items, maxAttachments, canDelete } = props;
   const { t } = useTranslation();

   let tmpItems: IAttachmentModel[] = [];
   items.forEach(x => {
      let tmpFile: IAttachmentModel = {
         parentId: parentId,
         id: `${newId()}-${Math.floor(Math.random() * 1000) + 1}`,
         title: x,
         uploaded: true,
         file: { name: x, size: 1234 } as any,
         progress: 0
      };
      tmpItems.push(tmpFile);
   })

   const [allAttachments, setAllAttachments] = useState<IAttachmentModel[]>(tmpItems);
   const [uploadAttachment, { isLoading: isLoadingUploadAttachment }] = useUploadAttachmentMutation();
   const [deleteAttachment, { isLoading: isLoadingDeleteAttachment }] = useDeleteAttachmentMutation();
   
   const handleOnUpload = (_file: File, _docType: string) => {

      let fileObj: IAttachmentModel = {
         parentId: parentId,
         id: newId(),
         title: _file.name,
         uploaded: false,
         file: _file,
         progress: 0
      };
      uploadAttachment(fileObj).unwrap()
      .then((d) => {
         fileObj.uploaded = true;
         var newAttachments = [...allAttachments, fileObj];
         setAllAttachments(newAttachments);
      });
   };

   const handleOnDelete = (fileName: string) => {
      const result = deleteAttachment({
         caseId: parentId,
         fileName: fileName,
      }).unwrap()
      .then((d) => {
         var newAttachments = allAttachments.filter(a => a.file.name !== fileName);
         setAllAttachments(newAttachments);
      });
      
   };

   const handleOnDownload = async (fileName: string) => {
      await attachmentDownloadService.downloadAttachment(parentId, fileName);
   };

   const isLoading = isLoadingUploadAttachment || isLoadingDeleteAttachment;

   return (
      <Flex gap="gap.small" >
         {isLoading ? <Loader message={t('common:entity.attachment', { count: 1 })} />
            : <FileList uploadTrigger={"onAdd"}
               files={allAttachments ? allAttachments : []}
               onDeleteFile={canDelete ? handleOnDelete : undefined} 
               onDownloadFile={handleOnDownload}/>
         }
         {allAttachments.length === 0 && <Text content={t('common:error.noItems', { entity: t('common:entity.attachment', { count: 0 }) })} />}
         <Flex hAlign='end'>
            <FileUploader
               onChange={(file) => handleOnUpload(file, "memo")}
               isDisabled={allAttachments.length > maxAttachments}
               maxAllowedSize={10}
               label={t("common:button.attach")}
            />
         </Flex>
      </Flex>
   );
}

export default Attachments;