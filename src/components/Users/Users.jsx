import { useState, useEffect } from 'react';
import api from '../../api';
import NewUserModal from '../Modals/NewUserModal';
import ViewUserModal from '../Modals/ViewUserModal';
import EditUserModal from '../Modals/EditUserModal';
import DeleteUserModal from '../Modals/DeleteUserModal';

const Users = () => {
  // ... (all state and functions unchanged)

  const getUserField = (user, field) => {
    if (user[field] !== undefined && user[field] !== null && user[field] !== '') return user[field];
    if (user.profile && user.profile[field] !== undefined && user.profile[field] !== null && user.profile[field] !== '') return user.profile[field];
    return '-';
  };

  // ... (other helpers)

  if (loading) return <div className="admin-card">Loading users...</div>;
  if (error) return <div className="admin-card">Error: {error}</div>;

  return (
    <>
      <div className="fade-in">
        {/* ... header and filters unchanged */}

        <div className="admin-card" style={{ padding: 0, overflow: 'hidden', marginTop: '20px' }}>
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table" style={{ minWidth: '1000px', width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead style={{ background: '#f9fafc' }}>
                <tr>
                  <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Profile</th>
                  <th style={{ padding: '16px 12px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Name <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" style={{ marginLeft: '4px', verticalAlign: 'middle' }} height="14" width="14"><path d="M7 20h2V8h3L8 4 4 8h3zm13-4h-3V4h-2v12h-3l4 4z"></path></svg>
                  </th>
                  <th style={{ padding: '16px 12px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '16px 12px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
                  <th style={{ padding: '16px 12px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company</th>
                  <th style={{ padding: '16px 12px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</th>
                  <th style={{ padding: '16px 12px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shop</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="table-row-hover" style={{ background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', borderRadius: '16px', transition: 'all 0.2s', cursor: 'pointer' }}>
                      {/* ... profile, name, status columns unchanged ... */}
                      <td style={{ padding: '16px 20px' }}>
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '16px',
                            background: getInitialsBg(user.name || user.username),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            fontWeight: '600',
                            color: getInitialsColor(user.status),
                          }}
                        >
                          {getInitials(user.name || user.username)}
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div className="d-flex" style={{ flexDirection: 'column' }}>
                          <span className="fw-bold" style={{ fontSize: '1rem', color: '#0f172a' }}>
                            {user.name || user.username}
                          </span>
                          <span className="text-muted" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <select
                          className="form-control form-select-sm"
                          value={user.status || 'Pending'}
                          onChange={(e) => handleStatusChange(user, e.target.value)}
                          disabled={updatingStatus === user.id}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '30px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#fff',
                            fontWeight: 500,
                            color: user.status === 'Approved' ? '#1d874b' : user.status === 'Rejected' ? '#b42318' : '#b45b0e',
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        {updatingStatus === user.id && (
                          <span className="small text-muted ms-2">Updating...</span>
                        )}
                      </td>
                      {/* Role column – use role_details.name */}
                      <td style={{ padding: '16px 12px', color: '#334155', fontSize: '0.9rem' }}>
                        {user.role_details?.name || '-'}
                      </td>
                      <td style={{ padding: '16px 12px', color: '#334155', fontSize: '0.9rem' }}>
                        {getUserField(user, 'company')}
                      </td>
                      <td style={{ padding: '16px 12px', color: '#334155', fontSize: '0.9rem' }}>
                        {getUserField(user, 'location')}
                      </td>
                      <td style={{ padding: '16px 12px', color: '#334155', fontSize: '0.9rem' }}>
                        {getUserField(user, 'shop')}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        {/* actions unchanged */}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted" style={{ fontSize: '1rem' }}>No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ... pagination unchanged ... */}
        </div>
      </div>

      {/* Modals unchanged */}
    </>
  );
};

export default Users;