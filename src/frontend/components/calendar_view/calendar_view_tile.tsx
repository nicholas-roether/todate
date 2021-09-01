import { Card, CardContent, makeStyles, Typography } from "@material-ui/core";
import clsx from "clsx";
import React, { PropsWithChildren } from "react";
import { EventHandler } from "react";

// TODO extract locale
const dateFormatDay = new Intl.DateTimeFormat([], {
	day: "numeric"
});

const useStyles = makeStyles((theme) => ({
	dayText: {
		fontSize: theme.typography.h5.fontSize
	},
	main: {
		marginTop: theme.spacing(1)
	},
	container: {
		width: "100%",
		height: "100%",
		background: theme.palette.background.default,
		borderWidth: "2px",
		transition: theme.transitions.create(
			["background", "color", "border-color"],
			{
				duration: theme.transitions.duration.short
			}
		),
		cursor: "pointer",
		"&:hover": {
			background: theme.palette.background.paper
		}
	},
	highlighted: {
		color: theme.palette.secondary.contrastText,
		borderColor: theme.palette.secondary.main,
		background: theme.palette.secondary.dark,
		borderWidth: "4px",
		margin: "-2px",
		width: "calc(100% + 4px)",
		height: "calc(100% + 4px)",
		position: "relative",
		top: 0,
		left: 0,
		"&:hover": {
			background: theme.palette.secondary.main
		}
	}
}));

interface CalendarViewTileProps {
	date: Date;
	today?: boolean;
	onClick?: EventHandler<React.MouseEvent>;
}

const CalendarViewTile = ({
	date,
	today = false,
	onClick,
	children
}: PropsWithChildren<CalendarViewTileProps>) => {
	const classes = useStyles();
	date.setHours(0, 0, 0, 0);
	const dayText = dateFormatDay.format(date.getTime());
	return (
		<Card
			variant="outlined"
			raised={false}
			square={true}
			className={clsx(classes.container, today && classes.highlighted)}
			onClick={onClick}
		>
			<CardContent>
				<Typography className={classes.dayText}>{dayText}</Typography>
				<main className={classes.main}>{children}</main>
			</CardContent>
		</Card>
	);
};

export default CalendarViewTile;
