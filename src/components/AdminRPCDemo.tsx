import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/AuthContext';

interface User {
  user_id: string;
  email: string;
  role: string;
  account_status: string;
  created_at: string;
}

interface SystemStats {
  total_users: number;
  pending_approvals: number;
  approved_users: number;
  rejected_users: number;
  users_by_role: Record<string, number>;
}

const AdminRPCDemo: React.FC = () => {
  const { userData } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newStatus, setNewStatus] = useState('approved');
  const [rejectedReason, setRejectedReason] = useState('');

  // Kiểm tra quyền admin
  const isAdmin = userData?.role === 'admin';

  // Lấy danh sách tất cả users
  const fetchAllUsers = async () => {
    if (!isAdmin) {
      setError('Bạn không có quyền truy cập chức năng này');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('admin_get_all_users');
      
      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lấy danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Lấy thống kê hệ thống
  const fetchSystemStats = async () => {
    if (!isAdmin) {
      setError('Bạn không có quyền truy cập chức năng này');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('admin_get_system_stats');
      
      if (error) {
        throw error;
      }

      setSystemStats(data);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lấy thống kê hệ thống');
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật trạng thái tài khoản
  const updateAccountStatus = async () => {
    if (!isAdmin || !selectedUserId) {
      setError('Vui lòng chọn người dùng và đảm bảo bạn có quyền admin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('admin_update_account_status', {
        _user_id: selectedUserId,
        _status: newStatus,
        _rejected_reason: newStatus === 'rejected' ? rejectedReason : null
      });
      
      if (error) {
        throw error;
      }

      if (data) {
        alert('Cập nhật trạng thái thành công!');
        fetchAllUsers(); // Refresh danh sách
        setSelectedUserId('');
        setRejectedReason('');
      } else {
        setError('Không tìm thấy người dùng để cập nhật');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  // Xóa người dùng
  const deleteUser = async (userId: string) => {
    if (!isAdmin) {
      setError('Bạn không có quyền truy cập chức năng này');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('admin_delete_user', {
        _user_id: userId
      });
      
      if (error) {
        throw error;
      }

      if (data) {
        alert('Xóa người dùng thành công!');
        fetchAllUsers(); // Refresh danh sách
      } else {
        setError('Không tìm thấy người dùng để xóa');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi xóa người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllUsers();
      fetchSystemStats();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Truy cập bị từ chối</h2>
          <p className="text-gray-600 mb-6">
            Bạn cần có quyền Admin để truy cập trang này.
          </p>
          <p className="text-sm text-gray-500">
            Vai trò hiện tại: {userData?.role || 'Không xác định'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin RPC Functions Demo</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* System Statistics */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Thống kê hệ thống</h2>
            <button
              onClick={fetchSystemStats}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Đang tải...' : 'Làm mới'}
            </button>
          </div>
          
          {systemStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{systemStats.total_users}</div>
                <div className="text-sm text-gray-600">Tổng người dùng</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{systemStats.pending_approvals}</div>
                <div className="text-sm text-gray-600">Chờ phê duyệt</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{systemStats.approved_users}</div>
                <div className="text-sm text-gray-600">Đã phê duyệt</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{systemStats.rejected_users}</div>
                <div className="text-sm text-gray-600">Bị từ chối</div>
              </div>
            </div>
          )}
        </div>

        {/* User Management */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Quản lý người dùng</h2>
            <button
              onClick={fetchAllUsers}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Đang tải...' : 'Làm mới danh sách'}
            </button>
          </div>

          {/* Update Status Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium mb-4">Cập nhật trạng thái tài khoản</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Chọn người dùng</option>
                {users.map(user => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.email} ({user.role})
                  </option>
                ))}
              </select>
              
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="approved">Phê duyệt</option>
                <option value="rejected">Từ chối</option>
                <option value="pending">Chờ xử lý</option>
              </select>
              
              {newStatus === 'rejected' && (
                <input
                  type="text"
                  placeholder="Lý do từ chối"
                  value={rejectedReason}
                  onChange={(e) => setRejectedReason(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2"
                />
              )}
              
              <button
                onClick={updateAccountStatus}
                disabled={loading || !selectedUserId}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Cập nhật
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Vai trò</th>
                  <th className="px-4 py-2 text-left">Trạng thái</th>
                  <th className="px-4 py-2 text-left">Ngày tạo</th>
                  <th className="px-4 py-2 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.user_id} className="border-b">
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        user.account_status === 'approved' ? 'bg-green-100 text-green-800' :
                        user.account_status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.account_status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => deleteUser(user.user_id)}
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Hướng dẫn sử dụng</h2>
          <div className="space-y-4 text-sm text-gray-600">
            <p><strong>Thống kê hệ thống:</strong> Hiển thị tổng quan về số lượng người dùng và trạng thái phê duyệt.</p>
            <p><strong>Quản lý người dùng:</strong> Xem danh sách tất cả người dùng, cập nhật trạng thái phê duyệt, và xóa tài khoản.</p>
            <p><strong>Bảo mật:</strong> Tất cả các chức năng này chỉ có thể được sử dụng bởi tài khoản có vai trò Admin.</p>
            <p><strong>RPC Functions:</strong> Sử dụng Postgres RPC với SECURITY DEFINER để đảm bảo bảo mật cao.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRPCDemo;