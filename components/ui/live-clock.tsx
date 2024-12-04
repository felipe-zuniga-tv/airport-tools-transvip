'use client'

import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

const everyXseconds = 1

export function LiveClock({ className }: { className?: string }) {
    const [time, setTime] = useState(new Date().toLocaleTimeString('es-CL', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false }));

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString('es-CL', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false }));
        }, 1000 * everyXseconds);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={cn("text-slate-900 w-[150px] text-lg p-2 px-6 bg-white rounded-lg flex flex-row items-center gap-2", className || '')}>
            <Clock className='h-4 w-4' /> {time}
        </div>
    );
}
