import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Clock, 
  MapPin, 
  User, 
  LogOut, 
  Calendar,
  ChevronRight,
  Coffee,
  Users,
  TrendingUp,
  Building2,
  BarChart3,
  FileText,
  PieChart,
  Settings,
  Plus,
  Save,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Package,
  Star,
  MessageSquare,
  Printer
} from 'lucide-react';
import ranGroupLogo from '@/assets/ran-group-logo.png';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Staff Detail Interface
interface StaffDetail {
  id: string;
  name: string;
  position: string;
  type: 'fulltime' | 'parttime' | 'trial';
  shift: 'morning' | 'afternoon' | 'evening';
  workHours: number;
  overtimeHours: number;
  onTime: boolean;
  productivity: number;
  notes: string;
}

// Types for Branch Management Report
interface DailyReportData {
  date: string;
  // 1. Báo cáo Nhân sự (Sáp nhập Nhân sự + Ca làm việc)
  staffDetails: StaffDetail[];
  staffTotal: number;
  staffFulltime: number;
  staffParttime: number;
  staffTrial: number;
  workHours: number;
  overtimeHours: number;
  onTimeRate: number;
  productivityPerHour: number;
  turnoverRate: number;
  staffIssues: string;
  staffNotes: string;
  
  // Ca làm việc (tích hợp vào báo cáo nhân sự)
  shiftsTotal: number;
  shiftsMorning: number;
  shiftsAfternoon: number;
  shiftsEvening: number;
  reportsComplete: number;
  shiftIssues: string;
  kpiAchievement: number;
  shiftNotes: string;
  
  // 3. Marketing & Khách hàng
  campaigns: string;
  vouchersUsed: number;
  voucherValue: number;
  redemptionRate: number;
  campaignRevenue: number;
  newCustomers: number;
  returningCustomers: number;
  npsScore: number;
  avgRating: number;
  negativeReviews: number;
  marketingNotes: string;
  
  // 4. Hàng hóa & Kho
  inventoryStart: number;
  inventoryEnd: number;
  wastage: number;
  wastagePercent: number;
  supplierOrders: number;
  supplierValue: number;
  stockoutDays: number;
  inventoryNotes: string;
  
  // 5. Sự cố
  incidentsTotal: number;
  incidentsEquipment: number;
  incidentsStaff: number;
  incidentsCustomer: number;
  incidentsSafety: number;
  incidentCost: number;
  incidentsResolved: number;
  incidentNotes: string;
  
  // 6. Phản ánh
  feedbackTotal: number;
  feedbackResolved: number;
  avgResolutionTime: number;
  pendingFeedback: number;
  feedbackNotes: string;
  
  // 7. Tài chính
  netSales: number;
  avgOrderValue: number;
  cogsPercent: number;
  laborPercent: number;
  cashVariance: number;
  ebitdaMargin: number;
  financialNotes: string;
  
  // 7.1. Thu nhập chi tiết
  cashRevenue: number; // Doanh thu tiền mặt
  cardRevenue: number; // Doanh thu thẻ
  onlineRevenue: number; // Doanh thu online
  otherRevenue: number; // Thu nhập khác
  totalDailyRevenue: number; // Tổng thu nhập ngày
  
  // 7.2. Chi phí chi tiết
  foodCost: number; // Chi phí nguyên liệu
  laborCost: number; // Chi phí nhân công
  utilityCost: number; // Chi phí điện nước
  rentCost: number; // Chi phí thuê mặt bằng
  marketingCost: number; // Chi phí marketing
  maintenanceCost: number; // Chi phí bảo trì
  otherExpenses: number; // Chi phí khác
  totalDailyExpenses: number; // Tổng chi phí ngày
  
  // 7.3. Hoạt động tài chính
  openingCash: number; // Tiền mặt đầu ca
  closingCash: number; // Tiền mặt cuối ca
  cashDeposit: number; // Tiền gửi ngân hàng
  cashWithdrawal: number; // Tiền rút từ ngân hàng
  pettyCash: number; // Quỹ tiền mặt
  dailyProfit: number; // Lợi nhuận ngày
  profitMargin: number; // Tỷ suất lợi nhuận (%)
}

interface BranchReportSummary {
  reportId: string;
  branchId: string;
  branchName: string;
  managerId: string;
  managerName: string;
  reportPeriod: '7' | '30' | '90';
  startDate: string;
  endDate: string;
  createdDate: string;
  approvedBy?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  dailyData: DailyReportData[];
  totalRevenue: number;
  kpiAchievementRate: number;
  avgNpsScore: number;
}

// Activity History Interfaces
interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'login' | 'logout' | 'create_report' | 'update_report' | 'delete_report' | 'approve_report' | 'reject_report' | 'export_data' | 'view_report';
  targetType: 'account' | 'daily_report' | 'summary_report' | 'system';
  targetId?: string;
  targetName?: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  changes?: ChangeLog[];
}

interface ChangeLog {
  field: string;
  fieldLabel: string;
  oldValue: any;
  newValue: any;
  changeType: 'create' | 'update' | 'delete';
}

interface AccountActivity {
  userId: string;
  userName: string;
  email: string;
  role: string;
  branch: string;
  lastLogin: string;
  loginCount: number;
  reportCount: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface ReportAudit {
  reportId: string;
  reportType: 'daily' | 'summary';
  reportDate: string;
  createdBy: string;
  createdAt: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  changeHistory: ChangeLog[];
  exportHistory: ExportLog[];
}

interface ExportLog {
  id: string;
  exportedBy: string;
  exportedAt: string;
  exportType: 'pdf' | 'excel' | 'csv';
  reportIds: string[];
  fileSize?: number;
}

// Interface cho dữ liệu tài chính 7 ngày
interface WeeklyFinancialData {
  weekStartDate: string;
  weekEndDate: string;
  dailyFinancials: DailyReportData[];
  weeklyTotals: {
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    avgDailyRevenue: number;
    avgDailyExpenses: number;
    avgProfitMargin: number;
    cashFlow: number;
  };
  trends: {
    revenueGrowth: number; // % so với tuần trước
    expenseGrowth: number;
    profitGrowth: number;
  };
}

// Reset all data to zero
const getEmptyDailyData = (date: string): DailyReportData => {
  return {
    date,
    // 1. Báo cáo Nhân sự
    staffDetails: [],
    staffTotal: 0,
    staffFulltime: 0,
    staffParttime: 0,
    staffTrial: 0,
    workHours: 0,
    overtimeHours: 0,
    onTimeRate: 0,
    productivityPerHour: 0,
    turnoverRate: 0,
    staffIssues: '',
    staffNotes: '',
    
    // 2. Ca làm việc
    shiftsTotal: 0,
    shiftsMorning: 0,
    shiftsAfternoon: 0,
    shiftsEvening: 0,
    reportsComplete: 0,
    shiftIssues: '',
    kpiAchievement: 0,
    shiftNotes: '',
    
    // 3. Marketing & Khách hàng
    campaigns: '',
    vouchersUsed: 0,
    voucherValue: 0,
    redemptionRate: 0,
    campaignRevenue: 0,
    newCustomers: 0,
    returningCustomers: 0,
    npsScore: 0,
    avgRating: 0,
    negativeReviews: 0,
    marketingNotes: '',
    
    // 4. Hàng hóa & Kho
    inventoryStart: 0,
    inventoryEnd: 0,
    wastage: 0,
    wastagePercent: 0,
    supplierOrders: 0,
    supplierValue: 0,
    stockoutDays: 0,
    inventoryNotes: '',
    
    // 5. Sự cố
    incidentsTotal: 0,
    incidentsEquipment: 0,
    incidentsStaff: 0,
    incidentsCustomer: 0,
    incidentsSafety: 0,
    incidentCost: 0,
    incidentsResolved: 0,
    incidentNotes: '',
    
    // 6. Phản ánh
    feedbackTotal: 0,
    feedbackResolved: 0,
    avgResolutionTime: 0,
    pendingFeedback: 0,
    feedbackNotes: '',
    
    // 7. Tài chính cơ bản
    netSales: 0,
    avgOrderValue: 0,
    cogsPercent: 0,
    laborPercent: 0,
    cashVariance: 0,
    ebitdaMargin: 0,
    financialNotes: '',
    
    // 8. Thu nhập chi tiết
    cashRevenue: 0,
    cardRevenue: 0,
    onlineRevenue: 0,
    otherRevenue: 0,
    totalDailyRevenue: 0,
    
    // 9. Chi phí chi tiết
    foodCost: 0,
    laborCost: 0,
    utilityCost: 0,
    rentCost: 0,
    marketingCost: 0,
    maintenanceCost: 0,
    otherExpenses: 0,
    totalDailyExpenses: 0,
    
    // 10. Hoạt động tài chính
    openingCash: 0,
    closingCash: 0,
    cashDeposit: 0,
    cashWithdrawal: 0,
    pettyCash: 0,
    dailyProfit: 0,
    profitMargin: 0
  };
};

export default function CenterDashboard() {
  const { userData, signOut } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [reportPeriod, setReportPeriod] = useState<'7' | '30' | '90'>('7');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentReport, setCurrentReport] = useState<BranchReportSummary | null>(null);
  const [dailyData, setDailyData] = useState<DailyReportData>(() => {
    const today = new Date().toISOString().split('T')[0];
    return getEmptyDailyData(today);
  });
  const [summaryData, setSummaryData] = useState<BranchReportSummary | null>(null);
  const [viewMode, setViewMode] = useState<'input' | 'summary' | 'history'>('input');
  
  // Add staff modal states
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffData, setNewStaffData] = useState<Omit<StaffDetail, 'id'>>({
    name: '',
    position: '',
    type: 'fulltime',
    shift: 'morning',
    workHours: 8,
    overtimeHours: 0,
    onTime: true,
    productivity: 100,
    notes: ''
  });
  
  // History feature states
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [accountActivities, setAccountActivities] = useState<AccountActivity[]>([]);
  const [reportAudits, setReportAudits] = useState<ReportAudit[]>([]);
  const [historyFilter, setHistoryFilter] = useState<{
    dateRange: { start: Date; end: Date };
    actionType: string;
    userId: string;
    targetType: string;
  }>({
    dateRange: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() },
    actionType: 'all',
    userId: 'all',
    targetType: 'all'
  });
  
  // Financial data states
  const [weeklyFinancialData, setWeeklyFinancialData] = useState<WeeklyFinancialData | null>(null);
  const [financialEditMode, setFinancialEditMode] = useState(false);
  const [selectedFinancialDate, setSelectedFinancialDate] = useState(new Date().toISOString().split('T')[0]);
  const [financialDataHistory, setFinancialDataHistory] = useState<DailyReportData[]>([]);
  
  // Initialize default financial data
  const initializeFinancialData = (): Partial<DailyReportData> => ({
    // Thu nhập
    cashRevenue: 0,
    cardRevenue: 0,
    onlineRevenue: 0,
    otherRevenue: 0,
    totalDailyRevenue: 0,
    // Chi phí
    foodCost: 0,
    laborCost: 0,
    utilityCost: 0,
    rentCost: 0,
    marketingCost: 0,
    maintenanceCost: 0,
    otherExpenses: 0,
    totalDailyExpenses: 0,
    // Hoạt động tài chính
    openingCash: 0,
    closingCash: 0,
    cashDeposit: 0,
    cashWithdrawal: 0,
    pettyCash: 0,
    dailyProfit: 0,
    profitMargin: 0
  });
  
  if (!userData) {
    navigate('/auth');
    return null;
  }

  const handleLogout = () => {
    signOut();
    navigate('/auth');
  };
  
  // Initialize report data with mockup data
  useEffect(() => {
    const initializeReport = () => {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - parseInt(reportPeriod));
      
      // Generate mockup daily data for the report period
      const mockupDailyData: DailyReportData[] = [];
      for (let i = 0; i < parseInt(reportPeriod); i++) {
        const reportDate = new Date(startDate);
        reportDate.setDate(startDate.getDate() + i);
        const dateString = reportDate.toISOString().split('T')[0];
        mockupDailyData.push(generateMockupData(dateString));
      }
      
      setCurrentReport({
        reportId: `RPT-${Date.now()}`,
        branchId: userData.branch || 'HN35',
        branchName: userData.branch === 'HN35' ? 'Hà Nội 35 NBK' : 'Hà Nội 40 NQ',
        managerId: userData.id || '',
        managerName: userData.full_name || userData.email || '',
        reportPeriod,
        startDate: startDate.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        createdDate: today.toISOString().split('T')[0],
        status: 'draft',
        dailyData: mockupDailyData,
        totalRevenue: 0,
        kpiAchievementRate: 0,
        avgNpsScore: 0
      });
    };
    
    initializeReport();
  }, [reportPeriod, userData]);
  
  // Financial data management functions
  const updateFinancialData = (date: string, field: keyof DailyReportData, value: number) => {
    // Validation
    if (value < 0) {
      alert('⚠️ Giá trị không được âm!');
      return;
    }
    
    setDailyData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-calculate totals
      if (['cashRevenue', 'cardRevenue', 'onlineRevenue', 'otherRevenue'].includes(field)) {
        updated.totalDailyRevenue = (updated.cashRevenue || 0) + (updated.cardRevenue || 0) + 
                                   (updated.onlineRevenue || 0) + (updated.otherRevenue || 0);
      }
      if (['foodCost', 'laborCost', 'utilityCost', 'rentCost', 'marketingCost', 'maintenanceCost', 'otherExpenses'].includes(field)) {
        updated.totalDailyExpenses = (updated.foodCost || 0) + (updated.laborCost || 0) + 
                                    (updated.utilityCost || 0) + (updated.rentCost || 0) + 
                                    (updated.marketingCost || 0) + (updated.maintenanceCost || 0) + 
                                    (updated.otherExpenses || 0);
      }
      // Auto-calculate profit and margin
      updated.dailyProfit = (updated.totalDailyRevenue || 0) - (updated.totalDailyExpenses || 0);
      updated.profitMargin = updated.totalDailyRevenue > 0 ? 
                            ((updated.dailyProfit || 0) / updated.totalDailyRevenue) * 100 : 0;
      
      // Save to localStorage for persistence
      const savedData = JSON.parse(localStorage.getItem('centerDashboardData') || '{}');
      savedData[date] = updated;
      localStorage.setItem('centerDashboardData', JSON.stringify(savedData));
      
      return updated;
    });
  };
  
  const loadWeeklyFinancialData = (startDate: string) => {
    const start = new Date(startDate);
    const dailyFinancials: DailyReportData[] = [];
    
    // Generate 7 days of financial data
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Load existing data or initialize with defaults
      const existingData = financialDataHistory.find(d => d.date === dateString);
      if (existingData) {
        dailyFinancials.push(existingData);
      } else {
        dailyFinancials.push({
          date: dateString,
          ...initializeFinancialData()
        } as DailyReportData);
      }
    }
    
    // Calculate weekly totals
    const weeklyTotals = {
      totalRevenue: dailyFinancials.reduce((sum, day) => sum + (day.totalDailyRevenue || 0), 0),
      totalExpenses: dailyFinancials.reduce((sum, day) => sum + (day.totalDailyExpenses || 0), 0),
      totalProfit: dailyFinancials.reduce((sum, day) => sum + (day.dailyProfit || 0), 0),
      avgDailyRevenue: 0,
      avgDailyExpenses: 0,
      avgProfitMargin: 0,
      cashFlow: 0
    };
    
    weeklyTotals.avgDailyRevenue = weeklyTotals.totalRevenue / 7;
    weeklyTotals.avgDailyExpenses = weeklyTotals.totalExpenses / 7;
    weeklyTotals.avgProfitMargin = weeklyTotals.totalRevenue > 0 ? 
                                  (weeklyTotals.totalProfit / weeklyTotals.totalRevenue) * 100 : 0;
    weeklyTotals.cashFlow = weeklyTotals.totalProfit;
    
    const endDate = new Date(start);
    endDate.setDate(start.getDate() + 6);
    
    setWeeklyFinancialData({
      weekStartDate: start.toISOString().split('T')[0],
      weekEndDate: endDate.toISOString().split('T')[0],
      dailyFinancials,
      weeklyTotals,
      trends: {
        revenueGrowth: 0, // Sẽ tính toán khi có dữ liệu tuần trước
        expenseGrowth: 0,
        profitGrowth: 0
      }
    });
  };
  
  const saveFinancialData = () => {
    if (weeklyFinancialData) {
      // Update financial data history
      const updatedHistory = [...financialDataHistory];
      weeklyFinancialData.dailyFinancials.forEach(dayData => {
        const existingIndex = updatedHistory.findIndex(d => d.date === dayData.date);
        if (existingIndex >= 0) {
          updatedHistory[existingIndex] = dayData;
        } else {
          updatedHistory.push(dayData);
        }
      });
      setFinancialDataHistory(updatedHistory);
      
      // Show success message
      alert('Dữ liệu tài chính đã được lưu thành công!');
    }
  };
  
  // Calculate comprehensive F&B summary data from daily reports
  const calculateSummary = (report: BranchReportSummary): BranchReportSummary & {
    // F&B Key Performance Indicators
    avgFoodCostPercent: number;
    avgLaborCostPercent: number;
    totalCustomers: number;
    avgOrderValue: number;
    customerRetentionRate: number;
    totalWastageValue: number;
    avgWastagePercent: number;
    operationalEfficiency: number;
    incidentRate: number;
    feedbackResolutionRate: number;
    inventoryTurnover: number;
    ebitdaMargin: number;
    // Staff Performance
    avgStaffProductivity: number;
    avgOnTimeRate: number;
    staffTurnoverRate: number;
    // Staff Working Hours Summary
    totalWorkHours: number;
    totalOvertimeHours: number;
    avgDailyWorkHours: number;
    totalStaffCount: number;
    workHoursPerStaff: number;
    // Customer Satisfaction
    avgCustomerRating: number;
    totalPositiveFeedback: number;
    // Marketing Effectiveness
    totalVoucherValue: number;
    avgRedemptionRate: number;
    marketingROI: number;
  } => {
    if (!report.dailyData || report.dailyData.length === 0) {
      return { 
        ...report, 
        totalRevenue: 0, 
        kpiAchievementRate: 0, 
        avgNpsScore: 0,
        avgFoodCostPercent: 0,
        avgLaborCostPercent: 0,
        totalCustomers: 0,
        avgOrderValue: 0,
        customerRetentionRate: 0,
        totalWastageValue: 0,
        avgWastagePercent: 0,
        operationalEfficiency: 0,
        incidentRate: 0,
        feedbackResolutionRate: 0,
        inventoryTurnover: 0,
        ebitdaMargin: 0,
        avgStaffProductivity: 0,
        avgOnTimeRate: 0,
        staffTurnoverRate: 0,
        totalWorkHours: 0,
        totalOvertimeHours: 0,
        avgDailyWorkHours: 0,
        totalStaffCount: 0,
        workHoursPerStaff: 0,
        avgCustomerRating: 0,
        totalPositiveFeedback: 0,
        totalVoucherValue: 0,
        avgRedemptionRate: 0,
        marketingROI: 0
      };
    }
    
    const days = report.dailyData.length;
    
    // Core Financial Metrics
    const totalRevenue = report.dailyData.reduce((sum, day) => sum + (day.netSales || 0), 0);
    const avgKpi = report.dailyData.reduce((sum, day) => sum + (day.kpiAchievement || 0), 0) / days;
    const avgNps = report.dailyData.reduce((sum, day) => sum + (day.npsScore || 0), 0) / days;
    
    // F&B Specific KPIs
    const avgFoodCostPercent = report.dailyData.reduce((sum, day) => sum + (day.cogsPercent || 0), 0) / days;
    const avgLaborCostPercent = report.dailyData.reduce((sum, day) => sum + (day.laborPercent || 0), 0) / days;
    const avgOrderValue = report.dailyData.reduce((sum, day) => sum + (day.avgOrderValue || 0), 0) / days;
    const ebitdaMargin = report.dailyData.reduce((sum, day) => sum + (day.ebitdaMargin || 0), 0) / days;
    
    // Customer Metrics
    const totalCustomers = report.dailyData.reduce((sum, day) => sum + (day.newCustomers || 0) + (day.returningCustomers || 0), 0);
    const totalReturning = report.dailyData.reduce((sum, day) => sum + (day.returningCustomers || 0), 0);
    const customerRetentionRate = totalCustomers > 0 ? (totalReturning / totalCustomers) * 100 : 0;
    const avgCustomerRating = report.dailyData.reduce((sum, day) => sum + (day.avgRating || 0), 0) / days;
    
    // Operational Efficiency
    const totalWastageValue = report.dailyData.reduce((sum, day) => sum + (day.wastage || 0), 0);
    const avgWastagePercent = report.dailyData.reduce((sum, day) => sum + (day.wastagePercent || 0), 0) / days;
    const avgStaffProductivity = report.dailyData.reduce((sum, day) => sum + (day.productivityPerHour || 0), 0) / days;
    const avgOnTimeRate = report.dailyData.reduce((sum, day) => sum + (day.onTimeRate || 0), 0) / days;
    const staffTurnoverRate = report.dailyData.reduce((sum, day) => sum + (day.turnoverRate || 0), 0) / days;
    
    // Inventory Management
    const avgInventoryStart = report.dailyData.reduce((sum, day) => sum + (day.inventoryStart || 0), 0) / days;
    const totalSupplierValue = report.dailyData.reduce((sum, day) => sum + (day.supplierValue || 0), 0);
    const inventoryTurnover = avgInventoryStart > 0 ? totalSupplierValue / avgInventoryStart : 0;
    
    // Incident & Feedback Management
    const totalIncidents = report.dailyData.reduce((sum, day) => sum + (day.incidentsTotal || 0), 0);
    const incidentRate = totalIncidents / days;
    const totalFeedback = report.dailyData.reduce((sum, day) => sum + (day.feedbackTotal || 0), 0);
    const totalResolved = report.dailyData.reduce((sum, day) => sum + (day.feedbackResolved || 0), 0);
    const feedbackResolutionRate = totalFeedback > 0 ? (totalResolved / totalFeedback) * 100 : 0;
    const totalPositiveFeedback = Math.floor(totalFeedback * 0.75); // Estimate positive feedback
    
    // Marketing Performance
    const totalVoucherValue = report.dailyData.reduce((sum, day) => sum + (day.voucherValue || 0), 0);
    const avgRedemptionRate = report.dailyData.reduce((sum, day) => sum + (day.redemptionRate || 0), 0) / days;
    const totalCampaignRevenue = report.dailyData.reduce((sum, day) => sum + (day.campaignRevenue || 0), 0);
    const marketingROI = totalVoucherValue > 0 ? (totalCampaignRevenue / totalVoucherValue) * 100 : 0;
    
    // Staff Working Hours Summary
    const totalWorkHours = report.dailyData.reduce((sum, day) => {
      return sum + (day.staffDetails?.reduce((staffSum, staff) => staffSum + staff.workHours, 0) || day.workHours || 0);
    }, 0);
    
    const totalOvertimeHours = report.dailyData.reduce((sum, day) => {
      return sum + (day.staffDetails?.reduce((staffSum, staff) => staffSum + staff.overtimeHours, 0) || day.overtimeHours || 0);
    }, 0);
    
    const totalStaffCount = report.dailyData.reduce((sum, day) => {
      return sum + (day.staffDetails?.length || day.staffTotal || 0);
    }, 0);
    
    const avgDailyWorkHours = totalWorkHours / days;
    const workHoursPerStaff = totalStaffCount > 0 ? totalWorkHours / totalStaffCount : 0;
    
    // Overall Operational Efficiency Score (0-100)
    const operationalEfficiency = Math.round((
      (avgKpi * 0.3) + 
      (avgOnTimeRate * 0.2) + 
      ((100 - avgWastagePercent) * 0.2) + 
      (feedbackResolutionRate * 0.15) + 
      (Math.min(inventoryTurnover * 20, 100) * 0.15)
    ));
    
    return {
      ...report,
      totalRevenue,
      kpiAchievementRate: avgKpi,
      avgNpsScore: avgNps,
      avgFoodCostPercent,
      avgLaborCostPercent,
      totalCustomers,
      avgOrderValue,
      customerRetentionRate,
      totalWastageValue,
      avgWastagePercent,
      operationalEfficiency,
      incidentRate,
      feedbackResolutionRate,
      inventoryTurnover,
      ebitdaMargin,
      avgStaffProductivity,
      avgOnTimeRate,
      staffTurnoverRate,
      totalWorkHours,
      totalOvertimeHours,
      avgDailyWorkHours,
      totalStaffCount,
      workHoursPerStaff,
      avgCustomerRating,
      totalPositiveFeedback,
      totalVoucherValue,
      avgRedemptionRate,
      marketingROI
    };
  };
  
  // Update summary when currentReport changes
  useEffect(() => {
    if (currentReport && currentReport.dailyData.length > 0) {
      setSummaryData(calculateSummary(currentReport));
    }
  }, [currentReport]);
  
  // Save daily data
  const saveDailyData = async () => {
    if (!currentReport) {
      alert('Không có báo cáo để lưu');
      return;
    }
    
    try {
      const updatedDailyData = [...currentReport.dailyData];
      const existingIndex = updatedDailyData.findIndex(d => d.date === selectedDate);
      
      if (existingIndex >= 0) {
        updatedDailyData[existingIndex] = { ...dailyData, date: selectedDate };
      } else {
        updatedDailyData.push({ ...dailyData, date: selectedDate });
      }
      
      const updatedReport = {
        ...currentReport,
        dailyData: updatedDailyData
      };
      
      setCurrentReport(updatedReport);
      
      // Save to localStorage for persistence
      localStorage.setItem(`branch-report-${currentReport.reportId}`, JSON.stringify(updatedReport));
      
      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Bạn cần đăng nhập để lưu báo cáo');
        return;
      }
      
      // Prepare data for Supabase
      const reportData = {
        report_id: currentReport.reportId,
        branch_id: currentReport.branchId,
        branch_name: currentReport.branchName,
        manager_id: user.id,
        manager_name: currentReport.managerName,
        report_date: selectedDate,
        report_data: JSON.stringify(dailyData),
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Check if report already exists for this date
      const { data: existingReport, error: checkError } = await supabase
        .from('daily_reports')
        .select('id')
        .eq('report_id', currentReport.reportId)
        .eq('report_date', selectedDate)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Lỗi kiểm tra báo cáo:', checkError);
        alert('Có lỗi xảy ra khi kiểm tra báo cáo');
        return;
      }
      
      if (existingReport) {
        // Update existing report
        const { error: updateError } = await supabase
          .from('daily_reports')
          .update({
            report_data: JSON.stringify(dailyData),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingReport.id);
        
        if (updateError) {
          console.error('Lỗi cập nhật báo cáo:', updateError);
          alert('Có lỗi xảy ra khi cập nhật báo cáo vào Supabase');
          return;
        }
        
        alert('Báo cáo đã được cập nhật thành công!');
      } else {
        // Insert new report
        const { error: insertError } = await supabase
          .from('daily_reports')
          .insert([reportData]);
        
        if (insertError) {
          console.error('Lỗi lưu báo cáo:', insertError);
          alert('Có lỗi xảy ra khi lưu báo cáo vào Supabase');
          return;
        }
        
        alert('Báo cáo đã được lưu thành công!');
      }
      
      // Update consolidated table
      await updateConsolidatedTable();
      
    } catch (error) {
      console.error('Lỗi không mong muốn:', error);
      alert('Có lỗi không mong muốn xảy ra');
    }
  };
  
  // Update consolidated table
  const updateConsolidatedTable = async () => {
    try {
      if (!currentReport) return;
      
      // Get all daily reports for this branch
      const { data: dailyReports, error: fetchError } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('branch_id', currentReport.branchId)
        .order('report_date', { ascending: false });
      
      if (fetchError) {
        console.error('Lỗi lấy dữ liệu báo cáo:', fetchError);
        return;
      }
      
      if (!dailyReports || dailyReports.length === 0) return;
      
      // Calculate consolidated metrics
      const totalRevenue = dailyReports.reduce((sum, report) => {
        const data = JSON.parse(report.report_data);
        return sum + (data.totalDailyRevenue || 0);
      }, 0);
      
      const totalExpenses = dailyReports.reduce((sum, report) => {
        const data = JSON.parse(report.report_data);
        return sum + (data.totalDailyExpenses || 0);
      }, 0);
      
      const avgKpiAchievement = dailyReports.reduce((sum, report) => {
        const data = JSON.parse(report.report_data);
        return sum + (data.kpiAchievement || 0);
      }, 0) / dailyReports.length;
      
      const avgNpsScore = dailyReports.reduce((sum, report) => {
        const data = JSON.parse(report.report_data);
        return sum + (data.npsScore || 0);
      }, 0) / dailyReports.length;
      
      // Prepare consolidated data
      const consolidatedData = {
        branch_id: currentReport.branchId,
        branch_name: currentReport.branchName,
        manager_id: currentReport.managerId,
        manager_name: currentReport.managerName,
        period_start: dailyReports[dailyReports.length - 1].report_date,
        period_end: dailyReports[0].report_date,
        total_revenue: totalRevenue,
        total_expenses: totalExpenses,
        total_profit: totalRevenue - totalExpenses,
        avg_kpi_achievement: avgKpiAchievement,
        avg_nps_score: avgNpsScore,
        report_count: dailyReports.length,
        last_updated: new Date().toISOString()
      };
      
      // Check if consolidated record exists
      const { data: existingConsolidated, error: checkConsolidatedError } = await supabase
        .from('consolidated_reports')
        .select('id')
        .eq('branch_id', currentReport.branchId)
        .single();
      
      if (checkConsolidatedError && checkConsolidatedError.code !== 'PGRST116') {
        console.error('Lỗi kiểm tra bảng tổng hợp:', checkConsolidatedError);
        return;
      }
      
      if (existingConsolidated) {
        // Update existing consolidated record
        const { error: updateConsolidatedError } = await supabase
          .from('consolidated_reports')
          .update(consolidatedData)
          .eq('id', existingConsolidated.id);
        
        if (updateConsolidatedError) {
          console.error('Lỗi cập nhật bảng tổng hợp:', updateConsolidatedError);
        }
      } else {
        // Insert new consolidated record
        const { error: insertConsolidatedError } = await supabase
          .from('consolidated_reports')
          .insert([consolidatedData]);
        
        if (insertConsolidatedError) {
          console.error('Lỗi tạo bảng tổng hợp:', insertConsolidatedError);
        }
      }
    } catch (error) {
      console.error('Lỗi cập nhật bảng tổng hợp:', error);
    }
  };

  // Add new staff to current daily data
  const addNewStaff = () => {
    // Validation
    if (!newStaffData.name.trim()) {
      alert('Vui lòng nhập tên nhân viên');
      return;
    }
    
    if (!newStaffData.position.trim()) {
      alert('Vui lòng nhập vị trí công việc');
      return;
    }
    
    if (newStaffData.workHours < 0 || newStaffData.workHours > 24) {
      alert('Số giờ làm việc phải từ 0 đến 24 giờ');
      return;
    }
    
    if (newStaffData.overtimeHours < 0 || newStaffData.overtimeHours > 12) {
      alert('Số giờ tăng ca phải từ 0 đến 12 giờ');
      return;
    }
    
    if (newStaffData.productivity < 0 || newStaffData.productivity > 200) {
      alert('Năng suất phải từ 0% đến 200%');
      return;
    }

    const newStaff: StaffDetail = {
      ...newStaffData,
      id: `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    const updatedStaffDetails = [...(dailyData.staffDetails || []), newStaff];
    
    // Update staff counts based on type
    const staffCounts = {
      fulltime: updatedStaffDetails.filter(s => s.type === 'fulltime').length,
      parttime: updatedStaffDetails.filter(s => s.type === 'parttime').length,
      trial: updatedStaffDetails.filter(s => s.type === 'trial').length
    };
    
    // Calculate updated metrics
    const totalWorkHours = updatedStaffDetails.reduce((sum, staff) => sum + staff.workHours, 0);
    const totalOvertimeHours = updatedStaffDetails.reduce((sum, staff) => sum + staff.overtimeHours, 0);
    const onTimeCount = updatedStaffDetails.filter(staff => staff.onTime).length;
    const avgProductivity = updatedStaffDetails.reduce((sum, staff) => sum + staff.productivity, 0) / updatedStaffDetails.length;
    const onTimeRate = updatedStaffDetails.length > 0 ? (onTimeCount / updatedStaffDetails.length) * 100 : 0;
    
    // Update shift counts
    const shiftCounts = {
      morning: updatedStaffDetails.filter(s => s.shift === 'morning').length,
      afternoon: updatedStaffDetails.filter(s => s.shift === 'afternoon').length,
      evening: updatedStaffDetails.filter(s => s.shift === 'evening').length
    };

    const updatedDailyData = {
      ...dailyData,
      staffDetails: updatedStaffDetails,
      staffTotal: updatedStaffDetails.length,
      staffFulltime: staffCounts.fulltime,
      staffParttime: staffCounts.parttime,
      staffTrial: staffCounts.trial,
      workHours: totalWorkHours,
      overtimeHours: totalOvertimeHours,
      onTimeRate: onTimeRate,
      productivityPerHour: avgProductivity,
      shiftsMorning: shiftCounts.morning,
      shiftsAfternoon: shiftCounts.afternoon,
      shiftsEvening: shiftCounts.evening,
      shiftsTotal: updatedStaffDetails.length
    };

    setDailyData(updatedDailyData);
    
    // Update current report with new daily data
    const updatedReport = {
      ...currentReport,
      dailyData: currentReport.dailyData.map(data => 
        data.date === selectedDate ? updatedDailyData : data
      )
    };
    
    setCurrentReport(updatedReport);
    
    // Save to localStorage for persistence
    localStorage.setItem(`branch-report-${currentReport.reportId}`, JSON.stringify(updatedReport));
    
    // Reset form data
    setNewStaffData({
      name: '',
      position: '',
      type: 'fulltime',
      shift: 'morning',
      workHours: 8,
      overtimeHours: 0,
      onTime: true,
      productivity: 100,
      notes: ''
    });
    
    setShowAddStaffModal(false);
    
    // Show success message
    alert(`Đã thêm nhân viên ${newStaffData.name} thành công!`);
  };

  // Print report function
  const exportToExcel = () => {
    if (!summaryData && !currentReport) {
      alert('Không có dữ liệu báo cáo để xuất');
      return;
    }

    // Import xlsx dynamically
    import('xlsx').then((XLSX) => {
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Create main report sheet
      const reportData = [
        ['BÁO CÁO TỔNG HỢP F&B'],
        [''],
        ['Chi nhánh:', currentReport?.branchName || 'Chi nhánh'],
        ['Kỳ báo cáo:', `${reportPeriod} ngày (${currentReport?.startDate} - ${currentReport?.endDate})`],
        ['Người tạo:', currentReport?.managerName || ''],
        ['Ngày tạo:', new Date().toLocaleDateString('vi-VN')],
        [''],
        ['CHỈ SỐ TÀI CHÍNH CỐT LÕI'],
        ['Tổng Doanh thu (VNĐ):', summaryData?.totalRevenue || 0],
        ['Giá trị TB/Đơn (VNĐ):', summaryData?.avgOrderValue || 0],
        ['Chi phí Thực phẩm (%):', summaryData?.avgFoodCostPercent || 0],
        ['Lợi nhuận EBITDA (%):', summaryData?.ebitdaMargin || 0],
        [''],
        ['TỔNG HỢP GIỜ LÀM VIỆC NHÂN SỰ'],
        ['Tổng Giờ làm việc:', summaryData?.totalWorkHours || 0],
        ['Tổng Giờ tăng ca:', summaryData?.totalOvertimeHours || 0],
        ['Tổng Nhân viên:', summaryData?.totalStaffCount || 0],
        ['Giờ/Nhân viên:', summaryData?.workHoursPerStaff || 0],
        [''],
        ['CHI TIẾT NHÂN VIÊN THEO NGÀY']
      ];
      
      // Add daily staff details header
      reportData.push(['Ngày', 'Tổng NV', 'Giờ làm việc', 'Giờ tăng ca', 'Tỷ lệ đúng giờ (%)', 'Năng suất TB (%)']);
      
      // Add daily staff data
      if (currentReport?.dailyData?.length) {
        currentReport.dailyData.forEach(day => {
          reportData.push([
            new Date(day.date).toLocaleDateString('vi-VN'),
            day.staffTotal || 0,
            day.workHours || 0,
            day.overtimeHours || 0,
            Math.round(day.onTimeRate || 0),
            Math.round(day.productivityPerHour || 0)
          ]);
        });
      } else {
        reportData.push(['Không có dữ liệu chi tiết']);
      }
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(reportData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 25 }, // Column A
        { wch: 20 }, // Column B
        { wch: 15 }, // Column C
        { wch: 15 }, // Column D
        { wch: 20 }, // Column E
        { wch: 20 }  // Column F
      ];
      
      // Style the header
      if (ws['A1']) {
        ws['A1'].s = {
          font: { bold: true, sz: 16 },
          alignment: { horizontal: 'center' }
        };
      }
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo tổng hợp');
      
      // Generate filename with date
      const today = new Date().toLocaleDateString('vi-VN').replace(/\//g, '_');
      const filename = `Bao_cao_tong_hop_FB_${today}_${reportPeriod}ngay.xlsx`;
      
      // Save the file
      XLSX.writeFile(wb, filename);
      
      alert('Đã xuất file Excel thành công!');
    }).catch((error) => {
      console.error('Lỗi khi xuất Excel:', error);
      alert('Có lỗi xảy ra khi xuất file Excel');
    });
  };
  
  // Generate realistic staff details
  const generateStaffDetails = (totalStaff: number, date: string): StaffDetail[] => {
    const staffNames = [
      // Bếp trưởng và Phó bếp
      'Nguyễn Văn Đức', 'Trần Minh Tuấn', 'Lê Thành Long', 'Phạm Văn Hùng',
      // Bếp chính và Bếp phụ
      'Hoàng Thị Lan', 'Vũ Văn Nam', 'Đặng Thị Hoa', 'Bùi Minh Quang', 'Ngô Thị Mai',
      'Lý Văn Tài', 'Đinh Thị Nga', 'Tạ Văn Phong', 'Phan Thị Linh', 'Chu Văn Dũng',
      // Phục vụ và Thu ngân
      'Dương Thị Thảo', 'Lưu Văn Khôi', 'Võ Thị Yến', 'Đỗ Văn Minh', 'Trịnh Thị Hương',
      'Hồ Văn Bình', 'Nguyễn Thị Xuân', 'Trần Văn Sơn', 'Lê Thị Phương', 'Phạm Văn Toàn',
      // Pha chế và Tạp vụ
      'Hoàng Thị Thu', 'Vũ Văn Đạt', 'Đặng Thị Nhung', 'Bùi Văn Hiếu', 'Ngô Thị Trang',
      'Lý Văn Cường', 'Đinh Thị Oanh', 'Tạ Văn Kiên', 'Phan Thị Dung', 'Chu Văn Thắng'
    ];
    
    const positions = [
      'Bếp trưởng', 'Phó bếp', 'Bếp chính', 'Bếp phụ', 'Phục vụ trưởng', 
      'Phục vụ chính', 'Phục vụ', 'Thu ngân', 'Pha chế', 'Tạp vụ', 'Bảo vệ'
    ];
    
    const shifts: ('morning' | 'afternoon' | 'evening')[] = ['morning', 'afternoon', 'evening'];
    const types: ('fulltime' | 'parttime' | 'trial')[] = ['fulltime', 'parttime', 'trial'];
    
    return Array.from({ length: totalStaff }, (_, index) => {
      const workHours = 6 + Math.random() * 4; // 6-10 hours
      const overtimeHours = Math.random() > 0.7 ? Math.random() * 2 : 0; // 30% chance of OT
      
      return {
        id: `staff-${date}-${index + 1}`,
        name: staffNames[index % staffNames.length],
        position: positions[index % positions.length],
        type: index < totalStaff * 0.6 ? 'fulltime' : (index < totalStaff * 0.9 ? 'parttime' : 'trial'),
        shift: shifts[index % 3],
        workHours: Math.round(workHours * 10) / 10,
        overtimeHours: Math.round(overtimeHours * 10) / 10,
        onTime: Math.random() > 0.15, // 85% on-time rate
        productivity: Math.round((70 + Math.random() * 30) * 10) / 10, // 70-100% productivity
        notes: Math.random() > 0.8 ? 'Cần training thêm' : (Math.random() > 0.9 ? 'Xuất sắc trong ca' : '')
      };
    });
  };

  // Professional F&B Mockup Data Generator - Realistic Industry Metrics

  const generateMockupData = (date: string): DailyReportData => {
    const dayOfWeek = new Date(date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isPeakDay = dayOfWeek === 5 || dayOfWeek === 6; // Friday-Saturday peak
    const multiplier = isWeekend ? 1.4 : (isPeakDay ? 1.2 : 1.0);
    const seasonalFactor = 0.9 + Math.random() * 0.2; // 0.9-1.1 seasonal variation
    
    // Generate staff numbers
    const staffTotal = Math.floor((15 + Math.random() * 5) * multiplier); // 15-20 staff
    const staffFulltime = Math.floor(staffTotal * 0.6); // 60% fulltime
    const staffParttime = Math.floor(staffTotal * 0.3); // 30% parttime
    const staffTrial = staffTotal - staffFulltime - staffParttime; // Remaining are trial
    
    // Generate detailed staff list
    const staffDetails = generateStaffDetails(staffTotal, date);
    const totalWorkHours = staffDetails.reduce((sum, staff) => sum + staff.workHours, 0);
    const totalOvertimeHours = staffDetails.reduce((sum, staff) => sum + staff.overtimeHours, 0);
    const onTimeCount = staffDetails.filter(staff => staff.onTime).length;
    const avgProductivity = staffDetails.reduce((sum, staff) => sum + staff.productivity, 0) / staffDetails.length;
    
    return {
      date,
      // 1. Báo cáo Nhân sự (Sáp nhập Nhân sự + Ca làm việc)
      staffDetails,
      staffTotal,
      staffFulltime,
      staffParttime,
      staffTrial,
      workHours: Math.round(totalWorkHours),
      overtimeHours: Math.round(totalOvertimeHours * 10) / 10,
      onTimeRate: Math.round((onTimeCount / staffTotal) * 100 * 10) / 10,
      productivityPerHour: Math.round(avgProductivity * 10) / 10,
      turnoverRate: 3 + Math.random() * 4, // 3-7% monthly (F&B high turnover)
      staffIssues: Math.random() > 0.75 ? 'Cần training thêm về food safety và customer service' : '',
      staffNotes: 'Đội ngũ bếp và phục vụ phối hợp tốt, cần tăng cường training cho nhân viên mới',
      
      // 2. Ca làm việc - F&B Shift Operations
      shiftsTotal: 3, // Breakfast, Lunch, Dinner
      shiftsMorning: 1, // 6:00-14:00 (Breakfast + Lunch prep)
      shiftsAfternoon: 1, // 14:00-18:00 (Lunch service + Dinner prep)
      shiftsEvening: 1, // 18:00-23:00 (Dinner service + cleanup)
      reportsComplete: Math.floor(2 + Math.random() * 2), // Shift handover reports
      shiftIssues: Math.random() > 0.8 ? 'Bếp chính gặp sự cố nhẹ trong rush hour, đã xử lý' : '',
      kpiAchievement: 85 + Math.random() * 12, // 85-97% (realistic F&B KPI)
      shiftNotes: 'Peak hours 12:00-13:30 và 19:00-21:00 vận hành tốt, cần optimize thời gian chế biến',
      
      // 3. Marketing & Khách hàng - F&B Customer Engagement
      campaigns: isPeakDay ? 'Weekend Family Combo, Happy Hour 17:00-19:00' : 'Lunch Set Menu, Loyalty Points 2x',
      vouchersUsed: Math.floor((35 + Math.random() * 25) * multiplier), // Higher F&B voucher usage
      voucherValue: Math.floor((680000 + Math.random() * 320000) * multiplier), // Average F&B voucher value
      redemptionRate: 72 + Math.random() * 18, // 72-90% (F&B higher redemption)
      campaignRevenue: Math.floor((4200000 + Math.random() * 1800000) * multiplier * seasonalFactor),
      newCustomers: Math.floor((12 + Math.random() * 8) * multiplier), // Walk-ins + delivery
      returningCustomers: Math.floor((65 + Math.random() * 25) * multiplier), // Strong repeat business
      npsScore: 7.5 + Math.random() * 1.8, // 7.5-9.3 (F&B customer satisfaction)
      avgRating: 4.1 + Math.random() * 0.7, // 4.1-4.8 (realistic F&B rating)
      negativeReviews: Math.floor(Math.random() * 4), // 0-3 negative reviews
      marketingNotes: 'Combo gia đình và happy hour thu hút khách tốt, cần mở rộng delivery radius',
      
      // 4. Hàng hóa & Kho - F&B Inventory Management
      inventoryStart: Math.floor((1200000 + Math.random() * 300000) * seasonalFactor), // Fresh ingredients value
      inventoryEnd: Math.floor((1050000 + Math.random() * 250000) * seasonalFactor), // End of day inventory
      wastage: Math.floor((25000 + Math.random() * 15000) * multiplier), // F&B higher wastage
      wastagePercent: 2.2 + Math.random() * 1.8, // 2.2-4.0% (F&B realistic wastage)
      supplierOrders: Math.floor(3 + Math.random() * 3), // 3-5 daily deliveries (fresh produce)
      supplierValue: Math.floor((480000 + Math.random() * 220000) * seasonalFactor), // Daily procurement
      stockoutDays: Math.floor(Math.random() * 2), // 0-1 stockout incidents
      inventoryNotes: 'Seafood và rau củ tươi cần kiểm soát nhiệt độ chặt chẽ, inventory turnover 3.2 lần/tuần',
      
      // 5. Sự cố - F&B Incident Management
      incidentsTotal: Math.floor(Math.random() * 4), // 0-3 incidents
      incidentsEquipment: Math.floor(Math.random() * 2), // Kitchen equipment issues
      incidentsStaff: Math.floor(Math.random() * 2), // Staff-related incidents
      incidentsCustomer: Math.floor(Math.random() * 2), // Customer complaints
      incidentsSafety: Math.floor(Math.random() * 1), // Food safety incidents
      incidentCost: Math.floor(Math.random() * 800000), // Higher F&B incident costs
      incidentsResolved: Math.floor(Math.random() * 3), // Resolution tracking
      incidentNotes: Math.random() > 0.7 ? 'Bếp gas cần maintenance, đã liên hệ kỹ thuật. Food safety audit passed' : 'Vận hành bình thường, tuân thủ HACCP',
      
      // 6. Phản ánh - F&B Customer Feedback Management
      feedbackTotal: Math.floor((12 + Math.random() * 8) * multiplier), // Higher F&B feedback volume
      feedbackResolved: Math.floor((9 + Math.random() * 6) * multiplier), // Active resolution
      avgResolutionTime: 12 + Math.random() * 18, // 12-30 minutes (faster F&B response)
      pendingFeedback: Math.floor(Math.random() * 4), // 0-3 pending
      feedbackNotes: 'Khách khen ngợi presentation món ăn và tốc độ phục vụ, cần cải thiện âm thanh không gian',
      
      // 7. Tài chính - F&B Financial Performance
      netSales: Math.floor((18500000 + Math.random() * 7500000) * multiplier * seasonalFactor), // Higher F&B revenue
      avgOrderValue: Math.floor((245000 + Math.random() * 85000) * multiplier), // F&B average ticket
      cogsPercent: 32 + Math.random() * 6, // 32-38% (F&B food cost)
      laborPercent: 28 + Math.random() * 5, // 28-33% (F&B labor cost)
      cashVariance: Math.floor((Math.random() - 0.5) * 150000), // -75k to +75k (higher F&B variance)
      ebitdaMargin: 15 + Math.random() * 8, // 15-23% (realistic F&B margin)
      financialNotes: 'Food cost tăng 2% do giá nguyên liệu, cần review menu pricing. Labor efficiency cải thiện 5%'
    };
  };
  
  // Reset all data to zero
  const resetAllData = () => {
    const emptyData = getEmptyDailyData(selectedDate);
    setDailyData(emptyData);
    
    // Clear localStorage
    localStorage.removeItem('centerDashboardData');
    
    // Show confirmation
    alert('Đã reset toàn bộ dữ liệu về 0. Bạn có thể bắt đầu nhập dữ liệu mới.');
  };

  // Load daily data for selected date
  const loadDailyData = (date: string) => {
    if (!currentReport) return;
    
    const existingData = currentReport.dailyData.find(d => d.date === date);
    if (existingData) {
      setDailyData(existingData);
    } else {
      // Start with empty data for new date - user can input manually
      const emptyData = getEmptyDailyData(date);
      setDailyData(emptyData);
    }
  };
  
  useEffect(() => {
    loadDailyData(selectedDate);
  }, [selectedDate, currentReport]);
  
  // Initialize history data when component mounts
  useEffect(() => {
    setActivityLogs(generateMockActivityLogs());
    setAccountActivities(generateMockAccountActivities());
    setReportAudits(generateMockReportAudits());
  }, []);
  
  // Generate mock activity logs
  const generateMockActivityLogs = (): ActivityLog[] => {
    const actions: ActivityLog['action'][] = ['login', 'logout', 'create_report', 'update_report', 'view_report', 'export_data'];
    const users = [
      { id: 'user1', name: 'Nguyễn Văn A', role: 'branch_manager' },
      { id: 'user2', name: 'Trần Thị B', role: 'center_manager' },
      { id: 'user3', name: 'Lê Văn C', role: 'admin' }
    ];
    
    const logs: ActivityLog[] = [];
    
    for (let i = 0; i < 50; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      logs.push({
        id: `log-${i + 1}`,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action,
        targetType: action.includes('report') ? 'daily_report' : 'account',
        targetId: action.includes('report') ? `RPT-${Math.floor(Math.random() * 1000)}` : undefined,
        targetName: action.includes('report') ? `Báo cáo ngày ${timestamp.toISOString().split('T')[0]}` : undefined,
        description: getActionDescription(action, user.name),
        timestamp: timestamp.toISOString(),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
    }
    
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };
  
  const getActionDescription = (action: ActivityLog['action'], userName: string): string => {
    const descriptions = {
      login: `${userName} đăng nhập vào hệ thống`,
      logout: `${userName} đăng xuất khỏi hệ thống`,
      create_report: `${userName} tạo báo cáo mới`,
      update_report: `${userName} cập nhật báo cáo`,
      view_report: `${userName} xem báo cáo`,
      export_data: `${userName} xuất dữ liệu báo cáo`,
      approve_report: `${userName} phê duyệt báo cáo`,
      reject_report: `${userName} từ chối báo cáo`,
      delete_report: `${userName} xóa báo cáo`
    };
    return descriptions[action] || `${userName} thực hiện ${action}`;
  };
  
  // Generate mock account activities
  const generateMockAccountActivities = (): AccountActivity[] => {
    return [
      {
        userId: 'user1',
        userName: 'Nguyễn Văn A',
        email: 'manager.hn35@rangroup.vn',
        role: 'branch_manager',
        branch: 'HN35',
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        loginCount: 45,
        reportCount: 12,
        lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'active'
      },
      {
        userId: 'user2',
        userName: 'Trần Thị B',
        email: 'manager.hn40@rangroup.vn',
        role: 'branch_manager',
        branch: 'HN40',
        lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        loginCount: 38,
        reportCount: 10,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      },
      {
        userId: 'user3',
        userName: 'Lê Văn C',
        email: 'admin@rangroup.vn',
        role: 'admin',
        branch: 'ALL',
        lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        loginCount: 120,
        reportCount: 0,
        lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'active'
      }
    ];
  };
  
  // Generate mock report audits
  const generateMockReportAudits = (): ReportAudit[] => {
    const reportTypes: ('daily' | 'summary')[] = ['daily', 'summary'];
    const statuses: ('draft' | 'submitted' | 'approved' | 'rejected')[] = ['draft', 'submitted', 'approved', 'rejected'];
    const users = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'];
    
    const audits: ReportAudit[] = [];
    
    for (let i = 0; i < 7; i++) {
      const reportDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const createdAt = new Date(reportDate.getTime() + Math.random() * 8 * 60 * 60 * 1000);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const creator = users[Math.floor(Math.random() * users.length)];
      
      audits.push({
        reportId: `RPT-${Date.now()}-${i}`,
        reportType: reportTypes[Math.floor(Math.random() * reportTypes.length)],
        reportDate: reportDate.toISOString().split('T')[0],
        createdBy: creator,
        createdAt: createdAt.toISOString(),
        lastModifiedBy: Math.random() > 0.5 ? users[Math.floor(Math.random() * users.length)] : undefined,
        lastModifiedAt: Math.random() > 0.5 ? new Date(createdAt.getTime() + Math.random() * 4 * 60 * 60 * 1000).toISOString() : undefined,
        approvedBy: status === 'approved' ? users[2] : undefined,
        approvedAt: status === 'approved' ? new Date(createdAt.getTime() + 2 * 60 * 60 * 1000).toISOString() : undefined,
        status,
        changeHistory: [],
        exportHistory: []
      });
    }
    
    return audits.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };
  
  // Initialize history data
  useEffect(() => {
    setActivityLogs(generateMockActivityLogs());
    setAccountActivities(generateMockAccountActivities());
    setReportAudits(generateMockReportAudits());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-background to-accent-soft">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src={ranGroupLogo} 
                alt="RAN Group Logo" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-primary">Báo cáo Trung tâm</h1>
                <p className="text-sm text-muted-foreground">Tổng hợp báo cáo các chi nhánh</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{userData.email}</span>
                <Badge variant="secondary" className="capitalize">
                  {userData.role}
                </Badge>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={resetAllData}
                className="flex items-center space-x-2"
              >
                <XCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Reset về 0</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/account-settings')}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Cài đặt</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-2">
                    Chào mừng đến Báo cáo Trung tâm
                  </h2>
                  <p className="text-muted-foreground">
                    Quản lý và theo dõi báo cáo từ tất cả các chi nhánh RAN Group
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-primary">
                  <Building2 className="h-8 w-8" />
                  <PieChart className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Mode Selection */}
        <div className="mb-8">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'input' | 'summary' | 'history')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="input">Báo cáo Hàng ngày</TabsTrigger>
              <TabsTrigger value="summary">Tổng hợp</TabsTrigger>
              <TabsTrigger value="history">Lịch sử</TabsTrigger>
            </TabsList>
            
            <TabsContent value="input" className="space-y-6">
              {/* Report Info Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Thông tin Báo cáo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="report-date">Ngày báo cáo</Label>
                    <Input
                      id="report-date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="report-period">Kỳ báo cáo</Label>
                    <Select value={reportPeriod} onValueChange={(value) => setReportPeriod(value as '7' | '30' | '90')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 ngày</SelectItem>
                        <SelectItem value="30">30 ngày</SelectItem>
                        <SelectItem value="90">90 ngày</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Chi nhánh</Label>
                    <Select value={currentReport?.branchName || ''} onValueChange={(value) => {
                      if (currentReport) {
                        setCurrentReport({...currentReport, branchName: value});
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chi nhánh" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chi nhánh Trung tâm">Chi nhánh Trung tâm</SelectItem>
                        <SelectItem value="Chi nhánh 35 Nguyễn Bỉnh Khiêm">Chi nhánh 35 Nguyễn Bỉnh Khiêm</SelectItem>
                        <SelectItem value="Chi nhánh 40 Ngô Quyền">Chi nhánh 40 Ngô Quyền</SelectItem>
                        <SelectItem value="Chi nhánh Đống Đa">Chi nhánh Đống Đa</SelectItem>
                        <SelectItem value="Chi nhánh Cầu Giấy">Chi nhánh Cầu Giấy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              {/* Daily Input Forms */}
              <div className="space-y-6">
                {/* 1. Báo cáo Nhân sự (Sáp nhập Nhân sự + Ca làm việc) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span>Báo cáo Nhân sự</span>
                    </CardTitle>
                    <CardDescription>
                      Thông tin chi tiết nhân viên và ca làm việc
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Tổng quan nhân sự */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Tổng nhân viên</Label>
                        <Input 
                          type="number" 
                          value={dailyData.staffTotal || 0} 
                          onChange={(e) => {
                            const value = Math.max(0, parseInt(e.target.value) || 0);
                            setDailyData({...dailyData, staffTotal: value});
                          }}
                        />
                      </div>
                      <div>
                        <Label>Fulltime</Label>
                        <Input 
                          type="number" 
                          value={dailyData.staffFulltime || 0} 
                          onChange={(e) => {
                            const value = Math.max(0, parseInt(e.target.value) || 0);
                            setDailyData({...dailyData, staffFulltime: value});
                          }}
                        />
                      </div>
                      <div>
                        <Label>Part-time</Label>
                        <Input 
                          type="number" 
                          value={dailyData.staffParttime || 0} 
                          onChange={(e) => {
                            const value = Math.max(0, parseInt(e.target.value) || 0);
                            setDailyData({...dailyData, staffParttime: value});
                          }}
                        />
                      </div>
                      <div>
                        <Label>Thử việc</Label>
                        <Input 
                          type="number" 
                          value={dailyData.staffTrial || 0} 
                          onChange={(e) => {
                            const value = Math.max(0, parseInt(e.target.value) || 0);
                            setDailyData({...dailyData, staffTrial: value});
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* KPI nhân sự */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Tổng giờ làm việc</Label>
                        <Input 
                          type="number" 
                          value={dailyData.workHours || 0} 
                          onChange={(e) => {
                            const value = Math.max(0, parseFloat(e.target.value) || 0);
                            setDailyData({...dailyData, workHours: value});
                          }}
                        />
                      </div>
                      <div>
                        <Label>Giờ tăng ca</Label>
                        <Input 
                          type="number" 
                          value={dailyData.overtimeHours || 0} 
                          onChange={(e) => {
                            const value = Math.max(0, parseFloat(e.target.value) || 0);
                            setDailyData({...dailyData, overtimeHours: value});
                          }}
                        />
                      </div>
                      <div>
                        <Label>Tỷ lệ đúng giờ (%)</Label>
                        <Input 
                          type="number" 
                          value={Math.round(dailyData.onTimeRate || 0)} 
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                            setDailyData({...dailyData, onTimeRate: value});
                          }}
                        />
                      </div>
                      <div>
                        <Label>Năng suất TB (%)</Label>
                        <Input 
                          type="number" 
                          value={Math.round(dailyData.productivityPerHour || 0)} 
                          onChange={(e) => {
                            const value = Math.max(0, parseFloat(e.target.value) || 0);
                            setDailyData({...dailyData, productivityPerHour: value});
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Thông tin ca làm việc */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Tổng ca</Label>
                        <Input 
                          type="number" 
                          value={dailyData.shiftsTotal || 0} 
                          onChange={(e) => {
                            const value = Math.max(0, parseInt(e.target.value) || 0);
                            setDailyData({...dailyData, shiftsTotal: value});
                          }}
                        />
                      </div>
                      <div>
                        <Label>Ca sáng</Label>
                        <Input 
                          type="number" 
                          value={dailyData.shiftsMorning || 0} 
                          onChange={(e) => {
                            const value = Math.max(0, parseInt(e.target.value) || 0);
                            setDailyData({...dailyData, shiftsMorning: value});
                          }}
                        />
                      </div>
                      <div>
                        <Label>Ca chiều</Label>
                        <Input 
                          type="number" 
                          value={dailyData.shiftsAfternoon || 0} 
                          onChange={(e) => {
                            const value = Math.max(0, parseInt(e.target.value) || 0);
                            setDailyData({...dailyData, shiftsAfternoon: value});
                          }}
                        />
                      </div>
                      <div>
                        <Label>Ca tối</Label>
                        <Input 
                          type="number" 
                          value={dailyData.shiftsEvening || 0} 
                          onChange={(e) => {
                            const value = Math.max(0, parseInt(e.target.value) || 0);
                            setDailyData({...dailyData, shiftsEvening: value});
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Bảng chi tiết nhân viên */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <Label className="text-base font-semibold">Chi tiết nhân viên</Label>
                        <Button variant="outline" size="sm" onClick={() => setShowAddStaffModal(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Thêm nhân viên
                        </Button>
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left font-medium">Tên nhân viên</th>
                                <th className="px-3 py-2 text-left font-medium">Vị trí</th>
                                <th className="px-3 py-2 text-left font-medium">Loại</th>
                                <th className="px-3 py-2 text-left font-medium">Ca</th>
                                <th className="px-3 py-2 text-right font-medium">Giờ làm</th>
                                <th className="px-3 py-2 text-right font-medium">Tăng ca</th>
                                <th className="px-3 py-2 text-center font-medium">Đúng giờ</th>
                                <th className="px-3 py-2 text-right font-medium">Năng suất</th>
                                <th className="px-3 py-2 text-left font-medium">Ghi chú</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(dailyData.staffDetails || []).map((staff, index) => (
                                <tr key={staff.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-3 py-2 font-medium">{staff.name}</td>
                                  <td className="px-3 py-2">{staff.position}</td>
                                  <td className="px-3 py-2">
                                    <Badge variant={staff.type === 'fulltime' ? 'default' : staff.type === 'parttime' ? 'secondary' : 'outline'}>
                                      {staff.type === 'fulltime' ? 'Full-time' : staff.type === 'parttime' ? 'Part-time' : 'Thử việc'}
                                    </Badge>
                                  </td>
                                  <td className="px-3 py-2">
                                    <Badge variant="outline">
                                      {staff.shift === 'morning' ? 'Sáng' : staff.shift === 'afternoon' ? 'Chiều' : 'Tối'}
                                    </Badge>
                                  </td>
                                  <td className="px-3 py-2 text-right">{staff.workHours}h</td>
                                  <td className="px-3 py-2 text-right">{staff.overtimeHours}h</td>
                                  <td className="px-3 py-2 text-center">
                                    {staff.onTime ? (
                                      <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-right">{staff.productivity}%</td>
                                  <td className="px-3 py-2 text-sm text-gray-600">{staff.notes}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    
                    {/* Ghi chú */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Ghi chú nhân sự</Label>
                        <Textarea 
                          value={dailyData.staffNotes || ''} 
                          onChange={(e) => setDailyData({...dailyData, staffNotes: e.target.value})}
                          placeholder="Ghi chú về tình hình nhân sự, vấn đề cần lưu ý..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Ghi chú ca làm việc</Label>
                        <Textarea 
                          value={dailyData.shiftNotes || ''} 
                          onChange={(e) => setDailyData({...dailyData, shiftNotes: e.target.value})}
                          placeholder="Ghi chú về ca làm việc, vấn đề trong ca..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 3. Marketing & Khách hàng */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <span>Marketing & Khách hàng</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Chiến dịch hiện tại</Label>
                      <Input 
                        value={dailyData.campaigns || ''} 
                        onChange={(e) => setDailyData({...dailyData, campaigns: e.target.value})}
                        placeholder="Nhập tên chiến dịch hiện tại"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Voucher sử dụng</Label>
                        <Input 
                          type="number" 
                          value={dailyData.vouchersUsed || 0} 
                          onChange={(e) => setDailyData({...dailyData, vouchersUsed: parseInt(e.target.value) || 0})}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label>Giá trị voucher (VNĐ)</Label>
                        <Input 
                          type="number" 
                          value={dailyData.voucherValue || 0} 
                          onChange={(e) => setDailyData({...dailyData, voucherValue: parseInt(e.target.value) || 0})}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label>Khách mới</Label>
                        <Input 
                          type="number" 
                          value={dailyData.newCustomers || 0} 
                          onChange={(e) => setDailyData({...dailyData, newCustomers: parseInt(e.target.value) || 0})}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label>Khách quay lại</Label>
                        <Input 
                          type="number" 
                          value={dailyData.returningCustomers || 0} 
                          onChange={(e) => setDailyData({...dailyData, returningCustomers: parseInt(e.target.value) || 0})}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label>NPS Score (0-10)</Label>
                        <Input 
                          type="number" 
                          value={dailyData.npsScore || 0} 
                          onChange={(e) => setDailyData({...dailyData, npsScore: parseFloat(e.target.value) || 0})}
                          min="0"
                          max="10"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <Label>Đánh giá TB (1-5)</Label>
                        <Input 
                          type="number" 
                          value={dailyData.avgRating || 0} 
                          onChange={(e) => setDailyData({...dailyData, avgRating: parseFloat(e.target.value) || 0})}
                          min="1"
                          max="5"
                          step="0.1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Ghi chú marketing</Label>
                      <Textarea 
                        value={dailyData.marketingNotes || ''} 
                        onChange={(e) => setDailyData({...dailyData, marketingNotes: e.target.value})}
                        placeholder="Ghi chú về hoạt động marketing và khách hàng"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Tài chính */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Tài chính
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Thu nhập chi tiết */}
                    <div>
                      <h4 className="font-semibold mb-3 text-green-700">💰 Thu nhập</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Doanh thu tiền mặt (VNĐ)</Label>
                          <Input 
                            type="number" 
                            value={dailyData.cashRevenue || 0} 
                            onChange={(e) => updateFinancialData(selectedDate, 'cashRevenue', parseInt(e.target.value) || 0)}
                            min="0"
                          />
                        </div>
                        <div>
                          <Label>Doanh thu thẻ (VNĐ)</Label>
                          <Input 
                            type="number" 
                            value={dailyData.cardRevenue || 0} 
                            onChange={(e) => updateFinancialData(selectedDate, 'cardRevenue', parseInt(e.target.value) || 0)}
                            min="0"
                          />
                        </div>
                        <div>
                          <Label>Doanh thu online (VNĐ)</Label>
                          <Input 
                            type="number" 
                            value={dailyData.onlineRevenue || 0} 
                            onChange={(e) => updateFinancialData(selectedDate, 'onlineRevenue', parseInt(e.target.value) || 0)}
                            min="0"
                          />
                        </div>
                        <div>
                          <Label>Thu nhập khác (VNĐ)</Label>
                          <Input 
                            type="number" 
                            value={dailyData.otherRevenue || 0} 
                            onChange={(e) => updateFinancialData(selectedDate, 'otherRevenue', parseInt(e.target.value) || 0)}
                            min="0"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Tổng thu nhập ngày (VNĐ)</Label>
                          <Input 
                            type="number" 
                            value={dailyData.totalDailyRevenue || 0} 
                            readOnly 
                            className="bg-green-50 font-semibold text-green-700"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Chi phí chi tiết */}
                    <div>
                      <h4 className="font-semibold mb-3 text-red-700">💸 Chi phí</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Chi phí nguyên liệu (VNĐ)</Label>
                          <Input 
                            type="number" 
                            value={dailyData.foodCost || 0} 
                            onChange={(e) => updateFinancialData(selectedDate, 'foodCost', parseInt(e.target.value) || 0)}
                            min="0"
                          />
                        </div>
                        <div>
                          <Label>Chi phí nhân công (VNĐ)</Label>
                          <Input 
                            type="number" 
                            value={dailyData.laborCost || 0} 
                            onChange={(e) => updateFinancialData(selectedDate, 'laborCost', parseInt(e.target.value) || 0)}
                            min="0"
                          />
                        </div>
                        <div>
                          <Label>Chi phí điện nước (VNĐ)</Label>
                          <Input 
                            type="number" 
                            value={dailyData.utilityCost || 0} 
                            onChange={(e) => updateFinancialData(selectedDate, 'utilityCost', parseInt(e.target.value) || 0)}
                            min="0"
                          />
                        </div>
                        <div>
                          <Label>Chi phí thuê mặt bằng (VNĐ)</Label>
                          <Input 
                            type="number" 
                            value={dailyData.rentCost || 0} 
                            onChange={(e) => updateFinancialData(selectedDate, 'rentCost', parseInt(e.target.value) || 0)}
                            min="0"
                          />
                        </div>
                        <div>
                          <Label>Chi phí marketing (VNĐ)</Label>
                          <Input 
                            type="number" 
                            value={dailyData.marketingCost || 0} 
                            onChange={(e) => updateFinancialData(selectedDate, 'marketingCost', parseInt(e.target.value) || 0)}
                            min="0"
                          />
                        </div>
                        <div>
                          <Label>Chi phí bảo trì (VNĐ)</Label>
                          <Input 
                            type="number" 
                            value={dailyData.maintenanceCost || 0} 
                            onChange={(e) => updateFinancialData(selectedDate, 'maintenanceCost', parseInt(e.target.value) || 0)}
                            min="0"
                          />
                        </div>
                        <div>
                          <Label>Chi phí khác (VNĐ)</Label>
                          <Input 
                            type="number" 
                            value={dailyData.otherExpenses || 0} 
                            onChange={(e) => updateFinancialData(selectedDate, 'otherExpenses', parseInt(e.target.value) || 0)}
                            min="0"
                          />
                        </div>
                        <div>
                          <Label>Tổng chi phí ngày (VNĐ)</Label>
                          <Input 
                            type="number" 
                            value={dailyData.totalDailyExpenses || 0} 
                            readOnly 
                            className="bg-red-50 font-semibold text-red-700"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Hoạt động tài chính và tổng kết */}
                    <div>
                      <h4 className="font-semibold mb-3 text-blue-700">📊 Tổng kết & Hoạt động tài chính</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Tiền mặt đầu ca (VNĐ)</Label>
                          <Input 
                            type="number" 
                            value={dailyData.openingCash || 0} 
                            onChange={(e) => setDailyData({...dailyData, openingCash: parseInt(e.target.value) || 0})}
                            min="0"
                          />
                        </div>
                        <div>
                          <Label>Tiền mặt cuối ca (VNĐ)</Label>
                          <Input 
                            type="number" 
                            value={dailyData.closingCash || 0} 
                            onChange={(e) => setDailyData({...dailyData, closingCash: parseInt(e.target.value) || 0})}
                            min="0"
                          />
                        </div>
                        <div>
                          <Label>Lợi nhuận ngày (VNĐ)</Label>
                          <Input 
                            type="number" 
                            value={dailyData.dailyProfit || 0} 
                            readOnly 
                            className="bg-blue-50 font-semibold text-blue-700"
                          />
                        </div>
                        <div>
                          <Label>Tỷ suất lợi nhuận (%)</Label>
                          <Input 
                            type="number" 
                            value={Math.round((dailyData.profitMargin || 0) * 100) / 100} 
                            readOnly 
                            className="bg-blue-50 font-semibold text-blue-700"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Ghi chú tài chính</Label>
                      <Textarea 
                        value={dailyData.financialNotes || ''} 
                        onChange={(e) => setDailyData({...dailyData, financialNotes: e.target.value})}
                        placeholder="Ghi chú về tình hình tài chính, các khoản thu chi đặc biệt..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Báo cáo & đề xuất */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-orange-600" />
                      <span>Báo cáo & đề xuất</span>
                    </CardTitle>
                    <CardDescription>
                      Báo cáo tình hình và đề xuất cải thiện
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Báo cáo tình hình */}
                    <div>
                      <h4 className="font-semibold mb-3 text-orange-700">📊 Báo cáo tình hình</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Tình hình kinh doanh</Label>
                          <Textarea 
                            placeholder="Mô tả tình hình kinh doanh trong ngày"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Vấn đề phát sinh</Label>
                          <Textarea 
                            placeholder="Các vấn đề, khó khăn gặp phải"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Đề xuất cải thiện */}
                    <div>
                      <h4 className="font-semibold mb-3 text-orange-700">💡 Đề xuất cải thiện</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Đề xuất ngắn hạn</Label>
                          <Textarea 
                            placeholder="Các đề xuất cải thiện trong tuần tới"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Đề xuất dài hạn</Label>
                          <Textarea 
                            placeholder="Các đề xuất cải thiện trong tháng tới"
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Ghi chú tổng hợp */}
                    <div>
                      <Label>Ghi chú tổng hợp</Label>
                      <Textarea 
                        placeholder="Ghi chú tổng hợp về báo cáo và đề xuất"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Tài chính */}

              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => loadDailyData(selectedDate)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Xem dữ liệu
                </Button>
                <Button variant="outline" onClick={exportToExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  In báo cáo
                </Button>
                <Button onClick={saveDailyData}>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu báo cáo
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="summary">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                      <span>Báo cáo Tổng hợp F&B - {reportPeriod} ngày</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {summaryData ? (
                      <div className="space-y-8">
                        {/* Core Financial KPIs */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-gray-800">📊 Chỉ số Tài chính Cốt lõi</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="text-2xl font-bold text-blue-600">
                                0.0M
                              </div>
                              <div className="text-sm text-gray-600">Tổng Doanh Thu</div>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                              <div className="text-2xl font-bold text-red-600">
                                0.0%
                              </div>
                              <div className="text-sm text-gray-600">Food Cost TB</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                              <div className="text-2xl font-bold text-orange-600">
                                0.0%
                              </div>
                              <div className="text-sm text-gray-600">Labor Cost TB</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                              <div className="text-2xl font-bold text-green-600">
                                0.0%
                              </div>
                              <div className="text-sm text-gray-600">EBITDA Margin</div>
                            </div>
                          </div>
                        </div>

                        {/* Customer & Sales Metrics */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-gray-800">👥 Khách hàng & Bán hàng</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <div className="text-2xl font-bold text-purple-600">
                                0
                              </div>
                              <div className="text-sm text-gray-600">Tổng Khách Hàng</div>
                            </div>
                            <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                              <div className="text-2xl font-bold text-indigo-600">
                                0K
                              </div>
                              <div className="text-sm text-gray-600">AOV Trung Bình</div>
                            </div>
                            <div className="text-center p-4 bg-teal-50 rounded-lg border border-teal-200">
                              <div className="text-2xl font-bold text-teal-600">
                                0.0%
                              </div>
                              <div className="text-sm text-gray-600">Tỷ lệ Khách Quay lại</div>
                            </div>
                            <div className="text-center p-4 bg-pink-50 rounded-lg border border-pink-200">
                              <div className="text-2xl font-bold text-pink-600">
                                0.0/5
                              </div>
                              <div className="text-sm text-gray-600">Đánh giá TB</div>
                            </div>
                          </div>
                        </div>

                        {/* Staff Working Hours Summary */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-gray-800">⏰ Tổng hợp Giờ làm việc Nhân sự</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="text-center p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                              <div className="text-2xl font-bold text-cyan-600">
                                0h
                              </div>
                              <div className="text-sm text-gray-600">Tổng Giờ Làm việc</div>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                              <div className="text-2xl font-bold text-yellow-600">
                                0h
                              </div>
                              <div className="text-sm text-gray-600">Tổng Giờ Tăng ca</div>
                            </div>
                            <div className="text-center p-4 bg-lime-50 rounded-lg border border-lime-200">
                              <div className="text-2xl font-bold text-lime-600">
                                0.0h
                              </div>
                              <div className="text-sm text-gray-600">TB Giờ/Ngày</div>
                            </div>
                            <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                              <div className="text-2xl font-bold text-emerald-600">
                                0
                              </div>
                              <div className="text-sm text-gray-600">Tổng Nhân viên</div>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="text-2xl font-bold text-slate-600">
                                0.0h
                              </div>
                              <div className="text-sm text-gray-600">Giờ/Nhân viên</div>
                            </div>
                          </div>
                        </div>

                        {/* Operational Excellence */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-gray-800">⚡ Hiệu quả Vận hành</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                              <div className="text-2xl font-bold text-emerald-600">
                                0%
                              </div>
                              <div className="text-sm text-gray-600">Hiệu quả Tổng thể</div>
                            </div>
                            <div className="text-center p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                              <div className="text-2xl font-bold text-cyan-600">
                                0.0%
                              </div>
                              <div className="text-sm text-gray-600">Tỷ lệ Đúng giờ</div>
                            </div>
                            <div className="text-center p-4 bg-lime-50 rounded-lg border border-lime-200">
                              <div className="text-2xl font-bold text-lime-600">
                                0
                              </div>
                              <div className="text-sm text-gray-600">Năng suất/Giờ</div>
                            </div>
                            <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                              <div className="text-2xl font-bold text-amber-600">
                                0.0x
                              </div>
                              <div className="text-sm text-gray-600">Vòng quay Kho</div>
                            </div>
                          </div>
                        </div>

                        {/* Quality & Service Metrics */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-gray-800">🎯 Chất lượng & Dịch vụ</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-violet-50 rounded-lg border border-violet-200">
                              <div className="text-2xl font-bold text-violet-600">
                                0%
                              </div>
                              <div className="text-sm text-gray-600">KPI Đạt được</div>
                            </div>
                            <div className="text-center p-4 bg-rose-50 rounded-lg border border-rose-200">
                              <div className="text-2xl font-bold text-rose-600">
                                0.0%
                              </div>
                              <div className="text-sm text-gray-600">Tỷ lệ Hao hụt</div>
                            </div>
                            <div className="text-center p-4 bg-sky-50 rounded-lg border border-sky-200">
                              <div className="text-2xl font-bold text-sky-600">
                                0.0%
                              </div>
                              <div className="text-sm text-gray-600">Giải quyết Phản ánh</div>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="text-2xl font-bold text-slate-600">
                                0.0
                              </div>
                              <div className="text-sm text-gray-600">Sự cố/Ngày</div>
                            </div>
                          </div>
                        </div>

                        {/* Marketing Performance */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-gray-800">📈 Hiệu quả Marketing</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-fuchsia-50 rounded-lg border border-fuchsia-200">
                              <div className="text-2xl font-bold text-fuchsia-600">
                                0.0M
                              </div>
                              <div className="text-sm text-gray-600">Tổng GT Voucher</div>
                            </div>
                            <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                              <div className="text-2xl font-bold text-emerald-600">
                                0.0%
                              </div>
                              <div className="text-sm text-gray-600">Tỷ lệ Sử dụng</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                              <div className="text-2xl font-bold text-orange-600">
                                0%
                              </div>
                              <div className="text-sm text-gray-600">Marketing ROI</div>
                            </div>
                          </div>
                        </div>

                        {/* Summary Insights */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                          <h3 className="text-lg font-semibold mb-3 text-gray-800">💡 Tổng quan Insights</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-700"><strong>Doanh thu:</strong> 0.0M VNĐ trong {reportPeriod} ngày</p>
                              <p className="text-gray-700"><strong>Khách hàng:</strong> 0 lượt, AOV 0K</p>
                              <p className="text-gray-700"><strong>Retention:</strong> 0.0% khách quay lại</p>
                            </div>
                            <div>
                              <p className="text-gray-700"><strong>Cost Control:</strong> Food 0.0% + Labor 0.0%</p>
                              <p className="text-gray-700"><strong>Chất lượng:</strong> Rating 0.0/5, Wastage 0.0%</p>
                              <p className="text-gray-700"><strong>Hiệu quả:</strong> 0% tổng thể, 0.0% đúng giờ</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <BarChart3 className="h-16 w-16 mx-auto" />
                        </div>
                        <p className="text-gray-500 text-lg">Chưa có dữ liệu báo cáo hàng ngày để tổng hợp</p>
                        <p className="text-gray-400 text-sm mt-2">Vui lòng nhập dữ liệu báo cáo hàng ngày trước</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <div className="space-y-6">
                {/* History Filter Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Search className="h-5 w-5" />
                      <span>Bộ lọc Lịch sử</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Loại hoạt động</Label>
                        <Select value={historyFilter.actionType} onValueChange={(value) => setHistoryFilter({...historyFilter, actionType: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="login">Đăng nhập</SelectItem>
                            <SelectItem value="create_report">Tạo báo cáo</SelectItem>
                            <SelectItem value="update_report">Cập nhật báo cáo</SelectItem>
                            <SelectItem value="export_data">Xuất dữ liệu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Người dùng</Label>
                        <Select value={historyFilter.userId} onValueChange={(value) => setHistoryFilter({...historyFilter, userId: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            {accountActivities.map(user => (
                              <SelectItem key={user.userId} value={user.userId}>{user.userName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Từ ngày</Label>
                        <Input 
                          type="date" 
                          value={historyFilter.dateRange.start.toISOString().split('T')[0]}
                          onChange={(e) => setHistoryFilter({
                            ...historyFilter, 
                            dateRange: { ...historyFilter.dateRange, start: new Date(e.target.value) }
                          })}
                        />
                      </div>
                      <div>
                        <Label>Đến ngày</Label>
                        <Input 
                          type="date" 
                          value={historyFilter.dateRange.end.toISOString().split('T')[0]}
                          onChange={(e) => setHistoryFilter({
                            ...historyFilter, 
                            dateRange: { ...historyFilter.dateRange, end: new Date(e.target.value) }
                          })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* History Tabs */}
                <Tabs defaultValue="activity-logs">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="activity-logs">Nhật ký Hoạt động</TabsTrigger>
                    <TabsTrigger value="account-activity">Hoạt động Tài khoản</TabsTrigger>
                    <TabsTrigger value="report-audit">Kiểm toán Báo cáo</TabsTrigger>
                  </TabsList>

                  {/* Activity Logs */}
                  <TabsContent value="activity-logs">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Nhật ký Hoạt động Hệ thống</span>
                          <Badge variant="secondary">{activityLogs.length} hoạt động</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {activityLogs
                            .filter(log => {
                              const logDate = new Date(log.timestamp);
                              const matchesDate = logDate >= historyFilter.dateRange.start && logDate <= historyFilter.dateRange.end;
                              const matchesAction = historyFilter.actionType === 'all' || log.action === historyFilter.actionType;
                              const matchesUser = historyFilter.userId === 'all' || log.userId === historyFilter.userId;
                              return matchesDate && matchesAction && matchesUser;
                            })
                            .slice(0, 20)
                            .map(log => (
                              <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                                <div className="flex-shrink-0">
                                  {log.action === 'login' && <User className="h-5 w-5 text-green-600" />}
                                  {log.action === 'logout' && <LogOut className="h-5 w-5 text-red-600" />}
                                  {log.action.includes('report') && <FileText className="h-5 w-5 text-blue-600" />}
                                  {log.action === 'export_data' && <Download className="h-5 w-5 text-purple-600" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900">{log.description}</p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <Badge variant="outline" className="text-xs">{log.userRole}</Badge>
                                    {log.targetName && (
                                      <span className="text-xs text-gray-500">{log.targetName}</span>
                                    )}
                                    <span className="text-xs text-gray-400">{log.ipAddress}</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Account Activity */}
                  <TabsContent value="account-activity">
                    <Card>
                      <CardHeader>
                        <CardTitle>Hoạt động Tài khoản</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {accountActivities.map(account => (
                            <div key={account.userId} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                  <div className={`h-3 w-3 rounded-full ${
                                    account.status === 'active' ? 'bg-green-500' : 
                                    account.status === 'inactive' ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}></div>
                                </div>
                                <div>
                                  <p className="font-medium">{account.userName}</p>
                                  <p className="text-sm text-gray-500">{account.email}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">{account.role}</Badge>
                                    <Badge variant="outline" className="text-xs">{account.branch}</Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <p className="text-gray-900">{account.loginCount} lần đăng nhập</p>
                                <p className="text-gray-900">{account.reportCount} báo cáo</p>
                                <p className="text-gray-500">
                                  Hoạt động cuối: {new Date(account.lastActivity).toLocaleString('vi-VN')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Report Audit */}
                  <TabsContent value="report-audit">
                    <Card>
                      <CardHeader>
                        <CardTitle>Kiểm toán Báo cáo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-12">
                          <div className="text-gray-400 mb-4">
                            <FileText className="h-16 w-16 mx-auto" />
                          </div>
                          <p className="text-gray-500 text-lg">Chưa có dữ liệu kiểm toán báo cáo</p>
                          <p className="text-gray-400 text-sm mt-2">Dữ liệu sẽ được hiển thị khi có báo cáo được tạo và phê duyệt</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng Chi nhánh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">2</span>
                <span className="text-sm text-muted-foreground">chi nhánh</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Báo cáo Hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">0</span>
                <span className="text-sm text-muted-foreground">báo cáo</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Trạng thái Hệ thống
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Hoạt động bình thường</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

        <Dialog open={showAddStaffModal} onOpenChange={setShowAddStaffModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm nhân viên mới</DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết cho nhân viên mới
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Tên nhân viên
            </Label>
            <Input
              id="name"
              value={newStaffData.name}
              onChange={(e) => setNewStaffData({...newStaffData, name: e.target.value})}
              className="col-span-3"
              placeholder="Nhập tên nhân viên"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="position" className="text-right">
              Vị trí
            </Label>
            <Input
              id="position"
              value={newStaffData.position}
              onChange={(e) => setNewStaffData({...newStaffData, position: e.target.value})}
              className="col-span-3"
              placeholder="Ví dụ: Bếp trưởng, Phục vụ"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Loại hình
            </Label>
            <Select value={newStaffData.type} onValueChange={(value: 'fulltime' | 'parttime' | 'trial') => setNewStaffData({...newStaffData, type: value})}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fulltime">Full-time</SelectItem>
                <SelectItem value="parttime">Part-time</SelectItem>
                <SelectItem value="trial">Thử việc</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="shift" className="text-right">
              Ca làm việc
            </Label>
            <Select value={newStaffData.shift} onValueChange={(value: 'morning' | 'afternoon' | 'evening') => setNewStaffData({...newStaffData, shift: value})}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Ca sáng</SelectItem>
                <SelectItem value="afternoon">Ca chiều</SelectItem>
                <SelectItem value="evening">Ca tối</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="workHours" className="text-right">
              Giờ làm việc
            </Label>
            <Input
              id="workHours"
              type="number"
              value={newStaffData.workHours}
              onChange={(e) => setNewStaffData({...newStaffData, workHours: parseInt(e.target.value) || 0})}
              className="col-span-3"
              min="0"
              max="24"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="overtimeHours" className="text-right">
              Giờ tăng ca
            </Label>
            <Input
              id="overtimeHours"
              type="number"
              value={newStaffData.overtimeHours}
              onChange={(e) => setNewStaffData({...newStaffData, overtimeHours: parseInt(e.target.value) || 0})}
              className="col-span-3"
              min="0"
              max="12"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="productivity" className="text-right">
              Năng suất (%)
            </Label>
            <Input
              id="productivity"
              type="number"
              value={newStaffData.productivity}
              onChange={(e) => setNewStaffData({...newStaffData, productivity: parseInt(e.target.value) || 0})}
              className="col-span-3"
              min="0"
              max="200"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Ghi chú
            </Label>
            <Textarea
              id="notes"
              value={newStaffData.notes}
              onChange={(e) => setNewStaffData({...newStaffData, notes: e.target.value})}
              className="col-span-3"
              placeholder="Ghi chú thêm về nhân viên"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddStaffModal(false)}>
            Hủy
          </Button>
          <Button onClick={addNewStaff}>
            Thêm nhân viên
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
}