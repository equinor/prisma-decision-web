import { CircularProgress, TextField } from '@equinor/eds-core-react';
import { useCallback, useState } from 'react';
import {
	Chart,
	LinearScale,
	PointElement,
	ScatterController,
	Tooltip,
	type ChartOptions,
	type Plugin,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { useGetStakeholderMatrixes } from '../../../hooks/api/useGetStakeholderMatrixes';
import { useSelectedProject } from '../ProjectContext';
import { CreateStakeholderMatrix } from './CreateStakeholderMatrix';
import { DeleteStakeholderMatrixDialog } from './DeleteStakeholderMatrixDialog';
import { EditStakeholderMatrix } from './EditStakeholderMatrix';

Chart.register(LinearScale, PointElement, ScatterController, Tooltip, annotationPlugin);

type StakeholderMatrixProps = {
	className?: string;
};

const regionColors = {
	consult: '#d1495b',
	partnerClosely: '#007f8b',
	observe: '#5b5bd6',
	keepInformed: '#2e8540',
};

const stakeholderRegions = [
	{ key: 'partnerClosely', label: 'Partner closely', affecting: 1, affected: 1 },
	{ key: 'consult', label: 'Consult', affecting: 0, affected: 1 },
	{ key: 'keepInformed', label: 'Keep informed', affecting: 1, affected: 0 },
	{ key: 'observe', label: 'Observe', affecting: 0, affected: 0 },
] as const;

const getRegionColor = (affectingDecision: number, affectedByDecision: number) => {
	if (affectedByDecision) {
		return affectingDecision ? regionColors.partnerClosely : regionColors.consult;
	}
	return affectingDecision ? regionColors.keepInformed : regionColors.observe;
};

const truncateCanvasText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
	if (ctx.measureText(text).width <= maxWidth) return text;
	let truncatedText = text;
	while (truncatedText.length > 1 && ctx.measureText(`${truncatedText}...`).width > maxWidth) {
		truncatedText = truncatedText.slice(0, -1);
	}
	return `${truncatedText}...`;
};

const matrixRegionsPlugin: Plugin<'scatter'> = {
	id: 'stakeholderMatrixRegions',
	beforeDraw: chart => {
		const { ctx, chartArea } = chart;
		const { left, right, top, bottom } = chartArea;
		const middleX = (left + right) / 2;
		const middleY = (top + bottom) / 2;
		const regions = [
			{ x: left, y: top, color: 'rgba(209, 73, 91, 0.12)', label: 'CONSULT' },
			{ x: middleX, y: top, color: 'rgba(0, 127, 139, 0.12)', label: 'PARTNER CLOSELY' },
			{ x: left, y: middleY, color: 'rgba(91, 91, 214, 0.11)', label: 'OBSERVE' },
			{ x: middleX, y: middleY, color: 'rgba(46, 133, 64, 0.11)', label: 'KEEP INFORMED' },
		];

		ctx.save();
		regions.forEach(region => {
			ctx.fillStyle = region.color;
			ctx.fillRect(region.x, region.y, middleX - left, middleY - top);
			ctx.fillStyle = getComputedStyle(chart.canvas).color;
			ctx.globalAlpha = 0.55;
			ctx.font = '600 11px equinor, sans-serif';
			ctx.textAlign = 'left';
			ctx.textBaseline = 'top';
			ctx.fillText(region.label, region.x + 14, region.y + 12);
			ctx.globalAlpha = 1;
		});
		ctx.restore();
	},
};

const matrixLabelsPlugin: Plugin<'scatter'> = {
	id: 'stakeholderMatrixLabels',
	afterDraw: chart => {
		const { ctx, chartArea } = chart;
		const { left, right, top, bottom } = chartArea;
		const textColor = getComputedStyle(chart.canvas).color;

		ctx.save();
		ctx.fillStyle = textColor;
		ctx.font = '14px equinor, sans-serif';

		ctx.textAlign = 'right';
		ctx.textBaseline = 'middle';
		ctx.fillText('High', left - 14, top);
		ctx.fillText('Low', left - 14, bottom);

		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';
		ctx.fillText('Low', left, bottom + 12);
		ctx.textAlign = 'right';
		ctx.fillText('High', right, bottom + 12);

		ctx.textAlign = 'center';
		ctx.fillText('Affecting the decision', (left + right) / 2, bottom + 12);

		ctx.save();
		ctx.translate(left - 72, (top + bottom) / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('Affected by the decision', 0, 0);
		ctx.restore();

		ctx.strokeStyle = textColor;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(right + 6, bottom - 3);
		ctx.lineTo(right + 11, bottom);
		ctx.lineTo(right + 6, bottom + 3);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(left - 3, top - 6);
		ctx.lineTo(left, top - 11);
		ctx.lineTo(left + 3, top - 6);
		ctx.stroke();
		ctx.restore();
	},
};

const stakeholderLabelsPlugin: Plugin<'scatter'> = {
	id: 'stakeholderLabels',
	afterDatasetsDraw: chart => {
		const { ctx, chartArea } = chart;
		const textColor = getComputedStyle(chart.canvas).color;
		const labelBackgroundColor = getComputedStyle(
			chart.canvas.parentElement ?? chart.canvas,
		).backgroundColor;
		const regionWidth = (chartArea.right - chartArea.left) / 2;
		const regionHeight = (chartArea.bottom - chartArea.top) / 2;
		const rowHeight = 34;
		const maxRows = Math.max(1, Math.floor((regionHeight - 20) / rowHeight));
		const regions = new Map<string, number[]>();

		chart.data.datasets.forEach((dataset, index) => {
			const point = dataset.data[0] as { x: number; y: number } | undefined;
			if (!point) return;
			const regionKey = `${point.x}-${point.y}`;
			regions.set(regionKey, [...(regions.get(regionKey) ?? []), index]);
		});

		ctx.save();
		regions.forEach(datasetIndexes => {
			const columns = Math.ceil(datasetIndexes.length / maxRows);
			const columnWidth = regionWidth / columns;

			datasetIndexes.forEach((datasetIndex, position) => {
				const dataset = chart.data.datasets[datasetIndex];
				const point = chart.getDatasetMeta(datasetIndex).data[0];
				if (!point || !dataset.label) return;

				const row = position % maxRows;
				const column = Math.floor(position / maxRows);
				const rowsInColumn = Math.min(maxRows, datasetIndexes.length - column * maxRows);
				const labelX = point.x - regionWidth / 2 + columnWidth * (column + 0.5);
				const labelY = point.y - ((rowsInColumn - 1) * rowHeight) / 2 + row * rowHeight;
				const maxLabelWidth = Math.max(72, columnWidth - 28);
				ctx.font = '600 13px equinor, sans-serif';
				const label = truncateCanvasText(ctx, dataset.label, maxLabelWidth);
				const labelWidth = Math.min(maxLabelWidth, ctx.measureText(label).width) + 28;

				ctx.fillStyle = labelBackgroundColor;
				ctx.beginPath();
				ctx.roundRect(labelX - labelWidth / 2, labelY - 14, labelWidth, 28, 4);
				ctx.fill();
				ctx.fillStyle =
					typeof dataset.pointBackgroundColor === 'string'
						? dataset.pointBackgroundColor
						: textColor;
				ctx.beginPath();
				ctx.arc(labelX - labelWidth / 2 + 10, labelY, 3, 0, Math.PI * 2);
				ctx.fill();
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillStyle = textColor;
				ctx.fillText(label, labelX + 5, labelY);
			});
		});
		ctx.restore();
	},
};

export const StakeholderMatrix = ({ className = '' }: StakeholderMatrixProps) => {
	const [searchQuery, setSearchQuery] = useState('');
	const selectedProject = useSelectedProject();
	const { stakeholderMatrices, isLoading } = useGetStakeholderMatrixes(selectedProject.id);
	const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase();
	const filteredStakeholders = stakeholderMatrices.filter(stakeholder =>
		`${stakeholder.stakeholder_name} ${stakeholder.stakeholder_role}`
			.toLocaleLowerCase()
			.includes(normalizedSearchQuery),
	);

	const setCanvasRef = useCallback(
		(canvas: HTMLCanvasElement | null) => {
			if (!canvas) return;
			const rootStyles = getComputedStyle(document.documentElement);
			const color = (property: string, fallback: string) => {
				const value = rootStyles.getPropertyValue(property).trim();
				return value ? `rgb(${value})` : fallback;
			};
			const secondaryColor = color('--eds_text_secondary', '#6f6f6f');
			const options: ChartOptions<'scatter'> = {
				responsive: true,
				maintainAspectRatio: false,
				animation: false,
				layout: { padding: { left: 112, right: 28, top: 24, bottom: 40 } },
				scales: {
					x: {
						min: 0,
						max: 1,
						display: true,
						grid: { display: false },
						ticks: { display: false },
						border: { color: secondaryColor },
					},
					y: {
						min: 0,
						max: 1,
						display: true,
						grid: { display: false },
						ticks: { display: false },
						border: { display: true, color: secondaryColor },
					},
				},
				plugins: {
					legend: { display: false },
					tooltip: { enabled: false },
					annotation: {
						annotations: {
							horizontalMidpoint: {
								type: 'line',
								yMin: 0.5,
								yMax: 0.5,
								xMin: 0,
								xMax: 1,
								borderColor: secondaryColor,
								borderWidth: 1,
								borderDash: [4, 5],
							},
							verticalMidpoint: {
								type: 'line',
								xMin: 0.5,
								xMax: 0.5,
								yMin: 0,
								yMax: 1,
								borderColor: secondaryColor,
								borderWidth: 1,
								borderDash: [4, 5],
							},
						},
					},
				},
			};

			const chart = new Chart(canvas, {
				type: 'scatter',
				data: {
					datasets: stakeholderMatrices.map(stakeholder => ({
						label: `${stakeholder.stakeholder_name} - ${stakeholder.stakeholder_role}`,
						data: [
							{
								x: stakeholder.affecting_the_decision >= 0.5 ? 0.75 : 0.25,
								y: stakeholder.affected_by_the_decision >= 0.5 ? 0.75 : 0.25,
							},
						],
						pointRadius: 0,
						pointHoverRadius: 0,
						pointBackgroundColor: getRegionColor(
							stakeholder.affecting_the_decision,
							stakeholder.affected_by_the_decision,
						),
						pointBorderColor: '#ffffff',
						pointBorderWidth: 2,
					})),
				},
				options,
				plugins: [matrixRegionsPlugin, matrixLabelsPlugin, stakeholderLabelsPlugin],
			});

			return () => chart.destroy();
		},
		[stakeholderMatrices],
	);

	return (
		<div className={`flex w-full flex-col gap-5 py-2 ${className}`}>
			<header className='flex flex-wrap items-start justify-between gap-4'>
				<div>
					<div className='flex items-center gap-3'>
						<h1 className='text-3xl font-bold'>Stakeholder Matrix</h1>
						<span className='bg-background-medium rounded-sm px-2 py-1 text-xs font-semibold'>
							{stakeholderMatrices.length}{' '}
							{stakeholderMatrices.length === 1 ? 'stakeholder' : 'stakeholders'}
						</span>
					</div>
					<p className='text-text-tertiary mt-1 text-sm'>
						Assess how much a stakeholder affects the decision and how strongly the
						decision affects them.
					</p>
				</div>
				<CreateStakeholderMatrix />
			</header>

			<div className='grid items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_320px]'>
				<section className='bg-background-default shadow-tile min-w-0 rounded-md p-4 sm:p-6'>
					<div className='text-text-tertiary mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs'>
						<span>
							<strong className='text-text-default'>Horizontal:</strong> influence on
							the decision
						</span>
						<span>
							<strong className='text-text-default'>Vertical:</strong> impact from the
							decision
						</span>
					</div>
					<div className='min-h-125 w-full' style={{ height: 'calc(100vh - 240px)' }}>
						<canvas
							ref={setCanvasRef}
							className='text-text-default'
							aria-label={`Stakeholder matrix with ${stakeholderMatrices.length} stakeholders`}
							role='img'
						/>
					</div>
					{isLoading && (
						<div className='flex justify-center py-3'>
							<CircularProgress size={24} />
						</div>
					)}
					{!isLoading && stakeholderMatrices.length === 0 && (
						<p className='text-text-tertiary text-center text-sm'>
							No stakeholders yet. Create one to add it to the matrix.
						</p>
					)}
				</section>

				<aside className='bg-background-default shadow-tile flex h-[calc(100vh-240px)] min-h-125 flex-col overflow-hidden rounded-md xl:w-80'>
					<div className='border-border-medium border-b px-4 py-3'>
						<h2 className='text-base font-semibold'>Stakeholders</h2>
						<p className='text-text-tertiary text-xs'>Grouped by matrix region</p>
					</div>
					<div className='border-border-medium border-b p-3'>
						<TextField
							label='Search stakeholders'
							placeholder='Name or role'
							value={searchQuery}
							onChange={event => setSearchQuery(event.target.value)}
						/>
					</div>
					<div className='min-h-0 flex-1 overflow-y-auto p-2'>
						{stakeholderRegions.map(region => {
							const regionStakeholders = filteredStakeholders
								.filter(
									stakeholder =>
										stakeholder.affecting_the_decision === region.affecting &&
										stakeholder.affected_by_the_decision === region.affected,
								)
								.sort((first, second) =>
									first.stakeholder_name.localeCompare(second.stakeholder_name),
								);
							if (regionStakeholders.length === 0) return null;

							return (
								<section key={region.key} className='mb-3 last:mb-0'>
									<div className='bg-background-light sticky top-0 z-10 flex items-center gap-2 px-3 py-2'>
										<span
											className='h-2.5 w-2.5 rounded-full'
											style={{
												backgroundColor: regionColors[region.key],
											}}
										/>
										<h3 className='flex-1 text-xs font-semibold uppercase'>
											{region.label}
										</h3>
										<span className='text-text-tertiary text-xs'>
											{regionStakeholders.length}
										</span>
									</div>
									{regionStakeholders.map(stakeholder => (
										<div
											key={stakeholder.stakeholder_matrix_id}
											className='hover:bg-background-light flex items-center rounded-sm pr-1'
										>
											<div className='flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left'>
												<span className='min-w-0 flex-1'>
													<span className='block truncate text-sm font-semibold'>
														{stakeholder.stakeholder_name}
													</span>
													<span className='text-text-tertiary block truncate text-xs'>
														{stakeholder.stakeholder_role}
													</span>
													<span className='mt-1.5 flex flex-wrap gap-1 text-[11px]'>
														<span className='bg-background-medium rounded-sm px-1.5 py-0.5'>
															Affecting:{' '}
															{stakeholder.affecting_the_decision
																? 'High'
																: 'Low'}
														</span>
														<span className='bg-background-medium rounded-sm px-1.5 py-0.5'>
															Affected:{' '}
															{stakeholder.affected_by_the_decision
																? 'High'
																: 'Low'}
														</span>
													</span>
												</span>
											</div>
											<div className='flex shrink-0'>
												<EditStakeholderMatrix stakeholder={stakeholder} />
												<DeleteStakeholderMatrixDialog
													stakeholder={stakeholder}
												/>
											</div>
										</div>
									))}
								</section>
							);
						})}
						{!isLoading && stakeholderMatrices.length === 0 && (
							<p className='text-text-tertiary px-3 py-8 text-center text-sm'>
								Your stakeholder list will appear here.
							</p>
						)}
						{!isLoading &&
							stakeholderMatrices.length > 0 &&
							filteredStakeholders.length === 0 && (
								<p className='text-text-tertiary px-3 py-8 text-center text-sm'>
									No stakeholders match your search.
								</p>
							)}
					</div>
				</aside>
			</div>
		</div>
	);
};

export default StakeholderMatrix;
