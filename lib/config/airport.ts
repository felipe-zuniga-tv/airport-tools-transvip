import { Routes } from "@/utils/routes";

// Airport Zones
export interface AirportZone {
    city_name: string;
    airport_code: string;
    branch_id: number;
    zone_id: number;
}

export const AIRPORT_CONSTANTS = {
  SECONDS_TO_UPDATE: 60,
  MAX_WAIT_TIME: 15,
  WAIT_TIME_WARNING: 10,
} as const;

export const airportZones: AirportZone[] = [
    { city_name: 'Santiago', airport_code: 'SCL', branch_id: 1, zone_id: 2 },
    { city_name: 'Antofagasta', airport_code: 'ANF', branch_id: 34, zone_id: 3 },
]

export const airportTools = [
  { name: 'Zona Iluminada SCL', href: Routes.AIRPORT.ZI_SCL, active: true },
  { name: 'Zona Iluminada ANF', href: Routes.AIRPORT.ZI_ANF, active: true },
  { name: 'Zona Iluminada CJC', href: Routes.AIRPORT.ZI_SCL, active: false },
  { name: 'Crear código QR', href: Routes.QR_GEN, active: false },
  { name: 'Reservas Programadas', href: '#', active: false },
]; // Add more tools as needed
