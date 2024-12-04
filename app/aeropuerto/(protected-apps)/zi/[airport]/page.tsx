import { Suspense } from 'react'
import SuspenseLoading from '@/components/ui/suspense'
import AirportStatusClient from '@/components/airport/airport-status-client'
import { getZonaIluminadaServices } from '@/lib/chat/functions'
import { AirportZone, airportZones } from '@/lib/config/airport'

export default async function AirportPage({ params }: { params: Promise<{ airport: string }>}) {
  const airport = (await params).airport
  const airportZone = airportZones.filter(a => a.airport_code === airport.toUpperCase())[0]

  return (
    <Suspense fallback={<SuspenseLoading />}>
      <AirportStatusDashboard zone={airportZone} />
    </Suspense>
  )
}

async function AirportStatusDashboard({ zone }: { zone: AirportZone }) {
    const data = await getZonaIluminadaServices(zone.zone_id)
    // console.log(data);
    
    return <AirportStatusClient vehicleTypesList={data} zone={zone} />
  }