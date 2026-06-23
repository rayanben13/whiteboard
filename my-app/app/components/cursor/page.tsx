"use client"
import { MouseIcon } from 'lucide-react'
import { useSelector } from 'react-redux'

function CursorPage() {
    const { cursor } = useSelector((state: any) => state.cursor)
    return (
        <div>
            {cursor.map((cursor: any) => (
                <div
                    key={cursor.userId}
                    style={{
                        position: "absolute",
                        top: cursor.y,
                        left: cursor.x,
                    }}
                >
                    <MouseIcon />
                </div>
            ))}
        </div>
    )
}

export default CursorPage