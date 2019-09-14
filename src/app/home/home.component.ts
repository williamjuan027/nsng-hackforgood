import { Component, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { screen } from "tns-core-modules/platform/platform"

@Component({
    selector: "ns-home",
    moduleId: module.id,
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.css"]
})
export class HomeComponent implements AfterViewInit {

  public viewHeight: number = screen.mainScreen.heightDIPs;

  constructor() {
  }

  ngAfterViewInit() {

  }

  test() {

    console.log('test');
  }

}
