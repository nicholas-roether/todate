import { makeStyles } from "@material-ui/core";
import clsx from "clsx";
import React from "react";

export interface ResizableContainerProps {
	top?: boolean;
	bottom?: boolean;
	left?: boolean;
	right?: boolean;
	defaultWidth?: number;
	minWidth?: number | string;
	maxWidth?: number | string;
	defaultHeight?: number;
	minHeight?: number | string;
	maxHeight?: number | string;
}

const useStyles = makeStyles(() => ({
	container: {
		display: "grid",
		position: "relative",
		zIndex: 1,
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
		position: "relative"
	},
	gutterTop: {
		cursor: "ns-resize",
		gridColumnStart: "left-outer",
		gridColumnEnd: "right-outer",
		height: "20px",
		gridRowStart: "top-outer",
		gridRowEnd: "top-inner"
	},
	gutterBottom: {
		cursor: "ns-resize",
		gridColumnStart: "left-outer",
		gridColumnEnd: "right-outer",
		height: "20px",
		gridRowStart: "bottom-inner",
		gridRowEnd: "bottom-outer"
	},
	gutterLeft: {
		cursor: "ew-resize",
		gridRowStart: "top-outer",
		gridRowEnd: "bottom-outer",
		width: "20px",
		gridColumnStart: "left-outer",
		gridColumnEnd: "left-inner"
	},
	gutterRight: {
		cursor: "ew-resize",
		gridRowStart: "top-outer",
		gridRowEnd: "bottom-outer",
		width: "20px",
		gridColumnStart: "right-inner",
		gridColumnEnd: "right-outer"
	},
	draggingHorizontal: {
		cursor: "col-resize"
	},
	draggingVertical: {
		cursor: "row-resize"
	}
}));

enum DragState {
	NONE,
	VERTICAL,
	HORIZONTAL
}

const ResizableContainer = ({
	top = false,
	bottom = false,
	left = false,
	right = false,
	defaultWidth = 300,
	minWidth = 0,
	maxWidth = "100%",
	defaultHeight = 300,
	minHeight = 0,
	maxHeight = "100%",
	children
}: React.PropsWithChildren<ResizableContainerProps>) => {
	const classes = useStyles();
	const containerRef = React.useRef<HTMLDivElement>(null);
	const [dragState, setDragState] = React.useState<DragState>(DragState.NONE);
	const [widthResize, setWidthResize] = React.useState<number>(defaultWidth);
	const [heightResize, setHeightResize] =
		React.useState<number>(defaultHeight);

	const vertical = top || bottom;
	const horizontal = left || right;

	const gutterMouseDownListener = React.useCallback(() => {
		document.body.style.userSelect = "none";
	}, []);

	const horizontalDragListener = React.useCallback(
		(evt: MouseEvent) => {
			if (!containerRef.current) return;
			if (!left && !right) return;
			let gutterPos = containerRef.current.offsetLeft;
			if (left) gutterPos += 10;
			else if (right) gutterPos += containerRef.current.offsetWidth - 10;
			const diff = evt.clientX - gutterPos;
			const currentWidth = containerRef.current.offsetWidth;
			setWidthResize(() => currentWidth + diff);
		},
		[left, right]
	);

	const verticalDragListener = React.useCallback(
		(evt: MouseEvent) => {
			if (!containerRef.current) return;
			if (!top && !bottom) return;
			let gutterPos = containerRef.current.offsetTop;
			if (top) gutterPos += 10;
			else if (bottom)
				gutterPos += containerRef.current.offsetHeight - 10;
			const diff = evt.clientY - gutterPos;
			const currentHeight = containerRef.current.offsetHeight;
			setHeightResize(() => currentHeight + diff);
		},
		[bottom, top]
	);

	const horizontalGutterMouseDownListener = React.useCallback(() => {
		document.body.style.cursor = "col-resize";
		setDragState(DragState.HORIZONTAL);
		gutterMouseDownListener();
		window.addEventListener("mousemove", horizontalDragListener);
	}, [gutterMouseDownListener, horizontalDragListener]);

	const verticalGutterMouseDownListener = React.useCallback(() => {
		document.body.style.cursor = "row-resize";
		setDragState(DragState.VERTICAL);
		gutterMouseDownListener();
		window.addEventListener("mousemove", verticalDragListener);
	}, [gutterMouseDownListener, verticalDragListener]);

	const windowMouseUpListener = React.useCallback(() => {
		document.body.style.userSelect = "";
		document.body.style.cursor = "";
		window.removeEventListener("mousemove", horizontalDragListener);
		window.removeEventListener("mousemove", verticalDragListener);
		setDragState(DragState.NONE);
	}, [horizontalDragListener, verticalDragListener]);

	const gutterDoubleClickListener = React.useCallback(() => {
		setWidthResize(() => defaultWidth);
		setHeightResize(() => defaultHeight);
	}, [defaultHeight, defaultWidth]);

	React.useEffect(() => {
		window.addEventListener("mouseup", windowMouseUpListener);
	}, [windowMouseUpListener]);

	return (
		<div
			className={clsx(
				classes.container,
				dragState === DragState.VERTICAL && classes.draggingVertical,
				dragState === DragState.HORIZONTAL && classes.draggingHorizontal
			)}
			style={{
				width: horizontal ? widthResize : "100%",
				height: vertical ? heightResize : "100%",
				minWidth,
				maxWidth,
				minHeight,
				maxHeight,
				marginTop: top ? "-10px" : undefined,
				marginBottom: top ? "-10px" : undefined,
				marginLeft: left ? "-10px" : undefined,
				marginRight: right ? "-10px" : undefined
			}}
			ref={containerRef}
		>
			{top && (
				<div
					className={clsx(
						classes.gutter,
						classes.gutterTop,
						dragState === DragState.VERTICAL &&
							classes.draggingVertical
					)}
					onMouseDown={verticalGutterMouseDownListener}
					onDoubleClick={gutterDoubleClickListener}
				/>
			)}
			{bottom && (
				<div
					className={clsx(
						classes.gutter,
						classes.gutterBottom,
						dragState === DragState.VERTICAL &&
							classes.draggingVertical
					)}
					onMouseDown={verticalGutterMouseDownListener}
					onDoubleClick={gutterDoubleClickListener}
				/>
			)}
			{left && (
				<div
					className={clsx(
						classes.gutter,
						classes.gutterLeft,
						dragState === DragState.HORIZONTAL &&
							classes.draggingHorizontal
					)}
					onMouseDown={horizontalGutterMouseDownListener}
					onDoubleClick={gutterDoubleClickListener}
				/>
			)}
			{right && (
				<div
					className={clsx(
						classes.gutter,
						classes.gutterRight,
						dragState === DragState.HORIZONTAL &&
							classes.draggingHorizontal
					)}
					onMouseDown={horizontalGutterMouseDownListener}
					onDoubleClick={gutterDoubleClickListener}
				/>
			)}
			<main className={classes.content}>{children}</main>
		</div>
	);
};

export default ResizableContainer;
