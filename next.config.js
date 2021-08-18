module.exports = {
	reactStrictMode: true,
	i18n: {
		locales: ["en-US"],
		defaultLocale: "en-US"
	},
	webpack: config => {
		config.module.rules.push({
			test: /\.graphql$/,
			include: /src/,
			exclude: /node_modules/,
			loader: "graphql-tag/loader"
		});
		return config;
	}
}
