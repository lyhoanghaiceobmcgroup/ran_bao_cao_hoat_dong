import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import ProfileStatusPage from './ProfileStatusPage';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    const verifyAccountStatus = async () => {
      if (user && !accountStatusChecked) {
        try {
          // Truy vấn trạng thái và vai trò từ bảng profiles
          const { data, error } = await supabase
            .from('profiles')
            .select('status, role_name')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (error) {
            console.error('Error checking profile status:', error);
            setCurrentAccountStatus('pending');
            setCurrentUserRole(null);
          } else {
            setCurrentAccountStatus((data?.status as any) || 'pending');
            setCurrentUserRole(data?.role_name || null);
          }
        } catch (error) {
          console.error('Error checking account status:', error);
          setCurrentAccountStatus('pending');
        } finally {
          setAccountStatusChecked(true);
        }
      }
    };

    verifyAccountStatus();
  }, [user, accountStatusChecked]);

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
  const accountStatus = currentAccountStatus || 'pending';

  // Hiển thị trang trạng thái hồ sơ nếu tài khoản chưa được phê duyệt hoặc bị từ chối
  if ((accountStatus === 'pending' && !allowPendingAccounts) || accountStatus === 'rejected') {
    return <ProfileStatusPage />;
  }

  // Kiểm tra vai trò nếu được yêu cầu
  if (requireRole && currentUserRole !== requireRole) {
    // Kiểm tra hierarchy: admin > central > manager > staff
    const roleHierarchy = { admin: 4, central: 3, trungtam: 3, manager: 2, staff: 1 };
    const userRoleLevel = roleHierarchy[currentUserRole as keyof typeof roleHierarchy] || 1;
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