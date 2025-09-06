import React, { useState, useEffect } from 'react';
import { useAuth, AccountStatus } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, Users, Search, Filter, Eye, UserCheck, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PendingAccount {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
  branch: string;
  accountStatus: AccountStatus;
  createdAt: string;
  rejectedReason?: string;
  approvedBy?: string;
  approvedAt?: string;
}

const AccountManagementPage: React.FC = () => {
  const { userData, updateAccountStatus } = useAuth();
  const [accounts, setAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'all'>('all');
  const [selectedAccount, setSelectedAccount] = useState<PendingAccount | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Mock data cho demo
  const mockAccounts: PendingAccount[] = [
    {
      id: '1',
      email: 'nhanvien1@ran.com',
      name: 'Nguyễn Văn A',
      role: 'staff',
      branch: 'HN35',
      accountStatus: 'pending',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      email: 'quanly1@ran.com',
      name: 'Trần Thị B',
      role: 'manager',
      branch: 'HN40',
      accountStatus: 'pending',
      createdAt: '2024-01-14T14:20:00Z'
    },
    {
      id: '3',
      email: 'nhanvien2@ran.com',
      name: 'Lê Văn C',
      role: 'staff',
      branch: 'HN35',
      accountStatus: 'approved',
      createdAt: '2024-01-13T09:15:00Z',
      approvedBy: 'Admin',
      approvedAt: '2024-01-13T16:30:00Z'
    },
    {
      id: '4',
      email: 'test@ran.com',
      name: 'Phạm Thị D',
      role: 'staff',
      branch: 'HN40',
      accountStatus: 'rejected',
      createdAt: '2024-01-12T11:45:00Z',
      rejectedReason: 'Thông tin không chính xác'
    }
  ];

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      // Trong thực tế, sẽ gọi API để lấy danh sách tài khoản
      // const { data, error } = await supabase
      //   .from('user_roles')
      //   .select('*')
      //   .order('created_at', { ascending: false });
      
      // Sử dụng mock data cho demo
      setTimeout(() => {
        setAccounts(mockAccounts);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAccounts(mockAccounts);
      setLoading(false);
    }
  };

  const handleApproveAccount = async (accountId: string) => {
    setActionLoading(true);
    try {
      await updateAccountStatus(accountId, 'approved', userData?.name);
      
      // Cập nhật local state
      setAccounts(prev => prev.map(account => 
        account.id === accountId 
          ? { 
              ...account, 
              accountStatus: 'approved', 
              approvedBy: userData?.name,
              approvedAt: new Date().toISOString()
            }
          : account
      ));
      
      // Đóng dialog nếu đang mở
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error approving account:', error);
      alert('Có lỗi xảy ra khi phê duyệt tài khoản');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectAccount = async (accountId: string, reason: string) => {
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    setActionLoading(true);
    try {
      await updateAccountStatus(accountId, 'rejected', undefined, reason);
      
      // Cập nhật local state
      setAccounts(prev => prev.map(account => 
        account.id === accountId 
          ? { 
              ...account, 
              accountStatus: 'rejected', 
              rejectedReason: reason
            }
          : account
      ));
      
      // Reset form và đóng dialog
      setRejectionReason('');
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error rejecting account:', error);
      alert('Có lỗi xảy ra khi từ chối tài khoản');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Chờ duyệt</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Đã duyệt</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Từ chối</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'Trung tâm';
      case 'manager': return 'Quản lý';
      case 'staff': return 'Nhân viên';
      default: return role;
    }
  };

  const getBranchName = (branch: string) => {
    switch (branch) {
      case 'HN35': return '35 Nguyễn Bỉnh Khiêm';
      case 'HN40': return '40 Ngô Quyền';
      default: return branch;
    }
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || account.accountStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = accounts.filter(acc => acc.accountStatus === 'pending').length;
  const approvedCount = accounts.filter(acc => acc.accountStatus === 'approved').length;
  const rejectedCount = accounts.filter(acc => acc.accountStatus === 'rejected').length;

  if (userData?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-600 mb-4">
            Chỉ tài khoản Trung tâm mới có thể truy cập trang quản lý tài khoản.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý tài khoản</h1>
          <p className="text-gray-600">Phê duyệt và quản lý các tài khoản đăng ký mới</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng tài khoản</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accounts.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chờ phê duyệt</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã phê duyệt</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bị từ chối</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm theo tên hoặc email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={(value: AccountStatus | 'all') => setStatusFilter(value)}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="pending">Chờ phê duyệt</SelectItem>
                    <SelectItem value="approved">Đã phê duyệt</SelectItem>
                    <SelectItem value="rejected">Bị từ chối</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accounts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách tài khoản ({filteredAccounts.length})</CardTitle>
            <CardDescription>
              Quản lý và phê duyệt các tài khoản đăng ký
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Đang tải...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thông tin</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Chi nhánh</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{account.name}</div>
                          <div className="text-sm text-gray-500">{account.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleName(account.role)}</TableCell>
                      <TableCell>{getBranchName(account.branch)}</TableCell>
                      <TableCell>{getStatusBadge(account.accountStatus)}</TableCell>
                      <TableCell>
                        {new Date(account.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedAccount(account)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Chi tiết
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Chi tiết tài khoản</DialogTitle>
                                <DialogDescription>
                                  Thông tin chi tiết và thao tác phê duyệt
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedAccount && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Tên</label>
                                      <p className="font-medium">{selectedAccount.name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Email</label>
                                      <p className="font-medium">{selectedAccount.email}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Vai trò</label>
                                      <p className="font-medium">{getRoleName(selectedAccount.role)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Chi nhánh</label>
                                      <p className="font-medium">{getBranchName(selectedAccount.branch)}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                                    <div className="mt-1">{getStatusBadge(selectedAccount.accountStatus)}</div>
                                  </div>
                                  
                                  {selectedAccount.accountStatus === 'approved' && selectedAccount.approvedBy && (
                                    <div className="bg-green-50 p-3 rounded-lg">
                                      <p className="text-sm text-green-700">
                                        <strong>Phê duyệt bởi:</strong> {selectedAccount.approvedBy}
                                      </p>
                                      {selectedAccount.approvedAt && (
                                        <p className="text-sm text-green-700">
                                          <strong>Thời gian:</strong> {new Date(selectedAccount.approvedAt).toLocaleString('vi-VN')}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  
                                  {selectedAccount.accountStatus === 'rejected' && selectedAccount.rejectedReason && (
                                    <div className="bg-red-50 p-3 rounded-lg">
                                      <p className="text-sm text-red-700">
                                        <strong>Lý do từ chối:</strong> {selectedAccount.rejectedReason}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {selectedAccount.accountStatus === 'pending' && (
                                    <div className="space-y-3">
                                      <div>
                                        <label className="text-sm font-medium text-gray-700">Lý do từ chối (nếu từ chối)</label>
                                        <Textarea
                                          placeholder="Nhập lý do từ chối tài khoản..."
                                          value={rejectionReason}
                                          onChange={(e) => setRejectionReason(e.target.value)}
                                          className="mt-1"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <DialogFooter>
                                {selectedAccount?.accountStatus === 'pending' && (
                                  <div className="flex space-x-2 w-full">
                                    <Button
                                      variant="outline"
                                      onClick={() => handleRejectAccount(selectedAccount.id, rejectionReason)}
                                      disabled={actionLoading}
                                      className="flex-1"
                                    >
                                      <UserX className="h-4 w-4 mr-1" />
                                      {actionLoading ? 'Đang xử lý...' : 'Từ chối'}
                                    </Button>
                                    <Button
                                      onClick={() => handleApproveAccount(selectedAccount.id)}
                                      disabled={actionLoading}
                                      className="flex-1"
                                    >
                                      <UserCheck className="h-4 w-4 mr-1" />
                                      {actionLoading ? 'Đang xử lý...' : 'Phê duyệt'}
                                    </Button>
                                  </div>
                                )}
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {!loading && filteredAccounts.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Không tìm thấy tài khoản nào</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountManagementPage;