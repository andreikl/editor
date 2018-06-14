import { Injectable } from '@angular/core';

import { Constants } from '../constants';

import { AppModel } from '../models/app.model';


@Injectable()
export class UtilsService {
    constructor(private appModel: AppModel) { }

    toNormal(point: Point, isGrid?: Boolean): Point {
        const normal = {
            'x': point.x / this.appModel.zoom - this.appModel.offset.x,
            'y': point.y / this.appModel.zoom - this.appModel.offset.y
        };
        return {
            'x': isGrid? this.appModel.grid * Math.round(normal.x / this.appModel.grid): normal.x,
            'y': isGrid? this.appModel.grid * Math.round(normal.y / this.appModel.grid): normal.y
        }
    }

    fromNormal(point: Point): Point {
        return {
            'x': (point.x + this.appModel.offset.x) * this.appModel.zoom,
            'y': (point.y + this.appModel.offset.y) * this.appModel.zoom
        }
    }

    getXofLine(a: Point, b: Point, y: number) {
        //(x2-x1)*(y-y1)=(y2-y1)*(x-x1)
        //ab.x*(y-y1)=ab.y*(x-x1)
        //ab.x*(y-y1)/ab.y+x1=x
        const ab = {
            'x': b.x - a.x,
            'y': b.y - a.y,
        }
        return ab.x * (y - a.y) / ab.y + a.x;
    }

    getYofLine(a: Point, b: Point, x: number) {
        //(x2-x1)*(y-y1)=(y2-y1)*(x-x1)
        //ab.x*(y-y1)=ab.y*(x-x1)
        //y=ab.y*(x-x1)/ab.x+y1
        const ab = {
            'x': b.x - a.x,
            'y': b.y - a.y,
        }
        return ab.y * (x - a.x) / ab.x + a.y;
    }

    getXOfEllipse(a: Point, b: Point, y: number): Point {
        // the x radius
        const e0 = Math.abs(b.x - a.x);
        //const e0 = Math.abs(b.x - a.x);
        //console.log('e0: ' + e0);

        // the y radius
        const e1 = Math.abs(b.y - a.y);
        //const e1 = Math.abs(b.y - a.y);
        //console.log('e1: ' + e0);

        // makes center of ellipse be the center of axis
        const cy = y - a.y;
        //console.log('cy: ' + cy);

        // calculates the intersection between line from center of ellipse and point
        // ellipse equation x * x / e0 * e0 + y * y / e1 * e1 = 1
        // x = e0 * sqrt(1 - y * y / e1 * e1))
        const a1 = 1 - (cy * cy) / (e1 * e1);
        //console.log('a1: ' + a1);
        //console.log('y: ' + e0 * Math.sqrt(a1));
        const cx = e0 * Math.sqrt(a1);
        // translates intersection to scene axis
        return {
            'x': -cx + a.x,
            'y': cx + a.x
        }
    }

    getYOfEllipse(a: Point, b: Point, x: number): Point {
        // the x radius
        const e0 = Math.abs(b.x - a.x);
        //console.log('e0: ' + e0);

        // the y radius
        const e1 = Math.abs(b.y - a.y);
        //console.log('e1: ' + e0);

        // makes center of ellipse be the center of axis
        const cx = x - a.x;
        //console.log('cy: ' + cy);

        // calculates the intersection between line from center of ellipse and point
        // ellipse equation x * x / e0 * e0 + y * y / e1 * e1 = 1
        // x = e1 * sqrt(1 - x * x / e0 * e0))
        const a1 = 1 - (cx * cx) / (e0 * e0);
        //console.log('a1: ' + a1);
        //console.log('x: ' + e1 * Math.sqrt(a1));
        const cy = e1 * Math.sqrt(a1);
        // translates intersection to scene axis
        return {
            'x': cy + a.y,
            'y': -cy + a.y
        }
    }

    // calculate middle of the line
    getLineCenter = (start: Point, end: Point) => {
        return <Point> {
            x: ((start.x < end.x)? start.x: end.x) + Math.abs(end.x - start.x) / 2,
            y: ((start.y < end.y)? start.y: end.y) + Math.abs(end.y - start.y) / 2,
        }
    }

    // check if line close enough to point
    testLine(pr: Primitive, a: Point, b: Point, point: Point, pp: PointType | undefined): PrimitivePoint | undefined {
        // optimized calculation
        const ab = {
            'x': b.x - a.x,
            'y': b.y - a.y,
        }
        const ac = {
            'x': point.x - a.x,
            'y': point.y - a.y,
        }
        const bc = {
            'x': point.x - b.x,
            'y': point.y - b.y,
        }
        const e = this.dotProduction(ac, ab);
        let dist = NaN;
        if (e <= 0.0) {
            dist = this.dotProduction(ac, ac);
        } else {
            const f = this.dotProduction(ab, ab);
            if (e >= f) {
                dist = this.dotProduction(bc, bc);
            } else {
                dist = this.dotProduction(ac, ac) - e * e / f;
            }
        }
        const screenDist = Constants.SELECTION_CIRCLE / this.appModel.zoom
        return (dist < screenDist * screenDist)? this.getClosestLinePoint(pr, a, b, point, pp): undefined;
    }

    // check if elipse close enough to point
    testEllipse(pr: Primitive, a: Point, b: Point, point: Point, context?: any): PrimitivePoint | undefined {
        const d = this.getClosestEllipsePoint(a, b, point);

        if (context) {
            point = this.fromNormal(point);
            const d1 = this.fromNormal(d);

            //draw projection line
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(d1.x, d1.y);
            context.stroke();
        }

        const xd = point.x - d.x;
        const yd = point.y - d.y
        const dist = xd * xd + yd * yd;

        const screenDist = Constants.SELECTION_CIRCLE / this.appModel.zoom
        return (dist < screenDist* screenDist)? {
            'pointType': PointType.MiddlePoint,
            'point': {
                'x': a.x,
                'y': a.y
            },
            'primitive': pr
        }: undefined;
    }

    // check if edge of primitive close enough to point
    testPrimitive(prim: Primitive, point: Point, context?: any): PrimitivePoint | undefined {
        switch(prim.type) {
            case Constants.TYPE_LINE:
            case Constants.TYPE_SIZE:
                return this.testLine(prim, prim.start, prim.end, point, undefined);

            case Constants.TYPE_ARC:
                return this.testEllipse(prim, prim.start, prim.end, point, context);

            case Constants.TYPE_RECTANGLE:
                return this.testLine(prim, prim.start, { // left line
                    'x': prim.start.x,
                    'y': prim.end.y
                }, point, PointType.StartPoint) || this.testLine(prim, { // bottom line
                    'x': prim.start.x,
                    'y': prim.end.y
                }, prim.end, point, PointType.EndPoint) || this.testLine(prim, prim.end, { // right line
                    'x': prim.end.x,
                    'y': prim.start.y
                }, point, PointType.EndPoint) || this.testLine(prim, { // top line
                    'x': prim.end.x,
                    'y': prim.start.y
                }, prim.start, point, PointType.StartPoint);

            default:
                return undefined;
        };
    }

    // get closest point to line
    getClosestLinePoint(pr: Primitive, a: Point, b: Point, point: Point, pp: PointType | undefined = undefined, isAttachToEnd: Boolean = false): PrimitivePoint {
        const ab = {
            'x': b.x - a.x,
            'y': b.y - a.y,
        }
        const ac = {
            'x': point.x - a.x,
            'y': point.y - a.y,
        }
        const bc = {
            'x': point.x - b.x,
            'y': point.y - b.y,
        }
        // project point into ab, computing parametrized position d(t) = a + t * (b - a)
        let t = this.dotProduction(ac, ab) / this.dotProduction(ab, ab);

        // if point outside ab, attach t to the closest endpoint
        if (t < 0.5) {
            if (isAttachToEnd && t < 0.0) t = 0.0;
            return {
                'point': {
                    'x': ab.x * t + a.x,
                    'y': ab.y * t + a.y
                },
                'pointType': pp || PointType.StartPoint,
                'primitive': pr
            }
        } else {
            if (isAttachToEnd && t > 1.0) t = 1.0;
            return {
                'point': {
                    'x': ab.x * t + a.x,
                    'y': ab.y * t + a.y
                },
                'pointType': pp || PointType.EndPoint,
                'primitive': pr
            }
        }
    }

    getClosestEllipsePoint(a: Point, b: Point, point: Point) {
        // the biggest radius
        //const e0 = Math.abs(b.x - a.x) > Math.abs(b.y - a.y)? Math.abs(b.x - a.x): Math.abs(b.y - a.y);
        // the x radius
        const e0 = Math.abs(b.x - a.x);
        //console.log('e1: ' + e0);
        // the smallest radius
        //const e1 = Math.abs(b.x - a.x) > Math.abs(b.y - a.y)? Math.abs(b.y - a.y): Math.abs(b.x - a.x);
        // the y radius
        const e1 = Math.abs(b.y - a.y);
        //console.log('e0: ' + e1);

        // makes center of ellipse be the center of axis
        const dc:Point = {
            'x': point.x - a.x,
            'y': point.y - a.y
        };

        // calculates the intersection between line from center of ellipse and point
        // line equation y = y0 / x0 * x
        // ellipse equation x * x / e0 * e0 + y * y / e1 * e1 = 1
        let d:Point = {
            'x': e0 * e1 / Math.sqrt(e0 * e0 * dc.y * dc.y + e1 * e1 * dc.x * dc.x) * dc.x,
            'y': e0 * e1 / Math.sqrt(e0 * e0 * dc.y * dc.y + e1 * e1 * dc.x * dc.x) * dc.y
        };
        // translates intersection to scene axis
        d = {
            'x': d.x + a.x,
            'y': d.y + a.y
        };
        return d;
    }

    // return point of primitive
    getPrimitivePoint(o: Primitive | undefined, sp: Point) {
        if (!o) {
            return undefined;
        }

        const sc = Constants.SELECTION_CIRCLE;
        const p1 = this.fromNormal(o.start);
        const p2 = this.fromNormal(o.end);
        if (sp.x >= p1.x - sc && sp.x <= p1.x + sc && sp.y >= p1.y - sc && sp.y <= p1.y + sc) { // start point
            return <PrimitivePoint> {
                'point': o.start,
                'pointType': PointType.StartPoint,
                'primitive': this.appModel.selectedPrimitive
            };
        } else if (sp.x >= p2.x - sc && sp.x <= p2.x + sc && sp.y >= p2.y - sc && sp.y <= p2.y + sc) { // end point
            return <PrimitivePoint> {
                'point': o.end,
                'pointType': PointType.EndPoint,
                'primitive': this.appModel.selectedPrimitive
            };
        } else if (o.type == Constants.TYPE_PEN) {
            const pen = <PrimitivePen>o;
            return pen.points.filter(point => {
                const p = this.fromNormal(point);
                return sp.x >= p.x - sc && sp.x <= p.x + sc && sp.y >= p.y - sc && sp.y <= p.y + sc;
            }).map(point => <PrimitivePoint> {
                'point': point,
                'pointType': PointType.MiddlePoint,
                'primitive': this.appModel.selectedPrimitive
            }).find(point => true);
        }
    }

    // clone object
    clone(object: any, isDeep: Boolean): any {
        if (typeof(object) == 'object') {
            if (Array.isArray(object)) {
                return object.map(o => this.clone(o, isDeep));
            } else if (object instanceof Map) {
                var mobj = new Map;
                Array.from(object.entries()).forEach(o => {
                    mobj.set(o[0], this.clone(o[1], isDeep))
                });
                return mobj;
            } else {
                var oobj = {};
                Object.keys(object).forEach(o => {
                    oobj[o] = this.clone(object[o], isDeep);
                });
                return oobj;
            }
        } else {
            return object;
        }
    }

    // translate to canvas rect
    getScreenPoint(rect, px, py): Point {
        return {
            'x': px - rect.left,
            'y': py - rect.top
        };
    }

    createSizePrimitive(pp1: PrimitivePoint, pp2: PrimitivePoint): Primitive | undefined {
        if ((pp1.primitive.type != Constants.TYPE_LINE || pp2.primitive.type != Constants.TYPE_LINE || pp1.primitive.id == pp2.primitive.id) // 1. line to other line case 
            && (pp1.primitive.type != Constants.TYPE_RECTANGLE || pp2.primitive.type != Constants.TYPE_RECTANGLE) // 2. rect to the same rect or other rect
            && (pp1.primitive.type != Constants.TYPE_ARC || pp2.primitive.type != Constants.TYPE_ARC)) // 3. arc to the same arc or other arc
            return undefined;

        const ps = <PrimitiveSize> {
            'id': Date.now().toString(),
            'type': Constants.TYPE_SIZE,
            'start': this.clone(pp1.point, false),
            'end': this.clone(pp2.point, false),
            'ref1': pp1.primitive.id,
            'ref1Type': pp1.pointType,
            'ref2': pp2.primitive.id,
            'ref2Type': pp2.pointType,
            'orientation': Constants.ORIENTATION_HORIZONTAL
        }
        pp1.primitive.references = this.createAndAdd(pp1.primitive.references, ps.id);
        pp2.primitive.references = this.createAndAdd(pp2.primitive.references, ps.id);

        this.moveSizePrimitive(ps, PointType.EndPoint, ps.end);

        this.appModel.selectedPrimitive = ps;
        this.appModel.data.set(ps.id, ps);

        return ps;
    }

    //Factory to create primitives
    createPrimitive(type: string | undefined, point: Point): Primitive | undefined {
        switch (type) {
            case Constants.TYPE_ARC:
                return <PrimitiveArc> {
                    'id': Date.now().toString(),
                    'type': type,
                    'start': point,
                    'end': { 'x': point.x, 'y': point.y },
                    'startAngle': 0,
                    'endAngle': 2 * Math.PI
                };

            case Constants.TYPE_PEN:
                return <PrimitivePen> {
                    'id': Date.now().toString(),
                    'type': type,
                    'start': point,
                    'end': { 'x': point.x, 'y': point.y },
                    'points': new Array<Point>()
                };
            case Constants.TYPE_LINE:
            case Constants.TYPE_RECTANGLE:
                return <Primitive> {
                    'id': Date.now().toString(),
                    'type': type,
                    'start': point,
                    'end': { 'x': point.x, 'y': point.y }
                }

            default:
                return undefined;

        }
    }

    //addPrimitive
    addPrimitive = (prim: Primitive) => {
        prim.start.x = !isNaN(this.appModel.grid)? this.appModel.grid * Math.round(prim.start.x / this.appModel.grid): prim.start.x;
        prim.start.y = !isNaN(this.appModel.grid)? this.appModel.grid * Math.round(prim.start.y / this.appModel.grid): prim.start.y;
        prim.end.x = !isNaN(this.appModel.grid)? this.appModel.grid * Math.round(prim.end.x / this.appModel.grid): prim.end.x;
        prim.end.y = !isNaN(this.appModel.grid)? this.appModel.grid * Math.round(prim.end.y / this.appModel.grid): prim.end.y;

        this.appModel.data.set(prim.id, prim);

        // clear creation state
        this.appModel.selectedTool = undefined;
    }

    movePrimitive = (p: Primitive, pp: PrimitivePoint, point: Point) => {
        if (pp.pointType == PointType.StartPoint) {
            const oldx = pp.point.x;
            const oldy = pp.point.y;
            pp.point.x = !isNaN(this.appModel.grid)? this.appModel.grid * Math.round(point.x / this.appModel.grid): point.x;
            pp.point.y = !isNaN(this.appModel.grid)? this.appModel.grid * Math.round(point.y / this.appModel.grid): point.y;
            const deltax = pp.point.x - oldx;
            const deltay = pp.point.y - oldy;
            p.end.x += deltax;
            p.end.y += deltay;
            if (p.type == Constants.TYPE_PEN) {
                const pp = <PrimitivePen>p;
                pp.points.forEach(o => {
                    o.x += deltax;
                    o.y += deltay;
                });
            }
        } else {
            pp.point.x = !isNaN(this.appModel.grid)? this.appModel.grid * Math.round(point.x / this.appModel.grid): point.x;
            pp.point.y = !isNaN(this.appModel.grid)? this.appModel.grid * Math.round(point.y / this.appModel.grid): point.y;
        }
        if (p.references) {
            p.references.forEach(ref => {
                let ps = <PrimitiveSize>this.appModel.data.get(ref);
                if (p.id == ps.ref1) {
                    this.moveSizePrimitive(ps, PointType.StartPoint, ps.start);
                } else {
                    this.moveSizePrimitive(ps, PointType.EndPoint, ps.end);
                }
            });
        }
    }

    moveSizePrimitive = (ps: PrimitiveSize, pt: PointType, point: Point) => {
        // swap xy if it is negative to avoid negative values and simplify calculations
        if (this.swapSizePositions(ps)) {
            pt = (pt == PointType.EndPoint)? PointType.StartPoint: PointType.EndPoint;
        }

        const r1 = this.appModel.data.get(ps.ref1);
        const r2 = this.appModel.data.get(ps.ref2);
        if (r1 && r2) {
            if (r1.type == Constants.TYPE_LINE && r2.type == Constants.TYPE_LINE && r1.id != r2.id) { // line to other line case
                if (ps.orientation == Constants.ORIENTATION_HORIZONTAL) {
                    if (pt == PointType.StartPoint) {
                        const p = this.getClosestLinePoint(r1, r1.start, r1.end, point, undefined);
                        const x = this.getXofLine(r2.start, r2.end, p.point.y);
                        ps.start.x = p.point.x;
                        ps.start.y = p.point.y;
                        ps.end.x = x;
                        ps.end.y = p.point.y;
                    } else {
                        const p = this.getClosestLinePoint(r2, r2.start, r2.end, point, undefined);
                        const x = this.getXofLine(r1.start, r1.end, p.point.y);
                        ps.start.x = x;
                        ps.start.y = p.point.y;
                        ps.end.x = p.point.x;
                        ps.end.y = p.point.y;
                    }
                } else {
                    if (pt == PointType.StartPoint) {
                        const p = this.getClosestLinePoint(r1, r1.start, r1.end, point, undefined);
                        const y = this.getYofLine(r2.start, r2.end, p.point.x);
                        ps.start.x = p.point.x;
                        ps.start.y = p.point.y;
                        ps.end.x = p.point.x;
                        ps.end.y = y;
                    } else {
                        const p = this.getClosestLinePoint(r2, r2.start, r2.end, point, undefined);
                        const y = this.getYofLine(r1.start, r1.end, p.point.x);
                        ps.start.x = p.point.x;
                        ps.start.y = y;
                        ps.end.x = p.point.x;
                        ps.end.y = p.point.y;
                    }
                   
                }
            } else if (r1.type == Constants.TYPE_RECTANGLE && r2.type == Constants.TYPE_RECTANGLE && r1.id == r2.id) { // rect to the same rect case
                if (ps.orientation == Constants.ORIENTATION_HORIZONTAL) {
                    ps.start.x = r1.start.x;
                    ps.start.y = point.y;
                    ps.end.x = r1.end.x;
                    ps.end.y = point.y;
                } else {
                    ps.start.x = point.x;
                    ps.start.y = r1.start.y;
                    ps.end.x = point.x;
                    ps.end.y = r1.end.y;
                }
            } else if (r1.type == Constants.TYPE_RECTANGLE && r2.type == Constants.TYPE_RECTANGLE && r1.id != r2.id) { // rect to other rect case
                if (ps.orientation == Constants.ORIENTATION_HORIZONTAL) {
                    if (ps.ref1Type == PointType.StartPoint) {
                        ps.start.x = r1.start.x;
                    } else {
                        ps.start.x = r1.end.x;
                    }
                    ps.start.y = point.y;
                    if (ps.ref2Type == PointType.StartPoint) {
                        ps.end.x = r2.start.x;
                    } else {
                        ps.end.x = r2.end.x;
                    }
                    ps.end.y = point.y;
                } else {
                    ps.start.x = point.x;
                    if (ps.ref1Type == PointType.StartPoint) {
                        ps.start.y = r1.start.y;
                    } else {
                        ps.start.y = r1.end.y;
                    }
                    ps.end.x = point.x;
                    if (ps.ref2Type == PointType.StartPoint) {
                        ps.end.y = r2.start.y;
                    } else {
                        ps.end.y = r2.end.y;
                    }
                }
            } else if (r1.type == Constants.TYPE_ARC && r2.type == Constants.TYPE_ARC && r1.id == r2.id) { // arc to the same arc case
                if (ps.orientation == Constants.ORIENTATION_HORIZONTAL) {
                    const xx = this.getXOfEllipse(r1.start, r1.end, r1.start.y);
                    ps.start.x = xx.x;
                    ps.start.y = point.y;
                    ps.end.x = xx.y;
                    ps.end.y = point.y;
                } else {
                    const yy = this.getYOfEllipse(r1.start, r1.end, r1.start.x);
                    ps.start.x = point.x;
                    ps.start.y = yy.y;
                    ps.end.x = point.x;
                    ps.end.y = yy.x;
                }
            } else if (r1.type == Constants.TYPE_ARC && r2.type == Constants.TYPE_ARC && r1.id != r2.id) { // arc to other arc case
                if (ps.orientation == Constants.ORIENTATION_HORIZONTAL) {
                    ps.start.x = r1.start.x;
                    ps.start.y = point.y;
                    ps.end.x = r2.start.x;
                    ps.end.y = point.y;
                } else {
                    ps.start.x = point.x;
                    ps.start.y = r1.start.y;
                    ps.end.x = point.x;
                    ps.end.y = r2.start.y;
                }
            }
        }
        // swap position again in case the moving cause start point to be more than end point
        this.swapSizePositions(ps)
    }

    updateSizeOrientation = (ps: PrimitiveSize) => {
        const point = this.getLineCenter(ps.start, ps.end);
        this.moveSizePrimitive(ps, PointType.StartPoint, point);
    }

    private dotProduction(x: Point, y: Point) {
        return x.x * y.x + x.y * y.y;
    }

    private createAndAdd<T>(arr: Array<T> | undefined, value: T) {
        if (arr) {
            arr.push(value)
            return arr;
        } else 
            return new Array<T>(value);
    }

    private swapSizePositions = (sp: PrimitiveSize): Boolean => {
        if (sp.orientation == Constants.ORIENTATION_HORIZONTAL) {
            if (sp.start.x > sp.end.x) {
                const tp = sp.start;
                sp.start = sp.end;
                sp.end = tp;

                const r = sp.ref1;
                sp.ref1 = sp.ref2;
                sp.ref2 = r;
                return true;
            }
        } else if (sp.orientation == Constants.ORIENTATION_VERTICAL) {
            if (sp.start.y > sp.end.y) {
                const tp = sp.start;
                sp.start = sp.end;
                sp.end = tp;

                const r = sp.ref1;
                sp.ref1 = sp.ref2;
                sp.ref2 = r;
                return true;
            }
        }
        return false;
    }
}
