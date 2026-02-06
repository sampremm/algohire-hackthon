import { useState, useEffect } from 'react';
import { listTemplates, createTemplate, triggerNotifications, getStats, getBatchStatus } from '../api';

const DEMO_USERS = [
  { id: 'f6a329e5-ec7f-4000-8019-8a34be1e874a', name: 'Alice Johnson' },
  { id: 'd7b7a9f7-e5d5-4c7e-87dd-03e0c8879e3a', name: 'Bob Smith' },
  { id: 'c88ebdfd-b0ed-4cc1-b45b-78600ca490d3', name: 'Carol White' },
  { id: '09bab597-e16f-4bf1-9d3d-688804e4201f', name: 'David Brown' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState(null);
  const [batchStatus, setBatchStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Form states
  const [newTemplate, setNewTemplate] = useState({ title: '', body: '' });
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [batchId, setBatchId] = useState('');

  useEffect(() => {
    if (activeTab === 'templates') fetchTemplates();
    if (activeTab === 'stats') fetchStats();
  }, [activeTab]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await listTemplates();
      setTemplates(data);
    } catch (e) {
      setMessage('❌ ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getStats();
      setStats(data);
    } catch (e) {
      setMessage('❌ Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (!newTemplate.title || !newTemplate.body) {
      setMessage('❌ Title and body required');
      return;
    }
    try {
      setLoading(true);
      await createTemplate(newTemplate.title, newTemplate.body);
      setMessage('✅ Template created');
      setNewTemplate({ title: '', body: '' });
      await fetchTemplates();
    } catch (e) {
      setMessage('❌ ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerNotifications = async (e) => {
    e.preventDefault();
    if (!selectedTemplate || selectedUsers.length === 0) {
      setMessage('❌ Select template and users');
      return;
    }
    try {
      setLoading(true);
      const result = await triggerNotifications(selectedTemplate, selectedUsers);
      setBatchId(result.batchId);
      setMessage('✅ Notifications queued: ' + result.batchId);
      setSelectedTemplate('');
      setSelectedUsers([]);
    } catch (e) {
      setMessage('❌ ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckBatchStatus = async (e) => {
    e.preventDefault();
    if (!batchId) {
      setMessage('❌ Enter batch ID');
      return;
    }
    try {
      setLoading(true);
      const status = await getBatchStatus(batchId);
      setBatchStatus(status);
      setMessage('✅ Batch status fetched');
    } catch (e) {
      setMessage('❌ Batch not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>📧 Admin Dashboard</h1>

      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('templates')}
          style={{
            marginRight: 10,
            padding: '8px 12px',
            background: activeTab === 'templates' ? '#2196F3' : '#ddd',
            color: activeTab === 'templates' ? 'white' : 'black',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab('trigger')}
          style={{
            marginRight: 10,
            padding: '8px 12px',
            background: activeTab === 'trigger' ? '#2196F3' : '#ddd',
            color: activeTab === 'trigger' ? 'white' : 'black',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Send Notifications
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          style={{
            padding: '8px 12px',
            background: activeTab === 'stats' ? '#2196F3' : '#ddd',
            color: activeTab === 'stats' ? 'white' : 'black',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Stats
        </button>
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

      {activeTab === 'templates' && (
        <div>
          <h2>Create Template</h2>
          <form onSubmit={handleCreateTemplate} style={{ marginBottom: 30 }}>
            <div style={{ marginBottom: 10 }}>
              <input
                type="text"
                placeholder="Title (e.g., Welcome {{name}})"
                value={newTemplate.title}
                onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                style={{ width: '100%', padding: 8, marginBottom: 10, boxSizing: 'border-box' }}
              />
              <textarea
                placeholder="Body (e.g., Hello {{name}}, welcome!)"
                value={newTemplate.body}
                onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                style={{ width: '100%', padding: 8, minHeight: 80, boxSizing: 'border-box' }}
              />
            </div>
            <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#4caf50', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              Create Template
            </button>
          </form>

          <h2>Existing Templates</h2>
          {loading && !templates.length && <p>Loading...</p>}
          {templates.length === 0 && !loading && <p>No templates</p>}
          <div style={{ display: 'grid', gap: 15 }}>
            {templates.map((t) => (
              <div key={t.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 4, background: '#f9f9f9' }}>
                <h3>{t.titleTemplate}</h3>
                <p>{t.bodyTemplate}</p>
                <div style={{ fontSize: 11, color: '#666' }}>ID: {t.id}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'trigger' && (
        <div>
          <h2>Trigger Notifications</h2>
          <form onSubmit={handleTriggerNotifications} style={{ marginBottom: 30 }}>
            <div style={{ marginBottom: 15 }}>
              <label>Template:</label>
              <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 5 }}>
                <option value="">Select a template...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.titleTemplate}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 15 }}>
              <label>Users:</label>
              <div style={{ marginTop: 5, border: '1px solid #ddd', padding: 10, borderRadius: 4, maxHeight: 150, overflow: 'auto' }}>
                {DEMO_USERS.map((user) => (
                  <div key={user.id} style={{ marginBottom: 8 }}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
                        }
                      }}
                    />
                    <label style={{ marginLeft: 8 }}>{user.name}</label>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#ff9800', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              Send to {selectedUsers.length} user(s)
            </button>
          </form>

          {batchId && (
            <div>
              <h3>Check Batch Status</h3>
              <form onSubmit={handleCheckBatchStatus} style={{ display: 'flex', gap: 10 }}>
                <input type="text" value={batchId} readOnly style={{ flex: 1, padding: 8 }} />
                <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#2196F3', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                  Check Status
                </button>
              </form>

              {batchStatus && (
                <div style={{ marginTop: 20, border: '1px solid #ddd', padding: 15, borderRadius: 4, background: '#f0f0f0' }}>
                  <h4>Status Breakdown:</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {Object.entries(batchStatus.byStatus || {}).map(([status, count]) => (
                      <div key={status}>
                        {status}: <strong>{count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div>
          <h2>Delivery Statistics</h2>
          {loading && !stats && <p>Loading...</p>}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 15 }}>
              <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 4, textAlign: 'center', background: '#e3f2fd' }}>
                <div style={{ fontSize: 12, color: '#666' }}>Total</div>
                <div style={{ fontSize: 28, fontWeight: 'bold' }}>{stats.total}</div>
              </div>
              <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 4, textAlign: 'center', background: '#c8e6c9' }}>
                <div style={{ fontSize: 12, color: '#666' }}>Sent ✓</div>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#4caf50' }}>{stats.sent}</div>
              </div>
              <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 4, textAlign: 'center', background: '#ffecb3' }}>
                <div style={{ fontSize: 12, color: '#666' }}>Failed ✗</div>
                <div style={{ fontSize: 28, fontWeight: 'bold', color: '#f44336' }}>{stats.failed}</div>
              </div>
              <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 4 }}>QUEUED: {stats.queued}</div>
              <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 4 }}>PROCESSING: {stats.processing}</div>
              <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 4 }}>RETRYING: {stats.retrying}</div>
            </div>
          )}
          <div style={{ marginTop: 20 }}>
            <strong>Success Rate:</strong> {stats?.successRate || 'N/A'}
          </div>
        </div>
      )}
    </div>
  );
}
