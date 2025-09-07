import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  MapPin, 
  User, 
  LogIn, 
  LogOut, 
  Calendar,
  ChevronRight,
  Coffee,
  Users,
  TrendingUp,
  Settings
} from 'lucide-react';
import ranGroupLogo from '@/assets/ran-group-logo.png';
import { useAuth } from '@/context/AuthContext';

export default function HN35Dashboard() {
  const { userData, signOut, setSelectedBranch } = useAuth();
  const navigate = useNavigate();
  const [currentShift, setCurrentShift] = useState('');

  useEffect(() => {
    if (!userData) {
      navigate('/auth');
    }
  }, [userData, navigate]);

  if (!userData) {
    return null;
  }

  // Cố định chi nhánh HN35
  const selectedBranch = 'HN35';
  
  const handleModeSelect = (mode: 'start-shift' | 'end-shift') => {
    setSelectedBranch(selectedBranch);
    if (mode === 'end-shift') {
      navigate('/end-shift-35NBK');
    } else if (mode === 'start-shift') {
      navigate('/start-shift-35NBK');
    } else {
      navigate(`/${mode}`);
    }
  };

  const handleLogout = () => {
    signOut();
    navigate('/auth');
  };

  const branches = [
    { code: 'HN35', name: '35 Nguyễn Bỉnh Khiêm, Hà Nội', status: 'active' },
  ];

  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  const getCurrentShift = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return 'Sáng';
    if (hour >= 14 && hour < 22) return 'Chiều';
    return 'Tối';
  };

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
    setCurrentTime(now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    }));
  }, []);

  useEffect(() => {
    setCurrentShift(getCurrentShift());
  }, []);

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'staff': return 'Nhân viên ca';
      case 'manager': return 'Quản lý chi nhánh';
      case 'admin': return 'Ban điều hành';
      default: return role;
    }
  };

  const getBranchStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'maintenance': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

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
                <p className="text-sm text-muted-foreground">Chi Nhánh 35 Nguyễn Bỉnh Khiêm, Hà Nội</p>
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
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Current Status */}
          <Card className="shadow-card bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <div className="text-sm opacity-90">Ngày hôm nay</div>
                    <div className="font-semibold">{currentDate}</div>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <div>
                    <div className="text-sm opacity-90">Thời gian hiện tại</div>
                    <div className="font-semibold">{currentTime}</div>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Coffee className="h-5 w-5" />
                  <div>
                    <div className="text-sm opacity-90">Ca hiện tại</div>
                    <div className="font-semibold">Ca {currentShift}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branch Selection */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-accent" />
                <span>Chi Nhánh Hiện Tại</span>
              </CardTitle>
              <CardDescription>
                Chi nhánh 35 Nguyễn Bỉnh Khiêm, Hà Nội
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedBranch}
                disabled={true}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chi nhánh hiện tại" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem 
                      key={branch.code} 
                      value={branch.code}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{branch.code} - {branch.name}</span>
                        <Badge 
                          variant="secondary" 
                          className={`ml-2 ${getBranchStatusColor(branch.status)}`}
                        >
                          {branch.status === 'active' ? 'Hoạt động' : 'Bảo trì'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Start Shift */}
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-success group cursor-pointer">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-success">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-success-soft">
                      <LogIn className="h-6 w-6 text-success" />
                    </div>
                    <span>Báo Cáo Vào Ca</span>
                  </div>
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </CardTitle>
                <CardDescription>
                  Thực hiện báo cáo đầu ca với đầy đủ thông tin cần thiết
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Kiểm tra nhân sự ca</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Coffee className="h-4 w-4 text-muted-foreground" />
                    <span>Kiểm tra kho nguyên liệu</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>Thiết lập mục tiêu ca</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-success hover:bg-success/90 text-success-foreground"
                  onClick={() => handleModeSelect('start-shift')}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Bắt Đầu Vào Ca
                </Button>
              </CardContent>
            </Card>

            {/* End Shift */}
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-destructive group cursor-pointer">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-destructive">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-destructive-soft">
                      <LogOut className="h-6 w-6 text-destructive" />
                    </div>
                    <span>Báo Cáo Ra Ca</span>
                  </div>
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </CardTitle>
                <CardDescription>
                  Tổng kết ca làm việc với doanh thu và báo cáo chi tiết
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>Báo cáo doanh thu POS</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Coffee className="h-4 w-4 text-muted-foreground" />
                    <span>Đối soát nguyên liệu</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Tổng kết nhân sự</span>
                  </div>
                </div>
                <Button 
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleModeSelect('end-shift')}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Kết Thúc Ra Ca
                </Button>
              </CardContent>
            </Card>
          </div>


        </div>
      </div>
    </div>
  );
}