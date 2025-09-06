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
import { sendEndShiftReportToTelegram, EndShiftReportData } from '@/utils/telegramApi';

export default function EndShiftReport() {
  const { userData, selectedBranch } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Get branch name based on current URL
  const getBranchName = () => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('HN40')) {
      return '40 Ngô Quyền, Hà Nội';
    }
    return '35 Nguyễn Bỉnh Khiêm, Hà Nội'; // Default to HN35
  };

  useEffect(() => {
    // ========== Auto set thời gian VN ==========
    const el = document.getElementById('at-vn') as HTMLInputElement;
    if (el) {
      try {
        el.value = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      } catch {
        el.value = new Date().toLocaleString('vi-VN');
      }
    }

    // ========== Tính tổng POS & AOV realtime ==========
    const cash = document.getElementById('pos_cash') as HTMLInputElement;
    const card = document.getElementById('pos_card') as HTMLInputElement;
    const ewlt = document.getElementById('pos_ewallet') as HTMLInputElement;
    const total = document.getElementById('pos_total') as HTMLInputElement;
    const bills = document.getElementById('pos_bills') as HTMLInputElement;
    const guests = document.getElementById('pos_guests') as HTMLInputElement;
    const aov = document.getElementById('pos_aov') as HTMLInputElement;

    function calcPOS() {
      const c = Number(cash?.value || 0);
      const d = Number(card?.value || 0);
      const q = Number(ewlt?.value || 0);
      const t = Number(total?.value || 0);
      const g = Number(guests?.value || 0);

      const sum = c + d + q;
      if (total && !total.value) total.value = sum.toString() || '';

      if (aov && !aov.value) {
        if ((t || sum) && g) {
          const base = t || sum;
          aov.value = (Math.round((base / g) * 100) / 100).toString();
        }
      }
    }
    
    if (cash && card && ewlt && total && guests) {
      [cash, card, ewlt, total, guests].forEach(el => el.addEventListener('input', () => {
        if (aov) aov.value = '';
        calcPOS();
      }));
    }

    // ========== Tính chênh quỹ realtime ==========
    const fTheory = document.getElementById('fund_theory') as HTMLInputElement;
    const fCounted = document.getElementById('fund_counted') as HTMLInputElement;
    const fDelta = document.getElementById('fund_delta') as HTMLInputElement;

    function calcFund() {
      const th = Number(fTheory?.value || 0);
      const ct = Number(fCounted?.value || 0);
      if (fDelta) fDelta.value = (ct - th).toString();
    }
    
    if (fTheory && fCounted) {
      [fTheory, fCounted].forEach(el => el.addEventListener('input', calcFund));
    }

    // ========== Thêm/xóa dòng Inventory, Staff, Incident ==========
    function wireRemove(container: Element) {
      if (container) {
        container.addEventListener('click', (e) => {
          const btn = (e.target as Element).closest('.removeRow');
          if (!btn) return;
          const row = btn.parentElement;
          const list = row?.parentElement;
          // Không xóa nếu chỉ còn 1 dòng
          if (list && list.children.length > 1 && row) row.remove();
        });
      }
    }

    // Inventory
    const invList = document.getElementById('invList');
    const addInv = document.getElementById('addInv');
    if (addInv && invList) {
      addInv.addEventListener('click', () => {
        const row = invList.firstElementChild?.cloneNode(true) as Element;
        if (row) {
          row.querySelectorAll('input').forEach((i: HTMLInputElement) => i.value = '');
          invList.appendChild(row);
        }
      });
      wireRemove(invList);
    }

    // Staff
    const staffList = document.getElementById('staffList');
    const addStaff = document.getElementById('addStaff');
    if (addStaff && staffList) {
      addStaff.addEventListener('click', () => {
        const row = staffList.firstElementChild?.cloneNode(true) as Element;
        if (row) {
          row.querySelectorAll('input').forEach((i: HTMLInputElement) => i.value = '');
          staffList.appendChild(row);
        }
      });
      wireRemove(staffList);
    }

    // Incident
    const incidentList = document.getElementById('incidentList');
    const addIncident = document.getElementById('addIncident');
    if (addIncident && incidentList) {
      addIncident.addEventListener('click', () => {
        const row = incidentList.firstElementChild?.cloneNode(true) as Element;
        if (row) {
          row.querySelectorAll('input').forEach((i: HTMLInputElement) => i.value = '');
          incidentList.appendChild(row);
        }
      });
      wireRemove(incidentList);
    }

    // ========== Form submit handler will be handled by React ==========
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      const formData = new FormData(e.currentTarget);
      
      // Parse form data into structured format
      const reportData: EndShiftReportData = {
        // Thông tin chung
        storeId: formData.get('storeId') as string || '',
        branchName: formData.get('branchName') as string || '',
        shiftPeriod: formData.get('shiftPeriod') as string || '',
        manager: formData.get('manager') as string || '',
        accountName: formData.get('accountName') as string || '',
        accountId: formData.get('accountId') as string || '',
        endTime: formData.get('endTime') as string || '',
        refId: formData.get('refId') as string || undefined,
        
        // Doanh thu POS
        pos_cash: Number(formData.get('pos_cash')) || 0,
        pos_card: Number(formData.get('pos_card')) || 0,
        pos_ewallet: Number(formData.get('pos_ewallet')) || 0,
        pos_total: Number(formData.get('pos_total')) || 0,
        pos_bills: Number(formData.get('pos_bills')) || 0,
        pos_guests: Number(formData.get('pos_guests')) || 0,
        pos_aov: Number(formData.get('pos_aov')) || 0,
        
        // Đối soát quỹ
        fund_theory: Number(formData.get('fund_theory')) || 0,
        fund_counted: Number(formData.get('fund_counted')) || 0,
        fund_delta: Number(formData.get('fund_delta')) || 0,
        
        // Kho & nguyên liệu
        inventory: parseArrayFields(formData, 'inv_name', ['inv_last', 'inv_theo', 'inv_diff', 'inv_note']),
        
        // Nhân sự
        staff: parseArrayFields(formData, 'staff_name', ['staff_role', 'staff_timeOut', 'staff_hours', 'staff_tip', 'staff_note']),
        
        // Marketing & khách hàng
        mkt_voucherCount: Number(formData.get('mkt_voucherCount')) || 0,
        mkt_voucherValue: Number(formData.get('mkt_voucherValue')) || 0,
        mkt_newCustomers: Number(formData.get('mkt_newCustomers')) || 0,
        mkt_returningCustomers: Number(formData.get('mkt_returningCustomers')) || 0,
        mkt_rating: Number(formData.get('mkt_rating')) || 0,
        mkt_nps: Number(formData.get('mkt_nps')) || 0,
        mkt_feedback: formData.get('mkt_feedback') as string || '',
        
        // Sự cố
        incidents: parseArrayFields(formData, 'incident_type', ['incident_status', 'incident_desc', 'incident_action']),
        
        // Ảnh và ghi chú
        imageNotes: formData.get('imageNotes') as string || undefined,
        images: formData.getAll('images[]') as File[]
      };
      
      // Send to Telegram
      const success = await sendEndShiftReportToTelegram(reportData);
      
      if (success) {
        setSubmitStatus('success');
        setSubmitMessage('Báo cáo ra ca đã được gửi thành công đến Telegram!');
        // Reset form after successful submission
        setTimeout(() => {
          (e.target as HTMLFormElement).reset();
          setSubmitStatus('idle');
          setSubmitMessage('');
        }, 3000);
      } else {
        throw new Error('Failed to send report to Telegram');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setSubmitStatus('error');
      setSubmitMessage('Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const parseArrayFields = (formData: FormData, nameField: string, otherFields: string[]) => {
    const names = formData.getAll(nameField + '[]') as string[];
    const result = [];
    
    for (let i = 0; i < names.length; i++) {
      const item: any = { name: names[i] };
      otherFields.forEach(field => {
        const fieldName = field.replace(nameField.split('_')[0] + '_', '');
        const values = formData.getAll(field + '[]') as string[];
        item[fieldName] = values[i] || '';
      });
      if (item.name) result.push(item);
    }
    
    return result;
  };

  if (!userData) {
    navigate('/login');
    return null;
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light via-background to-accent-soft">
      {/* Header */}
      <div className="bg-primary/5 backdrop-blur border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <img src={ranGroupLogo} alt="RAN Group" className="h-8 w-auto" />
              <div>
                <h1 className="font-semibold text-primary">Báo Cáo Ra Ca</h1>
                <p className="text-sm text-muted-foreground">{selectedBranch || 'HN01'} • {getCurrentDate()}</p>
              </div>
            </div>
            <Badge className="bg-destructive text-destructive-foreground">
              <Clock className="h-3 w-3 mr-1" />
              Ra ca
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <form
            id="endShiftForm"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Bắt buộc */}
            <input type="hidden" name="type" value="end" />
            {/* Optional: redirect sau khi gửi (303) */}
            {/* <input type="hidden" name="redirect" value="/thanks-end-shift" /> */}

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