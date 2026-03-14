import { describe, expect, it } from "vitest";

import { buildAirportDashboardState } from "./dashboard";

describe("buildAirportDashboardState", () => {
	it("keeps the latest vehicle entry per car and recomputes counts", () => {
		const sedanType = {
			id: [1],
			count: null,
			name: "Sedan",
			vehicle_image: "sedan.png",
		};
		const vanType = {
			id: [2],
			count: null,
			name: "Van",
			vehicle_image: "van.png",
		};

		const dashboardState = buildAirportDashboardState(
			[sedanType, vanType],
			[
				{
					type: sedanType,
					vehicles: [
						{
							action: 0,
							entry_time: "2026-03-14T12:00:00.000Z",
							fleet_id: 10,
							fleet_name: "Ana",
							name: "S-100",
							passenger_entry_time: "",
							tipo_contrato: "Leasing",
							total_passengers: 2,
							unique_car_id: "100",
							vehicle_type: "",
						},
						{
							action: 0,
							entry_time: "2026-03-14T12:05:00.000Z",
							fleet_id: 10,
							fleet_name: "Ana",
							name: "S-100",
							passenger_entry_time: "",
							tipo_contrato: "Leasing",
							total_passengers: 3,
							unique_car_id: "100",
							vehicle_type: "",
						},
					],
				},
				{
					type: vanType,
					vehicles: [
						{
							action: 0,
							entry_time: "2026-03-14T11:55:00.000Z",
							fleet_id: 20,
							fleet_name: "Beto",
							name: "V-200",
							passenger_entry_time: "",
							tipo_contrato: "Propio",
							total_passengers: 0,
							unique_car_id: "200",
							vehicle_type: "",
						},
					],
				},
			],
		);

		expect(dashboardState.vehicleList).toHaveLength(2);
		expect(dashboardState.vehicleList[0]).toMatchObject({
			unique_car_id: "100",
			vehicle_type: "Sedan",
			total_passengers: 3,
		});
		expect(dashboardState.vehicleList[1]).toMatchObject({
			unique_car_id: "200",
			vehicle_type: "Van",
		});
		expect(dashboardState.vehicleTypes).toEqual([
			{ ...sedanType, count: 1 },
			{ ...vanType, count: 1 },
		]);
	});

	it("returns zero counts when there are no vehicles", () => {
		const suvType = {
			id: [3],
			count: null,
			name: "SUV",
			vehicle_image: "suv.png",
		};

		const dashboardState = buildAirportDashboardState([suvType], []);

		expect(dashboardState.vehicleList).toEqual([]);
		expect(dashboardState.vehicleTypes).toEqual([{ ...suvType, count: 0 }]);
	});
});
