import { makeStyles } from "@material-ui/core";
import clsx from "clsx";
import React, { PropsWithChildren, useCallback, useEffect } from "react";

export interface ResizableContainerProps {
	top?: boolean;
	bottom?: boolean;
	left?: boolean;
	right?: boolean;
	defaultWidth?: number;
	minWidth?: number;
	maxWidth?: number;
	defaultHeight?: number;
	minHeight?: number;
	maxHeight?: number;
}

const useStyles = makeStyles(() => ({
	container: {
		display: "grid",
		// eslint-disable-next-line prettier/prettier
		gridTemplateAreas:
			"'. 			.			top-outer 		.			.			'\
			 '.				.			top-inner		.			.			'\
			 'left-outer 	left-inner	. 				right-inner	right-outer	'\
			 '. 			.			bottom-inner	.  			.			'\
			 '. 			.			bottom-outer	.  			.			'",
		gridTemplateRows: "min-content 10px auto 10px min-content",
		gridTemplateColumns: "min-content 10px auto 10px min-content"
	},
	content: {
		gridRowStart: "top-inner",
		gridRowEnd: "bottom-inner",
		gridColumnStart: "left-inner",
		gridColumnEnd: "right-inner"
	},
	gutter: {
		position: "relative",
		"&.top, &.bottom": {
			cursor: "ns-resize",
			gridColumnStart: "left-outer",
			gridColumnEnd: "right-outer",
			height: "20px"
		},
		"&.left, &.right": {
			cursor: "ew-resize",
			gridRowStart: "top-outer",
			gridRowEnd: "bottom-outer",
			width: "20px"
		},
		"&.top": {
			gridRowStart: "top-outer",
			gridRowEnd: "top-inner"
		},
		"&.bottom": {
			gridRowStart: "bottom-inner",
			gridRowEnd: "bottom-outer"
		},
		"&.left": {
			gridColumnStart: "left-outer",
			gridColumnEnd: "left-inner"
		},
		"&.right": {
			gridColumnStart: "right-inner",
			gridColumnEnd: "right-outer"
		}
	}
}));

const ResizableContainer = ({
	top = false,
	bottom = false,
	left = false,
	right = false,
	defaultWidth = 300,
	minWidth = 0,
	maxWidth,
	defaultHeight = 300,
	minHeight = 0,
	maxHeight,
	children
}: PropsWithChildren<ResizableContainerProps>) => {
	const classes = useStyles();
	const containerRef = React.useRef<HTMLDivElement>(null);

	const vertical = top || bottom;
	const horizontal = left || right;

	const gutterMouseDownListener = useCallback(() => {
		const container = containerRef.current;
		if (!container) return;
		[
			container,
			document.body,
			...Array.from(
				container.getElementsByClassName(
					"gutter"
				) as HTMLCollectionOf<HTMLElement>
			)
		].forEach((elem) => {
			elem.style.userSelect = "none";
		});
	}, []);

	const horizontalDragListener = useCallback(
		(evt: MouseEvent) => {
			const container = containerRef.current;
			if (!container) return;
			if (evt.movementX == 0) return;
			let resize = defaultWidth;
			if (container.getAttribute("data-resize-horizontal"))
				resize = Number.parseFloat(
					container.getAttribute("data-resize-horizontal") as string
				);
			resize += evt.movementX;
			if (maxWidth !== undefined && resize > maxWidth)
				container.style.width = `${maxWidth}px`;
			else if (resize < minWidth) container.style.width = `${minWidth}px`;
			else container.style.width = `${resize}px`;
			container.setAttribute("data-resize-horizontal", resize.toString());
		},
		[defaultWidth, maxWidth, minWidth]
	);

	const verticalDragListener = useCallback(
		(evt: MouseEvent) => {
			const container = containerRef.current;
			if (!container) return;
			if (evt.movementY == 0) return;
			const xPos = left
				? container.offsetLeft
				: container.offsetLeft + container.offsetWidth;
			let resize = defaultWidth;
			if (container.getAttribute("data-resize-vertical"))
				resize = Number.parseFloat(
					container.getAttribute("data-resize-vertical") ?? "0"
				);
			resize += evt.movementY;
			container.style.width = `${resize}px`;
			if (maxHeight !== undefined && resize > maxHeight)
				container.style.height = `${maxHeight}px`;
			else if (resize < minHeight)
				container.style.height = `${minHeight}px`;
			else container.style.height = `${resize}px`;
			container.setAttribute("data-resize-horizontal", resize.toString());
		},
		[defaultWidth, left, maxHeight, minHeight]
	);

	const horizontalGutterMouseDownListener = useCallback(() => {
		const container = containerRef.current;
		if (!container) return;
		[
			container,
			document.body,
			...Array.from(
				container.getElementsByClassName(
					"gutter"
				) as HTMLCollectionOf<HTMLElement>
			)
		].forEach((elem) => {
			elem.style.cursor = "col-resize";
		});
		gutterMouseDownListener();
		window.addEventListener("mousemove", horizontalDragListener);
	}, [gutterMouseDownListener, horizontalDragListener]);

	const verticalGutterMouseDownListener = useCallback(() => {
		const container = containerRef.current;
		if (!container) return;
		[
			container,
			document.body,
			...Array.from(
				container.getElementsByClassName(
					"gutter"
				) as HTMLCollectionOf<HTMLElement>
			)
		].forEach((elem) => {
			elem.style.cursor = "row-resize";
		});
		gutterMouseDownListener();
		window.addEventListener("mousemove", verticalDragListener);
	}, [gutterMouseDownListener, verticalDragListener]);

	const windowMouseUpListener = useCallback(() => {
		const container = containerRef.current;
		if (!container) return;
		[
			container,
			document.body,
			...Array.from(
				container.getElementsByClassName(
					"gutter"
				) as HTMLCollectionOf<HTMLElement>
			)
		].forEach((elem) => {
			elem.style.userSelect = "";
			elem.style.cursor = "";
		});
		window.removeEventListener("mousemove", horizontalDragListener);
		window.removeEventListener("mousemove", verticalDragListener);
	}, [horizontalDragListener, verticalDragListener]);

	useEffect(() => {
		window.addEventListener("mouseup", windowMouseUpListener);
	}, [windowMouseUpListener]);

	return (
		<div
			className={classes.container}
			style={{
				width: horizontal ? defaultWidth : "100%",
				height: vertical ? defaultHeight : "100%",
				minWidth,
				maxWidth,
				minHeight,
				maxHeight
			}}
			ref={containerRef}
		>
			{top && (
				<div
					className={clsx(classes.gutter, "top", "gutter")}
					onMouseDown={() => {
						verticalGutterMouseDownListener();
					}}
				/>
			)}
			{bottom && (
				<div
					className={clsx(classes.gutter, "bottom", "gutter")}
					onMouseDown={() => {
						verticalGutterMouseDownListener();
					}}
				/>
			)}
			{left && (
				<div
					className={clsx(classes.gutter, "left", "gutter")}
					onMouseDown={() => {
						horizontalGutterMouseDownListener();
					}}
				/>
			)}
			{right && (
				<div
					className={clsx(classes.gutter, "right", "gutter")}
					onMouseDown={() => {
						horizontalGutterMouseDownListener();
					}}
				/>
			)}
			<main className={classes.content}>{children}</main>
		</div>
	);
};

export default ResizableContainer;
