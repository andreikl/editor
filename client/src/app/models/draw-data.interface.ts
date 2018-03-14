import { Point } from './../models/point.interface';

export interface DrawData {
    'type': string;
    'x1': number;
    'y1': number;
    'x2': number;
    'y2': number;
    'points': Array<Point>;
    isActive: Boolean;
}
