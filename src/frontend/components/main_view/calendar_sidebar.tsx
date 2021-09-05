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
import Clock from "../clock";
import Rotate180 from "../utils/rotate180";

const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
	drawer: {
		width: drawerWidth
	},
	drawerPaper: {
		width: drawerWidth
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
		width: theme.spacing(9)
	},
	header: {
		textAlign: "right",
		padding: theme.spacing(1, 0)
	},
	toggleButtonContainer: {
		display: "inline-block",
		width: theme.spacing(9),
		textAlign: "center"
	},
	content: {
		paddingLeft: theme.spacing(2)
	},
	section: {
		paddingBottom: theme.spacing(2)
	},
	clockWrapper: {
		width: drawerWidth - theme.spacing(2)
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
			<main className={classes.content}>
				<div className={classes.section}>
					<Fade in={open}>
						<div className={classes.clockWrapper}>
							<Clock />
						</div>
					</Fade>
				</div>
				<div className={classes.section}>test</div>
			</main>
		</Drawer>
	);
};

export default CalendarSidebarDesktop;
