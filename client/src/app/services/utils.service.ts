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

    dotProduction(x: Point, y: Point) {
        return x.x * y.x + x.y * y.y;
    }

    testLine(a: Point, b: Point, point: Point) {
        //console.log('a: ', a);
        //console.log('b: ', b);
        //console.log('point: ', point);
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

        // closest point implementation
        // project point into ab, computing parametrized position d(t) = a + t * (b - a)
        //let t = this.dotProduction(ac, ab) / this.dotProduction(ab, ab);

        // if point outside ab, attach t to the closest endpoint
        //if (t < 0.0) t = 0.0;
        //if (t > 1.0) t = 1.0;

        // compute the closest point on ab
        //const d = {
        //    'x': ab.x * t + a.x,
        //    'y': ab.y * t + a.y
        //}

        //draw projection to line
        /*const canvas = this.canvas.nativeElement;
        const context = canvas.getContext("2d");
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(d.x, d.y);
        context.stroke();*/

        const screenDist = Constants.SELECTION_CIRCLE / this.appModel.zoom

        return (dist < screenDist * screenDist)? true: false;
    }

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
        } else {
            return o.points.filter(point => {
                const p = this.fromNormal(point);
                return sp.x >= p.x - sc && sp.x <= p.x + sc && sp.y >= p.y - sc && sp.y <= p.y + sc;
            }).map(point => <PrimitivePoint> {
                'point': point,
                'direction': PointType.MiddlePoint,
                'primitive': this.appModel.selectedPrimitive
            }).find(point => true);
        }
    }

    clone(object: any, isDeep: Boolean): any {
        let o = {};
        Object.keys(object).forEach(el => {
            if (isDeep && typeof(object[el]) == 'object') {
                if (Array.isArray(object[el])) {
                    o[el] = object[el].map(arrel => this.clone(arrel, true));
                } else {
                    o[el] = this.clone(object[el], true);
                }
            } else {
                o[el] = object[el];
            }
        });
        return o;
    }

    defer(f, context) {
        setTimeout(() => {
            f.call(context);
        }, 5000);
    }

    getScreenPoint(rect, px, py) {
        return {
            'x': px - rect.left,
            'y': py - rect.top
        };
    }
}
