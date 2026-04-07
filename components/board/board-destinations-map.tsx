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
import './board-destinations-map.css';
import { cn } from '@/lib/utils';
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
	service_name: string;
	pax_count: number;
	/** Destination line shown below pax count */
	address: string;
	kind: 'shared' | 'exclusive';
}

const MAP_MARKER_STYLES = {
	shared: {
		color: '#9a3412',
		fillColor: '#fb923c',
	},
	exclusive: {
		color: '#5b21b6',
		fillColor: '#a78bfa',
	},
} as const;

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
		<div className={cn('board-map-shell', className)}>
			<MapContainer
				center={DEFAULT_CENTER}
				zoom={11}
				className="size-full rounded-md"
				scrollWheelZoom
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
					url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
					subdomains="abcd"
					maxZoom={20}
				/>
				<FitView points={latLngs} />
				{points.map((p) => {
					const ms = MAP_MARKER_STYLES[p.kind];
					return (
						<CircleMarker
							key={`${p.kind}-${p.booking_id}`}
							center={[p.lat, p.lng]}
							radius={10}
							pathOptions={{
								color: ms.color,
								fillColor: ms.fillColor,
								fillOpacity: 0.9,
								weight: 2.5,
							}}
						>
							<Popup>
								<div className="text-sm text-slate-800">
									<div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 font-semibold tracking-tight text-slate-900">
										<span>#{p.booking_id}</span>
										<span className="text-slate-300" aria-hidden>
											·
										</span>
										<span className="min-w-0 font-semibold text-slate-900">
											{p.service_name}
										</span>
									</div>
									<div className="mt-1 text-sm tabular-nums text-slate-600">
										{p.pax_count === 1
											? '1 pasajero'
											: `${p.pax_count} pasajeros`}
									</div>
									<div className="mt-1 max-w-[250px] text-slate-600 text-sm">
										{p.address}
									</div>
								</div>
							</Popup>
						</CircleMarker>
					);
				})}
			</MapContainer>
		</div>
	);
}

export const BoardDestinationsMap = ({
	points,
	previewClassName,
}: {
	points: BoardMapPoint[];
	/** Height/size for the inline map preview (default: compact `h-44`). */
	previewClassName?: string;
}) => {
	const [open, setOpen] = useState(false);

	if (points.length === 0) {
		return (
			<div className="rounded-lg border border-dashed h-full border-slate-300/90 bg-gradient-to-b from-slate-50 to-slate-100/80 px-4 text-center text-xl text-slate-600 flex items-center justify-center">
				No hay destinos con coordenadas para mostrar en el mapa.
			</div>
		);
	}

	return (
		<div className="flex h-full min-h-0 flex-1 flex-col gap-2">
			<div
				className={cn(
					'relative min-h-0 w-full overflow-hidden rounded-lg bg-slate-200/60 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.12)] ring-1 ring-slate-300/70',
					previewClassName ?? 'h-44',
				)}
			>
				<MapBody points={points} className="absolute inset-0 rounded-xl" />
			</div>
			<Button
				type="button"
				variant="outline"
				size="sm"
				className="w-full shrink-0 gap-2 sm:w-auto"
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
					<div className="mt-4 h-[calc(85vh-5rem)] w-full overflow-hidden rounded-lg bg-slate-200/50 ring-1 ring-slate-300/70">
						{open ? (
							<MapBody points={points} className="size-full min-h-[320px] rounded-lg" />
						) : null}
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
};
