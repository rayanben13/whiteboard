"use client"
import { Suspense, lazy, useEffect } from "react";
import { connectToWhiteboardServer } from "./components/socket/socket";
const WhiteboardPage = lazy(() => import("./components/whiteboard/page"))

export default function Home() {
  useEffect(() => {
    connectToWhiteboardServer()
  }, [])
  return (
    <div>
      <Suspense fallback={<h1>Loading...</h1>}>
        <WhiteboardPage />
      </Suspense>
    </div>
  );
}
