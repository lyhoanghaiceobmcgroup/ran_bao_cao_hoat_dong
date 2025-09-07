import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Building2, 
  Shield, 
  Save, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Settings,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import ranGroupLogo from '@/assets/ran-group-logo.png';
import { useAuth, UserData, AccountStatus } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function AccountSettingsPage() {
  const { userData, user, updateAccountStatus } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff' as 'admin' | 'manager' | 'staff' | 'central',
    branch: '',
    accountStatus: 'approved' as AccountStatus,
    phone: '',
    department: '',
    joinDate: '',
    notes: ''
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!userData || !user) {
      navigate('/auth');
      return;
    }

    // Load current user data into form
    setFormData({
      name: userData.name || '',
      email: user.email || '',
      role: userData.role || 'staff',
      branch: userData.branch || '',
      accountStatus: userData.accountStatus || 'approved',
      // Mock additional data
      phone: '+84 123 456 789',
      department: userData.branch === 'HN35' ? 'Chi nhánh 35 Nguyễn Bỉnh Khiêm' :
                  userData.branch === 'HN40' ? 'Chi nhánh 40 Ngô Quyền' :
                  userData.branch === 'CENTER' ? 'Trung tâm báo cáo' : 'Trung tâm',
      joinDate: '2024-01-15',
      notes: 'Tài khoản hoạt động bình thường'
    });
  }, [userData, user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setMessage(null);

    try {
      // Handle mock users - skip database update
      if (user.id.startsWith('mock-')) {
        // For mock users, just show success message without database update
        setMessage({ type: 'success', text: 'Thông tin tài khoản đã được cập nhật thành công!' });
        return;
      }

      // Update user profile in Supabase for real users
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          department: formData.department,
          notes: formData.notes
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }
      
      setMessage({ type: 'success', text: 'Thông tin tài khoản đã được cập nhật thành công!' });
      
      // Scroll to top to show message
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ mật khẩu mới và xác nhận mật khẩu.' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không khớp.' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }

    setPasswordLoading(true);
    setMessage(null);

    try {
      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        throw error;
      }

      setMessage({ 
        type: 'success', 
        text: 'Yêu cầu đổi mật khẩu đã được gửi! Vui lòng kiểm tra email để xác nhận thay đổi.' 
      });
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Scroll to top to show message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Error updating password:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.' 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'manager': return 'Quản lý';
      case 'central': return 'Trung tâm';
      case 'staff': return 'Nhân viên';
      default: return role;
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Đã phê duyệt</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Chờ phê duyệt</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Bị từ chối</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!userData || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại</span>
            </Button>
            <div className="flex items-center space-x-3">
              <img src={ranGroupLogo} alt="RAN Group" className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Cài đặt tài khoản</h1>
                <p className="text-gray-600">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
              </div>
            </div>
          </div>
          <Settings className="h-8 w-8 text-blue-600" />
        </div>

        {/* Success/Error Message */}
        {message && (
          <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {message.type === 'success' ? 
              <CheckCircle className="h-4 w-4 text-green-600" /> : 
              <AlertCircle className="h-4 w-4 text-red-600" />
            }
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Thông tin tài khoản</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg">{formData.name}</h3>
                  <p className="text-gray-600">{formData.email}</p>
                </div>
                
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Vai trò:</span>
                    <Badge variant="outline">{getRoleDisplayName(formData.role)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Chi nhánh:</span>
                    <span className="text-sm font-medium">{formData.branch}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Trạng thái:</span>
                    {getStatusBadge(formData.accountStatus)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ngày tham gia:</span>
                    <span className="text-sm font-medium">{formData.joinDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Chỉnh sửa thông tin</CardTitle>
                <CardDescription>
                  Cập nhật thông tin cá nhân và cài đặt tài khoản của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 border-b pb-2">Thông tin cơ bản</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ và tên</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="pl-10"
                          placeholder="Nhập họ và tên"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="pl-10"
                          placeholder="Nhập email"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                {/* Department Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 border-b pb-2">Thông tin bổ sung</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Phòng ban</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        placeholder="Nhập phòng ban"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="joinDate">Ngày tham gia</Label>
                      <Input
                        id="joinDate"
                        type="date"
                        value={formData.joinDate}
                        onChange={(e) => handleInputChange('joinDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Password Change */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 border-b pb-2 flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Đổi mật khẩu</span>
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="pr-10"
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('current')}
                        >
                          {showPasswords.current ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Mật khẩu mới</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="pr-10"
                          placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('new')}
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="pr-10"
                          placeholder="Nhập lại mật khẩu mới"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('confirm')}
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handlePasswordChange} 
                      disabled={passwordLoading}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
                    >
                      <Lock className="h-4 w-4" />
                      <span>{passwordLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}</span>
                    </Button>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 border-b pb-2">Ghi chú</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Ghi chú cá nhân</Label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Nhập ghi chú về tài khoản..."
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t">
                  <Button 
                    onClick={handleSave} 
                    disabled={isLoading}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}