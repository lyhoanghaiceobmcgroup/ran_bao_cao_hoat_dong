import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Upload, Clock, User } from 'lucide-react';

interface IncidentSectionProps {
  data: any;
  onComplete: (data: any) => void;
}

export default function IncidentSection({ data, onComplete }: IncidentSectionProps) {
  const [incidents, setIncidents] = useState((data && data.incidents) || []);
  const [newIncident, setNewIncident] = useState({
    type: '',
    severity: 'low',
    description: '',
    immediateAction: '',
    rootCause: '',
    responsible: '',
    eta: '',
    status: 'open',
    attachments: [],
    cost: 0
  });

  const incidentTypes = [
    'Thiết bị',
    'Nhân sự',
    'Khách hàng',
    'VSATTP',
    'Khác'
  ];

  const severityLevels = [
    { value: 'low', label: 'Thấp', color: 'default' },
    { value: 'medium', label: 'Vừa', color: 'secondary' },
    { value: 'high', label: 'Cao', color: 'destructive' }
  ];

  const statusOptions = [
    { value: 'open', label: 'Mở', color: 'destructive' },
    { value: 'in-progress', label: 'Đang xử lý', color: 'secondary' },
    { value: 'resolved', label: 'Đã giải quyết', color: 'default' },
    { value: 'closed', label: 'Đã đóng', color: 'outline' }
  ];

  const addIncident = () => {
    if (newIncident.type && newIncident.description) {
      const incident = {
        ...newIncident,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        reportedBy: 'Current User' // Should come from auth context
      };

      setIncidents([...incidents, incident]);
      setNewIncident({
        type: '',
        severity: 'low',
        description: '',
        immediateAction: '',
        rootCause: '',
        responsible: '',
        eta: '',
        status: 'open',
        attachments: [],
        cost: 0
      });

      // Send alert for high severity incidents
      if (incident.severity === 'high') {
        // This would typically send a real-time notification
        console.log('High severity incident reported - sending alert to HQ');
      }
    }
  };

  const updateIncident = (index: number, field: string, value: any) => {
    const updated = [...incidents];
    updated[index][field] = value;
    setIncidents(updated);
  };

  const handleSave = () => {
    const highSeverityCount = incidents.filter(i => i.severity === 'high').length;
    const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'in-progress').length;
    const totalCost = incidents.reduce((sum, i) => sum + (i.cost || 0), 0);

    onComplete({
      incidents,
      statistics: {
        totalIncidents: incidents.length,
        highSeverityCount,
        openIncidents,
        totalCost
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Sự cố - sự vụ
          </CardTitle>
          <CardDescription>
            Ghi nhận và theo dõi các sự cố, sự vụ trong ca làm việc
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng sự cố</p>
                    <p className="text-lg font-bold text-red-500">{incidents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Mức độ cao</p>
                    <p className="text-lg font-bold text-orange-500">
                      {incidents.filter(i => i.severity === 'high').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Đang mở</p>
                    <p className="text-lg font-bold text-blue-500">
                      {incidents.filter(i => i.status === 'open' || i.status === 'in-progress').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Chi phí</p>
                    <p className="text-lg font-bold">
                      {incidents.reduce((sum, i) => sum + (i.cost || 0), 0).toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add New Incident */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-4">
            <h3 className="font-semibold">Báo cáo sự cố mới</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Loại sự cố</Label>
                <Select
                  value={newIncident.type}
                  onValueChange={(value) => setNewIncident(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại sự cố" />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mức độ</Label>
                <Select
                  value={newIncident.severity}
                  onValueChange={(value) => setNewIncident(prev => ({ ...prev, severity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {severityLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chi phí ước tính (VNĐ)</Label>
                <Input
                  type="number"
                  value={newIncident.cost}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mô tả ngắn</Label>
              <Textarea
                value={newIncident.description}
                onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả chi tiết sự cố..."
              />
            </div>

            <div className="space-y-2">
              <Label>Hành động tức thì</Label>
              <Textarea
                value={newIncident.immediateAction}
                onChange={(e) => setNewIncident(prev => ({ ...prev, immediateAction: e.target.value }))}
                placeholder="Các hành động đã thực hiện ngay lập tức..."
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Người chịu trách nhiệm</Label>
                <Input
                  value={newIncident.responsible}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, responsible: e.target.value }))}
                  placeholder="Tên người chịu trách nhiệm"
                />
              </div>
              <div className="space-y-2">
                <Label>ETA giải quyết</Label>
                <Input
                  type="datetime-local"
                  value={newIncident.eta}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, eta: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ảnh/Video đính kèm</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click để upload ảnh/video hoặc kéo thả file vào đây
                </p>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  id="incidentAttachments"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => document.getElementById('incidentAttachments')?.click()}
                >
                  Chọn file
                </Button>
              </div>
            </div>

            <Button onClick={addIncident}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm sự cố
            </Button>
          </div>

          {/* Incidents List */}
          {incidents.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Danh sách sự cố</h3>
              {incidents.map((incident, index) => (
                <Card key={incident.id} className={`${incident.severity === 'high' ? 'border-red-500' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={severityLevels.find(s => s.value === incident.severity)?.color as any}>
                          {severityLevels.find(s => s.value === incident.severity)?.label}
                        </Badge>
                        <Badge variant="outline">{incident.type}</Badge>
                        <Badge variant={statusOptions.find(s => s.value === incident.status)?.color as any}>
                          {statusOptions.find(s => s.value === incident.status)?.label}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(incident.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>

                    <p className="text-sm mb-2"><strong>Mô tả:</strong> {incident.description}</p>
                    {incident.immediateAction && (
                      <p className="text-sm mb-2"><strong>Hành động:</strong> {incident.immediateAction}</p>
                    )}
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                      <div className="space-y-2">
                        <Label>Nguyên nhân gốc (5-Why)</Label>
                        <Textarea
                          value={incident.rootCause}
                          onChange={(e) => updateIncident(index, 'rootCause', e.target.value)}
                          placeholder="Phân tích nguyên nhân gốc..."
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Trạng thái</Label>
                        <Select
                          value={incident.status}
                          onValueChange={(value) => updateIncident(index, 'status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {incident.cost > 0 && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                        <strong>Chi phí:</strong> {incident.cost.toLocaleString('vi-VN')} VNĐ
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Lưu thông tin sự cố
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}