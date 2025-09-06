import { useState } from 'react';
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
  Building2,
  BarChart3,
  FileText,
  PieChart
} from 'lucide-react';
import ranGroupLogo from '@/assets/ran-group-logo.png';
import { useAuth } from '@/context/AuthContext';

export default function CenterDashboard() {
  const { userData, signOut } = useAuth();
  const navigate = useNavigate();

  if (!userData) {
    navigate('/auth');
    return null;
  }

  const handleLogout = () => {
    signOut();
    navigate('/auth');
  };

  const handleReportSelect = (reportType: string) => {
    // Điều hướng đến các trang báo cáo tương ứng
    switch (reportType) {
      case 'branch-summary':
        navigate('/branch-summary-report');
        break;
      case 'daily-overview':
        navigate('/daily-overview-report');
        break;
      case 'monthly-analysis':
        navigate('/monthly-analysis-report');
        break;
      case 'performance-metrics':
        navigate('/performance-metrics');
        break;
      default:
        break;
    }
  };

  const reportCards = [
    {
      id: 'branch-summary',
      title: 'Tổng hợp Chi nhánh',
      description: 'Báo cáo tổng hợp từ tất cả chi nhánh',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'daily-overview',
      title: 'Tổng quan Ngày',
      description: 'Báo cáo hoạt động hàng ngày',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'monthly-analysis',
      title: 'Phân tích Tháng',
      description: 'Báo cáo phân tích theo tháng',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'performance-metrics',
      title: 'Chỉ số Hiệu suất',
      description: 'Đánh giá hiệu suất hoạt động',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-background to-accent-soft">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src={ranGroupLogo} 
                alt="RAN Group Logo" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-primary">Báo cáo Trung tâm</h1>
                <p className="text-sm text-muted-foreground">Tổng hợp báo cáo các chi nhánh</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{userData.email}</span>
                <Badge variant="secondary" className="capitalize">
                  {userData.role}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-2">
                    Chào mừng đến Báo cáo Trung tâm
                  </h2>
                  <p className="text-muted-foreground">
                    Quản lý và theo dõi báo cáo từ tất cả các chi nhánh RAN Group
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-primary">
                  <Building2 className="h-8 w-8" />
                  <PieChart className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          {reportCards.map((report) => {
            const IconComponent = report.icon;
            return (
              <Card 
                key={report.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${report.borderColor} ${report.bgColor}`}
                onClick={() => handleReportSelect(report.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-white`}>
                        <IconComponent className={`h-6 w-6 ${report.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {report.description}
                        </CardDescription>
                      </div>
                    </div>
                    <ChevronRight className={`h-5 w-5 ${report.color}`} />
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng Chi nhánh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">2</span>
                <span className="text-sm text-muted-foreground">chi nhánh</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Báo cáo Hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">0</span>
                <span className="text-sm text-muted-foreground">báo cáo</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Trạng thái Hệ thống
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Hoạt động bình thường</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}