import { Card, CardContent, CardHeader, makeStyles, Typography } from "@material-ui/core";
import React, { PropsWithChildren } from "react";
import { EventHandler } from "react";

// TODO extract locale
const dateFormatDay = new Intl.DateTimeFormat([], {
	day: "numeric"
});

const dateFormatDayMonth = new Intl.DateTimeFormat([], {
	day: "numeric",
	month: "numeric"
});

const useStyles = makeStyles(theme => ({
	containerNotMain: {
		width: "100%",
		height: "100%",
		// background: theme.palette.background.default
		color: theme.palette.text.disabled,
		background: theme.palette.action.disabledBackground
	},
	dayText: {
		fontSize: theme.typography.h5.fontSize
	},
	main: {
		marginTop: theme.spacing(1)
	},
	container: {
		width: "100%",
		height: "100%",
		background: theme.palette.background.default
	}
}));

interface CalendarViewTileProps {
	day: number,
	month?: number,
	mainMonth?: boolean,
	onClick?: EventHandler<React.MouseEvent>,
};

const CalendarViewTile = ({
	day,
	month,
	mainMonth = true,
	onClick,
	children
}: PropsWithChildren<CalendarViewTileProps>) => {
	const classes = useStyles();
	const date = new Date();
	date.setDate(day);
	let dayText = "";
	if(month !== null && month !== undefined) {
		date.setMonth(month);
		dayText = dateFormatDayMonth.format(date);
	} else {
		dayText = dateFormatDay.format(date);
	}
	console.log(dayText, day);
	return (
		<Card
			variant="outlined"
			raised={false}
			square={true}
			className={mainMonth ? classes.container : classes.containerNotMain}
			onClick={onClick}
		>
			<CardContent>
				<Typography className={classes.dayText}>{dayText}</Typography>
				<main className={classes.main}>
					{children}
				</main>
			</CardContent>
		</Card>
	)
}

export default CalendarViewTile;