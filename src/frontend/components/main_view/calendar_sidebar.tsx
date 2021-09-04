import { Drawer } from "@material-ui/core";
import React from "react";

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
	const [minimized, setMinimized] = React.useState(false);
	return (
		<Drawer variant="permanent" open>
			test
		</Drawer>
	);
};

export default CalendarSidebarDesktop;
