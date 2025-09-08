-- Tạo bảng daily_reports để lưu báo cáo hàng ngày
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id VARCHAR(255) NOT NULL,
  branch_id VARCHAR(255) NOT NULL,
  branch_name VARCHAR(255) NOT NULL,
  manager_id UUID REFERENCES auth.users(id),
  manager_name VARCHAR(255) NOT NULL,
  report_date DATE NOT NULL,
  report_data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(report_id, report_date)
);

-- Tạo bảng consolidated_reports để lưu báo cáo tổng hợp
CREATE TABLE IF NOT EXISTS consolidated_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id VARCHAR(255) NOT NULL UNIQUE,
  branch_name VARCHAR(255) NOT NULL,
  manager_id UUID REFERENCES auth.users(id),
  manager_name VARCHAR(255) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue DECIMAL(15,2) DEFAULT 0,
  total_expenses DECIMAL(15,2) DEFAULT 0,
  total_profit DECIMAL(15,2) DEFAULT 0,
  avg_kpi_achievement DECIMAL(5,2) DEFAULT 0,
  avg_nps_score DECIMAL(5,2) DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo index để tối ưu hóa truy vấn
CREATE INDEX IF NOT EXISTS idx_daily_reports_branch_date ON daily_reports(branch_id, report_date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_manager ON daily_reports(manager_id);
CREATE INDEX IF NOT EXISTS idx_consolidated_reports_branch ON consolidated_reports(branch_id);

-- Tạo RLS (Row Level Security) policies
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidated_reports ENABLE ROW LEVEL SECURITY;

-- Policy cho daily_reports: user chỉ có thể xem/chỉnh sửa báo cáo của mình
CREATE POLICY "Users can view their own daily reports" ON daily_reports
  FOR SELECT USING (auth.uid() = manager_id);

CREATE POLICY "Users can insert their own daily reports" ON daily_reports
  FOR INSERT WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Users can update their own daily reports" ON daily_reports
  FOR UPDATE USING (auth.uid() = manager_id);

-- Policy cho consolidated_reports: user chỉ có thể xem/chỉnh sửa báo cáo tổng hợp của mình
CREATE POLICY "Users can view their own consolidated reports" ON consolidated_reports
  FOR SELECT USING (auth.uid() = manager_id);

CREATE POLICY "Users can insert their own consolidated reports" ON consolidated_reports
  FOR INSERT WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Users can update their own consolidated reports" ON consolidated_reports
  FOR UPDATE USING (auth.uid() = manager_id);

-- Admin có thể xem tất cả báo cáo
CREATE POLICY "Admins can view all daily reports" ON daily_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all consolidated reports" ON consolidated_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Tạo function để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo trigger để tự động cập nhật updated_at khi có thay đổi
CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE ON daily_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consolidated_reports_updated_at BEFORE UPDATE ON consolidated_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();