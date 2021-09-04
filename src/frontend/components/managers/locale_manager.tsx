import React from "react";
import { Locale } from "../../../i18n/locale";

const LocaleContext = React.createContext<Locale>(Locale.ENGLISH);
const LocaleSetterContext = React.createContext<(newLocale: Locale) => void>(
	() => {}
);

interface LocaleManagerProps {
	defaultValue?: Locale;
}

const LocaleManager = ({
	defaultValue = Locale.GERMAN,
	children
}: React.PropsWithChildren<LocaleManagerProps>) => {
	const [locale, setLocale] = React.useState(defaultValue);

	return (
		<LocaleSetterContext.Provider value={setLocale}>
			<LocaleContext.Provider value={locale}>
				{children}
			</LocaleContext.Provider>
		</LocaleSetterContext.Provider>
	);
};

function useLocale() {
	return React.useContext(LocaleContext);
}

function useLocaleSetter() {
	return React.useContext(LocaleSetterContext);
}

export { LocaleContext, LocaleSetterContext, useLocale, useLocaleSetter };

export default LocaleManager;
