import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, User, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface BranchInfoSectionProps {
  data: any;
  onComplete: (data: any) => void;
}

export default function BranchInfoSection({ data, onComplete }: BranchInfoSectionProps) {
  const { userData } = useAuth();
  const [formData, setFormData] = useState({
    storeId: userData?.branch || '',
    storeName: userData?.branch || '',
    reportPeriod: 'today',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reportMode: 'daily',
    reporterName: userData?.name || '',
    reporterRole: userData?.role || '',
    ...data
  });

  const handleSave = () => {
    onComplete(formData);
  };

  const periodOptions = [
    { value: 'today', label: 'Hôm nay' },
    { value: '7days', label: '7 ngày qua' },
    { value: 'thisweek', label: 'Tuần này' },
    { value: 'thismonth', label: 'Tháng này' },
    { value: 'custom', label: 'Tùy chọn' }
  ];

  const reportModes = [
    { value: 'shift', label: 'Theo ca' },
    { value: 'daily', label: 'Theo ngày' },
    { value: 'eod', label: 'Gom EOD' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Thông tin định danh & phạm vi báo cáo
          </CardTitle>
          <CardDescription>
            Xác định chi nhánh và khoảng thời gian báo cáo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storeId">Mã chi nhánh</Label>
              <Input
                id="storeId"
                value={formData.storeId}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeName">Tên chi nhánh</Label>
              <Input
                id="storeName"
                value={formData.storeName}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportPeriod">Khoảng thời gian báo cáo</Label>
            <Select
              value={formData.reportPeriod}
              onValueChange={(value) => setFormData(prev => ({ ...prev, reportPeriod: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.reportPeriod === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Từ ngày</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Đến ngày</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reportMode">Chế độ báo cáo</Label>
            <Select
              value={formData.reportMode}
              onValueChange={(value) => setFormData(prev => ({ ...prev, reportMode: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportModes.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reporterName">Người báo cáo</Label>
              <Input
                id="reporterName"
                value={formData.reporterName}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reporterRole">Chức vụ</Label>
              <Input
                id="reporterRole"
                value={formData.reporterRole}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Lưu thông tin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}