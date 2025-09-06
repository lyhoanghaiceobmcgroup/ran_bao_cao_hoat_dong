import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, Plus, Gift, Users, DollarSign, AlertTriangle, Package, Calendar, Zap } from 'lucide-react';

interface MarketingSectionProps {
  data: any;
  onComplete: (data: any) => void;
}

export default function MarketingSection({ data, onComplete }: MarketingSectionProps) {
  const [campaigns, setCampaigns] = useState((data && data.campaigns) || []);
  const [newCampaign, setNewCampaign] = useState({
    id: '',
    name: '',
    type: 'discount',
    vouchersUsed: 0,
    voucherValue: 0,
    estimatedRevenue: 0,
    newCustomers: 0,
    returningCustomers: 0,
    status: 'active'
  });

  const campaignTypes = [
    { value: 'discount', label: 'Giảm giá', icon: Gift },
    { value: 'combo', label: 'Combo khuyến mãi', icon: Package },
    { value: 'loyalty', label: 'Chương trình thành viên', icon: Users },
    { value: 'seasonal', label: 'Theo mùa', icon: Calendar },
    { value: 'flash_sale', label: 'Flash Sale', icon: Zap }
  ];

  const predefinedCampaigns = [
    { id: 'COMBO2024', name: 'Combo tiết kiệm 2024', type: 'combo' },
    { id: 'HAPPY30', name: 'Happy Hour 30%', type: 'discount' },
    { id: 'NEWMEM', name: 'Thành viên mới', type: 'loyalty' },
    { id: 'WEEKEND', name: 'Weekend Special', type: 'seasonal' }
  ];

  const addCampaign = () => {
    if (newCampaign.id && newCampaign.name) {
      setCampaigns([...campaigns, { ...newCampaign, createdAt: new Date().toISOString() }]);
      setNewCampaign({
        id: '',
        name: '',
        type: 'discount',
        vouchersUsed: 0,
        voucherValue: 0,
        estimatedRevenue: 0,
        newCustomers: 0,
        returningCustomers: 0,
        status: 'active'
      });
    }
  };

  const updateCampaign = (index: number, field: string, value: any) => {
    const updated = [...campaigns];
    updated[index][field] = value;
    
    // Auto calculate ROI
    if (['estimatedRevenue', 'voucherValue', 'vouchersUsed'].includes(field)) {
      const campaign = updated[index];
      const totalCost = campaign.voucherValue * campaign.vouchersUsed;
      campaign.roi = totalCost > 0 ? ((campaign.estimatedRevenue - totalCost) / totalCost * 100) : 0;
    }
    
    setCampaigns(updated);
  };

  const totalVoucherValue = campaigns.reduce((sum, c) => sum + (c.voucherValue * c.vouchersUsed), 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + (c.estimatedRevenue || 0), 0);
  const totalROI = totalVoucherValue > 0 ? ((totalRevenue - totalVoucherValue) / totalVoucherValue * 100) : 0;
  const totalNewCustomers = campaigns.reduce((sum, c) => sum + (c.newCustomers || 0), 0);

  const inactiveCampaigns = campaigns.filter(c => c.status === 'inactive').length;

  const handleSave = () => {
    onComplete({
      campaigns,
      statistics: {
        totalCampaigns: campaigns.length,
        totalVoucherValue,
        totalRevenue,
        totalROI,
        totalNewCustomers,
        inactiveCampaigns
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Marketing & Khuyến mãi
          </CardTitle>
          <CardDescription>
            Theo dõi hiệu quả các chương trình marketing và khuyến mãi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng campaigns</p>
                    <p className="text-lg font-bold text-blue-500">{campaigns.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">ROI</p>
                    <p className={`text-lg font-bold ${totalROI >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {totalROI.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Khách mới</p>
                    <p className="text-lg font-bold text-purple-500">{totalNewCustomers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Chi phí voucher</p>
                    <p className="text-lg font-bold text-orange-500">
                      {totalVoucherValue.toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {inactiveCampaigns > 0 && (
            <Alert className="border-yellow-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Có {inactiveCampaigns} chương trình không hoạt động. Vui lòng kiểm tra trạng thái campaign.
              </AlertDescription>
            </Alert>
          )}

          {/* Add New Campaign */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-4">
            <h3 className="font-semibold">Thêm campaign mới</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Campaign ID</Label>
                <Select
                  value={newCampaign.id}
                  onValueChange={(value) => {
                    const campaign = predefinedCampaigns.find(c => c.id === value);
                    if (campaign) {
                      setNewCampaign(prev => ({
                        ...prev,
                        id: campaign.id,
                        name: campaign.name,
                        type: campaign.type
                      }));
                    } else {
                      setNewCampaign(prev => ({ ...prev, id: value }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn hoặc nhập ID" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedCampaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.id} - {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tên campaign</Label>
                <Input
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Tên chương trình"
                />
              </div>

              <div className="space-y-2">
                <Label>Loại campaign</Label>
                <Select
                  value={newCampaign.type}
                  onValueChange={(value) => setNewCampaign(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {campaignTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Voucher sử dụng</Label>
                <Input
                  type="number"
                  value={newCampaign.vouchersUsed}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, vouchersUsed: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Giá trị voucher</Label>
                <Input
                  type="number"
                  value={newCampaign.voucherValue}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, voucherValue: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Doanh thu ước tính</Label>
                <Input
                  type="number"
                  value={newCampaign.estimatedRevenue}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, estimatedRevenue: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Khách mới</Label>
                <Input
                  type="number"
                  value={newCampaign.newCustomers}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, newCustomers: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <Button onClick={addCampaign}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm campaign
            </Button>
          </div>

          {/* Campaigns List */}
          {campaigns.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Danh sách campaigns</h3>
              {campaigns.map((campaign, index) => {
                const totalCost = campaign.voucherValue * campaign.vouchersUsed;
                const roi = totalCost > 0 ? ((campaign.estimatedRevenue - totalCost) / totalCost * 100) : 0;
                
                return (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{campaign.id}</Badge>
                          <Badge variant={campaignTypes.find(t => t.value === campaign.type) ? "default" : "secondary"}>
                            {campaignTypes.find(t => t.value === campaign.type)?.label || campaign.type}
                          </Badge>
                          <Badge variant={campaign.status === 'active' ? "default" : "secondary"}>
                            {campaign.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{campaign.name}</p>
                          <p className={`text-sm ${roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ROI: {roi.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="space-y-2">
                          <Label>Voucher sử dụng</Label>
                          <Input
                            type="number"
                            value={campaign.vouchersUsed}
                            onChange={(e) => updateCampaign(index, 'vouchersUsed', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Giá trị voucher</Label>
                          <Input
                            type="number"
                            value={campaign.voucherValue}
                            onChange={(e) => updateCampaign(index, 'voucherValue', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Doanh thu</Label>
                          <Input
                            type="number"
                            value={campaign.estimatedRevenue}
                            onChange={(e) => updateCampaign(index, 'estimatedRevenue', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Khách mới</Label>
                          <Input
                            type="number"
                            value={campaign.newCustomers}
                            onChange={(e) => updateCampaign(index, 'newCustomers', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Trạng thái</Label>
                          <Select
                            value={campaign.status}
                            onValueChange={(value) => updateCampaign(index, 'status', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Hoạt động</SelectItem>
                              <SelectItem value="inactive">Không hoạt động</SelectItem>
                              <SelectItem value="expired">Hết hạn</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <strong>Tổng chi phí:</strong> {totalCost.toLocaleString('vi-VN')} VNĐ
                          </div>
                          <div>
                            <strong>Lợi nhuận:</strong> {(campaign.estimatedRevenue - totalCost).toLocaleString('vi-VN')} VNĐ
                          </div>
                          <div>
                            <strong>ROI:</strong> 
                            <span className={roi >= 0 ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                              {roi.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Lưu thông tin marketing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}