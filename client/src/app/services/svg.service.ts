import { Injectable } from '@angular/core';

import { DrawData } from '../models/draw-data.interface';
import { AppModel } from './../models/app.model';
import { Constants } from '../constants';

@Injectable()
export class SvgService {
    constructor(private appModel: AppModel) { }

    private normalize(data) {
        return <DrawData> {
            x1: data.x1 < data.x2? data.x1: data.x2,
            y1: data.y1 < data.y2? data.y1: data.y2,
            x2: data.x1 > data.x2? data.x1: data.x2,
            y2: data.y1 > data.y2? data.y1: data.y2
        }
    }

    private getHeader() {
        const r = this.appModel.data.reduce((x, y) => {
            x = this.normalize(x);
            y = this.normalize(y);
            return {
                x1: x.x1 < y.x1? x.x1: y.x1,
                y1: x.y1 < y.y1? x.y1: y.y1,
                x2: x.x2 > y.x2? x.x2: y.x2,
                y2: x.y2 > y.y2? x.y2: y.y2,
            };
        }, {
            x1: NaN,
            y1: NaN,
            x2: NaN,
            y2: NaN
        });

        return '<svg viewBox="' + r.x1 + ' ' + r.y1 + ' ' + (r.x2 - r.x1) + ' ' + (r.y2 - r.y1) + '" xmlns="http://www.w3.org/2000/svg">\n<g>\n';
    }

    private getBody() {
        return this.appModel.data.map((o, index) => {
            switch (o.type) {
                case Constants.ID_LINE:
                    return '<line id="svg_' + index + '" x1="' + o.x1 + '" y1="' + o.y1 + '" x2="' + o.x2 + '" y2="' + o.y2 + '" stroke-width="1" stroke="#000000" fill="none" />\n';

                case Constants.ID_RECTANGLE:
                    const no = this.normalize(o);
                    return '<rect id="svg_' + index + '" x="' + no.x1 + '" y="' + no.y1 + '" width="' + (no.x2 - no.x1) + '" height="' + (no.y2 - no.y1) + '" stroke-width="1" stroke="#000000" fill="none" />\n';

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
