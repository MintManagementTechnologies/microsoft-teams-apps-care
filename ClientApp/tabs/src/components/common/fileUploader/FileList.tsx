import * as React from "react";
import { useTranslation } from "react-i18next";
import {
   Flex,
   Attachment,
   MoreIcon,
   WordColorIcon,
   ExcelColorIcon,
   FilesGenericColoredIcon,
   FilesZipIcon,
   PowerPointColorIcon,
   Button,
   Popup,
   TrashCanIcon,
   DownloadIcon,
   EyeFriendlierIcon,
   Loader,
   Label,
   Segment,
   AttachmentBody,
   Pill,
   FilesPdfColoredIcon,
   FilesImageIcon,
   TableDeleteIcon,
} from "@fluentui/react-northstar";
import "./FileUploader.scss";
import { Link } from "react-router-dom";
import { useState } from "react";
import { IAttachmentModel } from "../../../features/attachment/types";
import { IBaseFile } from "./types";

type FileListProps = {
   compactView?: boolean;
   uploadTrigger: "onAdd" | "onButtonClick";
   files: IBaseFile[];
   onDeleteFile?: (fileName: string) => void;
   onDownloadFile?: (fileName: string) => void;
};

const FileList = (props: FileListProps): JSX.Element => {
   const { t, i18n } = useTranslation();
   //const [contextMenuId, setContextMenuId] = React.useState('');
   let contextMenuId = "";
   let files = props.files ? props.files : ([] as IBaseFile[]);

   const getFileIcon = (fileName: string) => {
      if (fileName.endsWith(".xlsx")) {
         return <ExcelColorIcon />;
      } else if (fileName.endsWith(".docx")) {
         return <WordColorIcon />;
      } else if (fileName.endsWith(".pptx")) {
         return <PowerPointColorIcon />;
      } else if (fileName.endsWith(".zip")) {
         return <FilesZipIcon />;
      } else if (fileName.endsWith(".pdf")) {
         return <FilesPdfColoredIcon />;
      } else if (fileName.endsWith(".png") || fileName.endsWith(".bmp") || fileName.endsWith(".gif") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
         return <FilesImageIcon />
      }

      return <FilesGenericColoredIcon />;
   };

   const invokeOnDownloadClick = (fileName: string) => {
      if (props.onDownloadFile === undefined) return;
      props.onDownloadFile(fileName);
   }

   const invokeOnDeleteClick = (fileName: string) => {
      if (props.onDeleteFile === undefined) return;
      props.onDeleteFile(fileName);
   }

   const [open, setOpen] = useState(false);
   return (
      <Flex column gap="gap.smaller" fill>
         {files.map((x: IBaseFile, index: number) => {
            let file: any = x.file;
            if (!file) {
               file = {
                  name: 'No Name',
                  size: 0
               };
            }
            let sizeAndUnits =
               file.size / 1024 / 1024 < 1
                  ? Math.round(file.size / 1024) + "KB"
                  : Math.round(file.size / 1024 / 1024) + "MB";
            if (file.size === 0) sizeAndUnits = "";

            return (
               <Attachment
                  key={`attachment-${index}`}
                  className="mmt-attachment"
                  icon={getFileIcon(file.name)}
                  header={file.name}
                  description={sizeAndUnits}
                  actionable
                  progress={x.progress}
                  disabled={!x.uploaded}
                  onClick={(event) => { setOpen(!open) }}
                  action={{
                     as: "span",
                     title: "Show more",
                     //icon: <MoreIcon />,
                     content: x.uploaded ? (
                        <Popup
                           onOpenChange={(e, { open }: any) => { e.stopPropagation(); setOpen(open) }}
                           // open={open}
                           inline
                           key={`attachment-popup-${index}`}
                           content={
                              <Flex
                                 column
                                 key={`actions-content-${x.id}`}
                                 fill
                              >
                                 <Button
                                    className={`mmt-contextual-btn mmt-link-btn ui-button`}
                                    key={`download-contextual-${x.id}`}
                                    content={t("Download")}
                                    icon={<DownloadIcon />}
                                    text
                                    onClick={ () => { invokeOnDownloadClick(file.name); return false; } }
                                 />
                                 {props.onDeleteFile === undefined ? <></> : <Button
                                    className={`mmt-contextual-btn mmt-link-btn ui-button`}
                                    key={`delete-contextual-${x.id}`}
                                    content={t("Delete")}
                                    icon={<TrashCanIcon />}
                                    text
                                    onClick={ () => { invokeOnDeleteClick(file.name); return false; } }/> }
                                 
                              </Flex>
                           }
                           trigger={<MoreIcon />}
                        />
                     ) : (
                        <Loader size="small" />
                     ),
                  }}
               />
            );
         })}
      </Flex>
   );
};

export default FileList;
