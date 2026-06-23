import { setColor, updateElement } from '@/app/components/features/whiteboard/whiteboardSlice';
import { emitUpdateElement } from '@/app/components/socket/socket';
import { RootState } from '@/app/components/store/store';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DialogDemo } from './dialog';

function Toolbar({ roomId, bgCanvasRef, selectedIds }: { readonly roomId: string, readonly bgCanvasRef: React.RefObject<HTMLCanvasElement | null>, readonly selectedIds: string[] }) {
    const dispatch = useDispatch();
    const elements = useSelector((state: RootState) => state.whiteboard.elements);
    const color = useSelector((state: RootState) => state.whiteboard.color);

    const handleColorChange = (newColor: string) => {
        if (selectedIds.length > 0) {
            selectedIds.forEach((id) => {
                const element = elements.find(
                    el => el.id === id
                );

                if (!element) return;

                const updatedElement = {
                    ...element,
                    color: newColor
                };

                dispatch(updateElement(updatedElement));
                emitUpdateElement({ elementData: updatedElement, roomId });
            });
        } else {
            dispatch(setColor(newColor));
        }
    };

    const handleExport = () => {
        const canvas = bgCanvasRef.current;
        if (!canvas) return;

        const image =
            canvas.toDataURL("image/png");

        const pdf = new jsPDF();
        const imgWidth = 190;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(image, "PNG", 10, 10, imgWidth, imgHeight);
        pdf.save("whiteboard.pdf");
    };

    return (
        <div className="fixed top-4 left-4 z-50 
                flex items-center gap-2 p-1.5 
                bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xl">

            <DialogDemo />

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-zinc-800 mx-0.5" />

            <label
                htmlFor="color-picker"
                className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden cursor-pointer active:scale-95 transition-transform"
                style={{ backgroundColor: color || "#000000" }}
                title="Change color"
            >
                <span className="sr-only">Choose drawing color</span>

                <input
                    id="color-picker"
                    type="color"
                    value={color || "#000000"}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </label>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-zinc-800 mx-0.5" />

            <button
                onClick={handleExport}
                title="Export canvas to PDF"
                className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-slate-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-200 transition-all duration-200 text-sm font-medium active:scale-95 shadow-sm"
            >
                <Download className="w-4.5 h-4.5" strokeWidth={2} />
                <span className="hidden sm:inline">Export PDF</span>
            </button>
        </div>
    )
}

export default Toolbar