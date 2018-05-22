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

    // calculate middle of the line
    getLineCenter = (start: Point, end: Point) => {
        return <Point> {
            x: ((start.x < end.x)? start.x: end.x) + Math.abs(end.x - start.x) / 2,
            y: ((start.y < end.y)? start.y: end.y) + Math.abs(end.y - start.y) / 2,
        }
    }

    // check if elipse close enough to point
    testEllipse(a: Point, b: Point, point: Point, context?: any) {
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
        return (dist < screenDist* screenDist)? true: false;
    }

    // check if line close enough to point
    testLine(a: Point, b: Point, point: Point, context?: any) {
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
        return (dist < screenDist * screenDist)? true: false;
    }

    // check if edge of primitive close enough to point
    testPrimitive(prim: Primitive, point: Point): boolean {
        switch(prim.type) {
            case Constants.TYPE_LINE:
            case Constants.TYPE_SIZE:
                return this.testLine(prim.start, prim.end, point);

            case Constants.TYPE_ARC:
                //const canvas = this.canvas.nativeElement;
                //const context = canvas.getContext("2d");
                return this.testEllipse(prim.start, prim.end, point);

            case Constants.TYPE_RECTANGLE:
                return this.testLine(prim.start, {
                    'x': prim.start.x,
                    'y': prim.end.y
                }, point) || this.testLine({
                    'x': prim.start.x,
                    'y': prim.end.y
                }, prim.end, point) || this.testLine(prim.end, {
                    'x': prim.end.x,
                    'y': prim.start.y
                }, point) || this.testLine({
                    'x': prim.end.x,
                    'y': prim.start.y
                }, prim.start, point);

            case Constants.TYPE_PEN:
                const pen = <PrimitivePen>prim;
                return pen.points.reduce((x, y) => {
                    return {
                        'res': x.res || this.testLine(x.point, y, point),
                        'point': y
                    }
                }, {
                    'res': false,
                    'point': prim.start
                }).res;

            default:
                return false;
        };
    }

    // get closest point to line
    getClosestLinePoint(a: Point, b: Point, point: Point) {
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
        if (t < 0.0) t = 0.0;
        if (t > 1.0) t = 1.0;

        // compute the closest point on ab
        return {
            'x': ab.x * t + a.x,
            'y': ab.y * t + a.y
        }
    }

    getClosestEllipsePoint(a: Point, b: Point, point: Point) {
        // the biggest radius
        const e0 = Math.abs(b.x - a.x) > Math.abs(b.y - a.y)? Math.abs(b.x - a.x): Math.abs(b.y - a.y);
        // the smallest radius
        const e1 = Math.abs(b.x - a.x) > Math.abs(b.y - a.y)? Math.abs(b.y - a.y): Math.abs(b.x - a.x);

        // makes center of ellipse be the center of axis
        const dc:Point = {
            'x': point.x - a.x,
            'y': point.y - a.y };

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
    getPrimitivePoint(o: Primitive, sp: Point) {
        const sc = Constants.SELECTION_CIRCLE;
        const p1 = this.fromNormal(o.start);
        const p2 = this.fromNormal(o.end);
        if (sp.x >= p1.x - sc && sp.x <= p1.x + sc && sp.y >= p1.y - sc && sp.y <= p1.y + sc) {
            return <PrimitivePoint> {
                'point': o.start,
                'direction': PointType.StartPoint,
                'primitive': this.appModel.selectedPrimitive
            };
        } else if (sp.x >= p2.x - sc && sp.x <= p2.x + sc && sp.y >= p2.y - sc && sp.y <= p2.y + sc) {
            return <PrimitivePoint> {
                'point': o.end,
                'direction': PointType.EndPoint,
                'primitive': this.appModel.selectedPrimitive
            };
        } else if (o.type == Constants.TYPE_PEN) {
            const pen = <PrimitivePen>o;
            return pen.points.filter(point => {
                const p = this.fromNormal(point);
                return sp.x >= p.x - sc && sp.x <= p.x + sc && sp.y >= p.y - sc && sp.y <= p.y + sc;
            }).map(point => <PrimitivePoint> {
                'point': point,
                'direction': PointType.MiddlePoint,
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

    swapSizePositions = (sp: PrimitiveSize): Boolean => {
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

    createSizePrimitive(start: Point, end: Point, ref1: Primitive, ref2: Primitive): Primitive | undefined {
        if ((ref1.type != Constants.TYPE_LINE || ref2.type != Constants.TYPE_LINE || ref1.id == ref2.id) // 1. line to other line case 
            && (ref1.type != Constants.TYPE_RECTANGLE || ref2.type != Constants.TYPE_RECTANGLE || ref1.id != ref2.id) // 2. rect to the same rect 
            && (ref1.type != Constants.TYPE_ARC || ref2.type != Constants.TYPE_ARC || ref1.id != ref2.id)) // 3. arc to the same arc
            return undefined;

        const ps = <PrimitiveSize> {
            'id': Date.now().toString(),
            'type': Constants.TYPE_SIZE,
            'start': this.clone(ref1.start, false),
            'end': this.clone(ref2.end, false),
            'ref1': ref1.id,
            'ref2': ref2.id,
            'orientation': Constants.ORIENTATION_HORIZONTAL
        }
        if (!ref1.references) {
            ref1.references = new Array<string>();
        }
        ref1.references.push(ps.id);
        if (!ref2.references) {
            ref2.references = new Array<string>();
        }
        ref2.references.push(ps.id);

        this.moveSizePrimitive(ps, PointType.EndPoint, end);
        this.swapSizePositions(ps);
        

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
        if (pp.direction == PointType.StartPoint) {
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
        const r1 = this.appModel.data.get(ps.ref1);
        const r2 = this.appModel.data.get(ps.ref2);
        if (r1 && r2) {
            // line to other line case
            if (r1.type == Constants.TYPE_LINE && r2.type == Constants.TYPE_LINE && r1.id != r2.id) {
                if (ps.orientation == Constants.ORIENTATION_HORIZONTAL) {
                    if (pt == PointType.StartPoint) {
                        const p = this.getClosestLinePoint(r1.start, r1.end, point);
                        const x = this.getXofLine(r2.start, r2.end, p.y);
                        ps.start.x = p.x;
                        ps.start.y = p.y;
                        ps.end.x = x;
                        ps.end.y = p.y;
                    } else {
                        const p = this.getClosestLinePoint(r2.start, r2.end, point);
                        const x = this.getXofLine(r1.start, r1.end, p.y);
                        ps.start.x = x;
                        ps.start.y = p.y;
                        ps.end.x = p.x;
                        ps.end.y = p.y;
                    }
                } else {
                    if (pt == PointType.StartPoint) {
                        const p = this.getClosestLinePoint(r1.start, r1.end, point);
                        const y = this.getYofLine(r2.start, r2.end, p.x);
                        ps.start.x = p.x;
                        ps.start.y = p.y;
                        ps.end.x = p.x;
                        ps.end.y = y;
                    } else {
                        const p = this.getClosestLinePoint(r2.start, r2.end, point);
                        const y = this.getYofLine(r1.start, r1.end, p.x);
                        ps.start.x = p.x;
                        ps.start.y = y;
                        ps.end.x = p.x;
                        ps.end.y = p.y;
                    }
                   
                }
            } else if (r1.type == Constants.TYPE_RECTANGLE && r2.type == Constants.TYPE_RECTANGLE && r1.id == r2.id) { // rect to the same rect case
                const leftBottom = {
                    'x': r1.start.x,
                    'y': r1.end.y,
                };
                const rightTop = {
                    'x': r1.end.x,
                    'y': r1.start.y,
                };
                if (ps.orientation == Constants.ORIENTATION_HORIZONTAL) {
                    if (pt == PointType.StartPoint) {
                        const p = this.getClosestLinePoint(r1.start, leftBottom, point);
                        const x = this.getXofLine(rightTop, r1.end, p.y);
                        ps.start.x = p.x;
                        ps.start.y = p.y;
                        ps.end.x = x;
                        ps.end.y = p.y;
                    } else {
                        const p = this.getClosestLinePoint(rightTop, r1.end, point);
                        const x = this.getXofLine(r1.start, leftBottom, p.y);
                        ps.start.x = x;
                        ps.start.y = p.y;
                        ps.end.x = p.x;
                        ps.end.y = p.y;
                    }
                } else {
                    if (pt == PointType.StartPoint) {
                        const p = this.getClosestLinePoint(r1.start, rightTop, point);
                        const y = this.getYofLine(leftBottom, r1.end, p.x);
                        ps.start.x = p.x;
                        ps.start.y = p.y;
                        ps.end.x = p.x;
                        ps.end.y = y;
                    } else {
                        const p = this.getClosestLinePoint(leftBottom, r1.end, point);
                        const y = this.getYofLine(r1.start, rightTop, p.x);
                        ps.start.x = p.x;
                        ps.start.y = y;
                        ps.end.x = p.x;
                        ps.end.y = p.y;
                    }
                }
            } else if (r1.type == Constants.TYPE_ARC && r2.type == Constants.TYPE_ARC && r1.id == r2.id) { // arc to the same arc case
                const p = this.getClosestEllipsePoint(r1.start, r1.end, point);
                if (ps.orientation == Constants.ORIENTATION_HORIZONTAL) {
                    if (pt == PointType.StartPoint) {
                    } else {
                    }
                } else {
                    if (pt == PointType.StartPoint) {
                    } else {
                    }
                }
            }
        }
    }

    updateSizeOrientation = (ps: PrimitiveSize) => {
        const r1 = this.appModel.data.get(ps.ref1);
        const r2 = this.appModel.data.get(ps.ref2);
        if (r1 && r2) {
            const point = this.getLineCenter(ps.start, ps.end);
            // line to other line case
            if (r1.type == Constants.TYPE_LINE && r2.type == Constants.TYPE_LINE && r1.id != r2.id) {
                if (ps.orientation == Constants.ORIENTATION_HORIZONTAL) {
                    // first point
                    const x1 = this.getXofLine(r1.start, r1.end, point.y);
                    ps.start.x = x1;
                    ps.start.y = point.y;
                    // second point
                    const x2 = this.getXofLine(r2.start, r2.end, point.y);
                    ps.end.x = x2;
                    ps.end.y = point.y;
                } else {
                    // first point
                    const y1 = this.getYofLine(r1.start, r1.end, point.x);
                    ps.start.x = point.x;
                    ps.start.y = y1;
                    // second point
                    const y2 = this.getYofLine(r2.start, r2.end, point.x);
                    ps.end.x = point.x;
                    ps.end.y = y2;
                }
            } else if (r1.type == Constants.TYPE_RECTANGLE && r2.type == Constants.TYPE_RECTANGLE && r1.id == r2.id) { // rect to the same rect case
                const leftBottom = {
                    'x': r1.start.x,
                    'y': r1.end.y,
                };
                const rightTop = {
                    'x': r1.end.x,
                    'y': r1.start.y,
                };
                if (ps.orientation == Constants.ORIENTATION_HORIZONTAL) {
                    // first point
                    const x1 = this.getXofLine(r1.start, leftBottom, point.y);
                    ps.start.x = x1;
                    ps.start.y = point.y;
                    // second point
                    const x2 = this.getXofLine(rightTop, r1.end, point.y);
                    ps.end.x = x2;
                    ps.end.y = point.y;
                } else {
                    // first point
                    const y1 = this.getYofLine(r1.start, rightTop, point.x);
                    ps.start.x = point.x;
                    ps.start.y = y1;
                    // second point
                    const y2 = this.getYofLine(leftBottom, r1.end, point.x);
                    ps.end.x = point.x;
                    ps.end.y = y2;
                }
            }
        }
    }

    private dotProduction(x: Point, y: Point) {
        return x.x * y.x + x.y * y.y;
    }
}
