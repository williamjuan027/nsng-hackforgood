import { Component, OnChanges, AfterViewInit, SimpleChanges, Input, Output, EventEmitter, ViewChild, ElementRef } from "@angular/core";
import { Color } from 'tns-core-modules/color';
import { isIOS, isAndroid } from "tns-core-modules/platform";
import { CreateViewEventData } from "tns-core-modules/ui/placeholder";
import { GestureTypes, PanGestureEventData } from "tns-core-modules/ui/gestures";

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
  styleUrls: ["./sidebar.component.css"]
})
export class SidebarComponent implements OnChanges, AfterViewInit {

  nativeWidth: number = 500;
  minHeight = 70;
  maxWaveHeight = 100;
  _shapeLayer;

  private animating: boolean = false;

  private displayLink: CADisplayLink;

  private l3ControlPointView = UIView.new();
  private l2ControlPointView = UIView.new();
  private l1ControlPointView = UIView.new();
  private cControlPointView = UIView.new();
  private r1ControlPointView = UIView.new();
  private r2ControlPointView = UIView.new();
  private r3ControlPointView = UIView.new();

  @Input('height') height: number;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes', changes);
  }

  ngAfterViewInit() {
  }

  onPan(args: PanGestureEventData): void {
    if (args.state === 2) {
      // finger moving
      let additionalHeight = Math.max(args.ios.translationInView(args.ios.view).y, 0);
      let waveHeight = Math.min(additionalHeight * 0.6, this.maxWaveHeight);
      let baseHeight = 50 + additionalHeight - waveHeight;

      let posX = args.ios.locationInView(args.ios.view).x
      this.layoutControlPoints(baseHeight, waveHeight, posX);

      this._updateShapeLayer();
    } else if (args.state === 3) {
      // finger up
      UIView.animateWithDurationDelayUsingSpringWithDampingInitialSpringVelocityOptionsAnimationsCompletion(0.9, 0.0, 0.57, 0.0, [], () => {
        this.animating = true;
        this.displayLink.paused = false;
        this.l1ControlPointView.center = CGPointMake(this.l1ControlPointView.center.x, this.minHeight + 100);
        this.l2ControlPointView.center = CGPointMake(this.l2ControlPointView.center.x, this.minHeight + 100);
        this.l3ControlPointView.center = CGPointMake(this.l3ControlPointView.center.x, this.minHeight + 100);
        this.cControlPointView.center = CGPointMake(this.cControlPointView.center.x, this.minHeight + 100);
        this.r1ControlPointView.center = CGPointMake(this.r1ControlPointView.center.x, this.minHeight + 100);
        this.r2ControlPointView.center = CGPointMake(this.r2ControlPointView.center.x, this.minHeight + 100);
        this.r3ControlPointView.center = CGPointMake(this.r3ControlPointView.center.x, this.minHeight + 100);
      }, () => {
        this.animating = false;
        this.displayLink.paused = true;
      });
    }
  }

  onCreatingView(event: CreateViewEventData) {
    let nativeView;
    if (isIOS) {
      nativeView = UIView.new();

      // nativeView.frame = CGRectMake(0, 0, 200, 200);     // TODO: check if this is used, remove if not used

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

      // used to debug control points
      // this.l3ControlPointView.backgroundColor = UIColor.redColor
      // this.l2ControlPointView.backgroundColor = UIColor.redColor
      // this.l1ControlPointView.backgroundColor = UIColor.redColor
      // this.cControlPointView.backgroundColor = UIColor.redColor
      // this.r1ControlPointView.backgroundColor = UIColor.redColor
      // this.r2ControlPointView.backgroundColor = UIColor.redColor
      // this.r3ControlPointView.backgroundColor = UIColor.redColor

      nativeView.addSubview(this.l3ControlPointView)
      nativeView.addSubview(this.l2ControlPointView)
      nativeView.addSubview(this.l1ControlPointView)
      nativeView.addSubview(this.cControlPointView)
      nativeView.addSubview(this.r1ControlPointView)
      nativeView.addSubview(this.r2ControlPointView)
      nativeView.addSubview(this.r3ControlPointView)

      this.layoutControlPoints(this.minHeight, 0, this.nativeWidth / 2);

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

  layoutControlPoints(baseHeight: number, waveHeight: number, locationX: number): void {
    const width = this.nativeWidth;
    const minLeftX = Math.min((locationX - width / 2) * 0.28, 0);
    const maxRightX = Math.max(width + (locationX - width / 2) * 0.28);

    const leftPartWidth = locationX - minLeftX;
    const rightPartWidth = maxRightX - locationX;

    this.l3ControlPointView.center = CGPointMake(minLeftX, baseHeight);
    this.l2ControlPointView.center = CGPointMake(minLeftX + leftPartWidth * 0.44, baseHeight);
    this.l1ControlPointView.center = CGPointMake(minLeftX + leftPartWidth * 0.71, baseHeight + waveHeight * 0.64);

    this.cControlPointView.center = CGPointMake(locationX, baseHeight + waveHeight * 1.36);
    this.r1ControlPointView.center = CGPointMake(maxRightX - rightPartWidth * 0.71, baseHeight + waveHeight * 0.64);
    this.r2ControlPointView.center = CGPointMake(maxRightX - (rightPartWidth * 0.44), baseHeight);
    this.r3ControlPointView.center = CGPointMake(maxRightX, baseHeight);
  }

  public _updateShapeLayer(): void {
    this._shapeLayer.path = this.currentPath();
  }

  currentPath() {
    let bezierPath = UIBezierPath.bezierPath();
    bezierPath.moveToPoint(CGPointMake(0, 0))

    bezierPath.addLineToPoint(CGPointMake(0, this.getPosition(this.l3ControlPointView).y));
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
    bezierPath.addLineToPoint(CGPointMake(this.nativeWidth, 0));

    bezierPath.closePath();
    return bezierPath.CGPath;
  }

  getPosition(args) {
    return this.animating && args.layer.presentationLayer() ? args.layer.presentationLayer().position : args.center;
  }
}
