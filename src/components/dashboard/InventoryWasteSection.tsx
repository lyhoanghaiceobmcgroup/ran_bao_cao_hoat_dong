import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Plus, AlertTriangle, TrendingDown, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InventoryWasteSectionProps {
  data: any;
  onComplete: (data: any) => void;
}

export default function InventoryWasteSection({ data, onComplete }: InventoryWasteSectionProps) {
  const [inventory, setInventory] = useState((data && data.inventory) || [
    {
      id: 1,
      sku: 'CF001',
      name: 'Cà phê Arabica',
      unit: 'kg',
      openingStock: 10,
      received: 5,
      consumed: 8,
      closingStock: 7,
      waste: 0,
      wasteReason: '',
      wasteValue: 0,
      minStock: 5,
      supplierInvoice: null
    }
  ]);

  const [newItem, setNewItem] = useState({
    sku: '',
    name: '',
    unit: 'kg',
    openingStock: 0,
    received: 0,
    consumed: 0,
    closingStock: 0,
    waste: 0,
    wasteReason: '',
    wasteValue: 0,
    minStock: 0
  });

  const wasteReasons = [
    'Hết hạn sử dụng',
    'Đổ/tràn trong quá trình pha chế',
    'Chất lượng không đạt',
    'Tặng khách (PR)',
    'Mẫu thử',
    'Khác'
  ];

  const addInventoryItem = () => {
    if (newItem.sku && newItem.name) {
      setInventory([...inventory, { ...newItem, id: Date.now() }]);
      setNewItem({
        sku: '',
        name: '',
        unit: 'kg',
        openingStock: 0,
        received: 0,
        consumed: 0,
        closingStock: 0,
        waste: 0,
        wasteReason: '',
        wasteValue: 0,
        minStock: 0
      });
    }
  };

  const updateInventoryItem = (index: number, field: string, value: any) => {
    const updated = [...inventory];
    updated[index][field] = value;
    
    // Auto calculate closing stock
    if (['openingStock', 'received', 'consumed', 'waste'].includes(field)) {
      const item = updated[index];
      updated[index].closingStock = item.openingStock + item.received - item.consumed - item.waste;
    }
    
    setInventory(updated);
  };

  const totalWasteValue = inventory.reduce((sum, item) => sum + (item.wasteValue || 0), 0);
  const totalCOGS = inventory.reduce((sum, item) => sum + (item.consumed * 50), 0); // Mock COGS calculation
  const wastePercentage = totalCOGS > 0 ? (totalWasteValue / totalCOGS) * 100 : 0;
  
  const lowStockItems = inventory.filter(item => item.closingStock <= item.minStock);
  const highWasteItems = inventory.filter(item => {
    const itemWastePercent = item.consumed > 0 ? (item.waste / item.consumed) * 100 : 0;
    return itemWastePercent > 5;
  });

  const handleSave = () => {
    onComplete({
      inventory,
      statistics: {
        totalWasteValue,
        wastePercentage,
        lowStockItems: lowStockItems.length,
        highWasteItems: highWasteItems.length
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Kho & hao hụt
          </CardTitle>
          <CardDescription>
            Quản lý tồn kho và theo dõi hao hụt nguyên liệu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tỷ lệ hao hụt</p>
                    <p className={`text-lg font-bold ${wastePercentage > 5 ? 'text-red-500' : 'text-green-500'}`}>
                      {wastePercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Giá trị hao hụt</p>
                    <p className="text-lg font-bold text-blue-500">
                      {totalWasteValue.toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tồn kho thấp</p>
                    <p className="text-lg font-bold text-orange-500">
                      {lowStockItems.length} items
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Hao hụt cao</p>
                    <p className="text-lg font-bold text-red-500">
                      {highWasteItems.length} items
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {lowStockItems.length > 0 && (
            <Alert className="border-orange-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Cảnh báo tồn kho thấp:</strong> {lowStockItems.map(item => item.name).join(', ')}
              </AlertDescription>
            </Alert>
          )}

          {highWasteItems.length > 0 && (
            <Alert className="border-red-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Cảnh báo hao hụt cao:</strong> {highWasteItems.map(item => item.name).join(', ')}
              </AlertDescription>
            </Alert>
          )}

          {/* Add New Item */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-4">
            <h3 className="font-semibold">Thêm nguyên liệu mới</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Mã SKU</Label>
                <Input
                  value={newItem.sku}
                  onChange={(e) => setNewItem(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="CF001"
                />
              </div>
              <div className="space-y-2">
                <Label>Tên nguyên liệu</Label>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Cà phê Arabica"
                />
              </div>
              <div className="space-y-2">
                <Label>Đơn vị</Label>
                <Select
                  value={newItem.unit}
                  onValueChange={(value) => setNewItem(prev => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lít">lít</SelectItem>
                    <SelectItem value="chai">chai</SelectItem>
                    <SelectItem value="gói">gói</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Định mức tối thiểu</Label>
                <Input
                  type="number"
                  value={newItem.minStock}
                  onChange={(e) => setNewItem(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <Button onClick={addInventoryItem}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm nguyên liệu
            </Button>
          </div>

          {/* Inventory Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Tên nguyên liệu</TableHead>
                  <TableHead>Tồn đầu</TableHead>
                  <TableHead>Nhập</TableHead>
                  <TableHead>Xuất</TableHead>
                  <TableHead>Hao hụt</TableHead>
                  <TableHead>Lý do hao hụt</TableHead>
                  <TableHead>Giá trị HH</TableHead>
                  <TableHead>Tồn cuối</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item, index) => {
                  const itemWastePercent = item.consumed > 0 ? (item.waste / item.consumed) * 100 : 0;
                  const isLowStock = item.closingStock <= item.minStock;
                  const isHighWaste = itemWastePercent > 5;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.openingStock}
                          onChange={(e) => updateInventoryItem(index, 'openingStock', parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.received}
                          onChange={(e) => updateInventoryItem(index, 'received', parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.consumed}
                          onChange={(e) => updateInventoryItem(index, 'consumed', parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.waste}
                          onChange={(e) => updateInventoryItem(index, 'waste', parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.wasteReason}
                          onValueChange={(value) => updateInventoryItem(index, 'wasteReason', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Chọn lý do" />
                          </SelectTrigger>
                          <SelectContent>
                            {wasteReasons.map((reason) => (
                              <SelectItem key={reason} value={reason}>
                                {reason}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.wasteValue}
                          onChange={(e) => updateInventoryItem(index, 'wasteValue', parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={isLowStock ? "destructive" : "outline"}>
                          {item.closingStock} {item.unit}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {isLowStock && <Badge variant="destructive" className="text-xs">Tồn thấp</Badge>}
                          {isHighWaste && <Badge variant="destructive" className="text-xs">HH cao</Badge>}
                          {!isLowStock && !isHighWaste && <Badge variant="default" className="text-xs">OK</Badge>}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Lưu thông tin kho
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}