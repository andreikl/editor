import { Point } from './../models/point.interface';

export interface Primitive {
    'type': string;
    'start': Point;
    'end': Point;
    'points': Array<Point>;
}
