import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, Users, TrendingUp, MapPin, Clock, ChevronRight } from 'lucide-react';
import ranGroupLogo from '@/assets/ran-group-logo.png';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-background to-accent-soft">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          
          {/* Hero Section */}
          <div className="space-y-6">
            <img 
              src={ranGroupLogo} 
              alt="RAN Group Logo" 
              className="mx-auto h-20 w-auto drop-shadow-lg"
            />
            <div>
              <h1 className="text-5xl font-bold text-primary mb-4">
                Hệ Thống Báo Cáo F&B
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Quản lý và báo cáo ca làm việc cho chuỗi chi nhánh RAN Group
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-success">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 rounded-lg bg-success-soft w-fit">
                  <Coffee className="h-8 w-8 text-success" />
                </div>
                <CardTitle className="text-success">Báo Cáo Vào Ca</CardTitle>
                <CardDescription>
                  Kiểm tra nhân sự, kho nguyên liệu và thiết lập mục tiêu ca
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-accent">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 rounded-lg bg-accent-soft w-fit">
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-accent">Báo Cáo Ra Ca</CardTitle>
                <CardDescription>
                  Tổng kết doanh thu, đối soát quỹ và báo cáo hiệu suất
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-l-4 border-l-primary">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 rounded-lg bg-primary/10 w-fit">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-primary">Quản Lý Nhân Sự</CardTitle>
                <CardDescription>
                  Check-in OTP, theo dõi giờ làm và hiệu suất nhân viên
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Thống Kê Hệ Thống</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-primary">6</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Chi nhánh hoạt động</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-success/5">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Users className="h-5 w-5 text-success" />
                    <span className="text-2xl font-bold text-success">150+</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Nhân viên</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-accent/5">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    <span className="text-2xl font-bold text-accent">500+</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Báo cáo/tháng</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-warning/5">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-warning" />
                    <span className="text-2xl font-bold text-warning">24/7</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Hoạt động</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="space-y-6">
            <Card className="shadow-elevated bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">Sẵn sàng bắt đầu?</h2>
                  <p className="text-primary-foreground/90">
                    Đăng nhập để truy cập hệ thống báo cáo và quản lý ca làm việc
                  </p>
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-white/90"
                    onClick={() => navigate('/login')}
                  >
                    Đăng Nhập Hệ Thống
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground space-y-1 pt-8 border-t">
            <p>© 2025 RAN Group. Tất cả quyền được bảo lưu.</p>
            <p>Hệ thống quản lý F&B chuyên nghiệp cho chuỗi chi nhánh</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
