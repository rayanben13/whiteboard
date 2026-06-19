
export enum ToolTypes {
    None = "none",
    Pencil = "pencil",
    Line = "line",
    Rectangle = "rectangle",
    Circle = "circle",
    Eraser = "eraser",
    Text = "text",
    Resize = "resize",
}

export type TextElement = {
    id: string;
    toolType: ToolTypes.Text;
    x1: number;
    y1: number;
    text: string;
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