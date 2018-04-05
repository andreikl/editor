import { Injectable } from '@angular/core';

import { AppModel } from './../models/app.model';
import { Constants } from '../constants';

@Injectable()
export class SvgService {
    constructor(private appModel: AppModel) { }

    private normalize(data) {
        return <Primitive> {
            'start': {
                'x': data.start.x < data.end.x? data.start.x: data.end.x,
                'y': data.start.y < data.end.y? data.start.y: data.end.y
            },
            'end': {
                'x': data.start.x > data.end.x? data.start.x: data.end.x,
                'y': data.start.y > data.end.y? data.start.y: data.end.y
            }
        }
    }

    private getHeader() {
        const getStart = (o) => {
            o = this.normalize(o);
            console.log('start norm:', o.start);
            if (o.type = Constants.ID_ARC) {
                return {
                    'x': o.start.x - Math.abs(o.end.x - o.start.x),
                    'y': o.start.y - Math.abs(o.end.y - o.start.y)
                }
            } else {
                return o.start;
            }
        }
        const getEnd = (o) => {
            o = this.normalize(o);
            console.log('end norm:', o.end);
            return o.end;
        }

        const r = this.appModel.data.reduce((x, y) => {
            console.log('x:', x);
            console.log('y:', y);
            const ys = getStart(y);
            const ye = getEnd(y);
            console.log('startx ' + x.start.x < ys.x? x.start.x: ys.x);
            console.log('starty ' + x.start.y < ys.y? x.start.y: ys.y);
            console.log('endx ' + x.end.x > ye.x? x.end.x: ye.x);
            console.log('endy ' + x.end.y > ye.y? x.end.y: ye.y);
            const rect = <Primitive> {
                'start': {
                    'x': x.start.x < ys.x? x.start.x: ys.x,
                    'y': x.start.y < ys.y? x.start.y: ys.y
                },
                'end': {
                    'x': x.end.x > ye.x? x.end.x: ye.x,
                    'y': x.end.y > ye.y? x.end.y: ye.y
                }
            };
            console.log(rect);
            return rect;
        }, <Primitive> {
            'start': {
                'x': NaN,
                'y': NaN
            },
            'end': {
                'x': NaN,
                'y': NaN
            }
        });

        return '<svg viewBox="' + r.start.x + ' ' + r.start.y + ' ' + (r.end.x - r.start.x) + ' ' + (r.end.y - r.start.y) + '" xmlns="http://www.w3.org/2000/svg">\n<g>\n';
    }

    private getBody() {
        return this.appModel.data.map(o => {
            switch (o.type) {
                case Constants.ID_LINE:
                    return '<line x1="' + o.start.x + '" y1="' + o.start.y + '" x2="' + o.end.x + '" y2="' + o.end.y + '" stroke-width="1" stroke="#000000" fill="none" />\n';

                case Constants.ID_RECTANGLE:
                    o = this.normalize(o);
                    return '<rect x="' + o.start.x + '" y="' + o.start.y + '" width="' + (o.end.x - o.start.x) + '" height="' + (o.end.y - o.start.y) + '" stroke-width="1" stroke="#000000" fill="none" />\n';

                case Constants.ID_PEN:
                    return '<polyline points="' + o.start.x + ',' + o.start.y + ' '
                        + o.points.map(point => point.x + ',' + point.y).reduce((x, y) => (x == '')? y: x + ' ' + y, '')
                        + '" stroke-width="1" stroke="#000000" fill="none" />\n';

                case Constants.ID_ARC:
                    const dataArc = <PrimitiveArc>o;
                    const rx = Math.abs(o.end.x - o.start.x);
                    const ry = Math.abs(o.end.x - o.start.x);
                    const startx = rx * Math.cos(dataArc.startAngle);
                    const starty = ry * Math.sin(dataArc.startAngle);
                    const endx = rx * Math.cos(dataArc.endAngle);
                    const endy = ry * Math.sin(dataArc.endAngle);

                    if (startx == endx && starty == endy)
                        return '<path d="M' + (o.start.x + startx) + ',' + (o.start.y + starty) + ' A' + rx + ',' + ry + ' 0 0,1 ' + (o.start.x + endx) + ',' + (o.start.y + endy) + '" stroke-width="1" stroke="#000000" fill="none" />\n';
                    else
                        return '<ellipse cx="' + o.start.x + '" cy="' + o.start.y + '" rx="' + rx + '" ry="' + ry + '" stroke-width="1" stroke="#000000" fill="none" />\n';

                default:
                    return '';
            }
        }).reduce((x, y) => x + y, '');
    }

    private getFooter() {
        return '</g>\n</svg>';
    }

    save() {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + this.getHeader() + this.getBody() + this.getFooter());
        element.setAttribute('download', Constants.SVG_FILENAME);
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
    }
}
