// Telegram Bot API integration for RAN Shift Reports

// Bot configuration using environment variables
const TELEGRAM_BOT_TOKENS = {
  'HN35': '8241020529:AAHW_BrHrjoQIvSR2TfmPv_en6u2BmvX_pg', // RAN_HN35_ShiftReport_Bot - hardcoded for now
  'HN40': '7998696645:AAHRwJRwoWBL2svvOGl2EBggie18jzcOWlI'  // RAN_HN40_ShiftReport_Bot - hardcoded for now
};

const TELEGRAM_CHAT_IDS = {
  'HN35': '-4802817130', // HN35 group - hardcoded for now
  'HN40': '-4893187199'  // HN40 group - hardcoded for now
};

// Bot names for identification
const TELEGRAM_BOT_NAMES = {
  'HN35': import.meta.env.VITE_TELEGRAM_BOT_NAME_HN35 || 'RAN_HN35_ShiftReport_Bot',
  'HN40': import.meta.env.VITE_TELEGRAM_BOT_NAME_HN40 || 'RAN_HN40_ShiftReport_Bot'
};



// Function to get chat ID based on current branch
function getTelegramChatId(): string {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (currentPath.includes('HN40')) {
    return TELEGRAM_CHAT_IDS.HN40;
  }
  return TELEGRAM_CHAT_IDS.HN35; // Default to HN35
}

// Function to get bot token based on current branch
function getTelegramBotToken(): string {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (currentPath.includes('HN40')) {
    return TELEGRAM_BOT_TOKENS.HN40;
  }
  return TELEGRAM_BOT_TOKENS.HN35; // Default to HN35
}

// Function to get Telegram API URL based on current branch
function getTelegramApiUrl(): string {
  const botToken = getTelegramBotToken();
  return `https://api.telegram.org/bot${botToken}`;
}

interface EndShiftReportData {
  // Thông tin chung
  storeId: string;
  branchName: string;
  shiftPeriod: string;
  manager: string;
  accountName: string;
  accountId: string;
  endTime: string;
  refId?: string;
  
  // Doanh thu POS
  pos_cash: number;
  pos_card: number;
  pos_ewallet: number;
  pos_total: number;
  pos_bills: number;
  pos_guests: number;
  pos_aov: number;
  
  // Đối soát quỹ
  fund_theory: number;
  fund_counted: number;
  fund_delta: number;
  
  // Kho & nguyên liệu
  inventory: Array<{
    name: string;
    last: string;
    theo: string;
    diff: string;
    note: string;
  }>;
  
  // Nhân sự
  staff: Array<{
    name: string;
    role: string;
    timeOut: string;
    hours: string;
    tip: string;
    note: string;
  }>;
  
  // Marketing & khách hàng
  mkt_voucherCount: number;
  mkt_voucherValue: number;
  mkt_newCustomers: number;
  mkt_returningCustomers: number;
  mkt_rating: number;
  mkt_nps: number;
  mkt_feedback: string;
  
  // Sự cố
  incidents: Array<{
    type: string;
    status: string;
    desc: string;
    action: string;
  }>;
  
  // Ảnh và ghi chú
  imageNotes?: string;
  images?: File[];
}

export async function sendEndShiftReportToTelegram(data: EndShiftReportData): Promise<boolean> {
  try {
    // Format message content
    const message = formatEndShiftMessage(data);
    const chatId = getTelegramChatId();
    const apiUrl = getTelegramApiUrl();
    
    // Send text message first
    const textResponse = await fetch(`${apiUrl}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    if (!textResponse.ok) {
      throw new Error('Failed to send text message to Telegram');
    }
    
    // Send images if any
    if (data.images && data.images.length > 0) {
      await sendImagesToTelegram(data.images, data.imageNotes);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return false;
  }
}

function formatEndShiftMessage(data: EndShiftReportData): string {
  const currentTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  
  let message = `🔚 <b>BÁO CÁO RA CA - ${data.branchName}</b>\n\n`;
  
  // Thông tin chung
  message += `🧭 <b>THÔNG TIN CHUNG</b>\n`;
  message += `• Cửa hàng: ${data.storeId}\n`;
  message += `• Chi nhánh: ${data.branchName}\n`;
  message += `• Ca làm việc: ${data.shiftPeriod}\n`;
  message += `• Người phụ trách: ${data.manager}\n`;
  message += `• Tài khoản: ${data.accountName} (${data.accountId})\n`;
  message += `• Giờ ra ca: ${data.endTime}\n`;
  if (data.refId) message += `• Mã hồ sơ: ${data.refId}\n`;
  message += `• Thời gian gửi: ${currentTime}\n\n`;
  
  // Doanh thu POS
  message += `💵 <b>DOANH THU POS</b>\n`;
  message += `• Tiền mặt: ${formatCurrency(data.pos_cash)}\n`;
  message += `• Thẻ: ${formatCurrency(data.pos_card)}\n`;
  message += `• QR/E-Wallet: ${formatCurrency(data.pos_ewallet)}\n`;
  message += `• Tổng doanh thu: ${formatCurrency(data.pos_total)}\n`;
  message += `• Số bill: ${data.pos_bills}\n`;
  message += `• Số khách: ${data.pos_guests}\n`;
  message += `• AOV: ${formatCurrency(data.pos_aov)}\n\n`;
  
  // Đối soát quỹ
  message += `🧾 <b>ĐỐI SOÁT QUỸ</b>\n`;
  message += `• Tiền lý thuyết: ${formatCurrency(data.fund_theory)}\n`;
  message += `• Tiền thực đếm: ${formatCurrency(data.fund_counted)}\n`;
  message += `• Chênh lệch: ${formatCurrency(data.fund_delta)}\n\n`;
  
  // Kho & nguyên liệu
  if (data.inventory && data.inventory.length > 0) {
    message += `📦 <b>KHO & NGUYÊN LIỆU</b>\n`;
    data.inventory.forEach((item, index) => {
      if (item.name) {
        message += `${index + 1}. ${item.name}\n`;
        message += `   - Tồn cuối ca: ${item.last}\n`;
        message += `   - Lý thuyết: ${item.theo}\n`;
        message += `   - Chênh lệch: ${item.diff}\n`;
        if (item.note) message += `   - Ghi chú: ${item.note}\n`;
      }
    });
    message += `\n`;
  }
  
  // Nhân sự
  if (data.staff && data.staff.length > 0) {
    message += `👥 <b>NHÂN SỰ CA</b>\n`;
    data.staff.forEach((person, index) => {
      if (person.name) {
        message += `${index + 1}. ${person.name} - ${person.role}\n`;
        message += `   - Giờ ra ca: ${person.timeOut}\n`;
        message += `   - Giờ công: ${person.hours}\n`;
        if (person.tip) message += `   - Tip: ${formatCurrency(Number(person.tip))}\n`;
        if (person.note) message += `   - Ghi chú: ${person.note}\n`;
      }
    });
    message += `\n`;
  }
  
  // Marketing & khách hàng
  message += `📈 <b>MARKETING & KHÁCH HÀNG</b>\n`;
  message += `• Voucher sử dụng: ${data.mkt_voucherCount} (${formatCurrency(data.mkt_voucherValue)})\n`;
  message += `• Khách mới: ${data.mkt_newCustomers}\n`;
  message += `• Khách quay lại: ${data.mkt_returningCustomers}\n`;
  message += `• Rating TB: ${data.mkt_rating}/5\n`;
  message += `• NPS: ${data.mkt_nps}\n`;
  if (data.mkt_feedback) {
    message += `• Feedback: ${data.mkt_feedback}\n`;
  }
  message += `\n`;
  
  // Sự cố
  if (data.incidents && data.incidents.length > 0) {
    message += `⚠️ <b>SỰ CỐ PHÁT SINH</b>\n`;
    data.incidents.forEach((incident, index) => {
      if (incident.type || incident.desc) {
        message += `${index + 1}. ${incident.type} - ${incident.status}\n`;
        message += `   - Mô tả: ${incident.desc}\n`;
        message += `   - Hành động: ${incident.action}\n`;
      }
    });
    message += `\n`;
  }
  
  message += `📱 <i>Gửi từ RAN Shift Management System</i>`;
  
  return message;
}

async function sendImagesToTelegram(images: File[], notes?: string): Promise<void> {
  const chatId = getTelegramChatId();
  const apiUrl = getTelegramApiUrl();
  
  for (const image of images) {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', image);
    
    if (notes) {
      formData.append('caption', `📷 Ảnh Bill/Chứng Từ\n${notes}`);
    } else {
      formData.append('caption', '📷 Ảnh Bill/Chứng Từ');
    }
    
    const response = await fetch(`${apiUrl}/sendPhoto`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      console.error('Failed to send image to Telegram:', await response.text());
    }
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

// Generic function to send text message to Telegram
export async function sendTelegramMessage(message: string): Promise<boolean> {
  try {
    const chatId = getTelegramChatId();
    const apiUrl = getTelegramApiUrl();
    
    const response = await fetch(`${apiUrl}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Telegram API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('[telegramApi] Success via Telegram API:', result);
    return true;
  } catch (error) {
    console.error('[telegramApi] Error sending message:', error);
    return false;
  }
}

// Generic function to send photo to Telegram
export async function sendTelegramPhoto(file: File, caption?: string): Promise<boolean> {
  try {
    const chatId = getTelegramChatId();
    const apiUrl = getTelegramApiUrl();
    
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', file);
    if (caption) {
      formData.append('caption', caption);
    }
    
    const response = await fetch(`${apiUrl}/sendPhoto`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send photo: ${response.status} - ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error('[telegramApi] Error sending photo:', error);
    return false;
  }
}

export { EndShiftReportData };