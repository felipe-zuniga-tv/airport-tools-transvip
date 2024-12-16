import Link from 'next/link';
import { airportZones } from '@/lib/config/airport'
import Header from '@/components/ui/navigation/header';
import { TransvipLogo } from '@/components/transvip/transvip-logo';

export default function AirportStartPage() {
    return (
        <div className="grid h-screen size-full bg-desert bg-cover bg-center">
            <div className='flex flex-col bg-gray-200/60'>
                <Header>
                    <TransvipLogo size={24} className="ml-4" />
                    <span className="ml-2 font-bold text-xl">Herramientas Aeropuerto</span>
                </Header>
                <div className='p-8 text-center max-w-4xl mx-auto w-full'>
                    <div className='p-8 bg-white rounded-md flex flex-col gap-4 items-start justify-start overflow-auto'>
                        {airportZones.map((zone) => (
                            <Link key={zone.airport_code} href={zone.href} className='w-full'>
                                <div className="p-12 rounded-md bg-slate-700 hover:bg-slate-500 text-white shadow-md text-xl text-center">
                                    Zona Iluminada - {zone.city_name}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}