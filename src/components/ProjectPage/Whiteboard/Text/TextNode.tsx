import { NodeProps } from '@xyflow/react';
import { useLayoutEffect, useRef, useState } from 'react';
import { useUpdateWhiteboardNodes } from '../../../../hooks/api/useUpdateWhiteboardNodes';
import { ReactFlowWhiteboardNode } from '../../../../types';
import { cn } from '../../../../utils/cn';

export const TextNode = ({
	data,
	selected,
	positionAbsoluteX,
	positionAbsoluteY,
}: NodeProps<ReactFlowWhiteboardNode>) => {
	const [value, setValue] = useState(data.data);
	const [editing, setEditing] = useState(Boolean(data.new));
	const { mutate: updateWhiteboardNodes } = useUpdateWhiteboardNodes();
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const nodePositionX = positionAbsoluteX ?? data.x_position;
	const nodePositionY = positionAbsoluteY ?? data.y_position;
	const showSelectionFrame = editing || selected;
	const textOpacity = (data.opacity ?? 100) / 100;

	useLayoutEffect(() => {
		if (!editing) return;

		let frame = 0;
		let timeout = 0;
		let attempts = 0;

		const focusInput = () => {
			const input = inputRef.current;
			if (!input) return;

			input.focus();
			input.select();

			if (document.activeElement === input || attempts >= 4) return;

			attempts += 1;
			timeout = window.setTimeout(focusInput, 0);
		};

		frame = requestAnimationFrame(focusInput);

		return () => {
			cancelAnimationFrame(frame);
			window.clearTimeout(timeout);
		};
	}, [editing]);

	const frameClassName = 'inline-block bg-transparent align-top leading-tight';
	const frameStyle = showSelectionFrame
		? {
				boxShadow: 'inset 0 0 0 1px var(--color-primary-resting)',
			}
		: undefined;

	if (editing) {
		return (
			<textarea
				className={cn(
					'nodrag nopan field-sizing-content resize-none overflow-hidden border-none bg-transparent whitespace-pre-wrap outline-none',
					frameClassName,
				)}
				style={{
					...frameStyle,
					color: data?.color && data.color !== 'default' ? data.color : undefined,
					opacity: textOpacity,
					fontSize: data.text_size ? `${data.text_size}px` : undefined,
				}}
				value={value}
				spellCheck={false}
				rows={1}
				ref={inputRef}
				onChange={e => setValue(e.target.value)}
				onBlur={() => {
					setEditing(false);
					updateWhiteboardNodes([
						{
							...data,
							data: value,
							x_position: nodePositionX,
							y_position: nodePositionY,
						},
					]);
				}}
			/>
		);
	}

	return (
		<div
			className={cn('cursor-grab whitespace-pre-wrap select-none', frameClassName)}
			style={{
				...frameStyle,
				color: data?.color && data.color !== 'default' ? data.color : undefined,
				opacity: textOpacity,
				fontSize: data.text_size ? `${data.text_size}px` : undefined,
			}}
			onDoubleClick={() => setEditing(true)}
		>
			{value}
		</div>
	);
};
