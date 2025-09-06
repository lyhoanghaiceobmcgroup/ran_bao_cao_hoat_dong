import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Lock, AlertCircle, User, Shield, Building2, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ranGroupLogo from '@/assets/ran-group-logo.png';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp, user, userData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBranchSelection, setShowBranchSelection] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    branch: ''
  });

  useEffect(() => {
    if (user && userData && !showBranchSelection) {
      // Nếu vai trò là central, điều hướng đến trang quản lý tài khoản
      if (userData.role === 'central') {
        navigate('/account-management');
        return;
      }
      
      // Nếu đã có thông tin chi nhánh trong userData, điều hướng trực tiếp
      if (userData.branch) {
        if (userData.branch === 'HN35') {
          navigate('/HN35-dashboard');
        } else if (userData.branch === 'HN40') {
          navigate('/HN40-dashboard');
        } else if (userData.role === 'manager' || userData.role === 'admin') {
          navigate('/branch-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        // Nếu chưa có thông tin chi nhánh, hiển thị form chọn chi nhánh
        setShowBranchSelection(true);
      }
    }
  }, [user, userData, navigate, showBranchSelection]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.role || !formData.branch) {
      setError('Vui lòng nhập đầy đủ thông tin và chọn vai trò, chi nhánh');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error } = await signIn(formData.email, formData.password);
    
    if (error) {
      setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
    } else {
      // Đăng nhập thành công, điều hướng trực tiếp dựa trên chi nhánh đã chọn
      handleBranchSelection(formData.branch);
    }
    
    setIsLoading(false);
  };

  const handleBranchSelection = (branch: string) => {
    setShowBranchSelection(false);
    
    // Kiểm tra vai trò trước khi điều hướng
    if (userData?.role === 'central') {
      navigate('/account-management');
      return;
    }
    
    // Điều hướng dựa trên chi nhánh được chọn
    if (branch === 'HN35') {
      navigate('/HN35-dashboard');
    } else if (branch === 'HN40') {
      navigate('/HN40-dashboard');
    } else if (branch === 'CENTER') {
      navigate('/Center-dashboard');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra thông tin cơ bản
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.role) {
      setError('Vui lòng nhập đầy đủ thông tin và chọn vai trò');
      return;
    }
    
    // Kiểm tra chi nhánh chỉ khi không phải vai trò nhân viên
    if (formData.role !== 'nhanvien' && !formData.branch) {
      setError('Vui lòng chọn chi nhánh');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Tạo tài khoản với thông tin phù hợp
    const role = formData.role;
    const branch = formData.role === 'nhanvien' ? '' : formData.branch; // Nhân viên không cần chi nhánh cụ thể
    
    const { error } = await signUp(formData.email, formData.password, role, branch);
    
    if (error) {
      if (error.message.includes('already registered')) {
        setError('Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.');
      } else {
        setError('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.');
      }
    } else {
      setError(null);
      // Show success message based on role
      if (formData.role === 'nhanvien') {
        setError('Đăng ký thành công! Tài khoản Nhân viên đã được tạo và đang chờ duyệt từ Trung tâm. Vui lòng kiểm tra email để xác thực tài khoản.');
      } else {
        setError(`Đăng ký thành công! Thông tin đăng ký với vai trò ${formData.role} đã được gửi đến tài khoản Trung tâm để phê duyệt. Vui lòng kiểm tra email để xác thực tài khoản.`);
      }
    }
    
    setIsLoading(false);
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);

    const demoEmail = 'nhanvien@gmail.com';
    const demoPassword = 'Hai.1809';

    const { error } = await signIn(demoEmail, demoPassword);
    
    if (error) {
      setError('Không thể đăng nhập với tài khoản demo. Vui lòng thử lại sau.');
    }
    
    setIsLoading(false);
  };

  const handleAdminLogin = async () => {
    setIsLoading(true);
    setError(null);

    const adminEmail = 'admin@ran.com';
    const adminPassword = '123321';

    const { error } = await signIn(adminEmail, adminPassword);
    
    if (error) {
      // Nếu không thể đăng nhập, thử tạo tài khoản
      const { error: signUpError } = await signUp(adminEmail, adminPassword);
      if (signUpError) {
        setError('Không thể tạo hoặc đăng nhập tài khoản admin. Vui lòng thử lại sau.');
      } else {
        setError('Tài khoản admin đã được tạo! Vui lòng kiểm tra email để xác thực.');
      }
    }
    
    setIsLoading(false);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Component chọn chi nhánh
  const BranchSelectionCard = () => (
    <Card className="shadow-elevated border-0 bg-card/95 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-primary flex items-center justify-center gap-2">
          <Building2 className="h-6 w-6" />
          Chọn Chi Nhánh
        </CardTitle>
        <CardDescription>
          Vui lòng chọn chi nhánh bạn muốn truy cập
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          variant="outline" 
          className="flex items-center justify-start w-full h-16 space-x-3 text-left"
          onClick={() => handleBranchSelection('HN35')}
        >
          <MapPin className="h-5 w-5 text-blue-600" />
          <div>
            <div className="font-semibold">Chi nhánh HN35</div>
            <div className="text-sm text-muted-foreground">35 Nguyễn Bỉnh Khiêm, Hà Nội</div>
          </div>
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center justify-start w-full h-16 space-x-3 text-left"
          onClick={() => handleBranchSelection('HN40')}
        >
          <MapPin className="h-5 w-5 text-green-600" />
          <div>
            <div className="font-semibold">Chi nhánh HN40</div>
            <div className="text-sm text-muted-foreground">40 Ngô Quyền, Hà Nội</div>
          </div>
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center justify-start w-full h-16 space-x-3 text-left"
          onClick={() => handleBranchSelection('CENTER')}
        >
          <Building2 className="h-5 w-5 text-purple-600" />
          <div>
            <div className="font-semibold">Báo cáo Trung tâm</div>
            <div className="text-sm text-muted-foreground">Tổng hợp báo cáo các chi nhánh</div>
          </div>
        </Button>
      </CardContent>
    </Card>
  );

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

        {/* Error Alert */}
        {error && (
          <Alert variant={error.includes('thành công') ? 'default' : 'destructive'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Branch Selection - hiển thị khi đã đăng nhập thành công */}
        {showBranchSelection && (
          <BranchSelectionCard />
        )}

        {/* Ẩn form đăng nhập/đăng ký khi đang chọn chi nhánh */}
        {!showBranchSelection && (
          <>
            {/* Demo Login Section */}
            <Card className="shadow-elevated border-0 bg-card/95 backdrop-blur">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg text-primary">Đăng Nhập Demo</CardTitle>
                <CardDescription>
                  Đăng nhập nhanh với tài khoản demo
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center w-full h-12 space-x-2"
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                  >
                    <User className="h-5 w-5" />
                    <span>Nhân viên (nhanvien@gmail.com)</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center w-full h-12 space-x-2 border-orange-200 hover:bg-orange-50"
                    onClick={handleAdminLogin}
                    disabled={isLoading}
                  >
                    <Shield className="h-5 w-5 text-orange-600" />
                    <span>Admin (admin@ran.com)</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Auth Form */}
            <Card className="shadow-elevated border-0 bg-card/95 backdrop-blur">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl text-primary">Xác Thực Tài Khoản</CardTitle>
                <CardDescription>
                  Đăng nhập hoặc tạo tài khoản để sử dụng hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Đăng Nhập</TabsTrigger>
                    <TabsTrigger value="signup">Đăng Ký</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-role">Vai trò</Label>
                        <Select value={formData.role} onValueChange={(value) => updateFormData('role', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn vai trò của bạn" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nhanvien">Nhân viên</SelectItem>
                            <SelectItem value="quanly">Quản lý</SelectItem>
                            <SelectItem value="trungtam">Trung tâm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-branch">Chi nhánh</Label>
                        <Select value={formData.branch} onValueChange={(value) => updateFormData('branch', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn chi nhánh" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HN35">Chi nhánh HN35 - 35 Nguyễn Bỉnh Khiêm</SelectItem>
                            <SelectItem value="HN40">Chi nhánh HN40 - 40 Ngô Quyền</SelectItem>
                            <SelectItem value="CENTER">Báo cáo Trung tâm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="Nhập email"
                            className="pl-10"
                            value={formData.email}
                            onChange={(e) => updateFormData('email', e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password">Mật khẩu</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signin-password"
                            type="password"
                            placeholder="Nhập mật khẩu"
                            className="pl-10"
                            value={formData.password}
                            onChange={(e) => updateFormData('password', e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-role">Vai trò</Label>
                        <Select value={formData.role} onValueChange={(value) => updateFormData('role', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn vai trò đăng ký" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nhanvien">Nhân viên</SelectItem>
                            <SelectItem value="quanly">Quản lý</SelectItem>
                            <SelectItem value="trungtam">Trung tâm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Chỉ hiển thị chọn chi nhánh khi không phải vai trò nhân viên */}
                      {formData.role !== 'nhanvien' && (
                        <div className="space-y-2">
                          <Label htmlFor="signup-branch">Chi nhánh</Label>
                          <Select value={formData.branch} onValueChange={(value) => updateFormData('branch', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn chi nhánh" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="HN35">Chi nhánh HN35 - 35 Nguyễn Bỉnh Khiêm</SelectItem>
                              <SelectItem value="HN40">Chi nhánh HN40 - 40 Ngô Quyền</SelectItem>
                              <SelectItem value="CENTER">Báo cáo Trung tâm</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {/* Thông báo cho vai trò nhân viên */}
                      {formData.role === 'nhanvien' && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-sm text-blue-800">
                            <strong>Lưu ý:</strong> Tài khoản Nhân viên sẽ có quyền truy cập báo cáo tất cả các chi nhánh và cần được phê duyệt bởi Trung tâm trước khi sử dụng.
                          </p>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="Nhập email"
                            className="pl-10"
                            value={formData.email}
                            onChange={(e) => updateFormData('email', e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Mật khẩu</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                            className="pl-10"
                            value={formData.password}
                            onChange={(e) => updateFormData('password', e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Nhập lại mật khẩu"
                            className="pl-10"
                            value={formData.confirmPassword}
                            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>© 2024 RAN Group. Tất cả quyền được bảo lưu.</p>
          <p>Hỗ trợ kỹ thuật: support@rangroup.vn</p>
        </div>
      </div>
    </div>
  );
}