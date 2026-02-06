import { useState, useEffect, useCallback } from 'react';
import { getUserNotifications, markNotificationRead } from '../api';

const DEMO_USERS = [
  { id: 'f6a329e5-ec7f-4000-8019-8a34be1e874a', name: 'Alice Johnson' },
  { id: 'd7b7a9f7-e5d5-4c7e-87dd-03e0c8879e3a', name: 'Bob Smith' },
  { id: 'c88ebdfd-b0ed-4cc1-b45b-78600ca490d3', name: 'Carol White' },
  { id: '09bab597-e16f-4bf1-9d3d-688804e4201f', name: 'David Brown' },
];

const AUTO_REFRESH_INTERVAL = 3000; // 3 seconds

export default function UserDashboard() {
  const [selectedUserId, setSelectedUserId] = useState(DEMO_USERS[0].id);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Memoized fetch function
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserNotifications(selectedUserId);
      setNotifications(data);
      setMessage('');
    } catch (e) {
      setMessage('❌ Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [selectedUserId]);

  // Effect: Fetch notifications when user changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Effect: Auto-refresh notifications at interval
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, AUTO_REFRESH_INTERVAL);

    // Cleanup interval on unmount or when autoRefresh changes
    return () => clearInterval(interval);
  }, [autoRefresh, fetchNotifications]);

  // Memoized mark as read function
  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await markNotificationRead(id, selectedUserId);
      await fetchNotifications();
      setMessage('✅ Notification marked as read');
      // Auto-clear message after 2 seconds
      setTimeout(() => setMessage(''), 2000);
    } catch (e) {
      setMessage('❌ Failed to mark as read');
      setTimeout(() => setMessage(''), 2000);
    }
  }, [fetchNotifications, selectedUserId]);

  const currentUser = DEMO_USERS.find((u) => u.id === selectedUserId);

  return (
    <div style={{ padding: 20 }}>
      <h1>📬 User Notifications</h1>

      <div style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 10 }}>Select User:</label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
        >
          {DEMO_USERS.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <div
          style={{
            padding: 12,
            marginBottom: 20,
            background: message.includes('✅') ? '#c8e6c9' : '#ffcdd2',
            borderRadius: 4,
            borderLeft: '4px solid ' + (message.includes('✅') ? '#4caf50' : '#f44336'),
          }}
        >
          {message}
        </div>
      )}

      <div style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Notifications for {DEMO_USERS.find(u => u.id === selectedUserId)?.name}</h2>
        <button
          onClick={() => fetchNotifications()}
          disabled={loading}
          style={{
            padding: '8px 12px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          🔄 Refresh
        </button>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          style={{
            padding: '8px 12px',
            background: autoRefresh ? '#4caf50' : '#999',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          {autoRefresh ? '✓ Auto-Refresh ON' : '⏸ Auto-Refresh OFF'}
        </button>
      </div>

      {loading && !notifications.length && <p>Loading notifications...</p>}

      {notifications.length === 0 && !loading && (
        <div
          style={{
            padding: 20,
            background: '#f5f5f5',
            borderRadius: 4,
            textAlign: 'center',
            color: '#999',
          }}
        >
          No notifications yet. Ask admin to send some!
        </div>
      )}

      <div style={{ display: 'grid', gap: 15 }}>
        {notifications.map((notif) => (
          <div
            key={notif.id}
            style={{
              border: '1px solid #ddd',
              padding: 15,
              borderRadius: 4,
              background: notif.isRead ? '#f9f9f9' : '#fff3e0',
              borderLeft: notif.isRead ? '4px solid #ddd' : '4px solid #ff9800',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px 0' }}>{notif.title}</h3>
                <p style={{ margin: '0 0 8px 0', color: '#666' }}>{notif.body}</p>
                <div style={{ fontSize: 11, color: '#999' }}>
                  {new Date(notif.createdAt).toLocaleString()}
                </div>
              </div>
              <div style={{ marginLeft: 15 }}>
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    style={{
                      padding: '6px 12px',
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Mark as Read
                  </button>
                )}
                {notif.isRead && (
                  <span style={{ color: '#4caf50', fontSize: 12, fontWeight: 'bold' }}>✓ Read</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
