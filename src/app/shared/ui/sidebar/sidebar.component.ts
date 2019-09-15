import { Component, OnChanges, AfterViewInit, SimpleChanges, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef } from "@angular/core";
import { Color } from 'tns-core-modules/color';
import { isIOS, isAndroid } from "tns-core-modules/platform";
import { CreateViewEventData } from "tns-core-modules/ui/placeholder";
import { GestureTypes, PanGestureEventData } from "tns-core-modules/ui/gestures";
import { animate, state, query, stagger, style, transition, trigger } from "@angular/animations";

declare const CAShapeLayer;
declare const UIView;

// example of calling function from parent class using WeakRef
// https://github.com/NativeScript/NativeScript/blob/master/tns-core-modules/fps-meter/fps-native.ios.ts
class CADisplayLinkTargetHandler extends NSObject {

  private _owner: WeakRef<SidebarComponent>;

  public static initWithOwner(owner: WeakRef<SidebarComponent>): CADisplayLinkTargetHandler {
    let handler = <CADisplayLinkTargetHandler>CADisplayLinkTargetHandler.new();
    handler._owner = owner;

    return handler;
  }
  public updateShapeLayer(link: CADisplayLink) {
    const owner = this._owner.get();
    if (owner) {
      owner._updateShapeLayer();
    }
  }
  public static ObjCExposedMethods = {
    "updateShapeLayer": { returns: interop.types.void, params: [CADisplayLink] }
  };
}

@Component({
  selector: "ns-sidebar",
  moduleId: module.id,
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"],
  animations: [
    trigger("state", [
      state("in", style({
        opacity: 1,
        transform: "translate(0)"
      })),
      state("void", style({
        opacity: 0,
        transform: "translate(-50, 0)"
      })),
      transition("void => *", [animate("200ms ease-out")]),
      transition("* => void", [animate("200ms ease-out")])
    ]),
    trigger("listAnimation", [
      transition("* => *", [
        // this hides everything right away
        query(":enter", style({opacity: 0, transform: "translate(-50, 0)"}), { optional: true }),

        // starts to animate things with a stagger in between
        query(":enter", stagger(150, [
          animate(300, style({opacity: 1, transform: "translate(0)"}))
        ]), { delay: 100, optional: true })
      ])
    ])
  ]
})
export class SidebarComponent implements OnChanges, AfterViewInit {

  nativeWidth: number = 800;
  minWidth = 20;
  maxWaveHeight = 100;
  _shapeLayer;

  public isOpen: boolean = false;

  public animating: boolean = false;

  private displayLink: CADisplayLink;

  private l3ControlPointView = UIView.new();
  private l2ControlPointView = UIView.new();
  private l1ControlPointView = UIView.new();
  private cControlPointView = UIView.new();
  private r1ControlPointView = UIView.new();
  private r2ControlPointView = UIView.new();
  private r3ControlPointView = UIView.new();

  @Input('height') height: number;

  isScrolling: boolean = false;
  isPanning: boolean = false;

  constructor(
    private cd: ChangeDetectorRef
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngAfterViewInit() {
  }

  onPan(args: PanGestureEventData): void {
    if (this.isScrolling || this.animating || Math.abs(args.deltaY) > Math.abs(args.deltaX / 2)) {
      return;
    }
    if (args.state === 2) {
      this.isPanning = true;
      // finger moving
      let additionalWidth = Math.max(args.ios.translationInView(args.ios.view).x, 0);
      let waveHeight = Math.min(additionalWidth * 0.6, this.maxWaveHeight);
      let baseWidth = this.minWidth + additionalWidth - waveHeight;

      let posY = args.ios.locationInView(args.ios.view).y;
      this.layoutControlPoints(baseWidth, waveHeight, posY);

      this._updateShapeLayer();
    } else if (args.state === 3) {
      // finger up
      UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(0.9, 0.0, 0.57, 0.0, [], () => {
        this.animating = true;
        this.displayLink.paused = false;
        this.minWidth = this.isOpen ? this.minWidth - 100 : this.minWidth + 100;
        this.l1ControlPointView.center = CGPointMake(this.minWidth, this.l1ControlPointView.center.y);
        this.l2ControlPointView.center = CGPointMake(this.minWidth, this.l2ControlPointView.center.y);
        this.l3ControlPointView.center = CGPointMake(this.minWidth, this.l3ControlPointView.center.y);
        this.cControlPointView.center = CGPointMake(this.minWidth, this.cControlPointView.center.y);
        this.r1ControlPointView.center = CGPointMake(this.minWidth, this.r1ControlPointView.center.y);
        this.r2ControlPointView.center = CGPointMake(this.minWidth, this.r2ControlPointView.center.y);
        this.r3ControlPointView.center = CGPointMake(this.minWidth, this.r3ControlPointView.center.y);
      }, () => {
        this.isPanning = false;
        this.animating = false;
        this.displayLink.paused = true;
        this.isOpen = !this.isOpen;
        this.cd.detectChanges();
      });
    }
  }

  onCreatingView(event: CreateViewEventData) {
    let nativeView;
    if (isIOS) {
      nativeView = UIView.new();

      this._shapeLayer = new CAShapeLayer();

      // this._shapeLayer.frame = CGRectMake(0, 0, 200, 400);//nativeView.bounds;//CGRectMake(100, 100, 100, 150);    // TODO: check if this is used, remove if not used

      this._shapeLayer.fillColor = new Color('#F45866').ios.CGColor;

      this.l3ControlPointView.frame = CGRectMake(0, 0, 3, 3);
      this.l2ControlPointView.frame = CGRectMake(0, 0, 3, 3);
      this.l1ControlPointView.frame = CGRectMake(0, 0, 3, 3);
      this.cControlPointView.frame = CGRectMake(0, 0, 3, 3);
      this.r1ControlPointView.frame = CGRectMake(0, 0, 3, 3);
      this.r2ControlPointView.frame = CGRectMake(0, 0, 3, 3);
      this.r3ControlPointView.frame = CGRectMake(0, 0, 3, 3);

      nativeView.addSubview(this.l3ControlPointView)
      nativeView.addSubview(this.l2ControlPointView)
      nativeView.addSubview(this.l1ControlPointView)
      nativeView.addSubview(this.cControlPointView)
      nativeView.addSubview(this.r1ControlPointView)
      nativeView.addSubview(this.r2ControlPointView)
      nativeView.addSubview(this.r3ControlPointView)

      this.layoutControlPoints(this.minWidth, 0, this.height / 2);

      // --------------------------------------------------------------------------------------------------------------
      // ObjC stuff

      // https://github.com/NativeScript/NativeScript/blob/master/tns-core-modules/fps-meter/fps-native.ios.ts

      let displayedLinkTarget = CADisplayLinkTargetHandler.initWithOwner(new WeakRef(this));
      this.displayLink = CADisplayLink.displayLinkWithTargetSelector(displayedLinkTarget, "updateShapeLayer");
      this.displayLink.addToRunLoopForMode(NSRunLoop.mainRunLoop, NSDefaultRunLoopMode);
      this.displayLink.paused = true;

      // --------------------------------------------------------------------------------------------------------------

      this._updateShapeLayer();

      nativeView.layer.addSublayer(this._shapeLayer);
    }
    event.view = nativeView;
  }

  layoutControlPoints(baseWidth: number, waveHeight: number, locationY: number): void {
    // const width = this.nativeWidth;
    const height = this.height + 40;
    locationY = locationY - 130;
    const minTopY = Math.min((locationY - height / 2) * 0.28, 0);
    const maxBottomY = Math.max(height + (locationY - height / 2) * 0.28);

    const topPartWidth = locationY - minTopY;
    const bottomPartWidth = maxBottomY - locationY;

    this.l3ControlPointView.center = CGPointMake(baseWidth, minTopY);
    this.l2ControlPointView.center = CGPointMake(baseWidth, minTopY + topPartWidth * 0.44);
    this.l1ControlPointView.center = CGPointMake(baseWidth + waveHeight * 0.64, minTopY + topPartWidth * 0.71);

    this.cControlPointView.center = CGPointMake(baseWidth + waveHeight * 1.36, locationY);
    this.r1ControlPointView.center = CGPointMake(baseWidth + waveHeight * 0.64, maxBottomY - bottomPartWidth * 0.71);
    this.r2ControlPointView.center = CGPointMake(baseWidth, maxBottomY - (bottomPartWidth * 0.44));
    this.r3ControlPointView.center = CGPointMake(baseWidth, maxBottomY);
  }

  public _updateShapeLayer(): void {
    this._shapeLayer.path = this.currentPath();
  }

  currentPath() {
    let bezierPath = UIBezierPath.bezierPath();
    bezierPath.moveToPoint(CGPointMake(0, -30))

    bezierPath.addLineToPoint(CGPointMake(this.getPosition(this.l3ControlPointView).x, -30));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(
      this.getPosition(this.l1ControlPointView),
      this.getPosition(this.l3ControlPointView),
      this.getPosition(this.l2ControlPointView)
    );
    bezierPath.addCurveToPointControlPoint1ControlPoint2(
      this.getPosition(this.r1ControlPointView),
      this.getPosition(this.cControlPointView),
      this.getPosition(this.r1ControlPointView)
    );
    bezierPath.addCurveToPointControlPoint1ControlPoint2(
      this.getPosition(this.r3ControlPointView),
      this.getPosition(this.r1ControlPointView),
      this.getPosition(this.r2ControlPointView)
    );

    bezierPath.addLineToPoint(CGPointMake(0, this.height));

    bezierPath.closePath();
    return bezierPath.CGPath;
  }

  getPosition(args) {
    return this.animating && args.layer.presentationLayer() ? args.layer.presentationLayer().position : args.center;
  }

  // ----------------------------------------------------------------------------------------------------------------

  onScroll(args: any): void {
    this.isScrolling = true;
    setTimeout(() => {
      this.isScrolling = false;
    }, 300);
  }


}
