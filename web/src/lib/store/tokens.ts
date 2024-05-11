import type { Tokens } from '../types/tokens';

const ACCESS = 'access';
const REFRESH = 'refresh';

export const getTokens = (): Tokens | null => {
	const accessToken = localStorage.getItem(ACCESS);
	const refreshToken = localStorage.getItem(REFRESH);

	if (!accessToken || !refreshToken) return null;

	return { accessToken, refreshToken };
};

export const setTokens = (tokens: Tokens) => {
	localStorage.setItem(ACCESS, tokens.accessToken);
	localStorage.setItem(REFRESH, tokens.refreshToken);
};

export const clearTokens = () => {
	localStorage.setItem(ACCESS, '');
	localStorage.setItem(REFRESH, '');
};
