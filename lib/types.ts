import { AirportZone } from "./config/airport";

export interface AirportVehicleType {
    id: number[];
    count: number;
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
}

export interface Props {
    vehicleTypesList: AirportVehicleType[];
    zone: AirportZone;
}