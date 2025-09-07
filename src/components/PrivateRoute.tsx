import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import ProfileStatusPage from './ProfileStatusPage';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'central' | 'trungtam' | 'manager' | 'quanly' | 'staff' | 'nhanvien';
  allowPendingAccounts?: boolean; // Cho phép tài khoản pending truy cập một số trang
  requireBranch?: string; // Yêu cầu chi nhánh cụ thể
}

export default function PrivateRoute({ 
  children, 
  requireRole, 
  allowPendingAccounts = false,
  requireBranch
}: PrivateRouteProps) {
  const { user, userData, loading, checkAccountStatus } = useAuth();
  const [accountStatusChecked, setAccountStatusChecked] = useState(false);
  const [currentAccountStatus, setCurrentAccountStatus] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [userBranch, setUserBranch] = useState<string | null>(null);

  useEffect(() => {
    const verifyAccountStatus = async () => {
      if (user && !accountStatusChecked) {
        try {
          // Truy vấn trạng thái và vai trò từ bảng profiles
          const { data, error } = await supabase
            .from('profiles')
            .select('status, role_name, branch')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (error) {
            console.error('Error checking profile status:', error);
            setCurrentAccountStatus('pending');
            setCurrentUserRole(null);
            setUserBranch(null);
          } else if (data) {
            setCurrentAccountStatus((data.status as any) || 'pending');
            setCurrentUserRole(data.role_name || null);
            setUserBranch(data.branch || null);
          } else {
            // Không tìm thấy profile - tạo profile mặc định và thông báo lỗi
            console.warn('No profile found for user:', user.email);
            try {
              // Tạo profile mặc định cho user
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  user_id: user.id,
                  email: user.email,
                  status: 'pending',
                  role_name: 'staff',
                  created_at: new Date().toISOString()
                });
              
              if (insertError) {
                console.error('Error creating default profile:', insertError);
              }
            } catch (createError) {
              console.error('Failed to create default profile:', createError);
            }
            
            setCurrentAccountStatus('pending');
            setCurrentUserRole('staff');
            setUserBranch(null);
          }
        } catch (error) {
          console.error('Error checking account status:', error);
          setCurrentAccountStatus('pending');
          setCurrentUserRole('staff');
        } finally {
          setAccountStatusChecked(true);
        }
      }
    };

    // Reset account status check when user changes
    if (user && accountStatusChecked) {
      setAccountStatusChecked(false);
    }

    verifyAccountStatus();
  }, [user]); // Remove accountStatusChecked from dependencies to prevent infinite loop

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
    // Kiểm tra hierarchy: admin > central/trungtam > manager/quanly > staff/nhanvien
    const roleHierarchy = { 
      admin: 4, 
      central: 3, 
      trungtam: 3, 
      manager: 2, 
      quanly: 2, 
      staff: 1, 
      nhanvien: 1 
    };
    const userRoleLevel = roleHierarchy[currentUserRole as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel = roleHierarchy[requireRole as keyof typeof roleHierarchy] || 0;

    // Nếu user có role cao hơn hoặc bằng required role thì được phép truy cập
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
              onClick={() => typeof window !== 'undefined' && window.history.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      );  
    }
  }

  // Kiểm tra chi nhánh nếu được yêu cầu
  if (requireBranch && userBranch && userBranch !== requireBranch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-orange-500 text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sai chi nhánh</h2>
          <p className="text-gray-600 mb-4">
            Bạn không thuộc chi nhánh được yêu cầu. Chi nhánh yêu cầu: <strong>{requireBranch}</strong>
          </p>
          <button 
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Cho phép truy cập nếu tất cả điều kiện đều thỏa mãn
  return <>{children}</>;
}