import { createTheme } from "@material-ui/core";

const defaultTheme = createTheme({
	palette: {
		type: "dark",
		primary: {
			main: "#de3c4b",
			contrastText: "#fff"
		},
		secondary: {
			main: "#7ae7c7",
			contrastText: "#000"
		},
		background: {
			default: "#08090a",
			paper: "#141415"
		},
		text: {
			primary: "#fff"
		}
	},
	shape: {
		borderRadius: 6
	}
});

export default defaultTheme;