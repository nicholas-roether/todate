import React from "react";
import { BidirectionalArray } from "../utils";

export type PageBuilder = (
	index: number
) => React.ReactNode | Promise<React.ReactNode>;

export interface InfinitePageScrollProps {
	axis?: "horizontal" | "vertical";
	direction?: "forwards" | "backwards" | "both";
	scrollbar?: "default" | "narrow" | "none";
	loadingIndicator?: React.ReactNode;
	builder: PageBuilder;
}

const InfinitePageScroll = ({
	axis = "vertical",
	direction = "forwards",
	scrollbar = "default",
	loadingIndicator = "loading...",
	builder
}: InfinitePageScrollProps) => {
	const scrollContainerRef = React.useRef();
	const pagesRef = React.useRef<BidirectionalArray<React.ReactNode>>(
		new BidirectionalArray<React.ReactNode>()
	);
};
