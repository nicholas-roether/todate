import React from "react";
import Page from "../src/frontend/components/page";
import MainView from "../src/frontend/components/main_view";

const Index = () => {
	const [page, setPage] = React.useState<number>(0);
	return (
		<Page title="home">
			<MainView
				startDate={new Date()}
				page={page}
				onUpdatePage={(pageDiff) => setPage((page) => page + pageDiff)}
			/>
		</Page>
	);
};

export default Index;
