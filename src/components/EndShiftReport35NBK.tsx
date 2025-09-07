import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import ranGroupLogo from '@/assets/ran-group-logo.png';
import { useAuth } from '@/context/AuthContext';

// HN35 specific constants
const HN35_BOT_TOKEN = '8241020529:AAHW_BrHrjoQIvSR2TfmPv_en6u2BmvX_pg';
const HN35_CHAT_ID = '-4802817130';
const HN35_STORE_ID = 'HN35';
const HN35_BRANCH_NAME = '35 Nguyễn Bỉnh Khiêm, Hà Nội';

// HN35 specific Telegram functions
const sendEndShiftReportToTelegram35NBK = async (data: any) => {
  try {
    // Format message
    let message = `🔚 <b>BÁO CÁO RA CA - ${data.branchName}</b>\n\n` +
      `📍 <b>Thông tin chung:</b>\n` +
      `• Cửa hàng: ${data.storeId}\n` +
      `• Chi nhánh: ${data.branchName}\n` +
      `• Ca làm việc: ${data.shiftPeriod}\n` +
      `• Người phụ trách: ${data.manager}\n` +
      `• Tài khoản: ${data.accountName} (${data.accountId})\n` +
      `• Giờ ra ca: ${data.endTime}\n` +
      `• Mã hồ sơ: ${data.refId || 'Tự sinh'}\n\n` +
      
      `💵 <b>Doanh thu POS:</b>\n` +
      `• Tiền mặt: ${data.pos_cash?.toLocaleString() || 0} VND\n` +
      `• Thẻ: ${data.pos_card?.toLocaleString() || 0} VND\n` +
      `• QR/E-Wallet: ${data.pos_ewallet?.toLocaleString() || 0} VND\n` +
      `• Tổng doanh thu: ${data.pos_total?.toLocaleString() || 0} VND\n` +
      `• Số bill: ${data.pos_bills || 0}\n` +
      `• Số khách: ${data.pos_guests || 0}\n` +
      `• AOV: ${data.pos_aov?.toLocaleString() || 0} VND\n\n` +
      
      `🧾 <b>Đối soát quỹ:</b>\n` +
      `• Tiền lý thuyết: ${data.fund_theory?.toLocaleString() || 0} VND\n` +
      `• Tiền thực đếm: ${data.fund_counted?.toLocaleString() || 0} VND\n` +
      `• Chênh lệch: ${data.fund_delta?.toLocaleString() || 0} VND\n\n`;

    // Add inventory section if exists
    if (data.inventory && data.inventory.length > 0) {
      const inventoryText = data.inventory.map((item: any, index: number) => 
        `${index + 1}. ${item.name}: Tồn cuối ${item.last}, Lý thuyết ${item.theo}, Chênh lệch ${item.diff}${item.note ? ` (${item.note})` : ''}`
      ).join('\n');
      message += `📦 <b>Kho & Nguyên liệu:</b>\n${inventoryText}\n\n`;
    }

    // Add staff section if exists
    if (data.staff && data.staff.length > 0) {
      const staffText = data.staff.map((person: any, index: number) => 
        `${index + 1}. ${person.name} (${person.role}): Ra ca ${person.timeOut}, ${person.hours}h, Tip ${person.tip || 0} VND${person.note ? ` - ${person.note}` : ''}`
      ).join('\n');
      message += `👥 <b>Nhân sự ca:</b>\n${staffText}\n\n`;
    }

    // Add marketing section
    message += `📈 <b>Marketing & Khách hàng:</b>\n` +
      `• Voucher sử dụng: ${data.mkt_voucherCount || 0} (${data.mkt_voucherValue?.toLocaleString() || 0} VND)\n` +
      `• Khách mới: ${data.mkt_newCustomers || 0}\n` +
      `• Khách quay lại: ${data.mkt_returningCustomers || 0}\n` +
      `• Rating TB: ${data.mkt_rating || 'N/A'}\n` +
      `• NPS: ${data.mkt_nps || 'N/A'}\n`;
    
    if (data.mkt_feedback) {
      message += `• Feedback: ${data.mkt_feedback}\n`;
    }
    message += '\n';

    // Add incidents section if exists
    if (data.incidents && data.incidents.length > 0) {
      const incidentText = data.incidents.map((incident: any, index: number) => 
        `${index + 1}. ${incident.type} - ${incident.status}: ${incident.desc}. Xử lý: ${incident.action}`
      ).join('\n');
      message += `⚠️ <b>Sự cố phát sinh:</b>\n${incidentText}\n\n`;
    }

    if (data.imageNotes) {
      message += `📷 <b>Ghi chú ảnh:</b> ${data.imageNotes}\n\n`;
    }

    message += `⏰ <b>Thời gian báo cáo:</b> ${data.at}\n`;
    message += `👤 <b>Người báo cáo:</b> ${data.accountName}`;

    // Send text message
    const response = await fetch(`https://api.telegram.org/bot${HN35_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: HN35_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send message to Telegram');
    }

    // Send images if any
    if (data.images && data.images.length > 0) {
      for (const image of data.images) {
        // Skip if image is not a valid File object or is empty
        if (!image || !(image instanceof File) || image.size === 0) {
          console.warn('Skipping invalid or empty image file');
          continue;
        }

        const formData = new FormData();
        formData.append('chat_id', HN35_CHAT_ID);
        formData.append('photo', image);
        formData.append('caption', `📷 Ảnh bill/chứng từ - ${data.branchName}`);
        formData.append('parse_mode', 'HTML');

        try {
          const imageResponse = await fetch(`https://api.telegram.org/bot${HN35_BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData
          });

          if (!imageResponse.ok) {
            const errorText = await imageResponse.text();
            console.error('Failed to send image to Telegram:', errorText);
          }
        } catch (error) {
          console.error('Error sending image to Telegram:', error);
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    throw error;
  }
};

export default function EndShiftReport35NBK() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getBranchName = () => {
    return HN35_BRANCH_NAME;
  };

  const getStoreId = () => {
    return HN35_STORE_ID;
  };

  // Auto-set VN time
  useEffect(() => {
    const setVNTime = () => {
      const now = new Date();
      const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // UTC+7
      const timeString = vnTime.toISOString().slice(0, 19).replace('T', ' ');
      
      const atInput = document.getElementById('at-vn') as HTMLInputElement;
      if (atInput) {
        atInput.value = timeString;
      }
    };

    setVNTime();
    const interval = setInterval(setVNTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sample data for testing
  const sampleInventory = [
    { name: 'Cà phê hạt Arabica', last: '2.5kg', theo: '3kg', diff: '-0.5kg', note: 'Cần bổ sung' },
    { name: 'Sữa tươi', last: '15 hộp', theo: '20 hộp', diff: '-5 hộp', note: '' },
    { name: 'Đường trắng', last: '3kg', theo: '3kg', diff: '0kg', note: 'Đủ' }
  ];

  const sampleStaff = [
    { name: 'Nguyễn Văn A', role: 'Barista', timeOut: '22:00', hours: '8', tip: '50000', note: 'Ca tối' },
    { name: 'Trần Thị B', role: 'Thu ngân', timeOut: '22:00', hours: '8', tip: '30000', note: '' }
  ];

  const sampleIncidents = [
    { type: 'Thiết bị', status: 'Đã xử lý', desc: 'Máy pha cà phê bị kẹt', action: 'Vệ sinh và khởi động lại' }
  ];

  useEffect(() => {
    // Populate sample data
    const populateInventory = () => {
      const invList = document.getElementById('invList');
      if (invList) {
        invList.innerHTML = '';
        sampleInventory.forEach(item => {
          const row = document.createElement('div');
          row.className = 'invRow grid grid-cols-2 md:grid-cols-6 gap-2 items-center';
          row.innerHTML = `
            <input name="inv_name[]" value="${item.name}" placeholder="Tên mặt hàng" class="col-span-2 p-2 border border-input rounded-md bg-background" />
            <input name="inv_last[]" value="${item.last}" placeholder="Tồn cuối ca" class="p-2 border border-input rounded-md bg-background" />
            <input name="inv_theo[]" value="${item.theo}" placeholder="Lý thuyết" class="p-2 border border-input rounded-md bg-background" />
            <input name="inv_diff[]" value="${item.diff}" placeholder="Chênh lệch" class="p-2 border border-input rounded-md bg-background" />
            <input name="inv_note[]" value="${item.note}" placeholder="Ghi chú" class="p-2 border border-input rounded-md bg-background" />
            <button type="button" class="removeRow px-2 py-1 bg-destructive text-destructive-foreground rounded ml-2">✕</button>
          `;
          invList.appendChild(row);
        });
      }
    };

    const populateStaff = () => {
      const staffList = document.getElementById('staffList');
      if (staffList) {
        staffList.innerHTML = '';
        sampleStaff.forEach(person => {
          const row = document.createElement('div');
          row.className = 'staffRow grid grid-cols-2 md:grid-cols-7 gap-2 items-center';
          row.innerHTML = `
            <input name="staff_name[]" value="${person.name}" placeholder="Họ tên" class="p-2 border border-input rounded-md bg-background" />
            <input name="staff_role[]" value="${person.role}" placeholder="Vai trò" class="p-2 border border-input rounded-md bg-background" />
            <input name="staff_timeOut[]" value="${person.timeOut}" placeholder="Giờ ra ca" class="p-2 border border-input rounded-md bg-background" />
            <input name="staff_hours[]" value="${person.hours}" placeholder="Giờ công" class="p-2 border border-input rounded-md bg-background" />
            <input name="staff_tip[]" value="${person.tip}" placeholder="Tip (VND)" class="p-2 border border-input rounded-md bg-background" />
            <input name="staff_note[]" value="${person.note}" placeholder="Ghi chú" class="p-2 border border-input rounded-md bg-background" />
            <button type="button" class="removeRow px-2 py-1 bg-destructive text-destructive-foreground rounded">✕</button>
          `;
          staffList.appendChild(row);
        });
      }
    };

    const populateIncidents = () => {
      const incidentList = document.getElementById('incidentList');
      if (incidentList) {
        incidentList.innerHTML = '';
        sampleIncidents.forEach(incident => {
          const row = document.createElement('div');
          row.className = 'incidentRow grid grid-cols-1 md:grid-cols-5 gap-2';
          row.innerHTML = `
            <input name="incident_type[]" value="${incident.type}" placeholder="Loại (thiết bị, khách hàng,…)" class="p-2 border border-input rounded-md bg-background" />
            <input name="incident_status[]" value="${incident.status}" placeholder="Trạng thái (đã xử lý,…)" class="p-2 border border-input rounded-md bg-background" />
            <input name="incident_desc[]" value="${incident.desc}" placeholder="Mô tả sự cố" class="p-2 border border-input rounded-md bg-background" />
            <input name="incident_action[]" value="${incident.action}" placeholder="Hành động xử lý" class="p-2 border border-input rounded-md bg-background" />
            <button type="button" class="removeRow px-2 py-1 bg-destructive text-destructive-foreground rounded">✕</button>
          `;
          incidentList.appendChild(row);
        });
      }
    };

    // Delay to ensure DOM is ready
    setTimeout(() => {
      populateInventory();
      populateStaff();
      populateIncidents();
    }, 100);
  }, []);

  const [currentDate, setCurrentDate] = useState('');
  
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getCurrentVNTime = () => {
    const now = new Date();
    const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    return vnTime.toISOString().slice(0, 19).replace('T', ' ');
  };
  
  useEffect(() => {
    setCurrentDate(getCurrentDate());
  }, []);

  const addInventoryRow = () => {
    const invList = document.getElementById('invList');
    if (invList) {
      const row = document.createElement('div');
      row.className = 'invRow grid grid-cols-2 md:grid-cols-6 gap-2 items-center';
      row.innerHTML = `
        <input name="inv_name[]" placeholder="Tên mặt hàng" class="col-span-2 p-2 border border-input rounded-md bg-background" />
        <input name="inv_last[]" placeholder="Tồn cuối ca" class="p-2 border border-input rounded-md bg-background" />
        <input name="inv_theo[]" placeholder="Lý thuyết" class="p-2 border border-input rounded-md bg-background" />
        <input name="inv_diff[]" placeholder="Chênh lệch" class="p-2 border border-input rounded-md bg-background" />
        <input name="inv_note[]" placeholder="Ghi chú" class="p-2 border border-input rounded-md bg-background" />
        <button type="button" class="removeRow px-2 py-1 bg-destructive text-destructive-foreground rounded ml-2">✕</button>
      `;
      invList.appendChild(row);
    }
  };

  const addStaffRow = () => {
    const staffList = document.getElementById('staffList');
    if (staffList) {
      const row = document.createElement('div');
      row.className = 'staffRow grid grid-cols-2 md:grid-cols-7 gap-2 items-center';
      row.innerHTML = `
        <input name="staff_name[]" placeholder="Họ tên" class="p-2 border border-input rounded-md bg-background" />
        <input name="staff_role[]" placeholder="Vai trò" class="p-2 border border-input rounded-md bg-background" />
        <input name="staff_timeOut[]" placeholder="Giờ ra ca" class="p-2 border border-input rounded-md bg-background" />
        <input name="staff_hours[]" placeholder="Giờ công" class="p-2 border border-input rounded-md bg-background" />
        <input name="staff_tip[]" placeholder="Tip (VND)" class="p-2 border border-input rounded-md bg-background" />
        <input name="staff_note[]" placeholder="Ghi chú" class="p-2 border border-input rounded-md bg-background" />
        <button type="button" class="removeRow px-2 py-1 bg-destructive text-destructive-foreground rounded">✕</button>
      `;
      staffList.appendChild(row);
    }
  };

  const addIncidentRow = () => {
    const incidentList = document.getElementById('incidentList');
    if (incidentList) {
      const row = document.createElement('div');
      row.className = 'incidentRow grid grid-cols-1 md:grid-cols-5 gap-2';
      row.innerHTML = `
        <input name="incident_type[]" placeholder="Loại (thiết bị, khách hàng,…)" class="p-2 border border-input rounded-md bg-background" />
        <input name="incident_status[]" placeholder="Trạng thái (đã xử lý,…)" class="p-2 border border-input rounded-md bg-background" />
        <input name="incident_desc[]" placeholder="Mô tả sự cố" class="p-2 border border-input rounded-md bg-background" />
        <input name="incident_action[]" placeholder="Hành động xử lý" class="p-2 border border-input rounded-md bg-background" />
        <button type="button" class="removeRow px-2 py-1 bg-destructive text-destructive-foreground rounded">✕</button>
      `;
      incidentList.appendChild(row);
    }
  };

  const removeRow = (event: any) => {
    if (event.target.classList.contains('removeRow')) {
      event.target.closest('.invRow, .staffRow, .incidentRow')?.remove();
    }
  };

  const parseArrayFields = (formData: FormData, fieldName: string) => {
    const values = formData.getAll(fieldName) as string[];
    return values.filter(value => value.trim() !== '');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      const formData = new FormData(event.currentTarget);
      
      // Parse form data
      const data = {
        // Basic info
        storeId: formData.get('storeId') as string || getStoreId(),
        branchName: formData.get('branchName') as string || getBranchName(),
        shiftPeriod: formData.get('shiftPeriod') as string,
        manager: formData.get('manager') as string,
        accountName: formData.get('accountName') as string,
        accountId: formData.get('accountId') as string,
        endTime: formData.get('endTime') as string,
        refId: formData.get('refId') as string,
        at: formData.get('at') as string || getCurrentVNTime(),

        // POS data
        pos_cash: parseFloat(formData.get('pos_cash') as string) || 0,
        pos_card: parseFloat(formData.get('pos_card') as string) || 0,
        pos_ewallet: parseFloat(formData.get('pos_ewallet') as string) || 0,
        pos_total: parseFloat(formData.get('pos_total') as string) || 0,
        pos_bills: parseInt(formData.get('pos_bills') as string) || 0,
        pos_guests: parseInt(formData.get('pos_guests') as string) || 0,
        pos_aov: parseFloat(formData.get('pos_aov') as string) || 0,

        // Fund reconciliation
        fund_theory: parseFloat(formData.get('fund_theory') as string) || 0,
        fund_counted: parseFloat(formData.get('fund_counted') as string) || 0,
        fund_delta: parseFloat(formData.get('fund_delta') as string) || 0,

        // Marketing
        mkt_voucherCount: parseInt(formData.get('mkt_voucherCount') as string) || 0,
        mkt_voucherValue: parseFloat(formData.get('mkt_voucherValue') as string) || 0,
        mkt_newCustomers: parseInt(formData.get('mkt_newCustomers') as string) || 0,
        mkt_returningCustomers: parseInt(formData.get('mkt_returningCustomers') as string) || 0,
        mkt_rating: parseFloat(formData.get('mkt_rating') as string) || 0,
        mkt_nps: parseFloat(formData.get('mkt_nps') as string) || 0,
        mkt_feedback: formData.get('mkt_feedback') as string,

        // Dynamic arrays
        inventory: parseArrayFields(formData, 'inv_name[]').map((name, index) => ({
          name,
          last: parseArrayFields(formData, 'inv_last[]')[index] || '',
          theo: parseArrayFields(formData, 'inv_theo[]')[index] || '',
          diff: parseArrayFields(formData, 'inv_diff[]')[index] || '',
          note: parseArrayFields(formData, 'inv_note[]')[index] || ''
        })),

        staff: parseArrayFields(formData, 'staff_name[]').map((name, index) => ({
          name,
          role: parseArrayFields(formData, 'staff_role[]')[index] || '',
          timeOut: parseArrayFields(formData, 'staff_timeOut[]')[index] || '',
          hours: parseArrayFields(formData, 'staff_hours[]')[index] || '',
          tip: parseArrayFields(formData, 'staff_tip[]')[index] || '',
          note: parseArrayFields(formData, 'staff_note[]')[index] || ''
        })),

        incidents: parseArrayFields(formData, 'incident_type[]').map((type, index) => ({
          type,
          status: parseArrayFields(formData, 'incident_status[]')[index] || '',
          desc: parseArrayFields(formData, 'incident_desc[]')[index] || '',
          action: parseArrayFields(formData, 'incident_action[]')[index] || ''
        })),

        // Images and notes
        images: formData.getAll('images[]') as File[],
        imageNotes: formData.get('imageNotes') as string
      };

      // Send to Telegram
      await sendEndShiftReportToTelegram35NBK(data);
      
      setSubmitStatus('success');
      setSubmitMessage('✅ Báo cáo ra ca đã được gửi thành công!');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        (event.target as HTMLFormElement).reset();
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting report:', error);
      setSubmitStatus('error');
      setSubmitMessage('❌ Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Event delegation for dynamic buttons
  useEffect(() => {
    const handleClick = (event: any) => {
      if (event.target.id === 'addInv') {
        addInventoryRow();
      } else if (event.target.id === 'addStaff') {
        addStaffRow();
      } else if (event.target.id === 'addIncident') {
        addIncidentRow();
      } else if (event.target.classList.contains('removeRow')) {
        removeRow(event);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 hover:bg-white/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
            
            <div className="flex items-center gap-4">
              <img src={ranGroupLogo} alt="RAN Group" className="h-12 w-auto" />
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Báo Cáo Ra Ca</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="h-4 w-4" />
                  <span>{getBranchName()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thời gian máy khách (VN) sẽ auto set bằng JS */}
            <input type="hidden" name="at" id="at-vn" />

            {/* ===== THÔNG TIN CHUNG ===== */}
            <section className="border border-border rounded-xl p-4 bg-card shadow-card">
              <h3 className="font-bold text-lg mb-4">🧭 Thông Tin Chung</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cửa hàng (storeId)</label>
                  <input name="storeId" placeholder="VD: RAN-40NQHN" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Chi nhánh (branchName)</label>
                  <input name="branchName" defaultValue={getBranchName()} className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Ca làm việc (shiftPeriod)</label>
                  <input name="shiftPeriod" placeholder="VD: Sáng / Chiều / Tối" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Người phụ trách (manager)</label>
                  <input name="manager" placeholder="VD: lyhoanghaiceo" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tài khoản (accountName)</label>
                  <input name="accountName" placeholder="Tên hiển thị" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">ID tài khoản (accountId)</label>
                  <input name="accountId" placeholder="VD: staff-HN01" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Giờ ra ca (endTime)</label>
                  <input name="endTime" placeholder="VD: 05:40" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Mã hồ sơ (refId - tuỳ chọn)</label>
                  <input name="refId" placeholder="Để trống sẽ tự sinh" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
              </div>
            </section>

            {/* ===== DOANH THU POS ===== */}
            <section className="border border-border rounded-xl p-4 bg-card shadow-card">
              <h3 className="font-bold text-lg mb-4">💵 Doanh Thu POS</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tiền mặt (VND)</label>
                  <input type="number" name="pos_cash" id="pos_cash" placeholder="0" min="0" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Thẻ (VND)</label>
                  <input type="number" name="pos_card" id="pos_card" placeholder="0" min="0" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">QR/E-Wallet (VND)</label>
                  <input type="number" name="pos_ewallet" id="pos_ewallet" placeholder="0" min="0" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tổng doanh thu (VND)</label>
                  <input type="number" name="pos_total" id="pos_total" placeholder="Tự tính" min="0" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Số bill</label>
                  <input type="number" name="pos_bills" id="pos_bills" placeholder="0" min="0" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Số khách</label>
                  <input type="number" name="pos_guests" id="pos_guests" placeholder="0" min="0" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">AOV (VND)</label>
                  <input type="number" name="pos_aov" id="pos_aov" placeholder="Tự tính nếu có tổng & khách" min="0" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
              </div>
            </section>

            {/* ===== ĐỐI SOÁT QUỸ ===== */}
            <section className="border border-border rounded-xl p-4 bg-card shadow-card">
              <h3 className="font-bold text-lg mb-4">🧾 Đối Soát Quỹ</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tiền lý thuyết (VND)</label>
                  <input type="number" name="fund_theory" id="fund_theory" placeholder="0" min="0" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tiền thực đếm (VND)</label>
                  <input type="number" name="fund_counted" id="fund_counted" placeholder="0" min="0" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Chênh lệch (VND)</label>
                  <input type="number" name="fund_delta" id="fund_delta" placeholder="Tự tính (thực - lý thuyết)" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
              </div>
            </section>

            {/* ===== KHO & NGUYÊN LIỆU (DANH SÁCH) ===== */}
            <section className="border border-border rounded-xl p-4 bg-card shadow-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">📦 Kho & Nguyên Liệu (tồn cuối ca)</h3>
                <button type="button" id="addInv" className="px-3 py-2 border border-input rounded-md bg-background hover:bg-accent">+ Thêm nguyên liệu</button>
              </div>
              <div id="invList" className="space-y-2">
                {/* Row mẫu */}
                <div className="invRow grid grid-cols-2 md:grid-cols-6 gap-2 items-center">
                  <input name="inv_name[]" placeholder="Tên mặt hàng" className="col-span-2 p-2 border border-input rounded-md bg-background" />
                  <input name="inv_last[]" placeholder="Tồn cuối ca" className="p-2 border border-input rounded-md bg-background" />
                  <input name="inv_theo[]" placeholder="Lý thuyết" className="p-2 border border-input rounded-md bg-background" />
                  <input name="inv_diff[]" placeholder="Chênh lệch" className="p-2 border border-input rounded-md bg-background" />
                  <input name="inv_note[]" placeholder="Ghi chú" className="p-2 border border-input rounded-md bg-background" />
                  <button type="button" className="removeRow px-2 py-1 bg-destructive text-destructive-foreground rounded ml-2">✕</button>
                </div>
              </div>
            </section>

            {/* ===== NHÂN SỰ CA (DANH SÁCH) ===== */}
            <section className="border border-border rounded-xl p-4 bg-card shadow-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">👥 Nhân Sự Ca</h3>
                <button type="button" id="addStaff" className="px-3 py-2 border border-input rounded-md bg-background hover:bg-accent">+ Thêm nhân sự</button>
              </div>
              <div id="staffList" className="space-y-2">
                {/* Row mẫu */}
                <div className="staffRow grid grid-cols-2 md:grid-cols-7 gap-2 items-center">
                  <input name="staff_name[]" placeholder="Họ tên" className="p-2 border border-input rounded-md bg-background" />
                  <input name="staff_role[]" placeholder="Vai trò" className="p-2 border border-input rounded-md bg-background" />
                  <input name="staff_timeOut[]" placeholder="Giờ ra ca" className="p-2 border border-input rounded-md bg-background" />
                  <input name="staff_hours[]" placeholder="Giờ công" className="p-2 border border-input rounded-md bg-background" />
                  <input name="staff_tip[]" placeholder="Tip (VND)" className="p-2 border border-input rounded-md bg-background" />
                  <input name="staff_note[]" placeholder="Ghi chú" className="p-2 border border-input rounded-md bg-background" />
                  <button type="button" className="removeRow px-2 py-1 bg-destructive text-destructive-foreground rounded">✕</button>
                </div>
              </div>
            </section>

            {/* ===== MARKETING & KHÁCH HÀNG ===== */}
            <section className="border border-border rounded-xl p-4 bg-card shadow-card">
              <h3 className="font-bold text-lg mb-4">📈 Marketing & Khách Hàng</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Voucher sử dụng (số)</label>
                  <input type="number" name="mkt_voucherCount" placeholder="0" min="0" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Giá trị voucher (VND)</label>
                  <input type="number" name="mkt_voucherValue" placeholder="0" min="0" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Khách mới</label>
                  <input type="number" name="mkt_newCustomers" placeholder="0" min="0" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Khách quay lại</label>
                  <input type="number" name="mkt_returningCustomers" placeholder="0" min="0" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Rating TB (1–5)</label>
                  <input type="number" step="0.1" min="1" max="5" name="mkt_rating" placeholder="VD: 4.3" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">NPS</label>
                  <input type="number" step="0.1" name="mkt_nps" placeholder="VD: 8.2" className="w-full p-2 border border-input rounded-md bg-background" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-foreground mb-2">Feedback nổi bật</label>
                <textarea name="mkt_feedback" rows={3} placeholder="Ghi lại nhận xét nổi bật của khách" className="w-full p-2 border border-input rounded-md bg-background"></textarea>
              </div>
            </section>

            {/* ===== SỰ CỐ PHÁT SINH (DANH SÁCH) ===== */}
            <section className="border border-border rounded-xl p-4 bg-card shadow-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">⚠️ Sự Cố Phát Sinh</h3>
                <button type="button" id="addIncident" className="px-3 py-2 border border-input rounded-md bg-background hover:bg-accent">+ Thêm sự cố</button>
              </div>
              <div id="incidentList" className="space-y-2">
                {/* Row mẫu */}
                <div className="incidentRow grid grid-cols-1 md:grid-cols-5 gap-2">
                  <input name="incident_type[]" placeholder="Loại (thiết bị, khách hàng,…)" className="p-2 border border-input rounded-md bg-background" />
                  <input name="incident_status[]" placeholder="Trạng thái (đã xử lý,…)" className="p-2 border border-input rounded-md bg-background" />
                  <input name="incident_desc[]" placeholder="Mô tả sự cố" className="p-2 border border-input rounded-md bg-background" />
                  <input name="incident_action[]" placeholder="Hành động xử lý" className="p-2 border border-input rounded-md bg-background" />
                  <button type="button" className="removeRow px-2 py-1 bg-destructive text-destructive-foreground rounded">✕</button>
                </div>
              </div>
            </section>

            {/* ===== ẢNH BILL/CHỨNG TỪ ===== */}
            <section className="border border-border rounded-xl p-4 bg-card shadow-card">
              <h3 className="font-bold text-lg mb-4">📷 Ảnh Bill/Chứng Từ (tuỳ chọn)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Chọn ảnh từ album</label>
                  <input 
                    type="file" 
                    name="images[]" 
                    multiple 
                    accept="image/*" 
                    className="w-full p-2 border border-input rounded-md bg-background file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" 
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>• Có thể chọn nhiều ảnh cùng lúc</p>
                  <p>• Định dạng hỗ trợ: JPG, PNG, GIF</p>
                  <p>• Kích thước tối đa: 10MB mỗi ảnh</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Ghi chú bổ sung</label>
                  <textarea 
                    name="imageNotes" 
                    rows={3} 
                    placeholder="Mô tả về các ảnh đã upload (tuỳ chọn)" 
                    className="w-full p-2 border border-input rounded-md bg-background"
                  ></textarea>
                </div>
              </div>
            </section>

            {/* ===== THÔNG BÁO TRẠNG THÁI ===== */}
            {submitStatus !== 'idle' && (
              <div className={`p-4 rounded-lg border ${
                submitStatus === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {submitStatus === 'success' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <span className="font-medium">{submitMessage}</span>
                </div>
              </div>
            )}

            {/* ===== NÚT GỬI ===== */}
            <div className="flex justify-end gap-3">
              <button 
                type="reset" 
                className="px-4 py-2 border border-input rounded-lg bg-background hover:bg-accent disabled:opacity-50"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-primary text-primary-foreground border-none rounded-lg cursor-pointer hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Đang gửi...' : 'Gửi Báo Cáo Ra Ca'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}