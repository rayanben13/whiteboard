"use client"
import Home from '@/app/page';
import { useParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { connectToWhiteboardServer, handleRoomJoin } from '../../components/socket/socket';


function WhiteBoardPageRoom() {
    const params = useParams();
    const roomId = params.roomId as string;

    useEffect(() => {
        connectToWhiteboardServer();
    }, []);

    useEffect(() => {
        if (!roomId) return;

        handleRoomJoin(roomId);
    }, [roomId]);

    return (
        <div>
            <Suspense fallback={<h1>Loading...</h1>}>
                <Home roomId={roomId} />
            </Suspense>
        </div>
    )
}

export default WhiteBoardPageRoom;
