import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  DollarSign, 
  Package, 
  Settings,
  Target,
  MapPin,
  TrendingUp,
  Coffee,
  Refrigerator,
  Monitor,
  Shield,
  Megaphone,
  Plus,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import ranGroupLogo from '@/assets/ran-group-logo.png';
import { useAuth } from '@/context/AuthContext';

// HN40 specific constants
const HN40_BOT_TOKEN = '7998696645:AAHRwJRwoWBL2svvOGl2EBggie18jzcOWlI';
const HN40_CHAT_ID = '-4893187199';
const HN40_STORE_ID = 'RAN-40NQHN';
const HN40_BRANCH_NAME = '40 Ngô Quyền, Hà Nội';

// HN40 specific Telegram functions
const sendTelegramMessage40NQ = async (message: string) => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${HN40_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: HN40_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
};

const sendTelegramPhoto40NQ = async (photo: File, caption: string) => {
  try {
    const formData = new FormData();
    formData.append('chat_id', HN40_CHAT_ID);
    formData.append('photo', photo);
    formData.append('caption', caption);
    formData.append('parse_mode', 'HTML');
    
    const response = await fetch(`https://api.telegram.org/bot${HN40_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending Telegram photo:', error);
    throw error;
  }
};

interface StaffMember {
  name: string;
  role: string;
  hours: string;
  note: string;
}

interface InventoryItem {
  item: string;
  onHand: string;
  minLevel: string;
  unit: string;
  status: string;
  note: string;
}

interface Incident {
  category: string;
  item: string;
  priority: string;
  status: string;
  note: string;
}

export default function StartShiftReport40NQ() {
  const { userData, selectedBranch } = useAuth();
  const navigate = useNavigate();
  const [checkinTime, setCheckinTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [messageColor, setMessageColor] = useState('#6b7280');
  
  // State for dynamic lists
  const [staffList, setStaffList] = useState<StaffMember[]>([
    { name: '', role: '', hours: '', note: '' },
    { name: '', role: '', hours: '', note: '' }
  ]);
  
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([
    { item: 'Cà phê hạt Arabica', onHand: '25', minLevel: '20', unit: 'kg', status: 'Đủ định mức', note: 'Nhập từ Đà Lạt' },
    { item: 'Sữa tươi nguyên kem', onHand: '18', minLevel: '20', unit: 'lit', status: 'Thiếu hàng', note: 'Cần đặt thêm' },
    { item: 'Syrup đường nâu', onHand: '12', minLevel: '15', unit: 'chai', status: 'Đủ định mức', note: '' },
    { item: 'Đường trắng', onHand: '8', minLevel: '10', unit: 'kg', status: 'Đủ định mức', note: '' },
    { item: 'Ly giấy size M', onHand: '280', minLevel: '300', unit: 'cái', status: 'Đủ định mức', note: '' },
    { item: 'Đá viên', onHand: '45', minLevel: '50', unit: 'kg', status: 'Đủ định mức', note: '' },
    { item: 'Topping trân châu', onHand: '8', minLevel: '10', unit: 'kg', status: 'Đủ định mức', note: '' }
  ]);
  
  const [incidentList, setIncidentList] = useState<Incident[]>([
    { category: '', item: '', priority: 'Medium', status: 'Cần xử lý', note: '' }
  ]);

  // Get branch name - hardcoded for HN40
  const getBranchName = () => {
    return HN40_BRANCH_NAME;
  };

  // Get store ID - hardcoded for HN40
  const getStoreId = () => {
    return HN40_STORE_ID;
  };

  // Sample data for adding new entries
  const sampleStaffData = [
    { name: 'Nguyễn Văn A', role: 'Barista', hours: '8', note: 'Ca sáng' },
    { name: 'Trần Thị B', role: 'Thu ngân', hours: '8', note: 'Ca sáng' },
    { name: 'Lê Văn C', role: 'Phục vụ', hours: '6', note: 'Part-time' },
    { name: 'Phạm Thị D', role: 'Pha chế', hours: '8', note: 'Fulltime' },
    { name: 'Hoàng Văn E', role: 'Quản lý ca', hours: '8', note: 'Team leader' }
  ];

  const additionalInventory = [
    { item: 'Bột ca cao', onHand: '5', minLevel: '8', unit: 'kg', status: 'Thiếu hàng', note: 'Cần bổ sung' },
    { item: 'Kem whip', onHand: '10', minLevel: '12', unit: 'chai', status: 'Đủ định mức', note: '' },
    { item: 'Hạt dẻ cười', onHand: '3', minLevel: '5', unit: 'kg', status: 'Thiếu hàng', note: 'Hết hàng' },
    { item: 'Bánh cookie', onHand: '20', minLevel: '30', unit: 'hộp', status: 'Đủ định mức', note: '' },
    { item: 'Nước suối', onHand: '50', minLevel: '40', unit: 'chai', status: 'Đủ định mức', note: 'Dư thừa' },
    { item: 'Đường phèn', onHand: '6', minLevel: '8', unit: 'kg', status: 'Đủ định mức', note: '' },
    { item: 'Matcha powder', onHand: '2', minLevel: '4', unit: 'kg', status: 'Thiếu hàng', note: 'Cần nhập' },
    { item: 'Sữa yến mạch', onHand: '8', minLevel: '10', unit: 'lit', status: 'Đủ định mức', note: 'Organic' },
    { item: 'Cốc thủy tinh', onHand: '45', minLevel: '50', unit: 'cái', status: 'Đủ định mức', note: '' },
    { item: 'Ống hút giấy', onHand: '200', minLevel: '150', unit: 'cái', status: 'Đủ định mức', note: 'Thân thiện môi trường' }
  ];

  const sampleIncidents = [
    { category: 'Thiết bị', item: 'Máy pha cà phê bị rò rỉ', priority: 'High', status: 'Cần xử lý', note: 'Cần gọi thợ sửa' },
    { category: 'Cơ sở vật chất', item: 'Đèn LED bàn số 3 hỏng', priority: 'Medium', status: 'Đang theo dõi', note: 'Đã báo bộ phận kỹ thuật' },
    { category: 'Vệ sinh', item: 'Toilet khách hàng tắc', priority: 'High', status: 'Cần xử lý', note: 'Khẩn cấp' },
    { category: 'Thiết bị', item: 'Máy tính tiền lag', priority: 'Medium', status: 'Cần xử lý', note: 'Cần khởi động lại' },
    { category: 'An ninh', item: 'Camera góc trái không hoạt động', priority: 'Low', status: 'Đang theo dõi', note: 'Đã liên hệ IT' },
    { category: 'Thiết bị', item: 'Máy xay cà phê kêu to', priority: 'Medium', status: 'Cần xử lý', note: 'Cần bảo trì' },
    { category: 'Cơ sở vật chất', item: 'Ghế khách bị lỏng ốc vít', priority: 'Low', status: 'Cần xử lý', note: 'Cần siết lại' },
    { category: 'Vệ sinh', item: 'Sàn nhà trơn trượt', priority: 'High', status: 'Đã xử lý', note: 'Đã lau khô và đặt biển cảnh báo' }
  ];

  useEffect(() => {
    setCheckinTime(vnNowString());
  }, []);

  if (!userData) {
    navigate('/login');
    return null;
  }

  const [currentDate, setCurrentDate] = useState('');
  
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  useEffect(() => {
    setCurrentDate(getCurrentDate());
  }, []);

  function vnNowString() {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit', minute:'2-digit', second:'2-digit'
    }).format(new Date());
  };

  // Add functions to handle dynamic lists
  const addStaff = () => {
    const randomStaff = sampleStaffData[staffList.length % sampleStaffData.length];
    setStaffList([...staffList, randomStaff]);
  };

  const addInventory = () => {
    const baseCount = 7; // initial seeded items
    const offset = inventoryList.length - baseCount;
    const idx = ((offset % additionalInventory.length) + additionalInventory.length) % additionalInventory.length;
    const randomInv = additionalInventory[idx] ?? { item: '', onHand: '', minLevel: '', unit: '', status: 'Đủ định mức', note: '' };
    setInventoryList([...inventoryList, randomInv]);
  };

  const addIncident = () => {
    const idx = (incidentList.length % sampleIncidents.length);
    const randomIncident = sampleIncidents[idx] ?? { category: '', item: '', priority: 'Medium', status: 'Cần xử lý', note: '' };
    setIncidentList([...incidentList, randomIncident]);
  };

  const updateStaff = (index: number, field: keyof StaffMember, value: string) => {
    const updated = [...staffList];
    updated[index] = { ...updated[index], [field]: value };
    setStaffList(updated);
  };

  const updateInventory = (index: number, field: keyof InventoryItem, value: string) => {
    const updated = [...inventoryList];
    updated[index] = { ...updated[index], [field]: value };
    setInventoryList(updated);
  };

  const updateIncident = (index: number, field: keyof Incident, value: string) => {
    const updated = [...incidentList];
    updated[index] = { ...updated[index], [field]: value };
    setIncidentList(updated);
  };

  const removeStaff = (index: number) => {
    setStaffList(staffList.filter((_, i) => i !== index));
  };

  const removeInventory = (index: number) => {
    setInventoryList(inventoryList.filter((_, i) => i !== index));
  };

  const removeIncident = (index: number) => {
    setIncidentList(incidentList.filter((_, i) => i !== index));
  };

  const handleSubmitReport = async () => {
    console.log('React handler: Button clicked - starting process');
    setIsSubmitting(true);
    setMessageColor('#6b7280');
    setStatusMessage('Đang kiểm tra...');

    try {

      // Collect form data
      const form = document.getElementById('startShiftForm') as HTMLFormElement;
      if (!form) {
        throw new Error('Form not found');
      }

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      // Add timestamp
      data.at = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

      console.log('Form data collected:', data);

      // Collect checklist data
      const checklistItems = {
        equipment: data.checklist_equipment === 'on',
        cleanliness: data.checklist_cleanliness === 'on',
        security: data.checklist_security === 'on',
        inventory: data.checklist_inventory === 'on',
        preparation: data.checklist_preparation === 'on'
      };

      // Check if all checklist items are completed
      const allChecklistCompleted = Object.values(checklistItems).every(item => item === true);
      const checklistStatus = allChecklistCompleted ? '✅' : '❌';

      // Collect staff data
      const staffData = staffList.map((staff, index) => {
        return {
          name: data[`staff_name_${index}`] || staff.name,
          role: data[`staff_role_${index}`] || staff.role,
          hours: data[`staff_hours_${index}`] || staff.hours,
          note: data[`staff_note_${index}`] || staff.note
        };
      }).filter(staff => staff.name.trim() !== '');

      // Collect inventory data
      const inventoryData = inventoryList.map((item, index) => {
        return {
          item: data[`inventory_item_${index}`] || item.item,
          onHand: data[`inventory_onHand_${index}`] || item.onHand,
          minLevel: data[`inventory_minLevel_${index}`] || item.minLevel,
          unit: data[`inventory_unit_${index}`] || item.unit,
          status: data[`inventory_status_${index}`] || item.status,
          note: data[`inventory_note_${index}`] || item.note
        };
      }).filter(item => item.item.trim() !== '');

      // Collect incident data
      const incidentData = incidentList.map((incident, index) => {
        return {
          category: data[`incident_category_${index}`] || incident.category,
          item: data[`incident_item_${index}`] || incident.item,
          priority: data[`incident_priority_${index}`] || incident.priority,
          status: data[`incident_status_${index}`] || incident.status,
          note: data[`incident_note_${index}`] || incident.note
        };
      }).filter(incident => incident.item.trim() !== '');

      // Format staff list for message
      const staffText = staffData.map(staff => 
        `• ${staff.name} - ${staff.role} (${staff.hours}h) ${staff.note ? '- ' + staff.note : ''}`
      ).join('\n') || 'Chưa có thông tin';

      // Format inventory list for message
      const inventoryText = inventoryData.map(item => 
        `• ${item.item}: ${item.onHand} ${item.unit} (Min: ${item.minLevel}) - ${item.status} ${item.note ? '- ' + item.note : ''}`
      ).join('\n') || 'Chưa có thông tin';

      // Format incidents list for message
      const incidentsText = incidentData.map(incident => 
        `• [${incident.priority}] ${incident.category}: ${incident.item} - ${incident.status} ${incident.note ? '- ' + incident.note : ''}`
      ).join('\n') || 'Không có sự cố';

      // Format checklist for message
      const checklistText = `
• Kiểm tra thiết bị: ${checklistItems.equipment ? '✅' : '❌'}
• Kiểm tra vệ sinh: ${checklistItems.cleanliness ? '✅' : '❌'}
• Kiểm tra an ninh: ${checklistItems.security ? '✅' : '❌'}
• Kiểm tra kho hàng: ${checklistItems.inventory ? '✅' : '❌'}
• Chuẩn bị ca làm việc: ${checklistItems.preparation ? '✅' : '❌'}`;

      // Format comprehensive message for Telegram
      const message = `🏪 <b>BÁO CÁO VÀO CA - ${data.storeId || 'N/A'}</b>\n\n` +
        `📋 <b>THÔNG TIN CHUNG</b>\n` +
        `• Cửa hàng: ${data.storeId || 'N/A'}\n` +
        `• Chi nhánh: ${data.branchName || 'N/A'}\n` +
        `• Ca làm việc: ${data.shiftPeriod || 'N/A'}\n` +
        `• Giờ vào ca: ${data.startTime || 'N/A'}\n` +
        `• Người phụ trách: ${data.manager || 'N/A'}\n` +
        `• Tài khoản: ${data.account || 'N/A'}\n` +
        `• Thời gian báo cáo: ${data.at}\n\n` +
        
        `💰 <b>QUỸ ĐẦU CA</b>\n` +
        `• Số tiền quỹ: ${data.openingFund ? parseInt(data.openingFund).toLocaleString('vi-VN') + ' VND' : 'N/A'}\n` +
        `• Tiền mặt: ${data.cashAmount ? parseInt(data.cashAmount).toLocaleString('vi-VN') + ' VND' : 'N/A'}\n` +
        `• Chuyển khoản: ${data.transferAmount ? parseInt(data.transferAmount).toLocaleString('vi-VN') + ' VND' : 'N/A'}\n\n` +
        
        `👥 <b>NHÂN SỰ CA</b>\n${staffText}\n\n` +
        
        `📦 <b>KHO & NGUYÊN LIỆU (ĐẦU CA)</b>\n${inventoryText}\n\n` +
        
        `📈 <b>MARKETING & KHÁCH HÀNG (KẾ HOẠCH)</b>\n` +
        `• Mục tiêu doanh thu: ${data.revenueTarget ? parseInt(data.revenueTarget).toLocaleString('vi-VN') + ' VND' : 'N/A'}\n` +
        `• Khuyến mãi hôm nay: ${data.promotions || 'Không có'}\n` +
        `• Kế hoạch marketing: ${data.marketingPlan || 'Không có'}\n\n` +
        
        `⚠️ <b>SỰ CỐ PHÁT SINH</b>\n${incidentsText}\n\n` +
        
        `🎯 <b>MỤC TIÊU CA (PRE-SHIFT)</b>\n` +
        `• Doanh thu mục tiêu: ${data.shiftRevenueTarget ? parseInt(data.shiftRevenueTarget).toLocaleString('vi-VN') + ' VND' : 'N/A'}\n` +
        `• Số khách mục tiêu: ${data.customerTarget || 'N/A'} khách\n` +
        `• Mục tiêu đặc biệt: ${data.specialGoals || 'Không có'}\n\n` +
        
        `${checklistStatus} <b>CHECKLIST VÀO CA</b>${checklistText}\n\n` +
        
        `📝 <b>GHI CHÚ BỔ SUNG</b>\n${data.notes || 'Không có ghi chú'}\n\n` +
        
        `📸 <b>ẢNH BILL/CHỨNG TỪ:</b> ${data.billImages ? 'Có đính kèm' : 'Không có'}\n`;

      setStatusMessage('Đang gửi đến Telegram...');

      // Send text message using HN40 specific function
      const success = await sendTelegramMessage40NQ(message);
      
      if (!success) {
        throw new Error('Failed to send message to Telegram');
      }

      // Send images if any
      const billImagesInput = document.getElementById('billPhotosInput') as HTMLInputElement;
      if (billImagesInput && billImagesInput.files && billImagesInput.files.length > 0) {
        setStatusMessage('Đang gửi ảnh...');
        
        for (let i = 0; i < Math.min(billImagesInput.files.length, 6); i++) {
          const file = billImagesInput.files[i];
          const caption = `📸 Ảnh bill/chứng từ ${i + 1}`;
          
          const photoSuccess = await sendTelegramPhoto40NQ(file, caption);
          if (!photoSuccess) {
            console.error(`Failed to send image ${i + 1}`);
          }
        }
      }

      setMessageColor('#16a34a');
      setStatusMessage('✅ Xác nhận gửi thành công! Báo cáo đã được gửi đến Telegram.');

    } catch (error) {
      console.error('Error:', error);
      setMessageColor('#dc2626');
      setStatusMessage(`❌ Lỗi: ${error.message || error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-background to-accent-soft">
      {/* Header */}
      <div className="bg-primary/5 backdrop-blur border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/HN40-dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <img src={ranGroupLogo} alt="RAN Group" className="h-8 w-auto" />
              <div>
                <h1 className="font-semibold text-primary">Báo Cáo Vào Ca</h1>
                <p className="text-sm text-muted-foreground">{selectedBranch || HN40_STORE_ID} • {currentDate}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-success text-success-foreground">
                <Clock className="h-3 w-3 mr-1" />
                Vào ca: {checkinTime}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card className="shadow-card max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <form id="startShiftForm" className="flex flex-col gap-4">
              {/* Form type identifier */}
              <input type="hidden" name="type" value="start" />
              
              {/* ===== Thông tin chung ===== */}
              <section className="p-4 border border-border rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Thông Tin Chung
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Cửa hàng (storeId) *</span>
                    <input 
                      name="storeId" 
                      defaultValue={getStoreId()} 
                      required
                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Chi nhánh</span>
                    <input 
                      name="branchName" 
                      defaultValue={getBranchName()}
                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Ca làm việc *</span>
                    <select 
                      name="shiftPeriod" 
                      required
                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="Sáng">Sáng</option>
                      <option value="Chiều">Chiều</option>
                      <option value="Tối">Tối</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Giờ vào ca</span>
                    <input 
                      name="startTime" 
                      type="time" 
                      placeholder="HH:mm"
                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Người phụ trách *</span>
                    <input 
                      name="manager" 
                      defaultValue={userData?.name || 'lyhoanghaiceo'} 
                      required
                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Tài khoản ghi nhận</span>
                    <input 
                      name="account" 
                      placeholder="username"
                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                </div>
              </section>

              {/* ===== Quỹ đầu ca ===== */}
              <section className="p-4 border border-border rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Quỹ Đầu Ca
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Số tiền quỹ đầu ca (VND)</span>
                    <input 
                      name="openingFund" 
                      type="number" 
                      inputMode="numeric" 
                      min="0" 
                      placeholder="VD: 500000"
                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Tiền mặt (VND)</span>
                    <input 
                      name="cashAmount" 
                      type="number" 
                      inputMode="numeric" 
                      min="0" 
                      placeholder="VD: 300000"
                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Chuyển khoản (VND)</span>
                    <input 
                      name="transferAmount" 
                      type="number" 
                      inputMode="numeric" 
                      min="0" 
                      placeholder="VD: 200000"
                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                </div>
              </section>

              {/* ===== Nhân sự ca ===== */}
              <section className="p-4 border border-border rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Nhân Sự Ca
                </h3>
                <div className="flex flex-col gap-2 mb-3">
                  {staffList.map((staff, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        className="col-span-3 px-2 py-1 border border-border rounded text-sm"
                        placeholder="Họ tên"
                        value={staff.name}
                        onChange={(e) => updateStaff(index, 'name', e.target.value)}
                      />
                      <input
                        className="col-span-2 px-2 py-1 border border-border rounded text-sm"
                        placeholder="Vai trò"
                        value={staff.role}
                        onChange={(e) => updateStaff(index, 'role', e.target.value)}
                      />
                      <input
                        className="col-span-2 px-2 py-1 border border-border rounded text-sm"
                        placeholder="Giờ công"
                        value={staff.hours}
                        onChange={(e) => updateStaff(index, 'hours', e.target.value)}
                      />
                      <input
                        className="col-span-4 px-2 py-1 border border-border rounded text-sm"
                        placeholder="Ghi chú"
                        value={staff.note}
                        onChange={(e) => updateStaff(index, 'note', e.target.value)}
                      />
                      {staffList.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="col-span-1 p-1 h-8"
                          onClick={() => removeStaff(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button type="button" onClick={addStaff} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm nhân sự
                </Button>
              </section>

              {/* ===== Kho & Nguyên liệu ===== */}
              <section className="p-4 border border-border rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Kho & Nguyên Liệu (đầu ca)
                </h3>
                <div className="flex flex-col gap-2 mb-3">
                  {inventoryList.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        className="col-span-3 px-2 py-1 border border-border rounded text-sm"
                        placeholder="Tên nguyên liệu"
                        value={item.item}
                        onChange={(e) => updateInventory(index, 'item', e.target.value)}
                      />
                      <input
                        className="col-span-2 px-2 py-1 border border-border rounded text-sm"
                        placeholder="Tồn hiện tại"
                        value={item.onHand}
                        onChange={(e) => updateInventory(index, 'onHand', e.target.value)}
                      />
                      <input
                        className="col-span-1 px-2 py-1 border border-border rounded text-sm"
                        placeholder="Định mức"
                        value={item.minLevel}
                        onChange={(e) => updateInventory(index, 'minLevel', e.target.value)}
                      />
                      <input
                        className="col-span-1 px-2 py-1 border border-border rounded text-sm"
                        placeholder="Đơn vị"
                        value={item.unit}
                        onChange={(e) => updateInventory(index, 'unit', e.target.value)}
                      />
                      <select
                        className="col-span-2 px-2 py-1 border border-border rounded text-sm"
                        value={item.status}
                        onChange={(e) => updateInventory(index, 'status', e.target.value)}
                      >
                        <option value="Đủ định mức">Đủ định mức</option>
                        <option value="Thiếu hàng">Thiếu hàng</option>
                        <option value="Cần sửa">Cần sửa</option>
                      </select>
                      <input
                        className="col-span-2 px-2 py-1 border border-border rounded text-sm"
                        placeholder="Ghi chú"
                        value={item.note}
                        onChange={(e) => updateInventory(index, 'note', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="col-span-1 p-1 h-8"
                        onClick={() => removeInventory(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" onClick={addInventory} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm nguyên liệu
                </Button>
              </section>

              {/* ===== Marketing & Khách hàng ===== */}
              <section className="p-4 border border-border rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Marketing & Khách Hàng (kế hoạch)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Campaign</span>
                    <input 
                      name="campaignName" 
                      placeholder="Happy Hour 14h-16h"
                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Ghi chú campaign</span>
                    <input 
                      name="campaignNote" 
                      placeholder="Target tăng trưởng 20%"
                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                </div>
              </section>

              {/* ===== Sự cố phát sinh ===== */}
              <section className="p-4 border border-border rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Sự Cố Phát Sinh
                </h3>
                <div className="flex flex-col gap-2 mb-3">
                  {incidentList.map((incident, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        className="col-span-2 px-2 py-1 border border-border rounded text-sm"
                        placeholder="Loại sự cố"
                        value={incident.category}
                        onChange={(e) => updateIncident(index, 'category', e.target.value)}
                      />
                      <input
                        className="col-span-3 px-2 py-1 border border-border rounded text-sm"
                        placeholder="Hạng mục"
                        value={incident.item}
                        onChange={(e) => updateIncident(index, 'item', e.target.value)}
                      />
                      <select
                        className="col-span-2 px-2 py-1 border border-border rounded text-sm"
                        value={incident.priority}
                        onChange={(e) => updateIncident(index, 'priority', e.target.value)}
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                      <select
                        className="col-span-2 px-2 py-1 border border-border rounded text-sm"
                        value={incident.status}
                        onChange={(e) => updateIncident(index, 'status', e.target.value)}
                      >
                        <option value="Cần xử lý">Cần xử lý</option>
                        <option value="Đã xử lý">Đã xử lý</option>
                        <option value="Đang theo dõi">Đang theo dõi</option>
                      </select>
                      <input
                        className="col-span-2 px-2 py-1 border border-border rounded text-sm"
                        placeholder="Mô tả/Ghi chú"
                        value={incident.note}
                        onChange={(e) => updateIncident(index, 'note', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="col-span-1 p-1 h-8"
                        onClick={() => removeIncident(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" onClick={addIncident} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm sự cố
                </Button>
              </section>

              {/* ===== Marketing & Khách hàng ===== */}
              <section className="p-4 border border-border rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Marketing & Khách Hàng (kế hoạch)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Mục tiêu doanh thu (VND)</span>
                    <input 
                      name="revenueTarget" 
                      type="number" 
                      inputMode="numeric" 
                      min="0" 
                      placeholder="VD: 5000000"
                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Khuyến mãi hôm nay</span>
                    <input 
                      name="promotions" 
                      placeholder="VD: Giảm 20% combo cà phê"
                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <label className="flex flex-col gap-2 md:col-span-2">
                    <span className="text-sm font-medium">Kế hoạch marketing</span>
                    <textarea 
                      name="marketingPlan" 
                      rows={3}
                      placeholder="VD: Đẩy mạnh bán combo, tập trung khách hàng thân thiết..."
                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                </div>
              </section>

              {/* Hidden JSON fields for Edge Function */}
              <input type="hidden" name="staff" value={JSON.stringify(staffList.filter(s => s.name || s.role || s.hours || s.note))} />
              <input type="hidden" name="inventory" value={JSON.stringify(inventoryList.filter(i => i.item))} />
              <input type="hidden" name="incidents" value={JSON.stringify(incidentList.filter(i => i.item || i.note))} />

              {/* ===== Mục tiêu ca ===== */}
              <section className="p-4 border border-border rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Mục Tiêu Ca (Pre-shift)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Doanh thu mục tiêu ca (VND)</span>
                    <input 
                      name="shiftRevenueTarget" 
                      type="number" 
                      inputMode="numeric" 
                      min="0"
                      placeholder="VD: 2000000"
                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Số khách mục tiêu</span>
                    <input 
                      name="customerTarget" 
                      type="number" 
                      inputMode="numeric" 
                      min="0"
                      placeholder="VD: 150"
                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">NPS target (1–10)</span>
                    <input 
                      name="targetNps" 
                      type="number" 
                      inputMode="decimal" 
                      min="0" 
                      max="10" 
                      step="0.1"
                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <label className="flex flex-col gap-2 md:col-span-2">
                    <span className="text-sm font-medium">Mục tiêu đặc biệt</span>
                    <textarea 
                      name="specialGoals" 
                      rows={2}
                      placeholder="VD: Tăng 15% combo, giảm 5% waste, cải thiện service time..."
                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                </div>
              </section>

              {/* ===== Checklist ===== */}
              <section className="p-4 border border-border rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Checklist Vào Ca
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" name="checklist_equipment" className="rounded" />
                    <span className="text-sm">Kiểm tra thiết bị</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" name="checklist_cleanliness" className="rounded" />
                    <span className="text-sm">Kiểm tra vệ sinh</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" name="checklist_security" className="rounded" />
                    <span className="text-sm">Kiểm tra an ninh</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" name="checklist_inventory" className="rounded" />
                    <span className="text-sm">Kiểm tra kho hàng</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" name="checklist_preparation" className="rounded" />
                    <span className="text-sm">Chuẩn bị ca làm việc</span>
                  </label>
                </div>
              </section>

              {/* ===== Ảnh bill/chứng từ ===== */}
              <section className="p-4 border border-border rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Ảnh Bill/Chứng Từ (tuỳ chọn - cập nhật ảnh từ album)
                </h3>
                <input 
                  type="file" 
                  name="billImages" 
                  id="billPhotosInput" 
                  accept="image/*" 
                  multiple 
                  capture="environment"
                  className="block w-full px-3 py-2 border border-dashed border-border rounded-lg bg-background file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <div className="text-xs text-muted-foreground mt-2">
                  Mẹo: Bạn có thể chọn từ thư viện ảnh hoặc dùng camera. Có thể đính kèm nhiều ảnh.
                </div>
                <div id="preview" className="flex gap-2 flex-wrap mt-3"></div>
              </section>

              {/* ===== Ghi chú bổ sung ===== */}
              <section className="p-4 border border-border rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  Ghi Chú Bổ Sung
                </h3>
                <textarea 
                  name="notes" 
                  rows={4}
                  placeholder="Nhập các ghi chú, lưu ý đặc biệt cho ca làm việc..."
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </section>

              {/* ===== Submit ===== */}
              <div className="flex items-center gap-4">
                <Button 
                  type="button"
                  onClick={handleSubmitReport}
                  disabled={isSubmitting}
                  className="bg-success hover:bg-success/90 text-success-foreground"
                >
                  {isSubmitting ? 'Đang gửi...' : '✅ Gửi Báo Cáo Vào Ca'}
                </Button>
                <span className="text-sm min-w-[260px]" style={{ color: messageColor }}>
                  {statusMessage}
                </span>
              </div>

              {/* Hidden fields for form data collection */}
              {staffList.map((staff, index) => (
                <div key={`staff-hidden-${index}`}>
                  <input type="hidden" name={`staff_name_${index}`} value={staff.name} />
                  <input type="hidden" name={`staff_role_${index}`} value={staff.role} />
                  <input type="hidden" name={`staff_hours_${index}`} value={staff.hours} />
                  <input type="hidden" name={`staff_note_${index}`} value={staff.note} />
                </div>
              ))}
              {inventoryList.map((item, index) => (
                <div key={`inventory-hidden-${index}`}>
                  <input type="hidden" name={`inventory_item_${index}`} value={item.item} />
                  <input type="hidden" name={`inventory_onHand_${index}`} value={item.onHand} />
                  <input type="hidden" name={`inventory_minLevel_${index}`} value={item.minLevel} />
                  <input type="hidden" name={`inventory_unit_${index}`} value={item.unit} />
                  <input type="hidden" name={`inventory_status_${index}`} value={item.status} />
                  <input type="hidden" name={`inventory_note_${index}`} value={item.note} />
                </div>
              ))}
              {incidentList.map((incident, index) => (
                <div key={`incident-hidden-${index}`}>
                  <input type="hidden" name={`incident_category_${index}`} value={incident.category} />
                  <input type="hidden" name={`incident_item_${index}`} value={incident.item} />
                  <input type="hidden" name={`incident_priority_${index}`} value={incident.priority} />
                  <input type="hidden" name={`incident_status_${index}`} value={incident.status} />
                  <input type="hidden" name={`incident_note_${index}`} value={incident.note} />
                </div>
              ))}
              <input type="hidden" name="redirect" value="/thank-you" />
            </form>
          </CardContent>
        </Card>

        <script dangerouslySetInnerHTML={{__html: `
          // Auto set VN time
          setTimeout(() => {
            try{
              const el = document.querySelector('input[name="startTime"]');
              const now = new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',hour12:false, timeZone:'Asia/Ho_Chi_Minh'});
              if (el && !el.value) el.value = now;
            }catch{}
          }, 100);

          // Preview ảnh
          const fileInput = document.getElementById("billPhotosInput");
          const preview = document.getElementById("preview");
          
          if (fileInput) {
            fileInput.addEventListener('change', () => {
              preview.innerHTML = "";
              const files = Array.from(fileInput.files || []).slice(0, 6);
              for (const f of files) {
                const url = URL.createObjectURL(f);
                const img = document.createElement('img');
                img.src = url;
                img.style.width = "80px";
                img.style.height = "80px";
                img.style.objectFit = "cover";
                img.style.borderRadius = "8px";
                img.title = f.name;
                preview.appendChild(img);
              }
            });
          }
        `}} />
      </div>
    </div>
  );
}