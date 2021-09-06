import {
	IconButton,
	makeStyles,
	TextField,
	TextFieldProps
} from "@material-ui/core";
import {
	KeyboardArrowDown as KeyboardArrowDownIcon,
	KeyboardArrowUp as KeyboardArrowUpIcon
} from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { useUniqueId } from "../../hooks";

const useStyles = makeStyles((theme) => ({
	form: {
		width: "100%"
	},
	container: {
		display: "inline-flex",
		flexDirection: "column",
		alignItems: "center",
		width: "100%"
	},
	textField: {
		margin: theme.spacing(1, 0),
		width: "100%"
	}
}));

export interface ListPickerClassesProp {
	buttons?: string;
	textField?: string;
}

export interface ListPickerProps {
	value: string;
	tryUpdateValue?: (newValue: string, showErrors: boolean) => void;
	onValueUp?: () => void;
	onValueDown?: () => void;
	disableUp?: boolean;
	disableDown?: boolean;
	error?: boolean;
	errorText?: string;
	label?: string;
	textFieldProps?: TextFieldProps;
	validValues?: RegExp;
	size?: "medium" | "small";
	className?: string;
	classes?: ListPickerClassesProp;
	placeholder?: string;
	autoComplete?: string;
	suggestions?: string[];
	autoSelect?: boolean;
	live?: boolean;
}

const ListPicker = ({
	value: startValue,
	tryUpdateValue,
	onValueUp,
	onValueDown,
	disableUp = false,
	disableDown = false,
	error = false,
	errorText,
	label,
	textFieldProps,
	validValues,
	size = "medium",
	className,
	classes: classesProp = {},
	placeholder,
	autoComplete,
	suggestions = [],
	autoSelect = false,
	live = false
}: ListPickerProps) => {
	const classes = useStyles();
	const [value, setValue] = React.useState<string>(startValue);
	const suggestionsListId = useUniqueId("list-picker-suggestions");

	React.useEffect(() => {
		setValue(startValue);
	}, [startValue]);

	const onKeyPress = React.useCallback(
		(evt: React.KeyboardEvent<HTMLInputElement>) => {
			if (evt.key === "Enter") {
				evt.preventDefault();
				tryUpdateValue?.(value, true);
			}
		},
		[tryUpdateValue, value]
	);

	const onBlur = React.useCallback(
		() => tryUpdateValue?.(value, true),
		[tryUpdateValue, value]
	);

	const onFocus = React.useCallback(
		(evt: React.FocusEvent<HTMLInputElement>) => {
			if (!autoSelect) return;
			evt.target.setSelectionRange(0, evt.target.value.length);
		},
		[autoSelect]
	);

	const onChange = React.useCallback(
		(evt: React.ChangeEvent<HTMLInputElement>) => {
			if (!validValues || validValues.test(evt.target.value)) {
				setValue(evt.target.value);
				if (live && evt.target.validity.valid)
					tryUpdateValue?.(evt.target.value, false);
			}
		},
		[live, tryUpdateValue, validValues]
	);

	return (
		<div className={clsx(classes.container, className)}>
			<IconButton
				className={classesProp.buttons}
				onClick={onValueUp}
				disabled={disableUp}
			>
				<KeyboardArrowUpIcon />
			</IconButton>
			<form className={classes.form} onSubmit={(evt) => console.log(evt)}>
				<datalist id={suggestionsListId}>
					{suggestions.map((suggestion, i) => (
						<option value={suggestion} key={i} />
					))}
				</datalist>
				<TextField
					variant="outlined"
					value={value}
					className={clsx(classes.textField, classesProp.textField)}
					onChange={onChange}
					onKeyPress={onKeyPress}
					onFocus={onFocus}
					onBlur={onBlur}
					error={error}
					label={label}
					helperText={error && errorText}
					size={size}
					placeholder={placeholder}
					autoComplete={autoComplete}
					{...textFieldProps}
					InputProps={{ inputProps: { list: suggestionsListId } }}
				/>
			</form>
			<IconButton
				className={classesProp.buttons}
				onClick={onValueDown}
				disabled={disableDown}
			>
				<KeyboardArrowDownIcon />
			</IconButton>
		</div>
	);
};

export default ListPicker;
