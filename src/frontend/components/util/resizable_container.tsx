import { makeStyles } from "@material-ui/core";
import clsx from "clsx";
import React, { PropsWithChildren } from "react";

export interface ResizableContainerProps {
	top?: boolean;
	bottom?: boolean;
	left?: boolean;
	right?: boolean;
	defaultWidth?: string;
	minWidth?: string;
	maxWidth?: string;
	defaultHeight?: string;
	minHeight?: string;
	maxHeight?: string;
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
		// width: (props: ResizableContainerProps) =>
		// 	props.left || props.right ? props.defaultWidth ?? "50%" : "100%",
		// height: (props: ResizableContainerProps) =>
		// 	props.top || props.bottom ? props.defaultHeight ?? "50%" : "100%",
		// minWidth: (props: ResizableContainerProps) =>
		// 	props.left || props.right ? props.minWidth ?? "0" : "0",
		// maxWidth: (props: ResizableContainerProps) =>
		// 	props.left || props.right ? props.maxWidth ?? "100%" : "100%",
		// minHeight: (props: ResizableContainerProps) =>
		// 	props.top || props.bottom ? props.minWidth ?? "0" : "0",
		// maxHeight: (props: ResizableContainerProps) =>
		// 	props.top || props.bottom ? props.maxWidth ?? "100%" : "100%"
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
	defaultWidth = "50%",
	minWidth = "0",
	maxWidth = "100%",
	defaultHeight = "50%",
	minHeight = "0",
	maxHeight = "100%",
	children
}: PropsWithChildren<ResizableContainerProps>) => {
	const classes = useStyles();

	const vertical = top || bottom;
	const horizontal = left || right;

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
		>
			{top && <div className={clsx(classes.gutter, "top")} />}
			{bottom && <div className={clsx(classes.gutter, "bottom")} />}
			{left && <div className={clsx(classes.gutter, "left")} />}
			{right && <div className={clsx(classes.gutter, "right")} />}
			<main className={classes.content}>{children}</main>
		</div>
	);
};

export default ResizableContainer;
