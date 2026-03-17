import { AirportZone } from "./config/airport";

export interface AirportVehicleType {
    id: number[];
    count: number | null;
    vehicle_image: string;
    name: string;
}

export interface AirportVehicleDetail {
    unique_car_id: string;
    tipo_contrato: string;
    name: string;
    action: number;
    fleet_id: number;
    fleet_name: string;
    entry_time: string;
    total_passengers: number;
    passenger_entry_time: string;
    vehicle_type: string
}

export type InboundAirportVehicleStatus =
    | 'assigned'
    | 'on_road'
    | 'approaching';

export interface InboundAirportVehicle {
    unique_car_id: string;
    fleet_name: string;
    vehicle_type: string;
    vehicle_type_name: string;
    vehicle_contract_type?: string;
    service_name?: string;
    eta_minutes: number;
    eta_updated_at: string;
    passenger_count: number;
    status?: InboundAirportVehicleStatus;
}

export interface Props {
    vehicleTypesList: AirportVehicleType[];
    zone: AirportZone;
}