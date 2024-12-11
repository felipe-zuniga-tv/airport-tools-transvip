import { Routes } from "@/utils/routes";

// Airport Zones
export interface AirportZone {
  city_name: string
  airport_code: string
  branch_id: number
  zone_id: number
  enable_delete: boolean
}

export const AIRPORT_CONSTANTS = {
  SECONDS_TO_UPDATE: 30,
  MAX_WAIT_TIME: 15,
  WAIT_TIME_WARNING: 10,
} as const;

export const airportZones: AirportZone[] = [
  { city_name: 'Santiago', airport_code: 'SCL', branch_id: 1, zone_id: 2, enable_delete: true },
  { city_name: 'Antofagasta', airport_code: 'ANF', branch_id: 34, zone_id: 3, enable_delete: false },
  { city_name: 'Calama', airport_code: 'CJC', branch_id: 179, zone_id: 5, enable_delete: false },
  { city_name: 'Calama (Los Olivos)', airport_code: 'CJC2', branch_id: 179, zone_id: 13, enable_delete: false },
]

export const airportTools = [
  { name: 'Zona Iluminada SCL', href: Routes.AIRPORT.ZI_SCL, active: true },
  { name: 'Zona Iluminada ANF', href: Routes.AIRPORT.ZI_ANF, active: true },
  { name: 'Zona Iluminada CJC', href: Routes.AIRPORT.ZI_CJC, active: true },
  { name: 'Zona Iluminada CJC (Los Olivos)', href: Routes.AIRPORT.ZI_CJC_LOS_OLIVOS, active: true },
  { name: 'Crear código QR', href: Routes.QR_GEN, active: false },
  { name: 'Reservas Programadas', href: '#', active: false },
]; // Add more tools as needed
