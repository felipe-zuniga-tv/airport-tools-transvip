'use client';

import { useEffect, useMemo, useState } from 'react';
import {
	CircleMarker,
	MapContainer,
	Popup,
	TileLayer,
	useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import { Maximize2 } from 'lucide-react';

export interface BoardMapPoint {
	booking_id: number;
	lat: number;
	lng: number;
	title: string;
}

const DEFAULT_CENTER: L.LatLngExpression = [-33.4489, -70.6693];

function FitView({ points }: { points: [number, number][] }) {
	const map = useMap();

	useEffect(() => {
		if (points.length === 0) {
			map.setView(DEFAULT_CENTER, 11);
			return;
		}
		if (points.length === 1) {
			map.setView(points[0], 13);
			return;
		}
		map.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 14 });
	}, [map, points]);

	return null;
}

function MapBody({
	points,
	className,
}: {
	points: BoardMapPoint[];
	className?: string;
}) {
	const latLngs = useMemo(
		() => points.map((p) => [p.lat, p.lng] as [number, number]),
		[points],
	);

	return (
		<div className={className}>
			<MapContainer
				center={DEFAULT_CENTER}
				zoom={11}
				className="size-full rounded-lg"
				scrollWheelZoom
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
					url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
					subdomains="abcd"
					maxZoom={20}
				/>
				<FitView points={latLngs} />
				{points.map((p) => (
					<CircleMarker
						key={p.booking_id}
						center={[p.lat, p.lng]}
						radius={9}
						pathOptions={{
							color: '#c2410c',
							fillColor: '#fb923c',
							fillOpacity: 0.92,
							weight: 2,
						}}
					>
						<Popup>
							<div className="text-sm">
								<div className="font-semibold">#{p.booking_id}</div>
								<div className="mt-1 max-w-[220px]">{p.title}</div>
							</div>
						</Popup>
					</CircleMarker>
				))}
			</MapContainer>
		</div>
	);
}

export const BoardDestinationsMap = ({
	points,
}: {
	points: BoardMapPoint[];
}) => {
	const [open, setOpen] = useState(false);

	if (points.length === 0) {
		return (
			<div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
				No hay destinos con coordenadas para mostrar en el mapa.
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="relative h-44 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
				<MapBody points={points} className="absolute inset-0" />
			</div>
			<Button
				type="button"
				variant="outline"
				size="sm"
				className="w-full gap-2 sm:w-auto"
				onClick={() => setOpen(true)}
			>
				<Maximize2 className="size-4" />
				Ampliar mapa
			</Button>

			<Sheet open={open} onOpenChange={setOpen}>
				<SheetContent
					side="bottom"
					className="h-[85vh] max-h-[85vh] w-full rounded-t-xl p-4 sm:max-w-full"
				>
					<SheetHeader className="text-left">
						<SheetTitle>Destinos en espera</SheetTitle>
					</SheetHeader>
					<div className="mt-4 h-[calc(85vh-5rem)] w-full overflow-hidden rounded-lg border border-slate-200">
						{open ? (
							<MapBody points={points} className="size-full min-h-[320px]" />
						) : null}
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
};
