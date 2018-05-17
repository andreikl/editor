export class Constants {
    static APP_TITLE = 'Editor';

    static EVENT_MODEL_CHANGED = 'model-changed';
    static EVENT_HISTORY = 'history';
    static EVENT_ZOOM = 'zoom';
    static EVENT_SIZE = 'size';
    static EVENT_GRID = 'grid';
    static EVENT_SELECTED_PRIMITIVE = 'selectedPrimitive';
    static EVENT_SELECTED_TOOL = 'selectedTool';

    static TYPE_LINE = 'line';
    static TYPE_RECTANGLE = 'rectangle';
    static TYPE_PEN = 'pen';
    static TYPE_ARC = 'arc';
    static TYPE_SIZE = 'size';
    static TYPE_PLUS = 'plus';
    static TYPE_MINUS = 'minus';
    static TYPE_GRID = 'grid';
    static TYPE_MOVE = 'move';
    static TYPE_SAVE = 'save';
    static TYPE_LOAD = 'load';
    static TYPE_BACK = 'back';
    static TYPE_NEXT = 'next';

    static DEFAULT_ZOOM_DELATA = 1.0;
    static DEFAULT_GRID = 4.0;
    static DEFAULT_NET = 20.0;
    static DEFAULT_NET_2 = 5;
    static DEFAULT_ZOOM = 3.0;
    static SELECTION_CIRCLE = 10;
    static MINIMAL_SIZE = 4;
    static MAXIMUM_HISTORY = 20;

    static ZERO_POINT: Point = {
        'x': 0,
        'y': 0
    };

    static SVG_FILENAME = 'svgfile.svg';

    static TOOL_ITEMS = [
        { id: Constants.TYPE_LINE, name: "Line", isActive: true },
        { id: Constants.TYPE_RECTANGLE, name: "Rectangle", isActive: false },
        { id: Constants.TYPE_PEN, name: "Pen", isActive: false },
        { id: Constants.TYPE_ARC, name: "Arc", isActive: false },
        { id: Constants.TYPE_SIZE, name: "Size", isActive: false },
    ];
    
    static PAGE_ITEMS = {
        'plus': { id: Constants.TYPE_PLUS, name: "Zoom In", isActive: false },
        'minus': { id: Constants.TYPE_MINUS, name: "Zoom Out", isActive: false },
        'grid': { id: Constants.TYPE_GRID, name: "Grid", isActive: false },
        'move': { id: Constants.TYPE_MOVE, name: "Move", isActive: false },
    };

    static FILE_ITEMS = {
        'save': { id: Constants.TYPE_SAVE, name: "Save", isActive: false },
        'load': { id: Constants.TYPE_LOAD, name: "Load", isActive: false },
        'back': { id: Constants.TYPE_BACK, name: "Back", isActive: false },
        'next': { id: Constants.TYPE_NEXT, name: "Next", isActive: false }
    };
};
