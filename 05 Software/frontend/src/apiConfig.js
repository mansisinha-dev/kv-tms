// Centralized API configuration for KV-TMS
// Uses relative path '/api/v1' so requests route via Vite proxy, Cloudflare tunnel, or same-origin deployment
export const API_BASE_URL = (typeof window !== 'undefined' && (window.location.hostname !== 'localhost' || window.location.port === '5173'))
    ? '/api/v1'
    : 'http://localhost:8080/api/v1';

export default API_BASE_URL;
