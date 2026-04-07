import { Routes } from "@/utils/routes";

// Airport Zones
export interface AirportZone {
  active: boolean
  city_name: string
  airport_code: string
  branch_id: number
  zone_id: number
  enable_delete: boolean
  enable_inbound: boolean
  href: string
}

export const AIRPORT_CONSTANTS = {
  SECONDS_TO_UPDATE: 45,
  SECONDS_TO_UPDATE_INBOUND: 120,
  MAX_WAIT_TIME: 15,
  WAIT_TIME_WARNING: 10,
} as const;

export const airportZones: AirportZone[] = [
  { active: true, city_name: 'Santiago', airport_code: 'SCL', branch_id: 1, zone_id: 2, enable_delete: true, enable_inbound: false, href: Routes.AIRPORT.ZI_SCL },
  { active: true, city_name: 'Antofagasta', airport_code: 'ANF', branch_id: 34, zone_id: 3, enable_delete: false, enable_inbound: false, href: Routes.AIRPORT.ZI_ANF },
  { active: true, city_name: 'Calama', airport_code: 'CJC', branch_id: 179, zone_id: 5, enable_delete: false, enable_inbound: false, href: Routes.AIRPORT.ZI_CJC },
  { active: true, city_name: 'Calama (Los Olivos)', airport_code: 'CJC2', branch_id: 179, zone_id: 13, enable_delete: false, enable_inbound: false, href: Routes.AIRPORT.ZI_CJC_LOS_OLIVOS },
]

export function isInboundEnabledForZone(zoneId: number) {
  return airportZones.some(
    (zone) => zone.zone_id === zoneId && zone.enable_inbound,
  )
}

export const airportTools = [
  { name: 'Zona Iluminada SCL', href: Routes.AIRPORT.ZI_SCL, active: true },
  { name: 'Zona Iluminada ANF', href: Routes.AIRPORT.ZI_ANF, active: true },
  { name: 'Zona Iluminada CJC', href: Routes.AIRPORT.ZI_CJC, active: true },
  { name: 'Zona Iluminada CJC (Los Olivos)', href: Routes.AIRPORT.ZI_CJC_LOS_OLIVOS, active: true },
]; // Add more tools as needed
