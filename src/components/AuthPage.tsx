import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, MapPin, Users, UserCheck } from 'lucide-react';
import ranGroupLogo from '@/assets/ran-group-logo.png';

export default function AuthPage() {
  const navigate = useNavigate();
  const { setUserRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  const handleLogin = () => {
    if (!selectedRole || !selectedBranch) {
      return;
    }
    
    // Cập nhật role và branch trong AuthContext
    setUserRole(selectedRole, selectedBranch);
    
    // Điều hướng trực tiếp dựa trên chi nhánh được chọn
    handleBranchSelection(selectedBranch);
  };

  const handleBranchSelection = (branch: string) => {
    // Điều hướng dựa trên chi nhánh được chọn
    if (branch === 'HN35') {
      navigate('/HN35-dashboard');
    } else if (branch === 'HN40') {
      navigate('/HN40-dashboard');
    } else if (branch === 'CENTER') {
      // Với vai trò quản lý và báo cáo trung tâm, yêu cầu đăng nhập bổ sung
      if (selectedRole === 'quanly') {
        navigate('/center-login');
      } else {
        navigate('/Center-dashboard');
      }
    }
  };







  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'nhanvien':
        return <Users className="h-5 w-5 text-blue-600" />;
      case 'quanly':
        return <UserCheck className="h-5 w-5 text-green-600" />;
      default:
        return <Users className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'nhanvien':
        return 'Nhân viên';
      case 'quanly':
        return 'Quản lý';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-background to-accent-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <img 
            src={ranGroupLogo} 
            alt="RAN Group Logo" 
            className="mx-auto h-16 w-auto drop-shadow-lg"
          />
          <div>
            <h1 className="text-3xl font-bold text-primary">Hệ Thống Báo Cáo F&B</h1>
            <p className="text-muted-foreground">Chuỗi Chi Nhánh RAN Group</p>
          </div>
        </div>

        {/* Selection Form */}
        <Card className="shadow-elevated border-0 bg-card/95 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-primary">Truy Cập Hệ Thống</CardTitle>
            <CardDescription>
              Chọn vai trò và chi nhánh để xem báo cáo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Chọn vai trò của bạn</h3>
              <div className="grid grid-cols-1 gap-2">
                {['nhanvien', 'quanly'].map((role) => (
                  <Button
                    key={role}
                    variant={selectedRole === role ? 'default' : 'outline'}
                    className="flex items-center justify-start w-full h-12 space-x-3 text-left"
                    onClick={() => setSelectedRole(role)}
                  >
                    {getRoleIcon(role)}
                    <span>{getRoleLabel(role)}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Branch Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Chọn chi nhánh</h3>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant={selectedBranch === 'HN35' ? 'default' : 'outline'}
                  className="flex items-center justify-start w-full h-16 space-x-3 text-left"
                  onClick={() => setSelectedBranch('HN35')}
                >
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold">Chi nhánh HN35</div>
                    <div className="text-sm text-muted-foreground">35 Nguyễn Bỉnh Khiêm, Hà Nội</div>
                  </div>
                </Button>
                <Button
                  variant={selectedBranch === 'HN40' ? 'default' : 'outline'}
                  className="flex items-center justify-start w-full h-16 space-x-3 text-left"
                  onClick={() => setSelectedBranch('HN40')}
                >
                  <MapPin className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-semibold">Chi nhánh HN40</div>
                    <div className="text-sm text-muted-foreground">40 Ngô Quyền, Hà Nội</div>
                  </div>
                </Button>
                <Button
                  variant={selectedBranch === 'CENTER' ? 'default' : 'outline'}
                  className="flex items-center justify-start w-full h-16 space-x-3 text-left"
                  onClick={() => setSelectedBranch('CENTER')}
                >
                  <Building2 className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-semibold">Báo cáo Trung tâm</div>
                    <div className="text-sm text-muted-foreground">Tổng hợp báo cáo các chi nhánh</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Login Button */}
            <Button 
              onClick={handleLogin}
              className="w-full h-12 text-lg"
              disabled={!selectedRole || !selectedBranch}
            >
              Truy Cập Báo Cáo
            </Button>
          </CardContent>
        </Card>


        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>© 2024 RAN Group. Tất cả quyền được bảo lưu.</p>
          <p>Hỗ trợ kỹ thuật: support@rangroup.vn</p>
        </div>
      </div>
    </div>
  );
}