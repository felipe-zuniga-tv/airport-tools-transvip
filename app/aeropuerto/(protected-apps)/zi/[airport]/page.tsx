import { Suspense } from 'react'
import { SuspenseLoading } from '@/components/ui/suspense'
import AirportStatusClient from '@/components/airport/airport-status-client'
import { getZonaIluminadaServices } from '@/lib/chat/functions'
import { AirportZone, airportZones } from '@/lib/config/airport'
import { getSession } from '@/lib/auth'

const DEFAULT_AIRPORT_ZONE = airportZones.filter(a => a.city_name === 'Santiago')[0]

export default async function AirportPage({ params }: { params: Promise<{ airport: string }> }) {
  const airport = (await params).airport
  let airportZoneFilter = airportZones.filter(a => a.airport_code === airport.toUpperCase())
  const airportZone = airportZoneFilter && airportZoneFilter.length ? airportZoneFilter[0] : DEFAULT_AIRPORT_ZONE

  return (
    <Suspense fallback={<SuspenseLoading />}>
      <AirportStatusDashboard zone={airportZone} />
    </Suspense>
  )
}

async function AirportStatusDashboard({ zone }: { zone: AirportZone }) {
  const session = await getSession()
  const data = await getZonaIluminadaServices(zone.zone_id)
  // console.log(`Servicios ZI: ${data.length}`);

  return <AirportStatusClient vehicleTypesList={data} zone={zone} session={session} />
}