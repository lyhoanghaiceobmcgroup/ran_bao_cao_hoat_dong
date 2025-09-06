import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EndShiftReportData {
  branch: string
  shift: string
  manager: string
  checkOutTime: string
  sales: {
    cash: string
    card: string
    ewallet: string
    total: string
    orderCount: string
    guestCount: string
    aov: string
  }
  cashRecon: {
    expectedCash: string
    countedCash: string
    variance: string
    reason: string
  }
  inventory: Array<{
    item: string
    ending: number
    expected: number
    variance: number
    reason: string
  }>
  staff: Array<{
    name: string
    position: string
    checkOut: string
    hours: number
    tips: string
    note: string
  }>
  marketing: {
    voucherUsed: string
    voucherValue: string
    newCustomers: string
    returningCustomers: string
    avgRating: string
    npsScore: string
    feedback: string
  }
  incidents: Array<{
    type: string
    description: string
    action: string
    status: string
  }>
}

interface StartShiftReportData {
  branch: string
  shift: string
  checkInTime: string
  shiftLead: string
  openingFloat: string
  floatProvider: string
  staff: Array<{
    name: string
    position: string
    present: boolean
    note: string
    checkInMethod: string
  }>
  inventory: Array<{
    item: string
    current: number
    required: number
    sufficient: boolean
    critical: boolean
  }>
  equipment: Array<{
    name: string
    status: string
    note: string
    priority: string
  }>
  marketing: {
    selectedCampaign: string
    campaignTarget: string
  }
  targets: {
    revenue: string
    upsell: string
    nps: string
    aov: string
    customerCount: string
  }
}

type ReportData = EndShiftReportData | StartShiftReportData

function formatCurrency(amount: string): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(parseInt(amount))
}

function formatStartShiftMessage(data: StartShiftReportData): string {
  const date = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  let message = `🌅 *BÁO CÁO VÀO CA*\n\n`
  message += `📅 Ngày: ${date}\n`
  message += `🏢 Chi nhánh: ${data.branch}\n`
  message += `⏰ Ca: ${data.shift}\n`
  message += `👤 Phụ trách: ${data.shiftLead}\n`
  message += `🕐 Giờ vào ca: ${data.checkInTime}\n\n`

  // Opening Float
  message += `💰 *QUỸ ĐẦU CA*\n`
  message += `💵 Số tiền: ${formatCurrency(data.openingFloat)}\n`
  if (data.floatProvider) {
    message += `👤 Người giao: ${data.floatProvider}\n`
  }
  message += `\n`

  // Staff
  const presentStaff = data.staff.filter(staff => staff.present)
  message += `👥 *NHÂN SỰ CA* (${presentStaff.length}/${data.staff.length} người)\n`
  presentStaff.forEach(staff => {
    message += `• ${staff.name} (${staff.position})`
    if (staff.note) {
      message += ` - ${staff.note}`
    }
    message += `\n`
  })
  
  const absentStaff = data.staff.filter(staff => !staff.present)
  if (absentStaff.length > 0) {
    message += `❌ *VẮNG MẶT:*\n`
    absentStaff.forEach(staff => {
      message += `• ${staff.name} (${staff.position})`
      if (staff.note) {
        message += ` - ${staff.note}`
      }
      message += `\n`
    })
  }
  message += `\n`

  // Critical Inventory Issues
  const criticalItems = data.inventory.filter(item => !item.sufficient && item.critical)
  if (criticalItems.length > 0) {
    message += `⚠️ *CẢNH BÁO KHO*\n`
    criticalItems.forEach(item => {
      message += `🔴 ${item.item}: ${item.current}/${item.required} ${item.unit || ''}\n`
    })
    message += `\n`
  }

  // Equipment Issues
  const equipmentIssues = data.equipment.filter(eq => eq.status !== 'good' && eq.priority === 'high')
  if (equipmentIssues.length > 0) {
    message += `🔧 *THIẾT BỊ CẦN SỬA CHỮA*\n`
    equipmentIssues.forEach(eq => {
      message += `⚠️ ${eq.name}: ${eq.status}`
      if (eq.note) {
        message += ` - ${eq.note}`
      }
      message += `\n`
    })
    message += `\n`
  }

  // Targets
  message += `🎯 *MỤC TIÊU CA*\n`
  message += `💰 Doanh thu: ${formatCurrency(data.targets.revenue)}\n`
  message += `📈 Upsell: ${data.targets.upsell}%\n`
  message += `⭐ NPS: ${data.targets.nps}/10\n`
  message += `💸 AOV: ${formatCurrency(data.targets.aov)}\n`
  message += `👥 Số khách: ${data.targets.customerCount}\n\n`

  // Marketing Campaign
  if (data.marketing.selectedCampaign) {
    message += `📢 *CAMPAIGN ACTIVE*\n`
    message += `🎫 ${data.marketing.selectedCampaign}\n`
    if (data.marketing.campaignTarget) {
      message += `🎯 Target: ${formatCurrency(data.marketing.campaignTarget)}\n`
    }
  }

  return message
}

function formatEndShiftMessage(data: EndShiftReportData): string {
  const date = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  let message = `🏪 *BÁO CÁO RA CA*\n\n`
  message += `📅 Ngày: ${date}\n`
  message += `🏢 Chi nhánh: ${data.branch}\n`
  message += `⏰ Ca: ${data.shift}\n`
  message += `👤 Phụ trách: ${data.manager}\n`
  message += `🕐 Giờ ra ca: ${data.checkOutTime}\n\n`

  // Sales Report
  message += `💰 *DOANH THU*\n`
  message += `💵 Tiền mặt: ${formatCurrency(data.sales.cash)}\n`
  message += `💳 Thẻ: ${formatCurrency(data.sales.card)}\n`
  message += `📱 E-Wallet: ${formatCurrency(data.sales.ewallet)}\n`
  message += `📊 Tổng: ${formatCurrency(data.sales.total)}\n`
  message += `🧾 Số bill: ${data.sales.orderCount}\n`
  message += `👥 Số khách: ${data.sales.guestCount}\n`
  message += `💸 AOV: ${formatCurrency(data.sales.aov)}\n\n`

  // Cash Reconciliation
  message += `💼 *ĐỐI SOÁT QUỸ*\n`
  message += `📈 Lý thuyết: ${formatCurrency(data.cashRecon.expectedCash)}\n`
  message += `💰 Thực đếm: ${formatCurrency(data.cashRecon.countedCash)}\n`
  message += `📉 Chênh lệch: ${formatCurrency(data.cashRecon.variance)}\n`
  if (data.cashRecon.reason) {
    message += `📝 Lý do: ${data.cashRecon.reason}\n`
  }
  message += `\n`

  // Staff Summary
  message += `👥 *NHÂN SỰ CA* (${data.staff.length} người)\n`
  data.staff.forEach(staff => {
    message += `• ${staff.name} (${staff.position}) - ${staff.hours}h`
    if (staff.note) {
      message += ` - ${staff.note}`
    }
    message += `\n`
  })
  message += `\n`

  // Inventory Issues
  const inventoryIssues = data.inventory.filter(item => Math.abs(item.variance) > 2)
  if (inventoryIssues.length > 0) {
    message += `📦 *VẤN ĐỀ KHOÁNG SẢN*\n`
    inventoryIssues.forEach(item => {
      message += `⚠️ ${item.item}: ${item.variance > 0 ? '+' : ''}${item.variance}`
      if (item.reason) {
        message += ` (${item.reason})`
      }
      message += `\n`
    })
    message += `\n`
  }

  // Marketing
  message += `📈 *MARKETING & KHÁCH HÀNG*\n`
  message += `🎫 Voucher sử dụng: ${data.marketing.voucherUsed}\n`
  message += `💝 Giá trị voucher: ${formatCurrency(data.marketing.voucherValue)}\n`
  message += `🆕 KH mới: ${data.marketing.newCustomers}\n`
  message += `🔄 KH quay lại: ${data.marketing.returningCustomers}\n`
  message += `⭐ Đánh giá TB: ${data.marketing.avgRating}/5\n`
  message += `📊 NPS: ${data.marketing.npsScore}\n`
  if (data.marketing.feedback) {
    message += `💬 Phản hồi: ${data.marketing.feedback}\n`
  }
  message += `\n`

  // Incidents
  const activeIncidents = data.incidents.filter(incident => 
    incident.description && incident.description.trim() !== ''
  )
  if (activeIncidents.length > 0) {
    message += `🚨 *SỰ CỐ CA LÀM*\n`
    activeIncidents.forEach(incident => {
      message += `• ${incident.type}: ${incident.description}\n`
      if (incident.action) {
        message += `  ➤ Hành động: ${incident.action}\n`
      }
      message += `  ➤ Trạng thái: ${incident.status === 'resolved' ? '✅ Đã xử lý' : '⏳ Đang xử lý'}\n`
    })
  }

  return message
}

function formatReportMessage(data: ReportData, reportType: 'start' | 'end'): string {
  if (reportType === 'start') {
    return formatStartShiftMessage(data as StartShiftReportData)
  } else {
    return formatEndShiftMessage(data as EndShiftReportData)
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json()
    
    // Support both old format (reportData) and new format (message, photos)
    let message: string
    let photos: string[] = []
    let chatId: string
    let botToken: string
    
    if (requestBody.message) {
      // New format from StartShiftReport
      message = requestBody.message
      photos = requestBody.photos || []
      chatId = requestBody.chat_id || '-4852576118'
      botToken = requestBody.bot_token || Deno.env.get('TELEGRAM_BOT_TOKEN')
    } else if (requestBody.reportData) {
      // Old format
      const { reportData, reportType = 'end' } = requestBody
      message = formatReportMessage(reportData, reportType)
      chatId = '-4852576118'
      botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    } else {
      return new Response(
        JSON.stringify({ error: 'Missing message or report data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not found')
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Send text message
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        }),
      }
    )

    if (!telegramResponse.ok) {
      const errorText = await telegramResponse.text()
      console.error('Telegram API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to send telegram message', details: errorText }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const result = await telegramResponse.json()
    console.log('Message sent successfully:', result)

    // Send photos if any
    for (const photoUrl of photos) {
      try {
        const photoResponse = await fetch(
          `https://api.telegram.org/bot${botToken}/sendPhoto`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: chatId,
              photo: photoUrl,
              caption: '📸 Ảnh bill/chứng từ'
            }),
          }
        )
        
        if (!photoResponse.ok) {
          console.warn('Failed to send photo:', await photoResponse.text())
        } else {
          console.log('Photo sent successfully')
        }
      } catch (photoError) {
        console.warn('Error sending photo:', photoError)
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Report sent to Telegram' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in send-telegram-report function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})