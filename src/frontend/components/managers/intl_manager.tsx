import { useRouter } from "next/dist/client/router";
import React from "react";
import { IntlProvider } from "react-intl";
import { Locale } from "../../../i18n/locale";
import { messages } from "../../../i18n/messages";

const IntlManager = ({ children }: React.PropsWithChildren<{}>) => {
	const router = useRouter();
	const locale = (router.locale ?? "en-US") as Locale;
	return (
		<IntlProvider
			defaultLocale={Locale.ENGLISH}
			locale={locale}
			messages={messages[locale]}
		>
			{children}
		</IntlProvider>
	);
};

export default IntlManager;
