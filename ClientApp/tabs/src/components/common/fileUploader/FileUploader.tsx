import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Flex, Button, PaperclipIcon, Input } from '@fluentui/react-northstar';
import './FileUploader.scss';

export type FileUploaderProps = {
    onChange: (file: File) => void;
    maxAllowedSize: number;
    isDisabled: boolean;
    label: string;
}

const FileUploader = (props: FileUploaderProps): JSX.Element => {
    const { t, i18n } = useTranslation();
    //const [showError, setShowError] = React.useState(false);
    const inputKey = Math.random().toString(36);
    const inputImageKey = Math.random().toString(36);
    
    const onFileChange = (event: any) => {
        //const files: HTMLInputElement["files"] = event.target.files;

        const maxAllowedSize = props.maxAllowedSize * 1024 * 1024;

        if (event.target.files === null || event.target.files.length === 0) {
            return;
        }
        if (event.target.files[0].size > maxAllowedSize) {
            //setShowError(true);
            setTimeout(() => {
                //setShowError(false);
            }, 5000);
            return;
        } else {
            props.onChange(event.target.files[0]);
        };
    }

    return (
        <Flex column>
            <Input
                className="mmt-fileUploader-input"
                type="file"
                name={`mmt-fileUploader-${inputKey}`}
                id={`mmt-fileUploader-${inputKey}`}
                accept="*"
                key={inputKey}
                onAbort={onFileChange}
                onAbortCapture={onFileChange}
                onChange={onFileChange}
                autoComplete="off"
                disabled={props.isDisabled}
            />
            <Button disabled={props.isDisabled} as={"label"} text primary content={t(props.label)} icon={<PaperclipIcon />} htmlFor={`mmt-fileUploader-${inputKey}`} className={`mmt-fileUploader-label ${props.isDisabled ? 'mmt-disabled-label' : ''}`} />
        </Flex>
    );
}

export default FileUploader;