import { makeStyles } from "@material-ui/core";
import React from "react";
import { useEffect } from "react";
import { BiArray, range } from "../utils";

const useStyles = makeStyles({
	container: {
		height: "100%",
		overflowY: "scroll",
		scrollbarWidth: "none",
		msOverflowStyle: "none",
		scrollSnapType: "y mandatory",
		"&::-webkit-scrollbar": {
			display: "none"
		}
	},
	pageContainer: {
		height: "100%",
		scrollSnapAlign: "center"
	}
});

export interface PageViewProps {
	builder: (index: number) => React.ReactNode;
	startPage?: number;
	onUpdatePage?: (newPage: number) => void;
}

const PRELOAD_COUNT = 3;

const PageView = ({ builder, startPage = 0, onUpdatePage }: PageViewProps) => {
	const classes = useStyles();
	const pagesRef = React.useRef(BiArray.empty<React.ReactNode>());
	const currentPageRef = React.useRef(startPage);
	const containerRef = React.useRef<HTMLDivElement>(null);
	const [state, setState] = React.useState(false);

	function rebuild() {
		setState((state) => !state);
	}

	if (pagesRef.current.length == 0) {
		for (
			let i = startPage - PRELOAD_COUNT;
			i <= startPage + PRELOAD_COUNT;
			i++
		) {
			pagesRef.current.set(i, builder(i));
		}
	}

	// initial scrolling
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const pageHeight = container.offsetHeight;
		// container.scrollTo({
		// 	top: (currentPageRef.current + pagesRef.current.offset) * pageHeight
		// });
		if (currentPageRef.current != startPage) {
			container.scrollTo({
				top: (startPage + pagesRef.current.offset) * pageHeight,
				behavior: "smooth"
			});
			currentPageRef.current = startPage;
		}
	}, [startPage]);

	// scroll event handling
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const pageHeight = container.offsetHeight;
		container.addEventListener("scroll", (evt) => {
			const scrollHeight = container.scrollTop;
			const currentPage = currentPageRef.current;
			const pages = pagesRef.current;
			const newPage =
				Math.round(scrollHeight / pageHeight) - pages.offset;
			if (newPage != currentPage) {
				// Update currentPageRef
				currentPageRef.current = newPage;
				onUpdatePage?.(newPage);

				// Load more pages
				if (currentPage == -pages.lengthNegative + 1) {
					pages.prepend(
						range(
							-pages.lengthNegative - PRELOAD_COUNT,
							-pages.lengthNegative
						).map((i) => builder(i))
					);
					rebuild();
					container.scrollTo({
						top: scrollHeight + PRELOAD_COUNT * pageHeight
					});
				} else if (currentPage == pages.lengthPositive - 1) {
					pages.append(
						range(
							pages.lengthPositive,
							pages.lengthPositive + PRELOAD_COUNT
						).map((i) => builder(i))
					);
					rebuild();
				}
			}
		});
	}, [builder, onUpdatePage]);

	return (
		<div ref={containerRef} className={classes.container}>
			{pagesRef.current.map((pageNode, i) => (
				<div className={classes.pageContainer} key={i}>
					{pageNode}
				</div>
			))}
		</div>
	);
};

export default PageView;
