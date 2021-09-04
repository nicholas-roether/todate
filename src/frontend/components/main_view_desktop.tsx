import { Drawer, makeStyles, Paper } from "@material-ui/core";
import React from "react";
import CalendarView from "./main_view_desktop/calendar_view_desktop";
import Clock from "./clock";
import ResizableContainer from "./resizable_container";

const useStyles = makeStyles(() => ({
	container: {
		display: "flex",
		height: "100%"
	},
	drawer: {
		width: "100%",
		height: "100%"
	},
	drawerPaper: {
		width: "100%",
		position: "static",
		height: "100%"
	}
}));

interface MainViewDesktopProps {
	startDate: Date;
	page: number;
	onUpdatePage: (pageDiff: number) => void;
}

const MainViewDesktop = ({
	startDate,
	page,
	onUpdatePage
}: MainViewDesktopProps) => {
	const classes = useStyles();
	return (
		<div className={classes.container}>
			<ResizableContainer
				right
				defaultWidth={350}
				minWidth={160}
				maxWidth="min(600px, max(calc(100% - 800px), 160px))"
			>
				{/* <Paper square style={{ height: "100%" }}>
					<Clock />
				</Paper> */}
				<Drawer
					variant="permanent"
					open
					className={classes.drawer}
					PaperProps={{ className: classes.drawerPaper }}
				>
					<Clock />
				</Drawer>
			</ResizableContainer>
			<div style={{ flex: "1" }}>
				<CalendarView
					startDate={startDate}
					page={page}
					onUpdatePage={onUpdatePage}
				/>
			</div>
		</div>
	);
};

export default MainViewDesktop;
