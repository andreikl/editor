import { Point } from './../models/point.interface';

export interface DrawData {
    'type': string;
    'start': Point;
    'end': Point;
    'points': Array<Point>;
}
