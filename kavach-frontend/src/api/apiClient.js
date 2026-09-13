export const API_BASE = 'https://kavach-api-latest.onrender.com/api';

function getAuthHeader() {
  const token = localStorage.getItem('kavach_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function handleResponse(response) {
  if (response.status === 401) {
    localStorage.removeItem('kavach_token');
    window.location.href = '/login'; // Force redirect to login
    throw new Error('Unauthorized');
  }
  
  // For export csv where response is not JSON
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("text/csv")) {
    return response.blob();
  }

  if (!response.ok) {
    let errMessage = 'API Error';
    try {
      const err = await response.json();
      errMessage = err.message || errMessage;
    } catch(e) {}
    throw new Error(errMessage);
  }

  return response.json();
}

export async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: getAuthHeader()
  });
  return handleResponse(response);
}

export async function apiPost(path, body = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return handleResponse(response);
}

export async function apiPut(path, body = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return handleResponse(response);
}

export async function apiPatch(path, body = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  return handleResponse(response);
}

export async function login(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    throw new Error('Invalid credentials');
  }
  
  const data = await response.json();
  localStorage.setItem('kavach_token', data.token);
  return data;
}

export function logout() {
  localStorage.removeItem('kavach_token');
  window.location.href = '/login';
}

export function isAuthenticated() {
  const token = localStorage.getItem('kavach_token');
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('kavach_token');
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}
