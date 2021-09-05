import {
	Collapse,
	Drawer,
	Fade,
	IconButton,
	makeStyles
} from "@material-ui/core";
import { ArrowForward as ArrowForwardIcon } from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { useCallback } from "react";
import { useIntl } from "react-intl";
import Clock from "../clock";
import MonthPicker from "../utils/month_picker";
import Rotate180 from "../utils/rotate180";
import YearPicker from "../utils/year_picker";

const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
	drawer: {
		width: drawerWidth
	},
	drawerPaper: {
		width: drawerWidth,
		overflowX: "hidden"
	},
	drawerOpen: {
		transition: theme.transitions.create("width", {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen
		})
	},
	drawerClose: {
		transition: theme.transitions.create("width", {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen
		}),
		overflowX: "hidden",
		width: theme.spacing(11)
	},
	header: {
		textAlign: "right",
		height: theme.spacing(8),
		padding: theme.spacing(1, 0)
	},
	toggleButtonContainer: {
		display: "inline-block",
		width: theme.spacing(11),
		textAlign: "center"
	},
	content: {
		transition: theme.transitions.create("padding", {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.short
		}),
		flex: 1,
		padding: theme.spacing(0, 2),
		overflowX: "hidden",
		display: "flex",
		flexDirection: "column"
	},
	closedContent: {
		padding: theme.spacing(0, 1)
	},
	clockWrapper: {
		width: drawerWidth - theme.spacing(2)
	},
	listPickerTextField: {
		"& input": {
			transition: theme.transitions.create(["padding", "text-align"], {
				easing: theme.transitions.easing.sharp,
				duration: theme.transitions.duration.short
			}),
			textAlign: "center"
		}
	},
	inputSection: {
		transition: theme.transitions.create(["padding"], {
			easing: theme.transitions.easing.easeIn,
			duration: theme.transitions.duration.leavingScreen
		}),
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-around",
		alignItems: "center",
		maxHeight: `calc(100% - ${2 * theme.spacing(8)}px)`
	},
	input: {
		marginTop: theme.spacing(5)
	}
}));

export interface CalendarSidebarDesktopProps {
	startDate: Date;
	page: number;
	onUpdatePage: (pageDiff: number) => void;
}

const CalendarSidebarDesktop = ({
	startDate,
	page,
	onUpdatePage
}: CalendarSidebarDesktopProps) => {
	const [open, setOpen] = React.useState(true);
	// const [year, setYear] = React.useState(startDate.getFullYear());
	// const [month, setMonth] = React.useState(startDate.getMonth());
	const date = new Date(startDate);
	date.setMonth(startDate.getMonth() + page);
	const year = date.getFullYear();
	const month = date.getMonth();
	const intl = useIntl();
	const classes = useStyles();

	const onYearChange = useCallback(
		(newYear: number) => {
			onUpdatePage?.((newYear - year) * 12);
		},
		[onUpdatePage, year]
	);

	const onMonthChange = useCallback(
		(newMonth: number) => {
			onUpdatePage?.(newMonth - month);
		},
		[month, onUpdatePage]
	);

	return (
		<Drawer
			variant="permanent"
			className={clsx(classes.drawer, {
				[classes.drawerOpen]: open,
				[classes.drawerClose]: !open
			})}
			classes={{
				paper: clsx(classes.drawerPaper, {
					[classes.drawerOpen]: open,
					[classes.drawerClose]: !open
				})
			}}
		>
			<header className={classes.header}>
				<span className={classes.toggleButtonContainer}>
					<Rotate180 direction="left" in={open}>
						<IconButton onClick={() => setOpen((open) => !open)}>
							<ArrowForwardIcon />
						</IconButton>
					</Rotate180>
				</span>
			</header>
			<main
				className={clsx(classes.content, {
					[classes.closedContent]: !open
				})}
			>
				<Fade in={open}>
					<div>
						<Collapse in={open}>
							<div className={classes.clockWrapper}>
								<Clock />
							</div>
						</Collapse>
					</div>
				</Fade>
				<div className={classes.inputSection}>
					<div className={classes.input}>
						<YearPicker
							year={year}
							onYearChange={onYearChange}
							label={intl.messages.year.toString()}
							size={open ? "medium" : "small"}
							classes={{
								textField: classes.listPickerTextField
							}}
						/>
					</div>
					<div className={classes.input}>
						<MonthPicker
							month={month}
							onMonthChange={onMonthChange}
							label={intl.messages.month.toString()}
							size={open ? "medium" : "small"}
							classes={{
								textField: classes.listPickerTextField
							}}
						/>
					</div>
				</div>
			</main>
		</Drawer>
	);
};

export default CalendarSidebarDesktop;
