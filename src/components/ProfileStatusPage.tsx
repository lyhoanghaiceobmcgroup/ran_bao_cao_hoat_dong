import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Shield,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ranGroupLogo from '@/assets/ran-group-logo.png';

interface ProfileData {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  company: string;
  role_name: string;
  branch: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejected_reason?: string;
  created_at: string;
  updated_at: string;
}

export default function ProfileStatusPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        setError('Không thể tải thông tin hồ sơ. Vui lòng thử lại.');
        return;
      }
      
      setProfile(data);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Có lỗi xảy ra khi tải thông tin hồ sơ.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleAccessSystem = () => {
    if (!profile) return;
    
    // Điều hướng dựa trên vai trò và chi nhánh
    if (profile.role_name === 'admin') {
      navigate('/admin');
    } else if (profile.role_name === 'trungtam' || profile.role_name === 'central') {
      navigate('/account-management');
    } else if (profile.branch === 'HN35') {
      navigate('/HN35-dashboard');
    } else if (profile.branch === 'HN40') {
      navigate('/HN40-dashboard');
    } else if (profile.branch === 'CENTER') {
      navigate('/Center-dashboard');
    } else if (profile.role_name === 'quanly' || profile.role_name === 'manager') {
      navigate('/branch-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50">Chờ duyệt</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">Đã duyệt</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50">Bị từ chối</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          title: 'Hồ sơ đang chờ duyệt',
          description: 'Hồ sơ của bạn đã được gửi và đang chờ phê duyệt từ quản trị viên. Vui lòng kiên nhẫn chờ đợi.',
          variant: 'default' as const
        };
      case 'approved':
        return {
          title: 'Hồ sơ đã được phê duyệt',
          description: 'Chúc mừng! Hồ sơ của bạn đã được phê duyệt. Bạn có thể truy cập đầy đủ các tính năng của hệ thống.',
          variant: 'default' as const
        };
      case 'rejected':
        return {
          title: 'Hồ sơ bị từ chối',
          description: 'Rất tiếc, hồ sơ của bạn đã bị từ chối. Vui lòng liên hệ với quản trị viên để biết thêm chi tiết.',
          variant: 'destructive' as const
        };
      default:
        return {
          title: 'Trạng thái không xác định',
          description: 'Không thể xác định trạng thái hồ sơ. Vui lòng liên hệ hỗ trợ.',
          variant: 'destructive' as const
        };
    }
  };

  const getRoleDisplayName = (roleName: string) => {
    switch (roleName) {
      case 'nhanvien':
      case 'staff':
        return 'Nhân viên';
      case 'quanly':
      case 'manager':
        return 'Quản lý';
      case 'trungtam':
      case 'central':
        return 'Trung tâm';
      case 'admin':
        return 'Quản trị viên';
      default:
        return roleName;
    }
  };

  const getBranchDisplayName = (branch: string) => {
    switch (branch) {
      case 'HN35':
        return 'Chi nhánh HN35 - 35 Nguyễn Bỉnh Khiêm';
      case 'HN40':
        return 'Chi nhánh HN40 - 40 Ngô Quyền';
      case 'CENTER':
        return 'Báo cáo Trung tâm';
      default:
        return branch || 'Chưa xác định';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-light via-background to-accent-soft flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Đang tải thông tin hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-light via-background to-accent-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-red-600">Lỗi tải dữ liệu</CardTitle>
            <CardDescription>{error || 'Không thể tải thông tin hồ sơ'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleRefresh} className="w-full" disabled={refreshing}>
              {refreshing ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Đang tải...</>
              ) : (
                <><RefreshCw className="h-4 w-4 mr-2" />Thử lại</>
              )}
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />Đăng xuất
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusMessage(profile.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-background to-accent-soft flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <img 
            src={ranGroupLogo} 
            alt="RAN Group Logo" 
            className="mx-auto h-16 w-auto drop-shadow-lg"
          />
          <div>
            <h1 className="text-3xl font-bold text-primary">Trạng Thái Hồ Sơ</h1>
            <p className="text-muted-foreground">Hệ Thống Báo Cáo F&B - RAN Group</p>
          </div>
        </div>

        {/* Status Alert */}
        <Alert variant={statusInfo.variant}>
          {getStatusIcon(profile.status)}
          <div className="ml-2">
            <h4 className="font-semibold">{statusInfo.title}</h4>
            <AlertDescription className="mt-1">
              {statusInfo.description}
            </AlertDescription>
          </div>
        </Alert>

        {/* Profile Information */}
        <Card className="shadow-elevated border-0 bg-card/95 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Thông Tin Hồ Sơ</span>
                </CardTitle>
                <CardDescription>Chi tiết thông tin đăng ký của bạn</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(profile.status)}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Họ và tên</span>
                </div>
                <p className="font-medium">{profile.full_name || 'Chưa cập nhật'}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </div>
                <p className="font-medium">{user?.email}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>Số điện thoại</span>
                </div>
                <p className="font-medium">{profile.phone || 'Chưa cập nhật'}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Công ty</span>
                </div>
                <p className="font-medium">{profile.company || 'Chưa cập nhật'}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Vai trò</span>
                </div>
                <p className="font-medium">{getRoleDisplayName(profile.role_name)}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Chi nhánh</span>
                </div>
                <p className="font-medium">{getBranchDisplayName(profile.branch)}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Ngày đăng ký</span>
              </div>
              <p className="font-medium">
                {new Date(profile.created_at).toLocaleString('vi-VN')}
              </p>
            </div>
            
            {profile.status === 'approved' && profile.approved_at && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4" />
                  <span>Ngày phê duyệt</span>
                </div>
                <p className="font-medium">
                  {new Date(profile.approved_at).toLocaleString('vi-VN')}
                </p>
              </div>
            )}
            
            {profile.status === 'rejected' && profile.rejected_reason && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <XCircle className="h-4 w-4" />
                  <span>Lý do từ chối</span>
                </div>
                <p className="font-medium text-red-600">{profile.rejected_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {profile.status === 'approved' && (
            <Button 
              onClick={handleAccessSystem} 
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Truy cập hệ thống
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className={profile.status === 'approved' ? 'flex-1' : 'w-full'}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>© 2024 RAN Group. Tất cả quyền được bảo lưu.</p>
          <p>Hỗ trợ kỹ thuật: support@rangroup.vn</p>
        </div>
      </div>
    </div>
  );
}