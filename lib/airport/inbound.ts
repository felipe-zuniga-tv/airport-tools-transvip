import { RowDataPacket } from 'mysql2';

import { airportZones } from '@/lib/config/airport';
import { InboundAirportVehicle } from '@/lib/types';
import { getMysqlPool } from '@/lib/server/mysql';

interface RankedTripRow extends RowDataPacket {
	driver_email: string | null;
	driver_first_name: string | null;
	driver_last_name: string | null;
	vehicle_type_name: string | null;
	license_plate: string | null;
	vehicle_number: string | number | null;
	vehicle_contract_type: string | null;
	service_name: string | null;
	pax_count: string | number | null;
	minutes_eta_to_destination: string | number | null;
	local_location_update_datetime: Date | string | null;
}

const INBOUND_AIRPORT_VEHICLES_QUERY = `
WITH RankedTrips AS (
    SELECT
        tf.fleet_id
        -- Contact
        , tf.email AS driver_email
        , TRIM(tf.first_name) AS driver_first_name
        , TRIM(tf.last_name) AS driver_last_name
        , tf.country_code
        , tf.phone AS driver_phone_number
        -- Location
        , tf.latitude AS driver_latitude
        , tf.longitude AS driver_longitude
        , (tf.location_update_datetime - INTERVAL tj.timezone MINUTE) AS local_location_update_datetime
        -- Driver Status
        , tf.is_active
        , tf.is_available AS is_online
        , tf.status AS working_status
        -- Vehiculo
        , tvt.name AS vehicle_type_name
        , tc.registration_number AS license_plate
        , tc.unique_car_id AS vehicle_number
        , tc.tipo_contrato AS vehicle_contract_type
        -- Reserva
        , tj.shared_service_id
        , tj.job_id
        , tj.type_of_trip
        , tj.job_status
        -- Servicio
        , ts.service_name
        -- Pasajeros
        , tj.number_of_passangers AS pax_count
        -- Convenio
        , tcon.agreement_type
        -- Horarios
        , tj.job_pickup_datetime
        , (tj.job_delivery_datetime - INTERVAL tj.timezone MINUTE) AS local_delivery_datetime
        , (tj.started_datetime - INTERVAL tj.timezone MINUTE) AS local_started_datetime
        -- Direccion
        -- Coordenadas
        , tj.job_pickup_latitude
        , tj.job_pickup_longitude
        , tj.job_latitude
        , tj.job_longitude
        -- Distancias
        , ST_Distance_Sphere(
            POINT(tf.longitude, tf.latitude),
            POINT(tj.job_pickup_longitude, tj.job_pickup_latitude)
        ) AS meters_driver_to_pickup_point
        , ST_Distance_Sphere(
            POINT(tf.longitude, tf.latitude),
            POINT(tj.job_longitude, tj.job_latitude)
        ) AS meters_driver_to_destination
        , ST_Distance_Sphere(
            POINT(tf.longitude, tf.latitude),
            POINT(tj.job_longitude, tj.job_latitude)
        ) / (25 / 3.6) / 60 AS minutes_eta_to_destination
        , CONVERT_TZ(NOW(), 'UTC', 'America/Santiago') + INTERVAL (
            ST_Distance_Sphere(
                POINT(tf.longitude, tf.latitude),
                POINT(tj.job_longitude, tj.job_latitude)
            ) / (25 / 3.6) / 60
        ) MINUTE AS estimated_arrival_time
        , ROW_NUMBER() OVER (
            PARTITION BY COALESCE(tj.shared_service_id, tj.job_id)
            ORDER BY (tj.started_datetime - INTERVAL tj.timezone MINUTE) DESC
        ) AS row_num
    FROM tb_jobs AS tj
    JOIN tb_fleets AS tf ON tf.fleet_id = tj.fleet_id AND tj.job_status IN (1)
    LEFT JOIN transvip_contract AS tcon ON tj.contract_id = tcon.id
    LEFT JOIN transvip_vehicle_type AS tvt ON tf.transport_type = tvt.id
    LEFT JOIN transvip_car_details AS tc ON tf.car_id = tc.id
    LEFT JOIN transvip_type_of_service AS ts ON tj.type_of_service = ts.id
    LEFT JOIN transvip_regions tr ON tr.region_id = tf.branch
    WHERE TRUE
    AND tf.is_deleted = 0
    AND tf.is_blocked = 0
    AND tf.is_available = 1
    AND tf.status IN (0, 1)
    AND tf.admin_verified = 1
    AND tr.region_name = ?
    AND tj.type_of_trip = 'R'
)
SELECT
    *
FROM RankedTrips
WHERE row_num = 1
`;

export function isAirportZoneId(zoneId: number) {
	return airportZones.some((zone) => zone.zone_id === zoneId);
}

export async function getInboundAirportVehicles(zoneId: number) {
	const zone = airportZones.find((airportZone) => airportZone.zone_id === zoneId);

	if (!zone) {
		return [];
	}

	const pool = getMysqlPool();
	const [rows] = await pool.query<RankedTripRow[]>(
		INBOUND_AIRPORT_VEHICLES_QUERY,
		[zone.city_name],
	);

	return rows
		.map<InboundAirportVehicle>((row) => {
			const vehicleTypeName = cleanText(row.vehicle_type_name) || 'Sin tipo';

			return {
				unique_car_id:
					cleanText(row.vehicle_number)?.trim() ||
					cleanText(row.license_plate) ||
					'Sin movil',
				fleet_name: getDriverFullName(row),
				vehicle_type: vehicleTypeName,
				vehicle_type_name: vehicleTypeName,
				vehicle_contract_type: cleanText(row.vehicle_contract_type),
				service_name: cleanText(row.service_name) || 'Sin servicio',
				eta_minutes: normalizeEtaMinutes(row.minutes_eta_to_destination),
				eta_updated_at: normalizeLocalTimestamp(row.local_location_update_datetime),
				passenger_count: normalizePassengerCount(row.pax_count),
			};
		})
		.sort((left, right) => left.eta_minutes - right.eta_minutes);
}

function cleanText(value: string | number | null | undefined) {
	if (value === null || value === undefined) {
		return '';
	}

	return String(value).trim();
}

function getDriverFullName(row: RankedTripRow) {
	const fullName = [cleanText(row.driver_first_name), cleanText(row.driver_last_name)]
		.filter(Boolean)
		.join(' ')
		.trim();

	return fullName || cleanText(row.driver_email) || 'Sin conductor';
}

function normalizePassengerCount(value: string | number | null) {
	const passengerCount = Number(value ?? 0);

	if (!Number.isFinite(passengerCount)) {
		return 0;
	}

	return Math.max(0, passengerCount);
}

function normalizeEtaMinutes(value: string | number | null) {
	const etaMinutes = Number(value ?? 0);

	if (!Number.isFinite(etaMinutes)) {
		return 0;
	}

	return Math.max(0, Math.round(etaMinutes));
}

function normalizeLocalTimestamp(value: Date | string | null) {
	if (!value) {
		return '';
	}

	if (value instanceof Date) {
		return [
			value.getFullYear(),
			String(value.getMonth() + 1).padStart(2, '0'),
			String(value.getDate()).padStart(2, '0'),
		].join('-') + ` ${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}:${String(value.getSeconds()).padStart(2, '0')}`;
	}

	return cleanText(value);
}
