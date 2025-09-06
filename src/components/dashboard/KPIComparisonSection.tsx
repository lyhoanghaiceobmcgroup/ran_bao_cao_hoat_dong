import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

interface KPIComparisonSectionProps {
  data: any;
  onComplete: (data: any) => void;
}

export default function KPIComparisonSection({ data, onComplete }: KPIComparisonSectionProps) {
  const [kpiData, setKPIData] = useState({
    revenue: { target: (data && data.revenue?.target) || 10000000, actual: (data && data.revenue?.actual) || 0 },
    aov: { target: (data && data.aov?.target) || 120000, actual: (data && data.aov?.actual) || 0 },
    upsell: { target: (data && data.upsell?.target) || 15, actual: (data && data.upsell?.actual) || 0 },
    nps: { target: (data && data.nps?.target) || 70, actual: (data && data.nps?.actual) || 0 },
    waste: { target: (data && data.waste?.target) || 3, actual: (data && data.waste?.actual) || 0 },
    customerSatisfaction: { target: (data && data.customerSatisfaction?.target) || 4.5, actual: (data && data.customerSatisfaction?.actual) || 0 },
    laborCost: { target: (data && data.laborCost?.target) || 25, actual: (data && data.laborCost?.actual) || 0 },
    ...(data || {})
  });

  const calculateAchievementRate = (actual: number, target: number, isReverse: boolean = false) => {
    if (target === 0) return 0;
    if (isReverse) {
      // For metrics where lower is better (like waste percentage)
      return target >= actual ? 100 : Math.max(0, 100 - ((actual - target) / target * 100));
    }
    return Math.min(100, (actual / target) * 100);
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-500';
    if (rate >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPerformanceBadge = (rate: number) => {
    if (rate >= 100) return { variant: 'default' as const, label: 'Vượt mục tiêu' };
    if (rate >= 90) return { variant: 'default' as const, label: 'Đạt tốt' };
    if (rate >= 70) return { variant: 'secondary' as const, label: 'Đạt khá' };
    return { variant: 'destructive' as const, label: 'Chưa đạt' };
  };

  const getTrendIcon = (actual: number, target: number, isReverse: boolean = false) => {
    const diff = actual - target;
    if (Math.abs(diff) < target * 0.05) return <Minus className="h-4 w-4 text-yellow-500" />;
    
    if (isReverse) {
      return diff > 0 ? <TrendingDown className="h-4 w-4 text-red-500" /> : <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    return diff > 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const generateSuggestions = () => {
    const suggestions = [];
    
    const revenueRate = calculateAchievementRate(kpiData.revenue.actual, kpiData.revenue.target);
    const aovRate = calculateAchievementRate(kpiData.aov.actual, kpiData.aov.target);
    const wasteRate = calculateAchievementRate(kpiData.waste.actual, kpiData.waste.target, true);
    
    if (revenueRate < 80) {
      suggestions.push("Doanh thu thấp: Tăng cường marketing, ưu đãi cho khách hàng");
    }
    if (aovRate < 80) {
      suggestions.push("AOV thấp: Khuyến khích upsell, tạo combo sản phẩm");
    }
    if (wasteRate < 80) {
      suggestions.push("Hao hụt cao: Cải thiện quy trình bảo quản, đào tạo nhân viên");
    }
    
    return suggestions;
  };

  const kpiMetrics = [
    {
      key: 'revenue',
      label: 'Doanh thu',
      unit: 'VNĐ',
      format: (value: number) => value.toLocaleString('vi-VN'),
      isReverse: false
    },
    {
      key: 'aov',
      label: 'AOV (Giá trị đơn TB)',
      unit: 'VNĐ',
      format: (value: number) => value.toLocaleString('vi-VN'),
      isReverse: false
    },
    {
      key: 'upsell',
      label: 'Tỷ lệ Upsell',
      unit: '%',
      format: (value: number) => value.toFixed(1),
      isReverse: false
    },
    {
      key: 'nps',
      label: 'NPS Score',
      unit: '',
      format: (value: number) => value.toString(),
      isReverse: false
    },
    {
      key: 'waste',
      label: 'Tỷ lệ hao hụt',
      unit: '%',
      format: (value: number) => value.toFixed(1),
      isReverse: true
    },
    {
      key: 'customerSatisfaction',
      label: 'Hài lòng khách hàng',
      unit: '/5',
      format: (value: number) => value.toFixed(1),
      isReverse: false
    },
    {
      key: 'laborCost',
      label: 'Chi phí nhân sự',
      unit: '% doanh thu',
      format: (value: number) => value.toFixed(1),
      isReverse: true
    }
  ];

  const handleKPIUpdate = (key: string, field: 'target' | 'actual', value: number) => {
    setKPIData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const autoSuggestTargets = () => {
    // Auto-suggest targets based on historical data (mock implementation)
    const suggestions = {
      revenue: { target: Math.round(kpiData.revenue.actual * 1.1) },
      aov: { target: Math.round(kpiData.aov.actual * 1.05) },
      upsell: { target: Math.min(25, kpiData.upsell.actual * 1.2) },
      nps: { target: Math.min(100, kpiData.nps.actual + 5) },
      waste: { target: Math.max(1, kpiData.waste.actual * 0.9) },
      customerSatisfaction: { target: Math.min(5, kpiData.customerSatisfaction.actual + 0.2) },
      laborCost: { target: Math.max(15, kpiData.laborCost.actual * 0.95) }
    };

    setKPIData(prev => {
      const updated = { ...prev };
      Object.keys(suggestions).forEach(key => {
        updated[key] = { ...updated[key], ...suggestions[key] };
      });
      return updated;
    });
  };

  const overallPerformance = kpiMetrics.reduce((sum, metric) => {
    const rate = calculateAchievementRate(
      kpiData[metric.key].actual,
      kpiData[metric.key].target,
      metric.isReverse
    );
    return sum + rate;
  }, 0) / kpiMetrics.length;

  const handleSave = () => {
    const suggestions = generateSuggestions();
    
    onComplete({
      kpiData,
      overallPerformance,
      suggestions,
      achievementRates: kpiMetrics.reduce((acc, metric) => {
        acc[metric.key] = calculateAchievementRate(
          kpiData[metric.key].actual,
          kpiData[metric.key].target,
          metric.isReverse
        );
        return acc;
      }, {} as Record<string, number>)
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            KPI mục tiêu vs thực tế
          </CardTitle>
          <CardDescription>
            So sánh hiệu suất thực tế với mục tiêu đề ra
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Performance */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Hiệu suất tổng thể</h3>
                <Button onClick={autoSuggestTargets} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Gợi ý mục tiêu
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={overallPerformance} className="h-3" />
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getPerformanceColor(overallPerformance)}`}>
                    {overallPerformance.toFixed(1)}%
                  </p>
                  <Badge {...getPerformanceBadge(overallPerformance)}>
                    {getPerformanceBadge(overallPerformance).label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI Metrics */}
          <div className="grid grid-cols-1 gap-6">
            {kpiMetrics.map((metric) => {
              const achievementRate = calculateAchievementRate(
                kpiData[metric.key].actual,
                kpiData[metric.key].target,
                metric.isReverse
              );
              const badge = getPerformanceBadge(achievementRate);

              return (
                <Card key={metric.key}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">{metric.label}</h4>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(kpiData[metric.key].actual, kpiData[metric.key].target, metric.isReverse)}
                        <Badge variant={badge.variant}>
                          {badge.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label>Mục tiêu {metric.unit}</Label>
                        <Input
                          type="number"
                          value={kpiData[metric.key].target}
                          onChange={(e) => handleKPIUpdate(metric.key, 'target', parseFloat(e.target.value) || 0)}
                          step={metric.key === 'revenue' ? 100000 : metric.key === 'aov' ? 1000 : 0.1}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Thực tế {metric.unit}</Label>
                        <Input
                          type="number"
                          value={kpiData[metric.key].actual}
                          onChange={(e) => handleKPIUpdate(metric.key, 'actual', parseFloat(e.target.value) || 0)}
                          step={metric.key === 'revenue' ? 100000 : metric.key === 'aov' ? 1000 : 0.1}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                        <Label>% Đạt mục tiêu</Label>
                        <div className="flex items-center gap-2 h-10">
                          <span className={`text-lg font-bold ${getPerformanceColor(achievementRate)}`}>
                            {achievementRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Mục tiêu: {metric.format(kpiData[metric.key].target)} {metric.unit}</span>
                        <span>Thực tế: {metric.format(kpiData[metric.key].actual)} {metric.unit}</span>
                      </div>
                      <Progress value={achievementRate} className="h-2" />
                    </div>

                    {achievementRate < 80 && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                        <strong>Gợi ý cải thiện:</strong> 
                        {metric.key === 'revenue' && ' Tăng cường marketing, ưu đãi khách hàng'}
                        {metric.key === 'aov' && ' Khuyến khích upsell, tạo combo sản phẩm'}
                        {metric.key === 'upsell' && ' Đào tạo kỹ năng bán hàng cho nhân viên'}
                        {metric.key === 'nps' && ' Cải thiện chất lượng dịch vụ, lắng nghe phản hồi'}
                        {metric.key === 'waste' && ' Cải thiện quy trình bảo quản, đào tạo nhân viên'}
                        {metric.key === 'customerSatisfaction' && ' Focus vào trải nghiệm khách hàng'}
                        {metric.key === 'laborCost' && ' Tối ưu hóa lịch làm việc, tăng năng suất'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Suggestions */}
          {generateSuggestions().length > 0 && (
            <Card className="border-orange-200">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 text-orange-700">Đề xuất cải thiện</h4>
                <ul className="space-y-1 text-sm text-orange-600">
                  {generateSuggestions().map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-500">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Lưu thông tin KPI
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}