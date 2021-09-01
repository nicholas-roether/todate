import { Card, CardContent, makeStyles, Typography } from "@material-ui/core";
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
		borderWidth: "2px"
	}
}));

interface CalendarViewTileProps {
	date: Date;
	component?: React.ElementType<React.HTMLAttributes<HTMLElement>>;
	onClick?: EventHandler<React.MouseEvent>;
}

const CalendarViewTile = ({
	date,
	onClick,
	children,
	component
}: PropsWithChildren<CalendarViewTileProps>) => {
	const classes = useStyles();
	date.setHours(0, 0, 0, 0);
	const dayText = dateFormatDay.format(date.getTime());
	return (
		<Card
			variant="outlined"
			raised={false}
			square={true}
			className={classes.container}
			onClick={onClick}
			component={component}
		>
			<CardContent>
				<Typography className={classes.dayText}>{dayText}</Typography>
				<main className={classes.main}>{children}</main>
			</CardContent>
		</Card>
	);
};

export default CalendarViewTile;
