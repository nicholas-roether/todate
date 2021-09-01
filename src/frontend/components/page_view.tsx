import { makeStyles } from "@material-ui/core";
import clsx from "clsx";
import React from "react";
import { useEffect } from "react";
import { usePrev } from "../hooks";
import { BiArray, range } from "../utils";

const useStyles = makeStyles((theme) => ({
	container: {
		height: "100%",
		overflow: "hidden",
		position: "relative",
		top: 0,
		left: 0
	},
	pageContainer: {
		height: "100%",
		width: "100%",
		transition: theme.transitions.create(["top", "bottom"], {
			duration: theme.transitions.duration.standard,
			easing: theme.transitions.easing.easeOut
		}),
		position: "absolute"
	},
	topPage: {
		top: 0
	},
	bottomPage: {
		bottom: 0
	},
	startBelowScreen: {
		bottom: "-100%"
	},
	startAboveScreen: {
		top: "-100%"
	}
}));

export interface PageViewProps {
	builder: (index: number) => React.ReactNode;
	page?: number;
	onUpdatePage?: (pageDiff: number) => void;
}

const SCROLL_COOLDOWN = 400;

const PageView = ({ builder, page = 0, onUpdatePage }: PageViewProps) => {
	const classes = useStyles();
	const prevPage = usePrev(page);
	const bottomPageRef = React.useRef<HTMLDivElement>(null);
	const topPageRef = React.useRef<HTMLDivElement>(null);
	const containerRef = React.useRef<HTMLDivElement>(null);
	const scrollingRef = React.useRef<boolean>(false);

	// Transition animation
	useEffect(() => {
		if (!topPageRef.current || !bottomPageRef.current) return;
		if (prevPage !== null && prevPage < page) {
			topPageRef.current.style.top = "-100%";
			bottomPageRef.current.style.bottom = "0";
		} else if (prevPage !== null && prevPage > page) {
			topPageRef.current.style.top = "0";
			bottomPageRef.current.style.bottom = "-100%";
		}
	}, [page, prevPage]);

	// Scroll listener
	useEffect(() => {
		if (!containerRef.current || !onUpdatePage) return;
		containerRef.current.addEventListener("wheel", (evt) => {
			if (scrollingRef.current || evt.deltaY == 0) return;
			setTimeout(() => {
				onUpdatePage(evt.deltaY > 0 ? 1 : -1);
			});
			scrollingRef.current = true;
			setTimeout(() => (scrollingRef.current = false), SCROLL_COOLDOWN);
		});
	}, [onUpdatePage]);

	if (prevPage == null || prevPage == page) {
		return (
			<div ref={containerRef} className={classes.container}>
				<div className={classes.pageContainer}>{builder(page)}</div>
			</div>
		);
	}

	const forwards = page > prevPage;
	const currentPageContent = builder(page);
	const prevPageContent = builder(prevPage);

	return (
		<div ref={containerRef} className={classes.container}>
			<div
				ref={topPageRef}
				className={clsx(
					classes.pageContainer,
					classes.topPage,
					!forwards && classes.startAboveScreen
				)}
				key={`top-#${forwards ? prevPage : page}`}
			>
				{forwards ? prevPageContent : currentPageContent}
			</div>
			<div
				ref={bottomPageRef}
				className={clsx(
					classes.pageContainer,
					classes.bottomPage,
					forwards && classes.startBelowScreen
				)}
				key={`bottom-#${forwards ? page : prevPage}`}
			>
				{forwards ? currentPageContent : prevPageContent}
			</div>
		</div>
	);
};

export default PageView;
