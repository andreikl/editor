/* SystemJS module definition */
//declare var module: NodeModule;
//interface NodeModule {
//    id: string;
//}

declare const enum PointType {
    StartPoint,
    MiddlePoint,
    EndPoint
}

interface Point {
    'x': number,
    'y': number,
}

interface Primitive {
    'type': string;
    'start': Point;
    'end': Point;
    'points': Array<Point>;
}

interface PrimitiveArc extends Primitive {
    'startAngle': number;
    'endAngle': number;
}

interface PrimitivePoint {
    'direction': PointType;
    'point': Point;
    'primitive': Primitive;
}
