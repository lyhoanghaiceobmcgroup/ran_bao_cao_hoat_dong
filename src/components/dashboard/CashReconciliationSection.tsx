import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, AlertTriangle, CheckCircle, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CashReconciliationSectionProps {
  data: any;
  onComplete: (data: any) => void;
}

export default function CashReconciliationSection({ data, onComplete }: CashReconciliationSectionProps) {
  const [formData, setFormData] = useState({
    openingFloat: (data && data.openingFloat) || 0,
    expectedCash: (data && data.expectedCash) || 0,
    countedCash: (data && data.countedCash) || 0,
    varianceReason: (data && data.varianceReason) || '',
    depositImage: (data && data.depositImage) || null,
    approvalStatus: (data && data.approvalStatus) || 'pending',
    ...(data || {})
  });

  const variance = formData.countedCash - formData.expectedCash;
  const variancePercentage = formData.expectedCash > 0 ? Math.abs(variance / formData.expectedCash * 100) : 0;
  const requiresJustification = variancePercentage > 1;

  const quickReasons = [
    'Tiền lẻ trả khách',
    'Lỗi nhập POS',
    'Tip nhân viên',
    'Chi phí phát sinh',
    'Đổi tiền lẻ',
    'Khác'
  ];

  const handleSave = () => {
    if (requiresJustification && !formData.varianceReason) {
      alert('Vui lòng nhập lý do chênh lệch tiền mặt');
      return;
    }

    onComplete({
      ...formData,
      variance,
      variancePercentage,
      requiresJustification
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Quỹ & đối soát tiền mặt
          </CardTitle>
          <CardDescription>
            Đối soát tiền mặt và kiểm tra chênh lệch quỹ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cash Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openingFloat">Tiền lẻ đầu ca (VNĐ)</Label>
              <Input
                id="openingFloat"
                type="number"
                value={formData.openingFloat}
                onChange={(e) => setFormData(prev => ({ ...prev, openingFloat: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedCash">Expected Cash (VNĐ)</Label>
              <Input
                id="expectedCash"
                type="number"
                value={formData.expectedCash}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedCash: parseInt(e.target.value) || 0 }))}
                placeholder="Từ POS"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="countedCash">Counted Cash (VNĐ)</Label>
              <Input
                id="countedCash"
                type="number"
                value={formData.countedCash}
                onChange={(e) => setFormData(prev => ({ ...prev, countedCash: parseInt(e.target.value) || 0 }))}
                placeholder="Số đếm thực tế"
              />
            </div>
          </div>

          {/* Variance Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className={`${variance === 0 ? 'border-green-500' : Math.abs(variance) > formData.expectedCash * 0.01 ? 'border-red-500' : 'border-yellow-500'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {variance === 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Chênh lệch (Variance)</p>
                    <p className={`text-xl font-bold ${variance === 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {variance.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Tỷ lệ chênh lệch</p>
                    <p className={`text-xl font-bold ${variancePercentage <= 1 ? 'text-green-500' : 'text-red-500'}`}>
                      {variancePercentage.toFixed(2)}%
                    </p>
                  </div>
                  {requiresJustification && (
                    <Badge variant="destructive">Cần giải trình</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Variance Justification */}
          {requiresJustification && (
            <Alert className="border-yellow-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Chênh lệch vượt quá 1% doanh thu. Vui lòng nhập lý do và upload ảnh chứng từ.
              </AlertDescription>
            </Alert>
          )}

          {(requiresJustification || formData.varianceReason) && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="varianceReason">Lý do chênh lệch quỹ</Label>
                <Select
                  value={formData.varianceReason}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, varianceReason: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lý do" />
                  </SelectTrigger>
                  <SelectContent>
                    {quickReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.varianceReason === 'Khác' && (
                <div className="space-y-2">
                  <Label htmlFor="customReason">Chi tiết lý do</Label>
                  <Textarea
                    id="customReason"
                    placeholder="Nhập chi tiết lý do chênh lệch..."
                    value={formData.customReason || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, customReason: e.target.value }))}
                  />
                </div>
              )}
            </div>
          )}

          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label htmlFor="depositImage">Ảnh chứng từ nộp tiền/phiếu nộp ngân hàng</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Upload ảnh chứng từ nộp tiền hoặc phiếu ngân hàng
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="depositImageInput"
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => document.getElementById('depositImageInput')?.click()}
              >
                Chọn file
              </Button>
            </div>
            {requiresJustification && (
              <p className="text-xs text-red-500">
                * Bắt buộc upload ảnh chứng từ khi chênh lệch &gt; 1%
              </p>
            )}
          </div>

          {/* Approval Status */}
          <div className="space-y-2">
            <Label>Trạng thái duyệt</Label>
            <div className="flex items-center gap-2">
              <Badge 
                variant={
                  formData.approvalStatus === 'approved' ? 'default' : 
                  formData.approvalStatus === 'rejected' ? 'destructive' : 
                  'secondary'
                }
              >
                {formData.approvalStatus === 'approved' ? 'Đã duyệt' :
                 formData.approvalStatus === 'rejected' ? 'Từ chối' :
                 'Chờ duyệt'}
              </Badge>
              <p className="text-sm text-muted-foreground">
                NV → Ca trưởng → Quản lý
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Lưu thông tin đối soát
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}