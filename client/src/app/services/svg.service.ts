import { Injectable } from '@angular/core';

import { DrawData } from '../models/draw-data.interface';
import { AppModel } from './../models/app.model';
import { Constants } from '../constants';

@Injectable()
export class SvgService {
    constructor(private appModel: AppModel) { }

    private normalize(data) {
        return <DrawData> {
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
        const r = this.appModel.data.reduce((x, y) => {
            x = this.normalize(x);
            y = this.normalize(y);
            return <DrawData> {
                'start': {
                    'x': x.start.x < y.start.x? x.start.x: y.start.x,
                    'y': x.start.y < y.start.y? x.start.y: y.start.y
                },
                'end': {
                    'x': x.end.x > y.end.x? x.end.x: y.end.x,
                    'y': x.end.y > y.end.y? x.end.y: y.end.y
                }
            };
        }, <DrawData> {
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
                    const no = this.normalize(o);
                    return '<rect x="' + no.start.x + '" y="' + no.start.y + '" width="' + (no.end.x - no.start.x) + '" height="' + (no.end.y - no.start.y) + '" stroke-width="1" stroke="#000000" fill="none" />\n';

                case Constants.ID_PEN:
                    return '<polyline points="' + o.start.x + ',' + o.start.y + ' '
                        + o.points.map(point => point.x + ',' + point.y).reduce((x, y) => (x == '')? y: x + ' ' + y, '')
                        + '" stroke-width="1" stroke="#000000" fill="none" />\n';

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
