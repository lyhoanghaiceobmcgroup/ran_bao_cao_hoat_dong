import { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AccountStatus = 'pending' | 'approved' | 'rejected';

export interface UserData {
  name: string;
  role: 'admin' | 'manager' | 'staff' | 'central';
  branch: string;
  accountStatus: AccountStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userData: UserData | null;
  selectedBranch: string;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, role?: string, branch?: string, fullName?: string, phone?: string, company?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  setSelectedBranch: (branch: string) => void;
  updateAccountStatus: (userId: string, status: AccountStatus, approvedBy?: string, rejectedReason?: string) => Promise<void>;
  checkAccountStatus: (userId: string) => Promise<AccountStatus>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Mock user data for development
  const mockUsers = {
    'nhanvien@gmail.com': {
      name: 'Nguyễn Văn A',
      role: 'staff' as const,
      branch: 'HN35',
      accountStatus: 'approved' as AccountStatus
    },
    'ranhn35@ran.com': {
      name: 'Nhân Viên HN35',
      role: 'staff' as const,
      branch: 'HN35',
      accountStatus: 'approved' as AccountStatus
    },
    'ranhn40@ran.com': {
      name: 'Nhân Viên HN40',
      role: 'staff' as const,
      branch: 'HN40',
      accountStatus: 'approved' as AccountStatus
    },
    'admin@ran.com': {
      name: 'Admin RAN',
      role: 'admin' as const,
      branch: 'HN35',
      accountStatus: 'approved' as AccountStatus
    },
    'central@ran.com': {
      name: 'Trung Tâm RAN',
      role: 'central' as const,
      branch: '',
      accountStatus: 'approved' as AccountStatus
    },
    'center@ran.com': {
      name: 'Báo Cáo Trung Tâm',
      role: 'manager' as const,
      branch: 'CENTER',
      accountStatus: 'approved' as AccountStatus
    },
    'lyhoanghaiceo@gmail.com': {
      name: 'Lý Hoàng Hải CEO',
      role: 'central' as const,
      branch: '',
      accountStatus: 'approved' as AccountStatus
    }
  };

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return 'staff'; // default role
      }

      return data?.role || 'staff';
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'staff';
    }
  };

  // Bỏ qua useEffect phức tạp - sử dụng mock data trực tiếp

  const signIn = async (email: string, password: string) => {
    try {
      // Mock authentication - check if email exists in mockUsers
      const mockUserData = mockUsers[email as keyof typeof mockUsers];
      
      if (mockUserData) {
        // Simulate successful login
        const mockUser = { id: `mock-${email}`, email } as User;
        setUser(mockUser);
        setUserData(mockUserData);
        setSelectedBranch(mockUserData.branch);
        return { error: null };
      }
      
      // If not in mock data, try real authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { error };
      }
      
      // Nếu đăng nhập thành công, kiểm tra trạng thái tài khoản
      if (data.user) {
        // Tạo userData mặc định cho tài khoản mới
        const defaultUserData: UserData = {
          name: data.user.email?.split('@')[0] || 'User',
          role: 'staff', // Mặc định là staff (nhân viên)
          branch: '', // Nhân viên không thuộc chi nhánh cụ thể
          accountStatus: 'pending' // Tài khoản mới cần phê duyệt
        };
        
        setUser(data.user);
        setUserData(defaultUserData);
        setSelectedBranch('');
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, role?: string, branch?: string, fullName?: string, phone?: string, company?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    // Tạo metadata cho tài khoản với thông tin đầy đủ
    const metadata = {
      full_name: fullName || '',
      phone: phone || '',
      company: company || '',
      role_name: role || 'staff',
      branch: branch || '',
      accountStatus: 'pending', // Tất cả tài khoản mới đều cần phê duyệt
      createdAt: new Date().toISOString()
    };
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });
    
    // Nếu đăng ký thành công, tạo profile trong database
    if (!error && data.user) {
      try {
        // Tạo profile trong bảng profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            full_name: fullName || '',
            phone: phone || '',
            company: company || '',
            role_name: role || 'staff',
            branch: branch || '',
            status: 'pending'
          });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Không throw error để không làm gián đoạn quá trình đăng ký
          // Profile sẽ được tạo tự động bởi trigger nếu insert thất bại
        }
        
        console.log('New user profile created:', {
          email,
          full_name: fullName,
          phone,
          company,
          role_name: role,
          branch,
          status: 'pending'
        });
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
        // Không throw error để không làm gián đoạn quá trình đăng ký
      }
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserData(null);
    setSelectedBranch('');
  };

  const updateAccountStatus = async (userId: string, status: AccountStatus, approvedBy?: string, rejectedReason?: string) => {
    try {
      // Mock implementation for demo - in production this would update the database
      console.log(`Mock: Updating account status for user ${userId} to ${status}`);
      
      if (status === 'approved' && approvedBy) {
        console.log(`Mock: Approved by ${approvedBy} at ${new Date().toISOString()}`);
      }
      
      if (status === 'rejected' && rejectedReason) {
        console.log(`Mock: Rejected with reason: ${rejectedReason}`);
      }
      
      // Simulate successful update
      // Original database code (commented out due to schema mismatch):
      // const updateData: any = {
      //   account_status: status,
      //   updated_at: new Date().toISOString()
      // };
      //
      // if (status === 'approved' && approvedBy) {
      //   updateData.approved_by = approvedBy;
      //   updateData.approved_at = new Date().toISOString();
      // }
      //
      // if (status === 'rejected' && rejectedReason) {
      //   updateData.rejected_reason = rejectedReason;
      // }
      //
      // const { error } = await supabase
      //   .from('user_roles')
      //   .update(updateData)
      //   .eq('user_id', userId);
      //
      // if (error) {
      //   console.error('Error updating account status:', error);
      //   throw error;
      // }

      // Cập nhật userData nếu đang cập nhật cho user hiện tại
      if (user?.id === userId && userData) {
        setUserData({
          ...userData,
          accountStatus: status,
          approvedBy: status === 'approved' ? approvedBy : userData.approvedBy,
          approvedAt: status === 'approved' ? new Date().toISOString() : userData.approvedAt,
          rejectedReason: status === 'rejected' ? rejectedReason : userData.rejectedReason
        });
      }
    } catch (error) {
      console.error('Error updating account status:', error);
      throw error;
    }
  };

  const checkAccountStatus = async (userId: string): Promise<AccountStatus> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('status')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking account status:', error);
        return 'pending';
      }

      if (!data) {
        console.warn('No profile found for user:', userId);
        // Tạo profile mặc định nếu không tồn tại
        try {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              full_name: '',
              phone: '',
              company: '',
              role_name: 'staff',
              branch: '',
              status: 'pending'
            });
          
          if (insertError) {
            console.error('Error creating default profile:', insertError);
          } else {
            console.log('Created default profile for user:', userId);
          }
        } catch (insertError) {
          console.error('Error creating default profile:', insertError);
        }
        return 'pending';
      }

      return (data.status as AccountStatus) || 'pending';
    } catch (error) {
      console.error('Error checking account status:', error);
      return 'pending';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      userData, 
      selectedBranch, 
      loading,
      signIn, 
      signUp, 
      signOut, 
      setSelectedBranch,
      updateAccountStatus,
      checkAccountStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};
