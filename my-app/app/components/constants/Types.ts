
export enum ToolTypes {
    None = "none",
    Pencil = "pencil",
    Line = "line",
    Rectangle = "rectangle",
    Eraser = "eraser",
    Text = "text",
    Resize = "resize",
    FillRectangle = "fillRectangle",
    Selection = "selection",
    Mouse = "mouse"
}

export type TextElement = {
    id: string;
    toolType: ToolTypes.Text;
    x1: number;
    y1: number;
    text: string;
    color?: string
};



export type elementType = {
    toolType: ToolTypes;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    id: string;
    points?: Array<{ x: number, y: number }>
    message?: string;
    text?: string;
    color?: string;
}

export type otherElementsType = {
    message: string;
    toolType?: ToolTypes;
    resizeHandle?: string;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    id?: string;

}