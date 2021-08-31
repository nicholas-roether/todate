import { Grid, makeStyles, Typography } from "@material-ui/core";
import React from "react";
import CalendarViewTile from "./calendar_view/calendar_view_tile";

// TODO localization
const weekdayDateFormat = new Intl.DateTimeFormat([], {
	weekday: "long"
});

const dayMonthDateFormat = new Intl.DateTimeFormat([], {
	day: "numeric",
	month: "numeric"
});

const useStyles = makeStyles((theme) => ({
	container: {
		display: "flex",
		flexDirection: "column",
		height: "100%"
	},
	grid: {
		flex: 1
	},
	item: {
		width: "calc(100% / 7)"
	},
	weekdays: {
		display: "flex"
	},
	line: {
		color: theme.palette.primary.main,
		margin: 0
	},
	headerItem: {
		width: "calc(100% / 7)",
		padding: theme.spacing(1, 2)
	}
}));

export interface CalendarViewProps {
	date: Date;
}

const CalendarView = ({ date }: CalendarViewProps) => {
	const classes = useStyles();
	const startDate = new Date();
	startDate.setFullYear(date.getFullYear(), date.getMonth(), 0);
	startDate.setDate(startDate.getDate() - startDate.getDay() + 1);
	const weekdayNames = [];
	for (let i = 0; i < 7; i++)
		weekdayNames.push(
			weekdayDateFormat.format(
				new Date(startDate.getTime() + 86400000 * i)
			)
		);

	const cells: JSX.Element[] = [];
	for (let i = 0; i < 42; i++) {
		const tileDate = new Date(startDate.getTime() + 86400000 * i);
		cells.push(
			<Grid item key={i} className={classes.item}>
				<CalendarViewTile
					day={tileDate.getDate()}
					month={
						tileDate.getDate() === 1
							? tileDate.getMonth()
							: undefined
					}
					mainMonth={tileDate.getMonth() === date.getMonth()}
				>
					test
				</CalendarViewTile>
			</Grid>
		);
	}
	return (
		<div className={classes.container}>
			<header>
				<div className={classes.weekdays}>
					{weekdayNames.map((name, i) => (
						<div key={i} className={classes.headerItem}>
							<Typography variant="h6">{name}</Typography>
						</div>
					))}
				</div>
				<hr className={classes.line} />
			</header>
			<Grid container className={classes.grid}>
				{cells}
			</Grid>
		</div>
	);
};

export default CalendarView;
