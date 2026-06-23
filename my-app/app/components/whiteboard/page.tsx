"use client"
import Toolbar from '@/components/toolbar';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import rough from 'roughjs';
import { v4 as uuid } from "uuid";
import { Actions } from '../constants/actions';
import { elementType, TextElement, ToolTypes } from '../constants/Types';
import CursorPage from '../cursor/page';
import { redo, undo, updateElement } from '../features/whiteboard/whiteboardSlice';
import { emitUpdateElement, handleDeleteCursor, handleMouseMoveSocket } from '../socket/socket';
import { RootState } from '../store/store';
import CreateElement from './utils/createElement';
import { getCursorStyle } from './utils/cursorStyle';
import { drawElement } from './utils/drawElement';
import { drawSelection } from './utils/drawSelection';
import { getElementAtPosition } from './utils/getElementAtPosition';
import { getResizeHandlePosition } from './utils/getResizeHandle';
import { getSelectedElements } from './utils/getSelectedElements';

function WhiteboardPage({ roomId }: { roomId: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bgCanvasRef = useRef<HTMLCanvasElement>(null);

    const toolTypeSelected = useSelector((state: RootState) => state.whiteboard.tool);
    const color = useSelector((state: RootState) => state.whiteboard.color);
    const elements = useSelector((state: RootState) => state.whiteboard.elements);
    const dispatch = useDispatch();

    // const [cursorStyle, setCursorStyle] = useState("default");
    const [action, setAction] = useState<Actions>(Actions.None);
    const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, value: "" });
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [viewTransform, setViewTransform] = useState({
        scale: 1,
        offsetX: 0,
        offsetY: 0,
    });
    const [isPanning, setIsPanning] = useState(false);


    const startCoords = useRef({ worldX: 0, worldY: 0 });
    const currentElementId = useRef<string>("");
    const lastEmitTime = useRef(0);
    const selectedResizeHandleRef = useRef<string | null>(null);
    const selectedElementRef = useRef<elementType | TextElement | null>(null);
    const pointsRef = useRef<{ x: number, y: number }[]>([]);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const tempMovingElementRef = useRef<elementType | TextElement | null>(null);
    const panStart = useRef({
        x: 0,
        y: 0
    });

    const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });



    const handleWheel = (
        e: React.WheelEvent
    ) => {
        // e.preventDefault();

        const zoomFactor = 0.1;

        setViewTransform(prev => ({
            ...prev,
            scale:
                e.deltaY < 0
                    ? prev.scale + zoomFactor
                    : Math.max(
                        0.1,
                        prev.scale - zoomFactor
                    )
        }));
    };

    useEffect(() => {
        const handleMouseLeave =
            () => {
                handleDeleteCursor({ roomId });
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
        const handleResize = () => {
            setScreenSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        // Set initial size on mount
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // رسم العناصر المستقرة على اللوحة الخلفية
    // رسم العناصر المستقرة على اللوحة الخلفية
    useEffect(() => {
        const canvas = bgCanvasRef.current;
        if (!canvas || !elements) return;
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);

        const rc = rough.canvas(canvas);

        ctx?.save();

        ctx?.translate(
            viewTransform.offsetX,
            viewTransform.offsetY
        );

        ctx?.scale(
            viewTransform.scale,
            viewTransform.scale
        );

        elements?.forEach((element) => {
            if ((action === Actions.Move || action === Actions.Resize) && element.id === selectedElementRef.current?.id) {
                return;
            }
            drawElement(ctx, rc, element);
        });

        const selectedElements = elements.filter(
            el => selectedIds.includes(el.id)
        );

        selectedElements.forEach(el => {
            if (action === Actions.Move) return;
            drawSelection(ctx, el);
        });

        ctx?.restore();

    }, [elements, screenSize.width, screenSize.height, selectedIds, action, viewTransform]);
    // text box
    useEffect(() => {
        if (
            textInput.visible &&
            textareaRef.current
        ) {
            textareaRef.current.focus();
        }
    }, [textInput.visible]);

    console.log("test")

    const handleMouseDown = (event: React.MouseEvent) => {
        if (textInput.visible) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const worldX =
            (x - viewTransform.offsetX) /
            viewTransform.scale;

        const worldY =
            (y - viewTransform.offsetY) /
            viewTransform.scale;

        startCoords.current = { worldX, worldY };
        currentElementId.current = uuid();

        const element = getElementAtPosition(worldX, worldY, elements);

        console.log("mouse Down", toolTypeSelected, element)

        if (toolTypeSelected === ToolTypes.None) {
            panStart.current = {
                x: event.clientX,
                y: event.clientY
            };
            startCoords.current = {
                worldX: viewTransform.offsetX,
                worldY: viewTransform.offsetY
            };
            setIsPanning(true);
            setAction(Actions.Panning);
            return;
        }




        if (toolTypeSelected === ToolTypes.Selection) {
            setAction(Actions.Selection)
            startCoords.current = { worldX, worldY };
            if (element) {
                setSelectedIds([element.element.id]);
                return;
            } else {
                setSelectedIds([]);
                return;
            };

        }

        if (toolTypeSelected === ToolTypes.Text) {
            setAction(Actions.Writing);
            setTimeout(() => {
                setTextInput({
                    visible: true,
                    x: worldX,
                    y: worldY,
                    value: "",
                });
            }, 0); return;
        }

        if (toolTypeSelected === ToolTypes.Resize) {

            if (element) {
                selectedElementRef.current = element.element;
                selectedResizeHandleRef.current = element.resizeHandle;
                tempMovingElementRef.current = { ...element.element };

                dragOffsetRef.current = {
                    x: worldX - element.element.x1,
                    y: worldY - element.element.y1,
                };
                setAction(element.resizeHandle === "inside" ? Actions.ReadyToMove : Actions.ReadyToResize);
                return;
            }
        }

        if (toolTypeSelected === ToolTypes.Pencil || toolTypeSelected === ToolTypes.Rectangle || toolTypeSelected === ToolTypes.Line || toolTypeSelected === ToolTypes.FillRectangle) {
            setAction(Actions.Drawing);
            if (toolTypeSelected === ToolTypes.Pencil) {
                pointsRef.current = [];
                pointsRef.current.push({ x: worldX, y: worldY });
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

        const worldX =
            (x - viewTransform.offsetX) /
            viewTransform.scale;

        const worldY =
            (y - viewTransform.offsetY) /
            viewTransform.scale;

        const rc = rough.canvas(canvas);
        let tempElement;

        const now = Date.now();
        if (now - lastEmitTime.current > 16) {
            handleMouseMoveSocket(worldX, worldY, roomId);

            lastEmitTime.current = now;
        }

        if (action === Actions.Panning && toolTypeSelected === ToolTypes.None) {
            const dx = event.clientX - panStart.current.x;
            const dy = event.clientY - panStart.current.y;
            setViewTransform(prev => ({
                ...prev,
                offsetX: startCoords.current.worldX + dx,
                offsetY: startCoords.current.worldY + dy,
            }));
            return;
        }


        if (toolTypeSelected === ToolTypes.Selection && action === Actions.Selection) {
            ctx.save();
            ctx.translate(viewTransform.offsetX, viewTransform.offsetY);
            ctx.scale(viewTransform.scale, viewTransform.scale);

            ctx.setLineDash([5, 5]);
            ctx.strokeRect(startCoords.current.worldX, startCoords.current.worldY, worldX - startCoords.current.worldX, worldY - startCoords.current.worldY);
            ctx.setLineDash([]);
            const selectedElements = getSelectedElements(startCoords.current.worldX, startCoords.current.worldY, worldX, worldY, elements);
            const newSelectedIds =
                selectedElements.map(
                    el => el.id
                );

            setSelectedIds(newSelectedIds);
            selectedElements.forEach((e) => {
                drawSelection(ctx, e);
            });

            ctx.restore();
            return;
        }

        if (toolTypeSelected === ToolTypes.Resize) {
            const element = getElementAtPosition(worldX, worldY, elements);
            const newCursor = getCursorStyle(element!);
            if (canvasRef.current) {
                canvasRef.current.style.cursor = newCursor;
            }

            if (action === Actions.ReadyToMove) {
                setAction(Actions.Move);
                return;
            }
            if (action === Actions.ReadyToResize) {
                setAction(Actions.Resize);
                return;
            }
            if (action === Actions.Move) {
                const selected = selectedElementRef.current;
                if (!selected || !tempMovingElementRef.current) return;

                const dx = worldX - startCoords.current.worldX;
                const dy = worldY - startCoords.current.worldY;

                // 1. تحديث إحداثيات النسخة المؤقتة داخل الـ Ref مباشرة (بدون ريندر)
                if (selected.toolType === ToolTypes.Pencil) {
                    tempMovingElementRef.current = {
                        ...selected,
                        points: selected.points?.map(p => ({ x: p.x + dx, y: p.y + dy })),
                    };
                } else if (selected.toolType === ToolTypes.Text) {
                    tempMovingElementRef.current = {
                        ...selected,
                        x1: selected.x1 + dx,
                        y1: selected.y1 + dy,
                    };
                } else {
                    tempMovingElementRef.current = {
                        ...selected,
                        x1: selected.x1 + dx,
                        y1: selected.y1 + dy,
                        x2: selected.x2 + dx,
                        y2: selected.y2 + dy,
                    };
                }

                // 2. الرسم المباشر الفوري على الكانفاس الأمامي السريع
                ctx.clearRect(0, 0, canvas.width, canvas.height); // تنظيف الكانفاس الأمامي
                ctx.save();
                ctx.translate(viewTransform.offsetX, viewTransform.offsetY);
                ctx.scale(viewTransform.scale, viewTransform.scale);
                drawElement(ctx, rc, tempMovingElementRef.current);
                ctx.restore();

                // إرسال الإحداثيات عبر السوكيت للمستخدمين الآخرين ليَروا الحركة حية
                emitUpdateElement({ elementData: tempMovingElementRef.current, roomId });

                return;
            }
            else if (action === Actions.Resize) {
                setAction(Actions.Resize);
                const selected = selectedElementRef.current;
                if (!selected) return;

                // 1. حساب الأبعاد الجديدة بناءً على حركة الفأرة والـ Handle
                const updatedElement = getResizeHandlePosition(worldX, worldY, selected, selectedResizeHandleRef.current);

                if (updatedElement) {
                    let normalizedElement: elementType | TextElement = { ...updatedElement };

                    if (updatedElement.toolType === ToolTypes.Rectangle) {
                        const rectEl = updatedElement;
                        const minX = Math.min(rectEl.x1, rectEl.x2);
                        const maxX = Math.max(rectEl.x1, rectEl.x2);
                        const minY = Math.min(rectEl.y1, rectEl.y2);
                        const maxY = Math.max(rectEl.y1, rectEl.y2);

                        normalizedElement = {
                            ...rectEl,
                            x1: minX,
                            y1: minY,
                            x2: maxX,
                            y2: maxY,
                        };
                    }

                    // 2. تخزين النتيجة الحية داخل الـ Ref المؤقت (بدون تفجير Re-render)
                    tempMovingElementRef.current = normalizedElement;

                    // 3. مسح الكانفاس الأمامي وإعادة رسم الشكل بأبعاده الجديدة فوراُ
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    ctx.save();

                    ctx.translate(
                        viewTransform.offsetX,
                        viewTransform.offsetY
                    );

                    ctx.scale(
                        viewTransform.scale,
                        viewTransform.scale
                    );

                    drawElement(ctx, rc, normalizedElement);
                    ctx.restore();

                    // 4. بث التغيير اللحظي للمستخدمين الآخرين عبر السوكيت
                    emitUpdateElement({ elementData: normalizedElement, roomId });
                }
                return;
            }
            return;
        }
        else if (canvasRef.current) canvasRef.current.style.cursor = "default";



        if (action === Actions.Drawing) {

            if (toolTypeSelected === ToolTypes.Pencil) {
                pointsRef.current.push({ x: worldX, y: worldY });
                tempElement = {
                    toolType: ToolTypes.Pencil,
                    id: currentElementId.current,
                    points: [...pointsRef.current],
                    color
                };
            } else {
                tempElement = CreateElement({
                    x1: startCoords.current.worldX,
                    y1: startCoords.current.worldY,
                    x2: worldX,
                    y2: worldY,
                    toolType: toolTypeSelected,
                    id: currentElementId.current,
                    color,
                });
            }

            ctx.save();

            ctx.translate(
                viewTransform.offsetX,
                viewTransform.offsetY
            );

            ctx.scale(
                viewTransform.scale,
                viewTransform.scale
            );

            drawElement(ctx, rc, tempElement as elementType | TextElement);
            ctx.restore();

            // const now = Date.now();
            // if (now - lastEmitTime.current > 16) {
            emitUpdateElement({ elementData: tempElement, roomId });
            //     lastEmitTime.current = now;
            // }
        }

    };

    const handleMouseUp = (event: React.MouseEvent) => {
        if (action === Actions.Selection && toolTypeSelected === ToolTypes.Selection) {
            setAction(Actions.None);
            return;
        }

        if (action === Actions.ReadyToMove || action === Actions.ReadyToResize || action === Actions.Panning) {
            setAction(Actions.None);
            setIsPanning(false);
            return;
        }

        if (action === Actions.Writing || toolTypeSelected === ToolTypes.Text) return;
        if (action !== Actions.Drawing && action !== Actions.Resize && action !== Actions.Move) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();


        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const worldX = (x - viewTransform.offsetX) / viewTransform.scale;
        const worldY = (y - viewTransform.offsetY) / viewTransform.scale;

        if (action === Actions.Resize || action === Actions.Move) {
            if (tempMovingElementRef.current) {
                dispatch(updateElement(tempMovingElementRef.current));
                tempMovingElementRef.current = null;
                selectedElementRef.current = null;
                setAction(Actions.None);
                return;
            }
        }

        selectedElementRef.current = null;


        if (action === Actions.Drawing) {
            const finalElement =
                toolTypeSelected === ToolTypes.Pencil
                    ? {
                        toolType: ToolTypes.Pencil,
                        id: currentElementId.current,
                        points: pointsRef.current,
                        color,
                    }
                    : CreateElement({
                        x1: startCoords.current.worldX,
                        y1: startCoords.current.worldY,
                        x2: worldX,
                        y2: worldY,
                        toolType: toolTypeSelected,
                        id: currentElementId.current,
                        color
                    });

            if ('toolType' in finalElement) {
                dispatch(updateElement(finalElement));
            }
            console.log(toolTypeSelected, action)

            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }


        if (canvasRef.current) canvasRef.current.style.cursor = "default";
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
                color
            };
            dispatch(updateElement(textElement));
            emitUpdateElement({ elementData: textElement, roomId });
        }

        setTextInput({ visible: false, x: 0, y: 0, value: "" });
        setAction(Actions.None);
    };


    console.log(roomId)

    return (
        <div>

            <Toolbar roomId={roomId} bgCanvasRef={bgCanvasRef} selectedIds={selectedIds} />

            <div className="relative w-screen h-screen overflow-hidden">

                {/* طبقة رقم 1: الخلفية الثابتة للأشكال المستقرة */}
                <canvas
                    ref={bgCanvasRef}
                    style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
                    width={screenSize.width || '100vw'}
                    height={screenSize.height || '100vh'}

                />

                <canvas
                    ref={canvasRef}
                    onWheel={handleWheel}
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
                    }}
                    width={screenSize.width || '100vw'}
                    height={screenSize.height || '100vh'}
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
                            color: color || "black",
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
        </div>
    );
}

export default WhiteboardPage;