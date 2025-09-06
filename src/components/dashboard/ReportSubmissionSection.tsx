import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  Download, 
  FileText,
  Clock,
  Shield
} from 'lucide-react';

interface ReportSubmissionSectionProps {
  data: any;
  onComplete: (data: any) => void;
  reportData: any;
  completedSections: string[];
}

export default function ReportSubmissionSection({ 
  data, 
  onComplete, 
  reportData, 
  completedSections 
}: ReportSubmissionSectionProps) {
  const { toast } = useToast();
  const [checklist, setChecklist] = useState({
    salesPosMatch: (data && data.salesPosMatch) || false,
    cashReconciled: (data && data.cashReconciled) || false,
    inventoryComplete: (data && data.inventoryComplete) || false,
    staffComplete: (data && data.staffComplete) || false,
    incidentsLogged: (data && data.incidentsLogged) || false,
    evidenceUploaded: (data && data.evidenceUploaded) || false,
    ...(data || {})
  });

  const [isLocked, setIsLocked] = useState((data && data.isLocked) || false);
  const [submissionStatus, setSubmissionStatus] = useState((data && data.submissionStatus) || 'draft');

  const checklistItems = [
    {
      key: 'salesPosMatch',
      label: 'Doanh thu & POS khớp',
      description: 'Đã đối chiếu doanh thu với dữ liệu POS',
      section: 'sales'
    },
    {
      key: 'cashReconciled',
      label: 'Quỹ đã đối soát, variance xử lý xong',
      description: 'Tiền mặt đã được đối soát và giải trình chênh lệch',
      section: 'cash'
    },
    {
      key: 'inventoryComplete',
      label: 'Kho & hao hụt đầy đủ minh chứng',
      description: 'Tồn kho đã kiểm đếm, hao hụt có lý do rõ ràng',
      section: 'inventory'
    },
    {
      key: 'staffComplete',
      label: 'Nhân sự đủ công & OT đã duyệt',
      description: 'Chấm công chính xác, overtime đã được phê duyệt',
      section: 'staff'
    },
    {
      key: 'incidentsLogged',
      label: 'Sự cố & feedback khách đã ghi nhận',
      description: 'Tất cả sự cố và phản hồi khách hàng đã được xử lý',
      section: 'incidents'
    },
    {
      key: 'evidenceUploaded',
      label: 'Ảnh chứng từ đã upload đầy đủ',
      description: 'POS cuối ca, phiếu nộp tiền, hóa đơn nhập hàng',
      section: 'evidence'
    }
  ];

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalItems = checklistItems.length;
  const completionRate = (completedCount / totalItems) * 100;

  const canSubmit = completedCount === totalItems && (completedSections?.length || 0) >= 8;
  const hasWarnings = checkForWarnings();

  function checkForWarnings() {
    const warnings = [];
    
    // Return empty warnings if reportData is not available
    if (!reportData) {
      return warnings;
    }
    
    // Check for high variance
    if (reportData.cashReconciliation?.variancePercentage > 1) {
      warnings.push('Chênh lệch quỹ > 1%');
    }
    
    // Check for high waste
    if (reportData.inventoryWaste?.statistics?.wastePercentage > 5) {
      warnings.push('Hao hụt > 5%');
    }
    
    // Check for low NPS
    if (reportData.customerFeedback?.npsScore < 50) {
      warnings.push('NPS Score thấp');
    }
    
    // Check for open incidents
    if (reportData.incidents?.statistics?.openIncidents > 0) {
      warnings.push('Còn sự cố chưa đóng');
    }
    
    return warnings;
  }

  const handleChecklistChange = (key: string, checked: boolean) => {
    setChecklist(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const handleQuickReport = async () => {
    if (!canSubmit) {
      toast({
        title: "Chưa thể gửi báo cáo",
        description: "Vui lòng hoàn thành tất cả các mục kiểm tra",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate API call to submit report
      setSubmissionStatus('submitting');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmissionStatus('submitted');
      
      toast({
        title: "Báo cáo đã được gửi",
        description: "Dữ liệu đã được đồng bộ về trung tâm quản lý",
      });

      onComplete({
        checklist,
        submissionStatus: 'submitted',
        submittedAt: new Date().toISOString(),
        warnings: checkForWarnings()
      });

    } catch (error) {
      setSubmissionStatus('error');
      toast({
        title: "Lỗi gửi báo cáo",
        description: "Vui lòng thử lại sau",
        variant: "destructive",
      });
    }
  };

  const handleLockDay = () => {
    setIsLocked(true);
    toast({
      title: "Đã khóa ngày",
      description: "Báo cáo không thể chỉnh sửa. Chỉ HO có thể mở lại.",
    });
  };

  const handleExportReport = (format: 'pdf' | 'excel') => {
    toast({
      title: `Đang xuất file ${format.toUpperCase()}`,
      description: "File sẽ được tải xuống sau ít phút",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Xác nhận & gửi báo cáo
          </CardTitle>
          <CardDescription>
            Kiểm tra và hoàn thiện báo cáo trước khi gửi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Completion Progress */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-blue-900">Tiến độ hoàn thành</h3>
                <Badge variant={completionRate === 100 ? "default" : "secondary"}>
                  {completedCount}/{totalItems}
                </Badge>
              </div>
              <Progress value={completionRate} className="h-3 mb-2" />
              <p className="text-sm text-blue-700">
                {completionRate === 100 ? 'Sẵn sàng gửi báo cáo!' : `Còn ${totalItems - completedCount} mục cần hoàn thành`}
              </p>
            </CardContent>
          </Card>

          {/* Warnings */}
          {hasWarnings.length > 0 && (
            <Alert className="border-yellow-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Cảnh báo:</strong> {hasWarnings.join(', ')}. 
                Vui lòng kiểm tra lại trước khi gửi báo cáo.
              </AlertDescription>
            </Alert>
          )}

          {/* Checklist */}
          <div className="space-y-4">
            <h3 className="font-semibold">Checklist hoàn thành</h3>
            {checklistItems.map((item) => {
              const isCompleted = checklist[item.key];
              const sectionCompleted = completedSections?.includes(item.section) || false;
              
              return (
                <div key={item.key} className="flex items-start space-x-3 p-3 rounded-lg border">
                  <Checkbox
                    id={item.key}
                    checked={isCompleted}
                    onCheckedChange={(checked) => handleChecklistChange(item.key, checked as boolean)}
                    disabled={isLocked}
                  />
                  <div className="flex-1">
                    <Label htmlFor={item.key} className="font-medium">
                      {item.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                    {!sectionCompleted && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Cần hoàn thành phần {item.section}
                      </Badge>
                    )}
                  </div>
                  {isCompleted && (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Submission Status */}
          {submissionStatus !== 'draft' && (
            <Card className={`
              ${submissionStatus === 'submitted' ? 'border-green-500 bg-green-50' : ''}
              ${submissionStatus === 'error' ? 'border-red-500 bg-red-50' : ''}
              ${submissionStatus === 'submitting' ? 'border-blue-500 bg-blue-50' : ''}
            `}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {submissionStatus === 'submitting' && <Clock className="h-5 w-5 text-blue-500 animate-spin" />}
                  {submissionStatus === 'submitted' && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {submissionStatus === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                  <div>
                    <p className="font-semibold">
                      {submissionStatus === 'submitting' && 'Đang gửi báo cáo...'}
                      {submissionStatus === 'submitted' && 'Báo cáo đã được gửi thành công'}
                      {submissionStatus === 'error' && 'Gửi báo cáo thất bại'}
                    </p>
                    {submissionStatus === 'submitted' && (
                      <p className="text-sm text-muted-foreground">
                        Dữ liệu đã đồng bộ về Supabase và Dashboard BI
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleQuickReport}
                disabled={!canSubmit || submissionStatus === 'submitting' || isLocked}
                className="flex-1 min-w-[200px]"
              >
                {submissionStatus === 'submitting' ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Gửi báo cáo nhanh
                  </>
                )}
              </Button>

              {submissionStatus === 'submitted' && !isLocked && (
                <Button
                  onClick={handleLockDay}
                  variant="outline"
                  className="flex-1 min-w-[200px]"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Khóa ngày
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleExportReport('pdf')}
                variant="outline"
                disabled={submissionStatus !== 'submitted'}
              >
                <FileText className="h-4 w-4 mr-2" />
                Xuất PDF
              </Button>

              <Button
                onClick={() => handleExportReport('excel')}
                variant="outline"
                disabled={submissionStatus !== 'submitted'}
              >
                <Download className="h-4 w-4 mr-2" />
                Xuất Excel
              </Button>
            </div>
          </div>

          {/* Lock Status */}
          {isLocked && (
            <Alert className="border-gray-500">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Báo cáo đã được khóa. Không thể chỉnh sửa. 
                Chỉ trung tâm quản lý (HO) có thể mở lại để chỉnh sửa.
              </AlertDescription>
            </Alert>
          )}

          {/* Additional Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Thông tin bổ sung</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Realtime: Dữ liệu được đồng bộ ngay lập tức khi gửi</li>
                <li>• Audit trail: Tất cả thay đổi đều được ghi log</li>
                <li>• Dashboard BI: Tự động cập nhật báo cáo tổng hợp</li>
                <li>• Weekly Summary: Tự động tạo báo cáo tuần</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}