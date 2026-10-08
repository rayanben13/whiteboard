import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export function DialogDemo() {
    const [roomName, setRoomName] = useState("")
    const router = useRouter();
    const handleCreateRoom = () => {
        const roomId = crypto.randomUUID();
        router.push(`/whiteboard/${roomId}?name=${roomName}`)
    }
    const searchParams = useSearchParams();
    const room_Name = searchParams.get("name");
    const pathname = usePathname()
    return (
        <Dialog>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateRoom(); }}>
                <DialogTrigger asChild>
                    <Button name="create-room" aria-label="create-room" variant="outline" className="flex items-center gap-1.5 px-3 h-9 rounded-xl border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all duration-200 active:scale-95 shadow-sm">
                        <Users className="w-4.5 h-4.5" strokeWidth={2} />
                        <span className="hidden sm:inline">{pathname === '/' ? 'Create room' : room_Name}</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Room name</DialogTitle>
                        <DialogDescription>
                            Choose room name
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="name">Name</Label>
                            <Input type="text" id="name" name="name" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
                        </Field>

                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleCreateRoom}
                            type="submit">Create</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
