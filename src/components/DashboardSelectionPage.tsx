import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  User, 
  LogOut, 
  ChevronRight,
  Settings,
  Users
} from 'lucide-react';
import ranGroupLogo from '@/assets/ran-group-logo.png';
import { useAuth } from '@/context/AuthContext';

export default function DashboardSelectionPage() {
  const { userData, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    signOut();
    navigate('/auth');
  };

  const handleDashboardSelect = (dashboard: string) => {
    setIsLoading(true);
    navigate(dashboard);
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'central': return 'Trung tâm';
      case 'manager': return 'Quản lý';
      case 'staff': return 'Nhân viên';
      default: return role;
    }
  };

  if (!userData) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-background to-accent-soft">
      {/* Header */}
      <div className="bg-primary/5 backdrop-blur border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={ranGroupLogo} alt="RAN Group" className="h-10 w-auto" />
              <div className="hidden sm:block">
                <h1 className="font-semibold text-primary">Hệ Thống Báo Cáo F&B</h1>
                <p className="text-sm text-muted-foreground">Lựa chọn Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{userData.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {getRoleDisplay(userData.role)}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/account-settings')}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Cài đặt</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary mb-2">
              Chào mừng, {userData.name}!
            </h2>
            <p className="text-muted-foreground">
              Vui lòng chọn dashboard bạn muốn truy cập
            </p>
          </div>

          {/* Dashboard Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Account Management */}
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-primary group cursor-pointer">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-primary">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <span>Quản lý tài khoản</span>
                  </div>
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </CardTitle>
                <CardDescription>
                  Quản lý và phê duyệt tài khoản người dùng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => handleDashboardSelect('/account-management')}
                  disabled={isLoading}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Truy cập
                </Button>
              </CardContent>
            </Card>

            {/* HN35 Dashboard */}
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-success group cursor-pointer">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-success">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <Building2 className="h-6 w-6 text-success" />
                    </div>
                    <span>Chi nhánh HN35</span>
                  </div>
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>35 Nguyễn Bỉnh Khiêm, Hà Nội</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-success hover:bg-success/90 text-success-foreground"
                  onClick={() => handleDashboardSelect('/HN35-dashboard')}
                  disabled={isLoading}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Truy cập HN35
                </Button>
              </CardContent>
            </Card>

            {/* HN40 Dashboard */}
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-warning group cursor-pointer">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-warning">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-warning/10">
                      <Building2 className="h-6 w-6 text-warning" />
                    </div>
                    <span>Chi nhánh HN40</span>
                  </div>
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>40 Ngô Quyền, Hà Nội</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-warning hover:bg-warning/90 text-warning-foreground"
                  onClick={() => handleDashboardSelect('/HN40-dashboard')}
                  disabled={isLoading}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Truy cập HN40
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}