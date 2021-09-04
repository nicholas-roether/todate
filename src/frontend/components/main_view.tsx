import { Box, Drawer, makeStyles, Paper } from "@material-ui/core";
import React from "react";
import CalendarView from "./main_view/calendar_view";
import Clock from "./clock";
import ResizableContainer from "./resizable_container";
import CalendarSidebarDesktop from "./main_view/calendar_sidebar";

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

interface MainViewProps {
	startDate: Date;
	page: number;
	onUpdatePage: (pageDiff: number) => void;
}

const MainView = ({ startDate, page, onUpdatePage }: MainViewProps) => {
	const classes = useStyles();
	return (
		<div className={classes.container}>
			{/* <ResizableContainer
				right
				defaultWidth={350}
				minWidth={160}
				maxWidth="min(600px, max(calc(100% - 800px), 160px))"
			>
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
			</div> */}
			<CalendarSidebarDesktop
				startDate={startDate}
				page={page}
				onUpdatePage={onUpdatePage}
			/>
			<CalendarView
				startDate={startDate}
				page={page}
				onUpdatePage={onUpdatePage}
			/>
		</div>
	);
};

export default MainView;
