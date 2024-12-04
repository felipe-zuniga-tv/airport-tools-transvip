import { airportZones } from '@/lib/config/airport'
import { Routes } from '@/utils/routes';
import Link from 'next/link';

const airportTools = [
    { airport_code: 'SCL', href: Routes.AIRPORT.ZI_SCL, active: true },
    { airport_code: 'ANF', href: Routes.AIRPORT.ZI_ANF, active: true },
];

export default function AirportZonePage() {
    return (
        <div className='bg-gray-200/80 p-8 min-h-screen text-center'>
            <span className='text-xl font-bold'>Zonas Aeropuerto</span>
            <div className='p-8 bg-white rounded-md grid grid-cols-1 md:grid-cols-2 grid-flow-row gap-4 items-start justify-start overflow-auto mt-8'>
                {airportZones.map((zone) => (
                    <Link key={zone.airport_code} href={airportTools.filter(t => t.active && t.airport_code === zone.airport_code)[0].href}>
                        <div className="p-12 rounded-md bg-slate-700 hover:bg-slate-500 text-white shadow-md text-xl text-center">
                            {zone.city_name}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}