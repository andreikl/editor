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
    'id': string;
    'type': string;
    'start': Point;
    'end': Point;
}

interface PrimitiveArc extends Primitive {
    'startAngle': number;
    'endAngle': number;
}

interface PrimitivePen extends Primitive {
    'points': Array<Point>;
}

interface PrimitiveSize extends Primitive {
    'references': Array<string>;
}

interface PrimitivePoint {
    'direction': PointType;
    'point': Point;
    'primitive': Primitive;
}
