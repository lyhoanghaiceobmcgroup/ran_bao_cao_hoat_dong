import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Clock, TrendingUp } from 'lucide-react';

interface StaffAttendanceSectionProps {
  data: any;
  onComplete: (data: any) => void;
}

export default function StaffAttendanceSection({ data, onComplete }: StaffAttendanceSectionProps) {
  const [staffList, setStaffList] = useState((data && data.staffList) || [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      position: 'Nhân viên pha chế',
      checkIn: '08:00',
      checkOut: '17:00',
      breakTime: 60,
      workHours: 8,
      late: 0,
      earlyLeave: 0,
      overtime: 0,
      overtimeApproved: false,
      tip: 0,
      bonus: 0,
      penalty: 0,
      note: '',
      productivity: { orders: 45, drinks: 120, upsell: 15 }
    }
  ]);

  const handleStaffUpdate = (index: number, field: string, value: any) => {
    const updated = [...staffList];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updated[index][parent][child] = value;
    } else {
      updated[index][field] = value;
    }
    setStaffList(updated);
  };

  const addStaff = () => {
    const newStaff = {
      id: Date.now(),
      name: '',
      position: '',
      checkIn: '',
      checkOut: '',
      breakTime: 0,
      workHours: 0,
      late: 0,
      earlyLeave: 0,
      overtime: 0,
      overtimeApproved: false,
      tip: 0,
      bonus: 0,
      penalty: 0,
      note: '',
      productivity: { orders: 0, drinks: 0, upsell: 0 }
    };
    setStaffList([...staffList, newStaff]);
  };

  const handleSave = () => {
    const onTimeRate = staffList.filter(s => s.late === 0).length / staffList.length * 100;
    const absentRate = 0; // Could be calculated based on expected vs actual staff
    const topPerformers = staffList
      .sort((a, b) => b.productivity.orders - a.productivity.orders)
      .slice(0, 3);

    onComplete({
      staffList,
      statistics: {
        totalStaff: staffList.length,
        onTimeRate: Math.round(onTimeRate),
        absentRate,
        topPerformers
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Nhân sự & giờ công
          </CardTitle>
          <CardDescription>
            Quản lý thông tin chấm công và năng suất nhân viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Danh sách nhân viên</h3>
              <Button onClick={addStaff} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Thêm nhân viên
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Vị trí</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Giờ công</TableHead>
                    <TableHead>Đi muộn</TableHead>
                    <TableHead>OT</TableHead>
                    <TableHead>Duyệt OT</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Orders/h</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffList.map((staff, index) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <Input
                          value={staff.name}
                          onChange={(e) => handleStaffUpdate(index, 'name', e.target.value)}
                          placeholder="Họ tên"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={staff.position}
                          onChange={(e) => handleStaffUpdate(index, 'position', e.target.value)}
                          placeholder="Vị trí"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          value={staff.checkIn}
                          onChange={(e) => handleStaffUpdate(index, 'checkIn', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          value={staff.checkOut}
                          onChange={(e) => handleStaffUpdate(index, 'checkOut', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{staff.workHours}h</Badge>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={staff.late}
                          onChange={(e) => handleStaffUpdate(index, 'late', parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={staff.overtime}
                          onChange={(e) => handleStaffUpdate(index, 'overtime', parseFloat(e.target.value) || 0)}
                          className="w-20"
                          step="0.5"
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={staff.overtimeApproved}
                          onCheckedChange={(checked) => handleStaffUpdate(index, 'overtimeApproved', checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={staff.tip}
                          onChange={(e) => handleStaffUpdate(index, 'tip', parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {staff.productivity.orders}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tỷ lệ đúng giờ</p>
                      <p className="text-2xl font-bold text-green-500">
                        {Math.round(staffList.filter(s => s.late === 0).length / staffList.length * 100)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng nhân viên</p>
                      <p className="text-2xl font-bold text-blue-500">{staffList.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Orders/h</p>
                      <p className="text-2xl font-bold text-orange-500">
                        {Math.round(staffList.reduce((sum, s) => sum + s.productivity.orders, 0) / staffList.length)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave}>
                Lưu thông tin nhân sự
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}