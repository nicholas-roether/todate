import React from "react";
import { useEffect } from "react";
import CalendarViewPage, {
	CalendarTileContentMap
} from "./calendar_view_desktop/calendar_view_page";
import PageView from "../page_view";

export interface CalendarViewProps {
	startDate: Date;
	page?: number;
	onUpdatePage?: (pageDiff: number) => void;
	getTileContent?: (month: number) => CalendarTileContentMap;
	onTileClick?: (date: Date, event: React.MouseEvent) => void;
}

const CalendarView = ({
	startDate,
	page = 0,
	onUpdatePage,
	getTileContent,
	onTileClick
}: CalendarViewProps) => {
	const [today, setToday] = React.useState<Date>(new Date());

	useEffect(() => {
		setTimeout(() => {
			setToday(new Date());
		}, 86400000 - (Date.now() % 86400000));
	}, [today]);

	// Make sure outside code isn't affected
	startDate = new Date(startDate);
	startDate.setDate(1);
	startDate.setHours(0, 0, 0, 0);
	return (
		<PageView
			page={page}
			onUpdatePage={onUpdatePage}
			builder={(index) => {
				const offsetDate = new Date(startDate);
				offsetDate.setMonth(offsetDate.getMonth() + index);
				return (
					<CalendarViewPage
						date={offsetDate}
						today={today}
						tileContent={getTileContent?.(offsetDate.getMonth())}
						onTileClick={onTileClick}
					/>
				);
			}}
		/>
	);
};

export default CalendarView;
