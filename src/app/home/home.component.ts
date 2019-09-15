import { Component, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "tns-core-modules/ui/page";
import { screen } from "tns-core-modules/platform/platform";

@Component({
    selector: "ns-home",
    moduleId: module.id,
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.css"]
})
export class HomeComponent implements AfterViewInit {

  public viewHeight: number = screen.mainScreen.heightDIPs;

  // @ViewChild('arrow', { static: true }) arrow: ElementRef;

  constructor(
    private routerExtensions: RouterExtensions,
    private page: Page
  ) {
    // this.page.actionBarHidden = true;
  }

  ngAfterViewInit(): void {
    // this.arrow.nativeElement.translateX = screen.mainScreen.widthDIPs / 10;
  }

  navigateToActivity(): void {
    this.routerExtensions.navigate(['/activity']);
  }

  test() {

    console.log('test');
  }

}
