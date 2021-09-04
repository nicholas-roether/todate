import { Paper } from "@material-ui/core";
import React from "react";
import CalendarView from "../src/frontend/components/calendar_view";
import Page from "../src/frontend/components/page";
import ResizableContainer from "../src/frontend/components/resizable_container";
import Clock from "../src/frontend/components/clock";

const Index = () => {
	const [page, setPage] = React.useState<number>(0);
	return (
		<Page title="home">
			<div style={{ display: "flex", height: "100%" }}>
				<ResizableContainer
					right
					defaultWidth={350}
					minWidth={80}
					maxWidth="min(600px, calc(100% - 800px))"
				>
					<Paper square style={{ height: "100%" }}>
						<Clock />
					</Paper>
				</ResizableContainer>
				<div style={{ flex: "1" }}>
					<CalendarView
						startDate={new Date()}
						page={page}
						onUpdatePage={(pageDiff) =>
							setPage((page) => page + pageDiff)
						}
					/>
				</div>
			</div>
		</Page>
	);
};

export default Index;
