import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Lock, User } from 'lucide-react';
import ranGroupLogo from '@/assets/ran-group-logo.png';

export default function CenterLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Danh sách tài khoản được phép truy cập
    const validAccounts = [
      { username: 'Thanhtung.themask@gmail.com', password: '0942246586' },
      { username: 'ranmixology@gmail.com', password: '123321' }
    ];

    // Kiểm tra thông tin đăng nhập
    const isValidAccount = validAccounts.some(
      account => account.username === username && account.password === password
    );

    if (isValidAccount) {
      // Đăng nhập thành công, chuyển đến Center-dashboard
      navigate('/Center-dashboard');
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác');
    }
    
    setIsLoading(false);
  };

  const handleBack = () => {
    navigate('/auth');
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
            <h1 className="text-3xl font-bold text-primary">Đăng Nhập Trung Tâm</h1>
            <p className="text-muted-foreground">Truy cập báo cáo tổng hợp các chi nhánh</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-elevated border-0 bg-card/95 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-primary flex items-center justify-center gap-2">
              <Building2 className="h-5 w-5" />
              Báo Cáo Trung Tâm
            </CardTitle>
            <CardDescription>
              Vui lòng đăng nhập để truy cập hệ thống báo cáo trung tâm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Email đăng nhập</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="email"
                    placeholder="Nhập email đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg"
                  disabled={isLoading || !username || !password}
                >
                  {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-10"
                  onClick={handleBack}
                >
                  Quay lại
                </Button>
              </div>
            </form>
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