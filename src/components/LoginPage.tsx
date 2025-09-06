import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Mail, Lock, User } from 'lucide-react';
import ranGroupLogo from '@/assets/ran-group-logo.png';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, user, userData } = useAuth();

  useEffect(() => {
    if (user && userData) {
      if (userData.role === 'manager' || userData.role === 'admin') {
        navigate('/branch-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, userData, navigate]);

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

        {/* Notice */}
        <Card className="shadow-elevated border-0 bg-card/95 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-primary">Chuyển hướng đến trang xác thực</CardTitle>
            <CardDescription>
              Hệ thống đã được nâng cấp với xác thực an toàn
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full"
            >
              Đi đến trang đăng nhập
            </Button>
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