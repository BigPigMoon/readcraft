import axios from 'axios';

export const TRANSLATOR_API = 'http://127.0.0.1:5000';

const transApi = axios.create({
	withCredentials: false,
	baseURL: TRANSLATOR_API
});

export default transApi;
