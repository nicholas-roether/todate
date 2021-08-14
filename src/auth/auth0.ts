import { initAuth0 } from "@auth0/nextjs-auth0";


export default initAuth0({
	baseURL: process.env.BASE_URL,
	secret: process.env.SESSION_COOKIE_SECRET,
	issuerBaseURL: process.env.AUTH0_CLIENT_DOMAIN,
	clientID: process.env.AUTH0_CLIENT_ID,
	clientSecret: process.env.AUTH0_CLIENT_SECRET,
	routes: {
		callback: process.env.AUTH_REDIRECT_URL || "/api/auth/callback",
		postLogoutRedirect: process.env.AUTH_LOGOUT_REDIRECT_URL || "/"
	},
	authorizationParams: {
		response_type: "code",
		scope: process.env.AUTH0_SCOPE
	},
	session: {
		absoluteDuration: Number(process.env.SESSION_COOKIE_LIFETIME) ?? 7200
	}
});