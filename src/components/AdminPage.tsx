import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, User, Building, Phone, Mail } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  company: string;
  role_name: string;
  branch: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  email?: string;
}

const AdminPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingProfiles();
  }, []);

  const fetchPendingProfiles = async () => {
    try {
      setLoading(true);
      
      // Get profiles with user email
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          phone,
          company,
          role_name,
          branch,
          status,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      // Get user emails
      const userIds = profilesData?.map(p => p.user_id) || [];
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
      }

      // Combine profile and user data
      const profilesWithEmail = profilesData?.map(profile => {
        const user = usersData?.users.find(u => u.id === profile.user_id);
        return {
          ...profile,
          email: user?.email || 'N/A'
        };
      }) || [];

      setProfiles(profilesWithEmail);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách hồ sơ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfileStatus = async (profileId: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      setProcessingId(profileId);
      
      const updateData: any = {
        status,
        approved_at: new Date().toISOString(),
        approved_by: (await supabase.auth.getUser()).data.user?.id
      };
      
      if (status === 'rejected' && reason) {
        updateData.rejected_reason = reason;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profileId);

      if (error) {
        throw error;
      }

      toast({
        title: "Thành công",
        description: `Hồ sơ đã được ${status === 'approved' ? 'phê duyệt' : 'từ chối'}`,
      });

      // Refresh the list
      await fetchPendingProfiles();
      
      // Clear rejection reason
      if (status === 'rejected') {
        setRejectionReason(prev => ({ ...prev, [profileId]: '' }));
      }
    } catch (error) {
      console.error('Error updating profile status:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái hồ sơ",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Chờ duyệt</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Đã duyệt</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Từ chối</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'staff': 'Nhân viên',
      'manager': 'Quản lý',
      'central': 'Trung tâm',
      'admin': 'Quản trị viên',
      'trungtam': 'Trung tâm'
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách hồ sơ...</p>
        </div>
      </div>
    );
  }

  const pendingProfiles = profiles.filter(p => p.status === 'pending');
  const processedProfiles = profiles.filter(p => p.status !== 'pending');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản trị hệ thống</h1>
        <p className="text-gray-600">Quản lý phê duyệt tài khoản người dùng</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng số hồ sơ</p>
                <p className="text-2xl font-bold text-gray-900">{profiles.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingProfiles.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-green-600">{profiles.filter(p => p.status === 'approved').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Từ chối</p>
                <p className="text-2xl font-bold text-red-600">{profiles.filter(p => p.status === 'rejected').length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Profiles */}
      {pendingProfiles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Hồ sơ chờ duyệt ({pendingProfiles.length})</h2>
          <div className="grid gap-4">
            {pendingProfiles.map((profile) => (
              <Card key={profile.id} className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{profile.full_name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {profile.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {profile.phone}
                        </span>
                      </CardDescription>
                    </div>
                    {getStatusBadge(profile.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Công ty:</strong> {profile.company || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Vai trò:</strong> {getRoleName(profile.role_name)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        <strong>Chi nhánh:</strong> {profile.branch || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    <strong>Ngày đăng ký:</strong> {new Date(profile.created_at).toLocaleString('vi-VN')}
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateProfileStatus(profile.id, 'approved')}
                        disabled={processingId === profile.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {processingId === profile.id ? 'Đang xử lý...' : 'Phê duyệt'}
                      </Button>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Textarea
                        placeholder="Lý do từ chối (tùy chọn)"
                        value={rejectionReason[profile.id] || ''}
                        onChange={(e) => setRejectionReason(prev => ({ ...prev, [profile.id]: e.target.value }))}
                        className="min-h-[80px]"
                      />
                      <Button
                        onClick={() => updateProfileStatus(profile.id, 'rejected', rejectionReason[profile.id])}
                        disabled={processingId === profile.id}
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {processingId === profile.id ? 'Đang xử lý...' : 'Từ chối'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Processed Profiles */}
      {processedProfiles.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Hồ sơ đã xử lý ({processedProfiles.length})</h2>
          <div className="grid gap-4">
            {processedProfiles.map((profile) => (
              <Card key={profile.id} className={`border-l-4 ${
                profile.status === 'approved' ? 'border-l-green-500' : 'border-l-red-500'
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{profile.full_name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {profile.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {profile.phone}
                        </span>
                      </CardDescription>
                    </div>
                    {getStatusBadge(profile.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Công ty:</strong> {profile.company || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        <strong>Vai trò:</strong> {getRoleName(profile.role_name)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        <strong>Chi nhánh:</strong> {profile.branch || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 mt-2">
                    <strong>Ngày đăng ký:</strong> {new Date(profile.created_at).toLocaleString('vi-VN')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {profiles.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có hồ sơ nào</h3>
            <p className="text-gray-500">Hiện tại chưa có hồ sơ nào trong hệ thống.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPage;