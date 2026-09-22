import { useCallback } from 'react';
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

Chart.register(LinearScale, PointElement, ScatterController, Tooltip, annotationPlugin);

type StakeholderMatrixProps = {
	className?: string;
};

const stakeholderColors = ['#007079', '#eb0037', '#4f6b2f', '#8c4a12', '#365f91', '#7d3c74'];

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
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillStyle =
					typeof dataset.pointBackgroundColor === 'string'
						? dataset.pointBackgroundColor
						: textColor;
				ctx.font = '600 13px equinor, sans-serif';
				ctx.fillText(dataset.label, labelX, labelY, columnWidth - 12);
			});
		});
		ctx.restore();
	},
};

export const StakeholderMatrix = ({ className = '' }: StakeholderMatrixProps) => {
	const selectedProject = useSelectedProject();
	const { stakeholderMatrices } = useGetStakeholderMatrixes(selectedProject.id);

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
					datasets: stakeholderMatrices.map((stakeholder, index) => ({
						label: `${stakeholder.stakeholder_name} - ${stakeholder.stakeholder_role}`,
						data: [
							{
								x: stakeholder.affecting_the_decision >= 0.5 ? 0.75 : 0.25,
								y: stakeholder.affected_by_the_decision >= 0.5 ? 0.75 : 0.25,
							},
						],
						pointRadius: 0,
						pointHoverRadius: 0,
						pointBackgroundColor: stakeholderColors[index % stakeholderColors.length],
						pointBorderColor: '#ffffff',
						pointBorderWidth: 2,
					})),
				},
				options,
				plugins: [matrixLabelsPlugin, stakeholderLabelsPlugin],
			});

			return () => chart.destroy();
		},
		[stakeholderMatrices],
	);

	return (
		<div className={`flex flex-col gap-5 py-2 ${className}`}>
			<header className='flex items-start justify-between gap-4'>
				<div>
					<h1 className='text-3xl font-bold'>Stakeholder Matrix</h1>
					<p className='text-text-tertiary mt-1 text-sm'>
						Assess how much a stakeholder affects the decision and how strongly the
						decision affects them.
					</p>
				</div>
				<CreateStakeholderMatrix />
			</header>

			<div className='grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]'>
				<section className='bg-background-default shadow-tile min-w-0 rounded-md p-4 sm:p-6'>
					<div className='h-80 w-full'>
						<canvas
							ref={setCanvasRef}
							className='text-text-default'
							aria-label={`Stakeholder matrix with ${stakeholderMatrices.length} stakeholders`}
							role='img'
						/>
					</div>
					{stakeholderMatrices.length === 0 && (
						<p className='text-text-tertiary text-center text-sm'>
							No stakeholders yet. Create one to add it to the matrix.
						</p>
					)}
				</section>
			</div>
		</div>
	);
};

export default StakeholderMatrix;
