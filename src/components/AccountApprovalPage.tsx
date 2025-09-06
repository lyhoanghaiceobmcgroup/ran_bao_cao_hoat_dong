import React from 'react';
import { useAuth, AccountStatus } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AccountApprovalPageProps {
  accountStatus: AccountStatus;
  userEmail?: string;
  rejectedReason?: string;
  approvedBy?: string;
  approvedAt?: string;
}

const AccountApprovalPage: React.FC<AccountApprovalPageProps> = ({
  accountStatus,
  userEmail,
  rejectedReason,
  approvedBy,
  approvedAt
}) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getStatusConfig = (status: AccountStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-16 w-16 text-yellow-500" />,
          title: 'Tài khoản đang chờ phê duyệt',
          description: 'Tài khoản của bạn đang được xem xét bởi quản trị viên Trung tâm',
          badge: <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Chờ phê duyệt</Badge>,
          color: 'border-yellow-200 bg-yellow-50'
        };
      case 'approved':
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: 'Tài khoản đã được phê duyệt',
          description: 'Chúc mừng! Tài khoản của bạn đã được phê duyệt và có thể truy cập hệ thống',
          badge: <Badge variant="default" className="bg-green-100 text-green-800">Đã phê duyệt</Badge>,
          color: 'border-green-200 bg-green-50'
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: 'Tài khoản bị từ chối',
          description: 'Rất tiếc, tài khoản của bạn không được phê duyệt',
          badge: <Badge variant="destructive" className="bg-red-100 text-red-800">Bị từ chối</Badge>,
          color: 'border-red-200 bg-red-50'
        };
      default:
        return {
          icon: <AlertCircle className="h-16 w-16 text-gray-500" />,
          title: 'Trạng thái không xác định',
          description: 'Không thể xác định trạng thái tài khoản',
          badge: <Badge variant="outline">Không xác định</Badge>,
          color: 'border-gray-200 bg-gray-50'
        };
    }
  };

  const statusConfig = getStatusConfig(accountStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className={`${statusConfig.color} border-2 shadow-lg`}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {statusConfig.icon}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              {statusConfig.title}
            </CardTitle>
            <div className="flex justify-center mt-2">
              {statusConfig.badge}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <CardDescription className="text-center text-gray-600 text-base">
              {statusConfig.description}
            </CardDescription>

            {userEmail && (
              <div className="bg-white/50 rounded-lg p-3 border">
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {userEmail}
                </p>
              </div>
            )}

            {accountStatus === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Thông tin quan trọng:</h4>
                    <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                      <li>• Quá trình phê duyệt có thể mất 1-2 ngày làm việc</li>
                      <li>• Bạn sẽ nhận được email thông báo khi có kết quả</li>
                      <li>• Liên hệ quản trị viên nếu cần hỗ trợ</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {accountStatus === 'approved' && approvedBy && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700">
                  <strong>Phê duyệt bởi:</strong> {approvedBy}
                </p>
                {approvedAt && (
                  <p className="text-sm text-green-700">
                    <strong>Thời gian:</strong> {new Date(approvedAt).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>
            )}

            {accountStatus === 'rejected' && rejectedReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">
                  <strong>Lý do từ chối:</strong> {rejectedReason}
                </p>
                <p className="text-sm text-red-600 mt-2">
                  Bạn có thể tạo tài khoản mới hoặc liên hệ quản trị viên để được hỗ trợ.
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button 
                onClick={handleSignOut}
                variant="outline" 
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </Button>
            </div>

            {accountStatus === 'rejected' && (
              <Button 
                onClick={() => navigate('/auth')}
                className="w-full"
              >
                Tạo tài khoản mới
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Cần hỗ trợ? Liên hệ: <a href="mailto:support@ran.com" className="text-blue-600 hover:underline">support@ran.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountApprovalPage;