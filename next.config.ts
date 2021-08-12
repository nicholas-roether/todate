import { NextConfig } from "next/dist/server/config-shared";

const config: NextConfig = {
	reactStrictMode: true,
	env: {},
	i18n: {
		locales: ["en-US"],
		defaultLocale: "en-US"
	},
}

export default config;