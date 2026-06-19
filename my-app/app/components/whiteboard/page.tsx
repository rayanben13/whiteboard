"use client"
import { Suspense, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import rough from 'roughjs';
import { v4 as uuid } from "uuid";
import { Actions } from '../constants/actions';
import { elementType, TextElement, ToolTypes } from '../constants/Types';
import CursorPage from '../cursor/page';
import { redo, undo, updateElement } from '../features/whiteboard/whiteboardSlice';
import { emitUpdateElement, handleDeleteCursor, handleMouseMoveSocket } from '../socket/socket';
import { RootState } from '../store/store';
import WhiteboardMenu from './menu';
import CreateElement from './utils/createElement';
import { getCursorStyle } from './utils/cursorStyle';
import { drawElement } from './utils/drawElement';
import { drawSelection } from './utils/drawSelection';
import { getElementAtPosition } from './utils/getElementAtPosition';
import { getResizeHandlePosition } from './utils/getResizeHandle';
import { getSelectedElements } from './utils/getSelectedElements';

function WhiteboardPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bgCanvasRef = useRef<HTMLCanvasElement>(null);

    const toolTypeSelected = useSelector((state: RootState) => state.whiteboard.tool);
    const elements = useSelector((state: RootState) => state.whiteboard.elements);
    const dispatch = useDispatch();

    const [cursorStyle, setCursorStyle] = useState("default");
    const [action, setAction] = useState<Actions>(Actions.None);
    const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, value: "" });
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const startCoords = useRef({ x: 0, y: 0 });
    const currentElementId = useRef<string>("");
    const lastEmitTime = useRef(0);
    const selectedResizeHandleRef = useRef<string | null>(null);
    const selectedElementRef = useRef<elementType | TextElement | null>(null);
    const pointsRef = useRef<{ x: number, y: number }[]>([]);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });


    useEffect(() => {
        const handleMouseLeave =
            () => {
                handleDeleteCursor();
            };

        document.addEventListener(
            "mouseleave",
            handleMouseLeave
        );

        return () => {
            document.removeEventListener(
                "mouseleave",
                handleMouseLeave
            );
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (
            e: KeyboardEvent
        ) => {
            if (
                e.ctrlKey &&
                e.key === "z" &&
                !e.shiftKey
            ) {
                e.preventDefault();
                dispatch(undo());
            }

            if (
                e.ctrlKey &&
                e.shiftKey &&
                e.key === "Z"
            ) {
                e.preventDefault();
                dispatch(redo());
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, []);

    useEffect(() => {
        setScreenSize({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    }, []);

    // رسم العناصر المستقرة على اللوحة الخلفية
    useEffect(() => {
        const canvas = bgCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);

        const rc = rough.canvas(canvas);
        elements.forEach((element) => {
            drawElement(ctx, rc, element);
        });
        const selectedElements = elements.filter(
            el => selectedIds.includes(el.id)
        );

        selectedElements.forEach(el => {
            drawSelection(ctx, el);
        });
    }, [elements, screenSize.width, screenSize.height, selectedIds]);

    // text box
    useEffect(() => {
        if (
            textInput.visible &&
            textareaRef.current
        ) {
            textareaRef.current.focus();
        }
    }, [textInput.visible]);

    const handleMouseDown = (event: React.MouseEvent) => {
        if (textInput.visible) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        startCoords.current = { x, y };
        currentElementId.current = uuid();

        const element = getElementAtPosition(x, y, elements);



        if (toolTypeSelected === ToolTypes.None) {
            setAction(Actions.Selection)
            startCoords.current = { x, y };
            if (element) {
                setSelectedIds([element.element.id]);
            } else {
                setSelectedIds([]);
            };

        }



        if (toolTypeSelected === ToolTypes.Text) {
            setAction(Actions.Writing);
            setTimeout(() => {
                setTextInput({
                    visible: true,
                    x,
                    y,
                    value: "",
                });
            }, 0); return;
        }

        if (toolTypeSelected === ToolTypes.Resize) {

            if (element) {
                selectedElementRef.current = element.element;
                selectedResizeHandleRef.current = element.resizeHandle;

                dragOffsetRef.current = {
                    x: x - element.element.x1,
                    y: y - element.element.y1,
                };
                setAction(element.resizeHandle === "inside" ? Actions.Move : Actions.Resize);
                return;
            }
        }

        if (toolTypeSelected === ToolTypes.Pencil || toolTypeSelected === ToolTypes.Rectangle || toolTypeSelected === ToolTypes.Line) {
            setAction(Actions.Drawing);
            if (toolTypeSelected === ToolTypes.Pencil) {
                pointsRef.current = [];
                pointsRef.current.push({ x, y });
            }
        }


    };

    const handleMouseMove = (event: React.MouseEvent) => {

        if (action === Actions.Writing || toolTypeSelected === ToolTypes.Text) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const rc = rough.canvas(canvas);
        let tempElement;

        const now = Date.now();
        if (now - lastEmitTime.current > 16) {
            handleMouseMoveSocket(x, y);

            lastEmitTime.current = now;
        }


        if (toolTypeSelected === ToolTypes.None && action === Actions.Selection) {
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(startCoords.current.x, startCoords.current.y, x - startCoords.current.x, y - startCoords.current.y);
            ctx.setLineDash([])
            const selectedElements = getSelectedElements(startCoords.current.x, startCoords.current.y, x, y, elements);
            const newSelectedIds =
                selectedElements.map(
                    el => el.id
                );

            setSelectedIds(newSelectedIds);
            selectedElements.forEach((e) => {

                drawSelection(ctx, e as elementType | TextElement);
            })

            return;
        }

        if (toolTypeSelected === ToolTypes.Resize) {

            const element = getElementAtPosition(x, y, elements);
            setCursorStyle(getCursorStyle(element));
            if (action === Actions.Move) {
                const selected = selectedElementRef.current;
                if (!selected)
                    return;


                const dx = x - startCoords.current.x;
                const dy = y - startCoords.current.y;

                let updatedElement;

                // pencil move
                if (selected.toolType === ToolTypes.Pencil) {
                    updatedElement = {
                        ...selected,
                        points:
                            selected.points?.map(
                                (p) => ({
                                    x:
                                        p.x + dx,
                                    y:
                                        p.y + dy,
                                })
                            ),
                    };
                }

                // text move
                else if (selected.toolType === ToolTypes.Text) {

                    updatedElement = {
                        ...selected,
                        x1:
                            selected.x1 +
                            dx,
                        y1:
                            selected.y1 +
                            dy,
                    };
                }

                // rect + line
                else {
                    updatedElement = {
                        ...selected,
                        x1:
                            selected.x1 +
                            dx,
                        y1:
                            selected.y1 +
                            dy,
                        x2:
                            selected.x2 +
                            dx,
                        y2:
                            selected.y2 +
                            dy,
                    };
                }

                dispatch(
                    updateElement(
                        updatedElement
                    )
                );

                emitUpdateElement(
                    updatedElement
                );

                selectedElementRef.current =
                    updatedElement;

                startCoords.current = {
                    x,
                    y,
                };

                return;
            }
            else if (action === Actions.Resize) {
                const selected = selectedElementRef.current;
                if (!selected) return;

                const updatedElement = getResizeHandlePosition(x, y, selected, selectedResizeHandleRef.current)
                if (updatedElement) {
                    dispatch(updateElement(updatedElement))
                    selectedElementRef.current = updatedElement;
                }
                return;
            }
            return;
        }
        else {
            setCursorStyle("default")
        }

        if (action === Actions.Drawing) {

            if (toolTypeSelected === ToolTypes.Pencil) {
                pointsRef.current.push({ x, y });
                tempElement = {
                    toolType: ToolTypes.Pencil,
                    id: currentElementId.current,
                    points: [...pointsRef.current],
                };
            } else {
                tempElement = CreateElement({
                    x1: startCoords.current.x,
                    y1: startCoords.current.y,
                    x2: x,
                    y2: y,
                    toolType: toolTypeSelected,
                    id: currentElementId.current,
                });
            }

            drawElement(ctx, rc, tempElement as elementType | TextElement);

            // const now = Date.now();
            // if (now - lastEmitTime.current > 16) {
            emitUpdateElement(tempElement);
            //     lastEmitTime.current = now;
            // }
        }

    };

    const handleMouseUp = (event: React.MouseEvent) => {
        if (action === Actions.Selection && toolTypeSelected === ToolTypes.None) {
            setAction(Actions.None);
            return;
        }

        if (action === Actions.Writing || toolTypeSelected === ToolTypes.Text) return;
        if (action !== Actions.Drawing && action !== Actions.Resize && action !== Actions.Move) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();


        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        selectedElementRef.current = null;

        if (action === Actions.Drawing) {
            const finalElement =
                toolTypeSelected === ToolTypes.Pencil
                    ? {
                        toolType: ToolTypes.Pencil,
                        id: currentElementId.current,
                        points: pointsRef.current,
                    }
                    : CreateElement({
                        x1: startCoords.current.x,
                        y1: startCoords.current.y,
                        x2: x,
                        y2: y,
                        toolType: toolTypeSelected,
                        id: currentElementId.current,
                    });

            if ('toolType' in finalElement) {
                dispatch(updateElement(finalElement));
            }

            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }


        setCursorStyle("default");
        selectedResizeHandleRef.current = null;
        setAction(Actions.None);
    };

    const handleBlur = () => {
        // 👇 Prevent closing if called during mount or if already hidden
        if (!textInput.visible) return;

        const value = textInput.value.trim();
        if (value) {
            const textElement = {
                id: uuid(),
                toolType: ToolTypes.Text,
                x1: textInput.x,
                y1: textInput.y,
                text: value,
            };
            dispatch(updateElement(textElement));
            emitUpdateElement(textElement);
        }

        setTextInput({ visible: false, x: 0, y: 0, value: "" });
        setAction(Actions.None);
    };

    return (
        <div>
            <WhiteboardMenu />
            <Suspense fallback={<h1>Loading...</h1>}>

                <div style={{ position: 'relative', width: screenSize.width, height: screenSize.height, border: '1px solid #ccc' }}>

                    {/* طبقة رقم 1: الخلفية الثابتة للأشكال المستقرة */}
                    <canvas
                        ref={bgCanvasRef}
                        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
                        width={screenSize.width}
                        height={screenSize.height}
                    />

                    <canvas
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            zIndex: 2,
                            background: 'transparent',
                            pointerEvents: textInput.visible ? 'none' : 'auto',
                            cursor: cursorStyle,
                        }}
                        width={screenSize.width}
                        height={screenSize.height}
                    />

                    <CursorPage />


                    {textInput.visible && (
                        <textarea
                            ref={textareaRef}
                            value={textInput.value}
                            onChange={(e) => setTextInput((prev) => ({ ...prev, value: e.target.value }))}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleBlur();
                                } else if (e.key === 'Escape') {
                                    setTextInput(prev => ({ ...prev, visible: false }));
                                    setAction(Actions.None);
                                }
                            }}
                            onBlur={handleBlur}
                            onMouseDown={(e) => e.stopPropagation()}
                            onMouseUp={(e) => e.stopPropagation()}
                            style={{
                                position: "absolute",
                                top: textInput.y,
                                left: textInput.x,
                                zIndex: 999,
                                display: "block", // 👈 Critical for inline elements
                                width: "150px",
                                minHeight: "30px",
                                color: "black",
                                border: "1px solid #333",
                                background: "white",
                                outline: "none",
                                resize: "none",
                                fontSize: "16px",
                                fontFamily: "sans-serif",
                                padding: "4px",
                                boxSizing: "border-box",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                            }}
                        />
                    )}
                </div>
            </Suspense>
        </div>
    );
}

export default WhiteboardPage;