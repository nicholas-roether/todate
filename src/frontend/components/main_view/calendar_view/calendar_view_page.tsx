import { makeStyles, Typography } from "@material-ui/core";
import React from "react";
import { FormattedDate, useIntl } from "react-intl";
import { findClosestMonday, range } from "../../../utils";
import CalendarViewTile from "./calendar_view_tile";

export interface CalendarTileContentMapElement {
	date: Date;
	content: React.ReactNode;
}

export type CalendarTileContentMap = CalendarTileContentMapElement[];

export interface CalendarViewPageProps {
	date: Date;
	today?: Date;
	onTileClick?: (date: Date, event: React.MouseEvent) => void;
	tileContent?: CalendarTileContentMap;
}

const useStyles = makeStyles((theme) => ({
	container: {
		width: "100%",
		height: "100%",
		display: "flex",
		flexDirection: "column",
		padding: theme.spacing(2, 1)
	},
	line: {
		borderColor: theme.palette.primary.main,
		marginTop: theme.spacing(2)
	},
	grid: {
		flex: 1,
		display: "grid",
		gridTemplateColumns: "repeat(7, 1fr)",
		gridTemplateRows: "auto repeat(5, 1fr)"
	},
	header: {
		padding: theme.spacing(2, 0)
	},
	gridColHeading: {
		textAlign: "center",
		padding: theme.spacing(2, 0)
	},
	gridTile: {
		margin: "-1px",
		overflow: "visible"
	}
}));

const CalendarViewPage = ({
	date,
	today,
	onTileClick,
	tileContent = []
}: CalendarViewPageProps) => {
	const classes = useStyles();
	const intl = useIntl();
	date = new Date(date);
	date.setDate(1);
	date.setHours(0, 0, 0, 0);
	if (today) {
		today = new Date(today);
		today.setHours(0, 0, 0, 0);
	}

	const weekdayNames: string[] = [];
	const testDate = new Date(259200000);
	for (let i = 0; i < 7; i++) {
		testDate.setDate(testDate.getDate() + 1);
		weekdayNames.push(intl.formatDate(testDate, { weekday: "short" }));
	}

	return (
		<div className={classes.container}>
			<header className={classes.header}>
				<Typography variant="h4">
					{/* {monthNameDateFormat.format(date)} */}
					<FormattedDate value={date} month="long" year="numeric" />
				</Typography>
				<hr className={classes.line} />
			</header>
			<main className={classes.grid}>
				{weekdayNames.map((name, i) => (
					<div key={i} className={classes.gridColHeading}>
						<Typography variant="h5">{name}</Typography>
					</div>
				))}
				{range(0, 5).map((week) =>
					range(0, 7).map((weekday) => {
						const weekdayDate = findClosestMonday(date);
						weekdayDate.setDate(
							weekdayDate.getDate() + week * 7 + weekday
						);
						if (weekdayDate.getMonth() !== date.getMonth())
							return <div key={weekday} />;
						const content = tileContent.find((elem) => {
							const elemDate = new Date(elem.date);
							elemDate.setHours(0, 0, 0, 0);
							return elemDate.getTime() === weekdayDate.getTime();
						})?.content;
						const clickHandler = onTileClick
							? (evt: React.MouseEvent) => {
									onTileClick(weekdayDate, evt);
							  }
							: undefined;
						return (
							<div
								key={`${week}-${weekday}`}
								className={classes.gridTile}
							>
								<CalendarViewTile
									date={weekdayDate}
									onClick={clickHandler}
									today={
										today &&
										today.getTime() == weekdayDate.getTime()
									}
								>
									{content}
								</CalendarViewTile>
							</div>
						);
					})
				)}
			</main>
		</div>
	);
};

export default CalendarViewPage;
