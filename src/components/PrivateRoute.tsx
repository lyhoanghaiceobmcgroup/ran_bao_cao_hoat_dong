import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import AccountApprovalPage from './AccountApprovalPage';
import { useEffect, useState } from 'react';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'manager' | 'staff';
  allowPendingAccounts?: boolean; // Cho phép tài khoản pending truy cập một số trang
}

export default function PrivateRoute({ 
  children, 
  requireRole, 
  allowPendingAccounts = false 
}: PrivateRouteProps) {
  const { user, userData, loading, checkAccountStatus } = useAuth();
  const [accountStatusChecked, setAccountStatusChecked] = useState(false);
  const [currentAccountStatus, setCurrentAccountStatus] = useState(userData?.accountStatus);

  useEffect(() => {
    const verifyAccountStatus = async () => {
      if (user && !accountStatusChecked) {
        try {
          const status = await checkAccountStatus(user.id);
          setCurrentAccountStatus(status);
        } catch (error) {
          console.error('Error checking account status:', error);
          // Fallback to userData status if API fails
          setCurrentAccountStatus(userData?.accountStatus || 'pending');
        } finally {
          setAccountStatusChecked(true);
        }
      } else if (userData?.accountStatus) {
        setCurrentAccountStatus(userData.accountStatus);
        setAccountStatusChecked(true);
      }
    };

    verifyAccountStatus();
  }, [user, userData, checkAccountStatus, accountStatusChecked]);

  // Hiển thị loading khi đang kiểm tra
  if (loading || !accountStatusChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Kiểm tra trạng thái tài khoản
  const accountStatus = currentAccountStatus || userData?.accountStatus || 'pending';

  // Hiển thị trang phê duyệt nếu tài khoản chưa được phê duyệt
  if (accountStatus === 'pending' && !allowPendingAccounts) {
    return (
      <AccountApprovalPage 
        accountStatus="pending"
        userEmail={user.email || undefined}
      />
    );
  }

  // Hiển thị trang từ chối nếu tài khoản bị từ chối
  if (accountStatus === 'rejected') {
    return (
      <AccountApprovalPage 
        accountStatus="rejected"
        userEmail={user.email || undefined}
        rejectedReason={userData?.rejectedReason}
      />
    );
  }

  // Kiểm tra vai trò nếu được yêu cầu
  if (requireRole && userData?.role !== requireRole) {
    // Kiểm tra hierarchy: admin > manager > staff
    const roleHierarchy = { admin: 3, manager: 2, staff: 1 };
    const userRoleLevel = roleHierarchy[userData?.role || 'staff'];
    const requiredRoleLevel = roleHierarchy[requireRole];

    if (userRoleLevel < requiredRoleLevel) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h2>
            <p className="text-gray-600 mb-4">
              Bạn không có quyền truy cập vào trang này. Yêu cầu vai trò: <strong>{requireRole}</strong>
            </p>
            <button 
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      );
    }
  }

  // Cho phép truy cập nếu tất cả điều kiện đều thỏa mãn
  return <>{children}</>;
}