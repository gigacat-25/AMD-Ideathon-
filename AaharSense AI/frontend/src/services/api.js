const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * API Service - Centralized HTTP client for AaharSense AI backend.
 * Handles authentication headers, error handling, and response parsing.
 */

function getHeaders() {
  const uid = localStorage.getItem('AaharSense AI_uid') || 'demo_user_001';
  return {
    'Authorization': `Bearer ${uid}`,
    'Content-Type': 'application/json',
  };
}

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

// ============== AUTH ==============

export async function demoLogin() {
  const res = await fetch(`${API_BASE}/api/auth/demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await handleResponse(res);
  localStorage.setItem('AaharSense AI_uid', data.uid);
  localStorage.setItem('AaharSense AI_user', JSON.stringify(data.user));
  return data;
}

// ============== FOOD ANALYSIS ==============

export async function analyzeFoodImage(file) {
  const uid = localStorage.getItem('AaharSense AI_uid') || 'demo_user_001';
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/food/analyze`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${uid}` },
    body: formData,
  });
  return handleResponse(res);
}

export async function analyzeFoodText(description) {
  const res = await fetch(`${API_BASE}/api/food/analyze-text`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ description }),
  });
  return handleResponse(res);
}

// ============== FOOD LOGGING ==============

export async function logFood(foodData) {
  const res = await fetch(`${API_BASE}/api/food/log`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(foodData),
  });
  return handleResponse(res);
}

export async function getFoodLogs(date) {
  const params = date ? `?date=${date}` : '';
  const res = await fetch(`${API_BASE}/api/food/log${params}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

// ============== DASHBOARD ==============

export async function getDashboard() {
  const res = await fetch(`${API_BASE}/api/dashboard/today`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function getWeeklyReport() {
  const res = await fetch(`${API_BASE}/api/dashboard/weekly`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

// ============== PROFILE ==============

export async function getProfile() {
  const res = await fetch(`${API_BASE}/api/profile/`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function updateProfile(profileData) {
  const res = await fetch(`${API_BASE}/api/profile/`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ profile: profileData }),
  });
  return handleResponse(res);
}

// ============== RECOMMENDATIONS ==============

export async function getRecommendations() {
  const res = await fetch(`${API_BASE}/api/recommendations/meal`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function askFoodQuestion(question) {
  const res = await fetch(`${API_BASE}/api/recommendations/query`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ question }),
  });
  return handleResponse(res);
}

// ============== HEALTH CHECK ==============

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/api/health`);
  return handleResponse(res);
}

