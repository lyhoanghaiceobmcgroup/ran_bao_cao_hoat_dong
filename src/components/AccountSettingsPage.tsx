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
  Settings
} from 'lucide-react';
import ranGroupLogo from '@/assets/ran-group-logo.png';
import { useAuth, UserData, AccountStatus } from '@/context/AuthContext';

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
    position: '',
    department: '',
    joinDate: '',
    notes: ''
  });

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
      position: userData.role === 'admin' ? 'Quản trị viên' : 
                userData.role === 'manager' ? 'Quản lý' : 
                userData.role === 'central' ? 'Trung tâm' : 'Nhân viên',
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
      // Simulate API call to update user profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would update the database
      // For now, we'll just show a success message
      setMessage({ type: 'success', text: 'Thông tin tài khoản đã được cập nhật thành công!' });
      
      // Scroll to top to show message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="position">Chức vụ</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                        placeholder="Nhập chức vụ"
                      />
                    </div>
                  </div>
                </div>

                {/* Work Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 border-b pb-2">Thông tin công việc</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Vai trò</Label>
                      <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staff">Nhân viên</SelectItem>
                          <SelectItem value="manager">Quản lý</SelectItem>
                          <SelectItem value="admin">Quản trị viên</SelectItem>
                          <SelectItem value="central">Trung tâm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="branch">Chi nhánh</Label>
                      <Select value={formData.branch} onValueChange={(value) => handleInputChange('branch', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HN35">HN35 - 35 Nguyễn Bỉnh Khiêm</SelectItem>
                          <SelectItem value="HN40">HN40 - 40 Ngô Quyền</SelectItem>
                          <SelectItem value="CENTER">Trung tâm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

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

                {/* Account Status */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 border-b pb-2">Trạng thái tài khoản</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accountStatus">Trạng thái</Label>
                    <Select value={formData.accountStatus} onValueChange={(value) => handleInputChange('accountStatus', value as AccountStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approved">Đã phê duyệt</SelectItem>
                        <SelectItem value="pending">Chờ phê duyệt</SelectItem>
                        <SelectItem value="rejected">Bị từ chối</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Ghi chú</Label>
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