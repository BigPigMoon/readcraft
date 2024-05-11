import axios from 'axios';
import { clearTokens, getTokens, setTokens } from '../store/tokens';
import type { Tokens } from '../types/tokens';

export const RC_API = 'http://localhost:3000';

const rcApi = axios.create({
	withCredentials: true,
	baseURL: RC_API
});

let refresh_req = false;

rcApi.interceptors.request.use((config) => {
	const access = getTokens()?.accessToken;
	config.headers.Authorization = `Bearer ${access}`;
	return config;
});

rcApi.interceptors.response.use(
	(config) => {
		return config;
	},
	async (error) => {
		const config = error.config;

		if (error.response.status === 401 && config && !config.sent && !refresh_req) {
			refresh_req = true;
			config.sent = true;
			try {
				const ref = axios.create({
					withCredentials: true,
					headers: {
						Authorization: `Bearer ${getTokens()?.refreshToken}`,
						'Content-Type': 'application/json'
					}
				});

				const res = await ref.post<Tokens>(`${RC_API}/api/auth/refresh`);

				setTokens(res.data);

				refresh_req = false;
				return rcApi.request(config);
			} catch (e) {
				console.error(e);
				clearTokens();
				refresh_req = false;
			}
		}
		throw error;
	}
);

export default rcApi;
