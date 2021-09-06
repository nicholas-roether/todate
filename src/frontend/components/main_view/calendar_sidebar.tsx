import {
	Button,
	Collapse,
	Drawer,
	Fab,
	Fade,
	Hidden,
	IconButton,
	makeStyles,
	Slide,
	Theme,
	useTheme
} from "@material-ui/core";
import {
	ArrowForward as ArrowForwardIcon,
	Today as TodayIcon
} from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
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
			duration: theme.transitions.duration.enteringScreen
		})
	},
	drawerClose: {
		transition: theme.transitions.create("width", {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen
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
		overflow: "hidden",
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
		marginTop: theme.spacing(5),
		width: "100%"
	},
	buttonSection: {
		marginTop: theme.spacing(8),
		textAlign: "center"
	},
	buttonSectionOpen: {
		minWidth: drawerWidth - theme.spacing(4)
	}
}));

export interface CalendarSidebarDesktopProps {
	startDate: Date;
	page: number;
	onUpdatePage: (pageDiff: number) => void;
}

// TODO redo layout of buttons & inputs to respond to vertical resizing

const CalendarSidebarDesktop = ({
	startDate,
	page,
	onUpdatePage
}: CalendarSidebarDesktopProps) => {
	const [open, setOpen] = React.useState(true);
	const date = new Date(startDate);
	date.setMonth(startDate.getMonth() + page);
	const year = date.getFullYear();
	const month = date.getMonth();
	const intl = useIntl();
	const theme = useTheme<Theme>();
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

	const onBackToToday = useCallback(() => {
		onUpdatePage?.(-page);
	}, [onUpdatePage, page]);

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
					<div
						className={clsx(classes.buttonSection, {
							[classes.buttonSectionOpen]: open
						})}
					>
						<Hidden xsUp={!open}>
							<span>
								<Button
									onClick={onBackToToday}
									startIcon={<TodayIcon />}
									variant="contained"
									color="secondary"
									disabled={page == 0}
								>
									<FormattedMessage
										id="backToToday"
										defaultMessage="Back to today"
									/>
								</Button>
							</span>
						</Hidden>
						<Hidden xsUp={open}>
							<span>
								<Fab
									onClick={onBackToToday}
									color="secondary"
									disabled={page == 0}
								>
									<TodayIcon />
								</Fab>
							</span>
						</Hidden>
					</div>
				</div>
			</main>
		</Drawer>
	);
};

export default CalendarSidebarDesktop;
