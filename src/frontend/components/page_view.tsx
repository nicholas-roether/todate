import { Grow, makeStyles, useTheme } from "@material-ui/core";
import clsx from "clsx";
import React from "react";
import { useEffect } from "react";
import { useOngoingTouchesRef, usePrev } from "../hooks";

const useStyles = makeStyles((theme) => ({
	container: {
		height: "100%",
		width: "100%",
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
	},
	overlayPageContainer: {
		position: "relative",
		width: "100%",
		height: "100%"
	},
	overlayedPage: {
		position: "absolute",
		width: "100%",
		height: "100%"
	}
}));

export interface PageViewProps {
	builder: (index: number) => React.ReactNode;
	page?: number;
	onUpdatePage?: (pageDiff: number) => void;
}

const SCROLL_COOLDOWN = 300;
const DRAG_THRESHOLD = 20;

const PageView = ({ builder, page = 0, onUpdatePage }: PageViewProps) => {
	const classes = useStyles();
	const prevPage = usePrev(page);
	const bottomPageRef = React.useRef<HTMLDivElement>(null);
	const topPageRef = React.useRef<HTMLDivElement>(null);
	const containerRef = React.useRef<HTMLDivElement>(null);
	const scrollingRef = React.useRef<boolean>(false);
	const [ongoingTouchesRef, onTouchStart, onTouchEnd] =
		useOngoingTouchesRef();
	const theme = useTheme();

	const tryUpdateBy = React.useCallback(
		(amount: number) => {
			if (scrollingRef.current) return;
			setTimeout(() => {
				onUpdatePage?.(amount);
			});
			scrollingRef.current = true;
			setTimeout(() => (scrollingRef.current = false), SCROLL_COOLDOWN);
		},
		[onUpdatePage]
	);

	const onWheel = React.useCallback(
		(evt: React.WheelEvent) => {
			if (evt.deltaY == 0) return;
			tryUpdateBy(evt.deltaY > 0 ? 1 : -1);
		},
		[tryUpdateBy]
	);

	const onTouchMove = React.useCallback(
		(evt: React.TouchEvent) => {
			if (!ongoingTouchesRef.current) return;
			for (const touch of Array.from(evt.changedTouches)) {
				const prevState = ongoingTouchesRef.current.find(
					(prevTouch) => prevTouch.identifier == touch.identifier
				);
				if (!prevState) return;
				const deltaX = touch.clientX - prevState.clientX;
				const deltaY = touch.clientY - prevState.clientY;
				if (
					Math.abs(deltaY) > Math.abs(deltaX) &&
					Math.abs(deltaY) > DRAG_THRESHOLD
				) {
					tryUpdateBy(deltaY < 0 ? 1 : -1);
					return;
				}
			}
		},
		[ongoingTouchesRef, tryUpdateBy]
	);

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

	let content: React.ReactNode;

	if (prevPage == null || prevPage == page) {
		content = <div className={classes.pageContainer}>{builder(page)}</div>;
	} else if (Math.abs(prevPage - page) == 1) {
		const forwards = page > prevPage;
		const currentPageContent = builder(page);
		const prevPageContent = builder(prevPage);

		content = (
			<>
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
			</>
		);
	} else {
		const currentPageContent = builder(page);
		const prevPageContent = builder(prevPage);

		content = (
			<div className={classes.overlayPageContainer}>
				<div className={classes.overlayedPage}>
					<Grow in={false} appear key={`disappear-#${prevPage}`}>
						<div className={classes.pageContainer}>
							{prevPageContent}
						</div>
					</Grow>
				</div>
				<div className={classes.overlayedPage}>
					<Grow
						in={true}
						timeout={theme.transitions.duration.leavingScreen}
						appear
						key={`appear-#${page}`}
					>
						<div className={classes.pageContainer}>
							{currentPageContent}
						</div>
					</Grow>
				</div>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className={classes.container}
			onTouchStart={onTouchStart}
			onTouchEnd={onTouchEnd}
			onWheel={onWheel}
			onTouchMove={onTouchMove}
		>
			{content}
		</div>
	);
};

export default PageView;
