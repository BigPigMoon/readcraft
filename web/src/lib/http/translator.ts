import axios from 'axios';

export const TRANSLATOR_API = 'http://locahost:5000';

const transApi = axios.create({
	withCredentials: true,
	baseURL: TRANSLATOR_API
});

export default transApi;
