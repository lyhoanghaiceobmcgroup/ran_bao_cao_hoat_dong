import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, CreditCard, Smartphone, Banknote, Upload, Calculator } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SalesPaymentSectionProps {
  data: any;
  onComplete: (data: any) => void;
}

export default function SalesPaymentSection({ data, onComplete }: SalesPaymentSectionProps) {
  const [formData, setFormData] = useState({
    netSales: (data && data.netSales) || 0,
    cashPayment: (data && data.cashPayment) || 0,
    cardPayment: (data && data.cardPayment) || 0,
    eWalletPayment: (data && data.eWalletPayment) || 0,
    totalBills: (data && data.totalBills) || 0,
    totalCustomers: (data && data.totalCustomers) || 0,
    refunds: (data && data.refunds) || [],
    voids: (data && data.voids) || [],
    discounts: (data && data.discounts) || [],
    posImage: (data && data.posImage) || null,
    ...(data || {})
  });

  const [newRefund, setNewRefund] = useState({ amount: 0, reason: '', approver: '' });
  const [newVoid, setNewVoid] = useState({ amount: 0, reason: '', approver: '' });
  const [newDiscount, setNewDiscount] = useState({ amount: 0, reason: '', approver: '' });

  const totalPayments = formData.cashPayment + formData.cardPayment + formData.eWalletPayment;
  const aov = formData.totalCustomers > 0 ? formData.netSales / formData.totalCustomers : 0;
  const variance = totalPayments - formData.netSales;

  const addRefund = () => {
    if (newRefund.amount > 0) {
      setFormData(prev => ({
        ...prev,
        refunds: [...prev.refunds, { ...newRefund, id: Date.now() }]
      }));
      setNewRefund({ amount: 0, reason: '', approver: '' });
    }
  };

  const addVoid = () => {
    if (newVoid.amount > 0) {
      setFormData(prev => ({
        ...prev,
        voids: [...prev.voids, { ...newVoid, id: Date.now() }]
      }));
      setNewVoid({ amount: 0, reason: '', approver: '' });
    }
  };

  const addDiscount = () => {
    if (newDiscount.amount > 0) {
      setFormData(prev => ({
        ...prev,
        discounts: [...prev.discounts, { ...newDiscount, id: Date.now() }]
      }));
      setNewDiscount({ amount: 0, reason: '', approver: '' });
    }
  };

  const handleSave = () => {
    onComplete({
      ...formData,
      aov,
      variance,
      totalPayments
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Doanh thu & thanh toán
          </CardTitle>
          <CardDescription>
            Theo dõi doanh thu và các phương thức thanh toán
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Net Sales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="netSales">Doanh thu ròng (VNĐ)</Label>
              <Input
                id="netSales"
                type="number"
                value={formData.netSales}
                onChange={(e) => setFormData(prev => ({ ...prev, netSales: parseInt(e.target.value) || 0 }))}
                className="text-lg font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalBills">Số hóa đơn</Label>
              <Input
                id="totalBills"
                type="number"
                value={formData.totalBills}
                onChange={(e) => setFormData(prev => ({ ...prev, totalBills: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalCustomers">Số khách</Label>
              <Input
                id="totalCustomers"
                type="number"
                value={formData.totalCustomers}
                onChange={(e) => setFormData(prev => ({ ...prev, totalCustomers: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Phương thức thanh toán</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cashPayment" className="flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  Tiền mặt (VNĐ)
                </Label>
                <Input
                  id="cashPayment"
                  type="number"
                  value={formData.cashPayment}
                  onChange={(e) => setFormData(prev => ({ ...prev, cashPayment: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardPayment" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Thẻ (VNĐ)
                </Label>
                <Input
                  id="cardPayment"
                  type="number"
                  value={formData.cardPayment}
                  onChange={(e) => setFormData(prev => ({ ...prev, cardPayment: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eWalletPayment" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Ví điện tử (VNĐ)
                </Label>
                <Input
                  id="eWalletPayment"
                  type="number"
                  value={formData.eWalletPayment}
                  onChange={(e) => setFormData(prev => ({ ...prev, eWalletPayment: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">AOV</p>
                    <p className="text-lg font-bold text-blue-500">
                      {aov.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng thanh toán</p>
                    <p className="text-lg font-bold text-green-500">
                      {totalPayments.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Chênh lệch</p>
                    <p className={`text-lg font-bold ${variance === 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {variance.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Refunds, Voids, Discounts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Refund / Void / Discount</h3>
            
            {/* Add new entries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label>Refund mới</Label>
                <Input
                  type="number"
                  placeholder="Số tiền"
                  value={newRefund.amount}
                  onChange={(e) => setNewRefund(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                />
                <Input
                  placeholder="Lý do"
                  value={newRefund.reason}
                  onChange={(e) => setNewRefund(prev => ({ ...prev, reason: e.target.value }))}
                />
                <Input
                  placeholder="Người duyệt"
                  value={newRefund.approver}
                  onChange={(e) => setNewRefund(prev => ({ ...prev, approver: e.target.value }))}
                />
                <Button onClick={addRefund} size="sm">Thêm Refund</Button>
              </div>

              <div className="space-y-2">
                <Label>Void mới</Label>
                <Input
                  type="number"
                  placeholder="Số tiền"
                  value={newVoid.amount}
                  onChange={(e) => setNewVoid(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                />
                <Input
                  placeholder="Lý do"
                  value={newVoid.reason}
                  onChange={(e) => setNewVoid(prev => ({ ...prev, reason: e.target.value }))}
                />
                <Input
                  placeholder="Người duyệt"
                  value={newVoid.approver}
                  onChange={(e) => setNewVoid(prev => ({ ...prev, approver: e.target.value }))}
                />
                <Button onClick={addVoid} size="sm">Thêm Void</Button>
              </div>

              <div className="space-y-2">
                <Label>Discount mới</Label>
                <Input
                  type="number"
                  placeholder="Số tiền"
                  value={newDiscount.amount}
                  onChange={(e) => setNewDiscount(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                />
                <Input
                  placeholder="Lý do"
                  value={newDiscount.reason}
                  onChange={(e) => setNewDiscount(prev => ({ ...prev, reason: e.target.value }))}
                />
                <Input
                  placeholder="Người duyệt"
                  value={newDiscount.approver}
                  onChange={(e) => setNewDiscount(prev => ({ ...prev, approver: e.target.value }))}
                />
                <Button onClick={addDiscount} size="sm">Thêm Discount</Button>
              </div>
            </div>
          </div>

          {/* POS Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="posImage">Ảnh chốt POS cuối ca/ngày</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click để upload ảnh POS hoặc kéo thả file vào đây
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="posImageInput"
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => document.getElementById('posImageInput')?.click()}
              >
                Chọn file
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Lưu thông tin doanh thu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}