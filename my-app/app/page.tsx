"use client"
import { Suspense, lazy, useEffect } from "react";
import { connectToWhiteboardServer } from "./components/socket/socket";
import WhiteboardMenu from "./components/whiteboard/menu";
const WhiteboardPage = lazy(() => import("./components/whiteboard/page"))

export default function Home({ roomId }: { roomId: string }) {
  useEffect(() => {
    connectToWhiteboardServer()
  }, [])
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950">
      <WhiteboardMenu roomId={roomId} />

      <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-zinc-950 text-slate-400 font-medium">Loading Whiteboard...</div>}>
        <WhiteboardPage roomId={roomId} />
      </Suspense>
    </div>
  );
}
