import {Injectable} from '@angular/core';
import {FileUploader, FileItem, ParsedResponseHeaders} from 'ng2-file-upload';


@Injectable()
export class UploadService {

  private uploader: FileUploader;
  private WEB_API_UPLOAD = '/upload';

  constructor() {

    this.uploader = new FileUploader({
      allowedMimeType: ['application/epub+zip'],
      url: this.WEB_API_UPLOAD
    });
    this.uploader.onBeforeUploadItem = (item) => {

      // Response to preflight request doesn't pass access control check:
      // The value of the 'Access-Control-Allow-Origin' header
      // in the response must not be the wildcard '*' when the request's credentials
      // mode is 'include'
      item.withCredentials = false;
    };
    this.uploader.onErrorItem = ((item: FileItem,
                                  response: string,
                                  status: number,
                                  headers: ParsedResponseHeaders): any => {
      console.error(response);
    });
  }

  get Uploader() {
    return this.uploader;
  }
}
