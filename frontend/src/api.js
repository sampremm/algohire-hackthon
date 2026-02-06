import axios from 'axios';

const API_BASE = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Admin endpoints
export async function listTemplates() {
  const res = await api.get('/admin/templates');
  return res.data;
}

export async function createTemplate(title, body) {
  const res = await api.post('/admin/templates', { title, body });
  return res.data;
}

export async function triggerNotifications(templateId, userIds) {
  const res = await api.post('/admin/notify', { templateId, userIds });
  return res.data;
}

export async function getStats() {
  const res = await api.get('/admin/stats');
  return res.data;
}

export async function getBatchStatus(batchId) {
  const res = await api.get(`/admin/batches/${batchId}/status`);
  return res.data;
}

// User endpoints
export async function getUserNotifications(userId) {
  const res = await api.get("/user/notifications", {
    headers: {
      "x-user-id": userId,
      "x-role": "USER"
    }
  });
  return res.data;
}

export async function markNotificationRead(notificationId, userId) {
  const res = await api.patch(`/user/notifications/${notificationId}/read`, {}, {
    headers: {
      "x-user-id": userId,
      "x-role": "USER"
    }
  });
  return res.data;
}

export default api;
