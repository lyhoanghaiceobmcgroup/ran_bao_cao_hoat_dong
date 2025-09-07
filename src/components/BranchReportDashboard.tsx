import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Users, 
  DollarSign, 
  Wallet, 
  Package, 
  AlertTriangle, 
  MessageSquare, 
  TrendingUp, 
  Target,
  Send,
  CheckCircle,
  Calendar,
  Clock,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ranGroupLogo from '@/assets/ran-group-logo.png';

// Import section components
import BranchInfoSection from './dashboard/BranchInfoSection';
import StaffAttendanceSection from './dashboard/StaffAttendanceSection';
import SalesPaymentSection from './dashboard/SalesPaymentSection';
import CashReconciliationSection from './dashboard/CashReconciliationSection';
import InventoryWasteSection from './dashboard/InventoryWasteSection';
import IncidentSection from './dashboard/IncidentSection';
import CustomerFeedbackSection from './dashboard/CustomerFeedbackSection';
import MarketingSection from './dashboard/MarketingSection';
import KPIComparisonSection from './dashboard/KPIComparisonSection';
import ReportSubmissionSection from './dashboard/ReportSubmissionSection';

interface ReportData {
  branchInfo: any;
  staffAttendance: any;
  salesPayment: any;
  cashReconciliation: any;
  inventoryWaste: any;
  incidents: any;
  customerFeedback: any;
  marketing: any;
  kpiComparison: any;
}

export default function BranchReportDashboard() {
  const { userData, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [reportData, setReportData] = useState<ReportData>({
    branchInfo: {},
    staffAttendance: {},
    salesPayment: {},
    cashReconciliation: {},
    inventoryWaste: {},
    incidents: {},
    customerFeedback: {},
    marketing: {},
    kpiComparison: {}
  });
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleString('vi-VN'));
    };
    
    // Set initial time
    updateDateTime();
    
    // Update every minute
    const interval = setInterval(updateDateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSectionComplete = (sectionKey: string, data: any) => {
    setReportData(prev => ({
      ...prev,
      [sectionKey]: data
    }));
    
    if (!completedSections.includes(sectionKey)) {
      setCompletedSections(prev => [...prev, sectionKey]);
    }
  };

  const sections = [
    { key: 'info', label: 'Thông tin chi nhánh', icon: Building2, component: BranchInfoSection },
    { key: 'staff', label: 'Nhân sự & giờ công', icon: Users, component: StaffAttendanceSection },
    { key: 'sales', label: 'Doanh thu & thanh toán', icon: DollarSign, component: SalesPaymentSection },
    { key: 'cash', label: 'Quỹ & đối soát', icon: Wallet, component: CashReconciliationSection },
    { key: 'inventory', label: 'Kho & hao hụt', icon: Package, component: InventoryWasteSection },
    { key: 'incidents', label: 'Sự cố - sự vụ', icon: AlertTriangle, component: IncidentSection },
    { key: 'feedback', label: 'Phản hồi khách hàng', icon: MessageSquare, component: CustomerFeedbackSection },
    { key: 'marketing', label: 'Marketing & KM', icon: TrendingUp, component: MarketingSection },
    { key: 'kpi', label: 'KPI mục tiêu', icon: Target, component: KPIComparisonSection },
    { key: 'submit', label: 'Xác nhận & gửi', icon: Send, component: ReportSubmissionSection }
  ];

  const completionRate = Math.round((completedSections.length / (sections.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={ranGroupLogo} alt="RAN Group" className="h-12 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Báo cáo nhanh - Quản lý chi nhánh</h1>
                <p className="text-muted-foreground">Hệ thống quản lý chuỗi F&B</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{userData?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{userData?.branch}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{currentDateTime}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Badge variant={completionRate === 100 ? "default" : "secondary"}>
                  Hoàn thành: {completionRate}%
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    signOut();
                    navigate('/auth');
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 gap-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isCompleted = completedSections.includes(section.key);
                
                return (
                  <TabsTrigger
                    key={section.key}
                    value={section.key}
                    className="flex flex-col items-center gap-1 p-3 h-auto relative"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs text-center leading-tight">{section.label}</span>
                    {isCompleted && (
                      <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-500" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="bg-card rounded-lg shadow-sm">
            {sections.map((section) => {
              const SectionComponent = section.component;
              
              return (
                <TabsContent key={section.key} value={section.key} className="p-6">
                  <SectionComponent
                    data={reportData[section.key as keyof ReportData]}
                    onComplete={(data: any) => handleSectionComplete(section.key, data)}
                  />
                </TabsContent>
              );
            })}
          </div>
        </Tabs>
      </main>
    </div>
  );
}