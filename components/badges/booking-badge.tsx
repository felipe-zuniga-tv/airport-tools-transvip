'use client'
import { Button } from "@/components/ui/button";
import { IBookingInfoOutput } from "@/lib/chat/types";
import { cn } from "@/lib/utils";

export function BookingIdBadge({ result, className }: { 
    result : IBookingInfoOutput
    className?: string
}) {
    return (
        <Button variant={"default"}
            className={cn("h-min py-1 text-white w-[90px] bg-transvip/80 hover:bg-transvip-dark text-sm", className || "")}>
            { result.booking.id }
        </Button>
    )
}