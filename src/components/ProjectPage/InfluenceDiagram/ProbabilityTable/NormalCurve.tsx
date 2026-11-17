import { Slider } from '@equinor/eds-core-react';
import { Input } from '@equinor/eds-core-react/next';
import { useRef, useState } from 'react';
import { formatProbability } from './probabilityFormat';
import { normalCdf, normalPdf } from './probabilityTableMath';

const WIDTH = 352;
const HEIGHT = 128;
const AXIS = 112;
const TOP = 22;
const round = (value: number) => Math.round(value * 100) / 100;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Curve, bars and a draggable centre handle on the 0–1 outcome scale */
export const NormalCurve = ({
	centre,
	sd,
	names,
	values,
	onCentreChange,
}: {
	centre: number;
	sd: number;
	/** In scale order */
	names: string[];
	/** In scale order, or undefined while the settings are invalid */
	values?: number[];
	onCentreChange: (centre: number) => void;
}) => {
	const svgRef = useRef<SVGSVGElement>(null);
	const [dragging, setDragging] = useState(false);
	const n = names.length;
	const valid = Number.isFinite(centre) && Number.isFinite(sd) && sd > 0;
	const truncation = valid ? normalCdf(1, centre, sd) - normalCdf(0, centre, sd) : 1;
	// A slice's probability is about density × slice width, so curve and bars share one scale
	const curve = valid
		? Array.from({ length: 101 }, (_, i) => {
				const x = i / 100;
				return { x, y: normalPdf(x, centre, sd) / truncation / n };
			})
		: [];
	const top = Math.max(...(values ?? [0]), ...curve.map(point => point.y), 0.0001) * 1.1;
	const toY = (value: number) => AXIS - (value / top) * (AXIS - TOP);
	const handleX = clamp(centre, 0, 1) * WIDTH;
	const centreFromPointer = (event: React.PointerEvent) => {
		const rect = svgRef.current?.getBoundingClientRect();
		if (!rect) return;
		onCentreChange(round(clamp((event.clientX - rect.left) / rect.width, 0, 1)));
	};

	return (
		<div className='flex flex-col gap-1'>
			<svg
				ref={svgRef}
				viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
				className='w-full touch-none overflow-visible select-none'
				aria-hidden={false}
				onPointerDown={event => {
					event.currentTarget.setPointerCapture(event.pointerId);
					setDragging(true);
					centreFromPointer(event);
				}}
				onPointerMove={event => dragging && centreFromPointer(event)}
				onPointerUp={() => setDragging(false)}
			>
				{values?.map((value, i) => (
					<rect
						key={i}
						x={(i / n) * WIDTH + 2}
						width={WIDTH / n - 4}
						y={toY(value)}
						height={AXIS - toY(value)}
						className='fill-(--eds-dataviz-cat-1-1)'
					/>
				))}
				{curve.length > 0 && (
					<polyline
						points={curve.map(point => `${point.x * WIDTH},${toY(point.y)}`).join(' ')}
						className='fill-none stroke-(--eds-dataviz-cat-1-4)'
						strokeWidth={2}
					/>
				)}
				<line
					x1={0}
					x2={WIDTH}
					y1={AXIS}
					y2={AXIS}
					className='stroke-(--eds-text-secondary)'
				/>
				{Array.from({ length: n - 1 }, (_, i) => (
					<line
						key={i}
						x1={((i + 1) / n) * WIDTH}
						x2={((i + 1) / n) * WIDTH}
						y1={AXIS - 4}
						y2={AXIS + 4}
						className='stroke-(--eds-text-secondary)'
					/>
				))}
				<line
					x1={handleX}
					x2={handleX}
					y1={TOP - 4}
					y2={AXIS}
					strokeDasharray='3 3'
					className='stroke-(--eds-text-primary)'
				/>
				<text
					x={clamp(handleX, 32, WIDTH - 32)}
					y={TOP - 10}
					textAnchor='middle'
					className='fill-(--eds-text-secondary) text-[10px]'
				>
					Centre {formatProbability(clamp(centre, 0, 1))}
				</text>
				<circle
					cx={handleX}
					cy={AXIS}
					r={7}
					tabIndex={0}
					role='slider'
					aria-label='Centre'
					aria-valuemin={0}
					aria-valuemax={1}
					aria-valuenow={centre}
					className='cursor-grab fill-(--eds-background-surface) stroke-(--eds-border-interactive-accent-emphasis-default) outline-none focus-visible:stroke-(--eds-border-interactive-focus)'
					strokeWidth={2.5}
					onKeyDown={event => {
						const step = event.shiftKey ? 0.1 : 0.01;
						if (event.key === 'ArrowRight' || event.key === 'ArrowUp')
							onCentreChange(round(clamp(centre + step, 0, 1)));
						else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown')
							onCentreChange(round(clamp(centre - step, 0, 1)));
						else return;
						event.preventDefault();
					}}
				/>
			</svg>
			<div
				className='grid text-center text-[10px] leading-3 text-(--eds-text-secondary)'
				style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
			>
				{names.map((name, i) => (
					<div key={name + i} className='min-w-0 px-0.5'>
						<div className='truncate' title={name}>
							{name}
						</div>
						<div className='text-(--eds-text-primary) tabular-nums'>
							{values ? formatProbability(values[i]) : '–'}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

/** A slider with a typed fallback field, for precise or keyboard input */
export const SliderField = ({
	label,
	value,
	min,
	max,
	onChange,
}: {
	label: string;
	value: string;
	min: number;
	max: number;
	onChange: (value: string) => void;
}) => {
	const number = Number(value.replace(',', '.'));
	return (
		<div className='flex flex-col gap-1'>
			<span className='text-xs text-(--eds-text-secondary)'>{label}</span>
			<div className='flex items-center gap-3'>
				<div className='min-w-0 flex-1'>
					<Slider
						aria-label={label}
						value={Number.isFinite(number) ? clamp(number, min, max) : min}
						min={min}
						max={max}
						step={0.01}
						minMaxDots={false}
						minMaxValues={false}
						onChange={(_, next) => onChange(String(next[0]))}
					/>
				</div>
				<Input
					aria-label={`${label} value`}
					inputMode='decimal'
					value={value}
					className='w-18 flex-none'
					onChange={event => onChange(event.target.value)}
				/>
			</div>
		</div>
	);
};
