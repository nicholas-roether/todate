import {
	Box,
	Divider,
	Drawer,
	Fade,
	IconButton,
	makeStyles,
	Theme,
	useTheme
} from "@material-ui/core";
import { ArrowForward as ArrowForwardIcon } from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { useIntl } from "react-intl";
import Clock from "../clock";
import ListPicker from "../utils/list_picker";
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
		padding: theme.spacing(0, 2),
		overflowX: "hidden",
		position: "relative",
		width: "100%",
		height: "100%"
	},
	closedContent: {
		padding: theme.spacing(0, 1)
	},
	section: {
		paddingBottom: theme.spacing(2)
	},
	clockWrapper: {
		width: drawerWidth - theme.spacing(2)
	},
	centered: {
		textAlign: "center"
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
	spacer: {
		marginTop: theme.spacing(6)
	},
	inputSection: {
		transition: theme.transitions.create("padding", {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.short
		}),
		position: "absolute",
		top: 0,
		left: 0,
		width: "100%",
		height: `calc(100% - ${theme.spacing(10)}px)`,
		padding: theme.spacing(0, 2),
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center"
	},
	closedInputSection: {
		padding: theme.spacing(0, 1)
	},
	inputContainer: {
		height: "60%",
		width: "100%",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center"
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
	const [year, setYear] = React.useState(new Date().getFullYear());
	const [month, setMonth] = React.useState(new Date().getMonth());
	const intl = useIntl();
	const classes = useStyles();
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
				<div className={classes.section}>
					<Fade in={open}>
						<div className={classes.clockWrapper}>
							<Clock />
						</div>
					</Fade>
				</div>
				<div
					className={clsx(classes.inputSection, {
						[classes.closedInputSection]: !open
					})}
				>
					<div className={classes.inputContainer}>
						<YearPicker
							year={year}
							onYearChange={setYear}
							label={intl.messages.year.toString()}
							size={open ? "medium" : "small"}
							classes={{
								textField: classes.listPickerTextField
							}}
						/>
						<MonthPicker
							month={month}
							onMonthChange={setMonth}
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
