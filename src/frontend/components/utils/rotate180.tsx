import { makeStyles, Theme } from "@material-ui/core";
import { useTheme } from "@material-ui/styles";
import React from "react";
import { Transition } from "react-transition-group";
import { TransitionStatus } from "react-transition-group/Transition";

const useStyles = makeStyles((theme) => ({
	transition: {
		transition: theme.transitions.create("transform", {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.short
		})
	}
}));

export interface Rotate180Props {
	in: boolean;
	direction: "right" | "left";
}

const Rotate180 = ({
	in: inProp,
	direction,
	children
}: React.PropsWithChildren<Rotate180Props>) => {
	const theme = useTheme<Theme>();
	const classes = useStyles();
	const transitionStyles: Partial<Record<TransitionStatus, any>> = {
		entering: { transform: `rotate(${direction == "left" && "-"}180deg)` },
		entered: { transform: `rotate(${direction == "left" && "-"}180deg)` },
		exiting: { transform: "rotate(0)" },
		exited: { transform: "rotate(0)" }
	};

	return (
		<Transition in={inProp} timeout={theme.transitions.duration.short}>
			{(state) => (
				<div
					className={classes.transition}
					style={transitionStyles[state]}
				>
					{children}
				</div>
			)}
		</Transition>
	);
};

export default Rotate180;
