export class Constants {
    static APP_TITLE = 'Editor';

    static EVENT_MODEL_CHANGED = 'model-changed';
    static EVENT_ZOOM = 'zoom';
    static EVENT_SIZE = 'size';
    static EVENT_SELECTED_PRIMITIVE = 'selectedPrimitive';

    static ID_LINE = 'line';
    static ID_RECTANGLE = 'rectangle';
    static ID_PEN = 'pen';
    static ID_PLUS = 'plus';
    static ID_MINUS = 'minus';
    static ID_GRID = 'grid';
    static ID_MOVE = 'move';
    static ID_SAVE = 'save';

    static DEFAULT_ZOOM_DELATA = 0.1;
    static DEFAULT_GRID = 5.0;
    static DEFAULT_ZOOM = 1.0;
    static SELECTION_CIRCLE = 10;
    static MINIMAL_SIZE = 4;

    static SVG_FILENAME = 'svgfile.svg';

    static TOOL_ITEMS = [
        { id: Constants.ID_LINE, name: "Line", isActive: true },
        { id: Constants.ID_RECTANGLE, name: "Rectangle", isActive: false },
        { id: Constants.ID_PEN, name: "Pen", isActive: false },
    ];
    
    static CANVAS_ITEMS = [
        { id: Constants.ID_PLUS, name: "Zoom In", isActive: false },
        { id: Constants.ID_MINUS, name: "Zoom Out", isActive: false },
        { id: Constants.ID_GRID, name: "Grid", isActive: false },
        { id: Constants.ID_MOVE, name: "Move", isActive: false },
        { id: Constants.ID_SAVE, name: "Save", isActive: false }
    ];
};