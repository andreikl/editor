import { Injectable } from '@angular/core';

import { Point } from '../models/point.interface';
import { AppModel } from '../models/app.model';
import { Constants } from '../constants';

@Injectable()
export class UtilsService {

    constructor(private appModel: AppModel) { }

    toNormal(point: Point, isGrid: Boolean): Point {
        const normal = {
            'x': (point.x - this.appModel.offset.x) / this.appModel.zoom,
            'y': (point.y - this.appModel.offset.y) / this.appModel.zoom
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

        return (dist < Constants.SELECTION_CIRCLE * Constants.SELECTION_CIRCLE)? true: false;
    }

    deepClone(object: any): any {
        let o = {};
        Object.keys(object).forEach(el => {
            if (typeof(object[el]) == 'object') {
                if (Array.isArray(object[el])) {
                    o[el] = object[el].map(arrel => this.deepClone(object[el]));
                } else {
                    o[el] = this.deepClone(object[el]);
                }
            } else {
                o[el] = object[el];
            }
        });
        return o;
    }
}
