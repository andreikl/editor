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
    'references': Array<string> | undefined;
}

interface PrimitiveArc extends Primitive {
    'startAngle': number;
    'endAngle': number;
}

interface PrimitiveSize extends Primitive {
    'ref1': string;
    'ref1Type': PointType;
    'ref2': string;
    'ref2Type': PointType;
    'orientation': string;
}

interface PrimitivePoint {
    'pointType': PointType;
    'point': Point;
    'primitive': Primitive;
}
