import {Component, ViewChild, Input, ElementRef, Inject} from '@angular/core';
import {Report, ReportService} from "./report.service";
import {SafeUrl, DomSanitizer} from "@angular/platform-browser";
import {CheckOverService} from "../check-over/check-over.service";
import {CheckStateService} from "../check-over/check.state.service";
import {FileItem} from 'ng2-file-upload';
import swal from 'sweetalert2';

// import * as jsPDF from 'jspdf';

import {Accessibility} from "../accessibility";
import {TranslateService} from "@ngx-translate/core";

declare var $: any;

@Component({
  selector: 'report',
  templateUrl: './report.html',
  styleUrls: ['./report.css']
})
export class ReportComponent {

  public reportUrl: SafeUrl;

  public btnReportEnabled: boolean;
  public btnReportAnimated: boolean;
  public btnId: string;
  public reportId: string;

  private a11y: Accessibility;
  private focusedElementBeforeOpen: any;

  @Input() itemIndex: number;
  @ViewChild('reportIframe') iframe: ElementRef;

  constructor(private reportService: ReportService,
              private sanitizer: DomSanitizer,
              private checkOverService: CheckOverService,
              private translate: TranslateService,
              private checkStateService: CheckStateService) {

    this.btnReportEnabled = false;
    this.btnReportAnimated = false;
    this.btnId = '-1';

    this.a11y = new Accessibility(translate);
  }

  setItemOnSuccess(item: FileItem) {

    console.log('setItemOnSuccess');

    this.a11y.setAriaLiveValue("Starte Prüfung");
    this.a11y.progressInterpolation(item, 90);

    item.onSuccess = (response: any, status: any, headers: any): any =>
      this.afterSuccessfulUpload(response, item);

    item.onComplete = (response: any, status: any, headers: any): any =>
      console.log('completed');
  }

  private afterSuccessfulUpload(response: string, item: FileItem): any {

    // console.log('afterSuccessfulUpload');

    const responseData = JSON.parse(response);
    const uploadID = responseData.uploadID;
    this.btnId = uploadID;
    this.reportId = uploadID + "_id";

    // (item as any).progressValue = 50;
    this.a11y.setAriaLiveValue("50%");

    this.checkOverService.runCheck(uploadID)
      .then(response => {

        this.checkStateService.checkState(response).then(response => {

          const report = JSON.parse(response);
          this.reportService.add(new Report(responseData.name, uploadID, report.path));
          // console.log('btnID: ' + this.btnId);
          this.afterSuccessfulCheck(item, report);

        }).catch(err => {
            swal({type: 'error', title: 'EPUB: ' + responseData.name + ' ' + 'An error occurred:  ' + err});
            console.error('An error occurred:  ' + err);
          }
        );
      })
      .catch(err => {
        console.error('An error occurred:  ' + err);
      });
  }

  showReport(): void {

    this.btnReportAnimated = false;
    this.setReportSrc(this.reportService.getReportDataById(this.btnId));
  }

  private afterSuccessfulCheck(item, report) {

    this.btnReportEnabled = true;
    this.btnReportAnimated = true;
    (item as any).mode = "determinate";
    (item as any).progressValue = 100;
    (item as any).accessibility = {
      'color': report.aLevel.color,
      'font-size': '32px',
      'width': '32px',
      'height': '32px'
    };


    const accessibilityAsWord = this.a11y.getAccessibilityLevelAsWord(report.aLevel.color);

    this.translate.get('BACC.CHECKER_IS_FINISHED',
      {
        fileName: (item as any).file.name,
        accessibilityAsWord: accessibilityAsWord
      })
      .subscribe((res: string) => {
        this.a11y.setAriaLiveValue(res);
        let onElement = document.getElementById(this.btnId);

        setTimeout(() => {
          // console.log(onElement);
          onElement.focus();
        }, 500)
      });

    (item as any).accessibilityAriaLabel = accessibilityAsWord;
  }

  private setReportSrc(url: string) {
    console.log('url: ' + url);
    this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onLoad() {
    if (this.reportUrl) {
      $("#" + this.reportId).modal('show');

      const id = 'reportIframe-' + this.reportId;

      $("#" + id).contents().find(".header-title").remove();

      // TODO: move to accessibility module
      this.focusedElementBeforeOpen = document.activeElement;
      const that = this;
      $("#" + this.reportId).on('hidden.bs.modal', () => {

        $("#" + id).contents().find("body").html('');

        if (that.focusedElementBeforeOpen)
          that.focusedElementBeforeOpen.focus();
      })
    }
  }

  // saveAsPDF() {
  //
  //   let pdf = new jsPDF('p', 'pt', 'a4');
  //   pdf.text(20, 20, 'BACC Report');
  //   pdf.fromHTML(this.iframe.nativeElement.contentDocument.body, 15, 15, {
  //       'width': 180
  //     },
  //     (dispose) => {
  //       // dispose: object with X, Y of the last line add to the PDF
  //       //          this allow the insertion of new lines after html
  //       pdf.save('Test.pdf');
  //     });
  // }
}


