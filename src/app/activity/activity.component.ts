import { Component, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "tns-core-modules/ui/page";
import { screen } from "tns-core-modules/platform/platform";

@Component({
    selector: "ns-activity",
    moduleId: module.id,
    templateUrl: "./activity.component.html",
    styleUrls: ["./activity.component.css"]
})
export class ActivityComponent implements AfterViewInit {


  constructor(
    private routerExtensions: RouterExtensions,
    private page: Page
  ) {
    this.page.actionBarHidden = true;
  }

  ngAfterViewInit() {
  }

  back(): void {
    this.routerExtensions.backToPreviousPage();
  }


}
