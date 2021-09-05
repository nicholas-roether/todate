import React from "react";
import { useEffect } from "react";
import CalendarViewPage, {
	CalendarTileContentMap
} from "./calendar_view/calendar_view_page";
import PageView from "../page_view";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
	container: {
		padding: theme.spacing(0, 2),
		width: "100%",
		height: "100%"
	}
}));

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
	const classes = useStyles();

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
		<div className={classes.container}>
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
							tileContent={getTileContent?.(
								offsetDate.getMonth()
							)}
							onTileClick={onTileClick}
						/>
					);
				}}
			/>
		</div>
	);
};

export default CalendarView;
