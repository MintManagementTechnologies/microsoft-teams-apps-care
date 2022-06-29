
import axios, { AxiosRequestConfig } from 'axios';
import { getApiBaseUrl } from '../common/utils/sharedFunctions';

// Do not use the RTK service for downloading files as this might crash
// the browser. see link https://github.com/reduxjs/redux-toolkit/issues/1522
export const attachmentDownloadService = {
    downloadAttachment: async (caseId: string, fileName: string) => {
       const baseApiUrl = getApiBaseUrl(true);
       const axiosConfig : AxiosRequestConfig = {
          headers: {
             "authorization": process.env.REACT_APP_APIENDPOINT_TOKEN || 'c940e013-e7c9-4f7b-870b-be07b70d311f'
          }
       };
 
       var response = await axios({
             url: `${baseApiUrl}/Case/attachment/download/${caseId}/${fileName}`, 
             method: 'GET',
             responseType: 'blob', 
             headers: axiosConfig.headers
       });
 
       const url = window.URL.createObjectURL(new Blob([response.data]));
       const link = document.createElement('a');
       link.href = url;
       link.setAttribute('download', fileName); //or any other extension
       link.setAttribute('target', '_blank');
       document.body.appendChild(link);
       link.click();
 
    }
 }
 
 export default attachmentDownloadService;