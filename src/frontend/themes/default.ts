import { createTheme } from "@material-ui/core";

const headingOverride = {
	fontFamily: "'Urbanist', 'Noto Sans JP', sans-serif"
};

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
	},
	typography: {
		fontFamily: "'Montserrat', 'Noto Sans JP', sans-serif",
		fontWeightRegular: 300
	},
	overrides: {
		MuiTypography: {
			h1: headingOverride,
			h2: headingOverride,
			h3: headingOverride,
			h4: headingOverride,
			h5: headingOverride,
			h6: headingOverride
		}
	}
});

export default defaultTheme;
