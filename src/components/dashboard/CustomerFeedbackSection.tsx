import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Star, TrendingUp, Users, Plus } from 'lucide-react';

interface CustomerFeedbackSectionProps {
  data: any;
  onComplete: (data: any) => void;
}

export default function CustomerFeedbackSection({ data, onComplete }: CustomerFeedbackSectionProps) {
  const [formData, setFormData] = useState({
    averageRating: (data && data.averageRating) || 0,
    npsScore: (data && data.npsScore) || 0,
    totalFeedbacks: (data && data.totalFeedbacks) || 0,
    newCustomers: (data && data.newCustomers) || 0,
    returningCustomers: (data && data.returningCustomers) || 0,
    negativeFeedbacks: (data && data.negativeFeedbacks) || [],
    feedbackSources: (data && data.feedbackSources) || {
      qr: 0,
      google: 0,
      facebook: 0,
      app: 0
    },
    ...(data || {})
  });

  const [newNegativeFeedback, setNewNegativeFeedback] = useState({
    rating: 1,
    comment: '',
    source: 'qr',
    resolution: '',
    resolutionTime: '',
    status: 'pending'
  });

  const feedbackSources = [
    { value: 'qr', label: 'QR tại quầy' },
    { value: 'google', label: 'Google Maps' },
    { value: 'facebook', label: 'Fanpage' },
    { value: 'app', label: 'App Loyalty' }
  ];

  const resolutionStatus = [
    { value: 'pending', label: 'Chờ xử lý', color: 'secondary' },
    { value: 'in-progress', label: 'Đang xử lý', color: 'default' },
    { value: 'resolved', label: 'Đã giải quyết', color: 'outline' }
  ];

  const addNegativeFeedback = () => {
    if (newNegativeFeedback.comment) {
      const feedback = {
        ...newNegativeFeedback,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };

      setFormData(prev => ({
        ...prev,
        negativeFeedbacks: [...prev.negativeFeedbacks, feedback]
      }));

      setNewNegativeFeedback({
        rating: 1,
        comment: '',
        source: 'qr',
        resolution: '',
        resolutionTime: '',
        status: 'pending'
      });
    }
  };

  const updateNegativeFeedback = (index: number, field: string, value: any) => {
    const updated = [...formData.negativeFeedbacks];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, negativeFeedbacks: updated }));
  };

  const customerRetentionRate = formData.totalFeedbacks > 0 ? 
    (formData.returningCustomers / (formData.newCustomers + formData.returningCustomers)) * 100 : 0;

  const requiresActionCount = formData.negativeFeedbacks.filter(f => f.rating <= 6 && f.status === 'pending').length;

  const handleSave = () => {
    onComplete({
      ...formData,
      statistics: {
        customerRetentionRate,
        requiresActionCount,
        avgResolutionTime: '2 giờ' // Mock calculation
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Phản hồi khách hàng
          </CardTitle>
          <CardDescription>
            Theo dõi và xử lý phản hồi từ khách hàng
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overview Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rating TB</p>
                    <p className="text-lg font-bold text-yellow-500">
                      {formData.averageRating.toFixed(1)}/5
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">NPS Score</p>
                    <p className={`text-lg font-bold ${formData.npsScore >= 50 ? 'text-green-500' : formData.npsScore >= 0 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {formData.npsScore}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng phản hồi</p>
                    <p className="text-lg font-bold text-green-500">{formData.totalFeedbacks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tỷ lệ quay lại</p>
                    <p className="text-lg font-bold text-purple-500">
                      {customerRetentionRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Basic Metrics Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="averageRating">Rating trung bình (1-5)</Label>
              <Input
                id="averageRating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.averageRating}
                onChange={(e) => setFormData(prev => ({ ...prev, averageRating: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="npsScore">NPS Score</Label>
              <Input
                id="npsScore"
                type="number"
                min="-100"
                max="100"
                value={formData.npsScore}
                onChange={(e) => setFormData(prev => ({ ...prev, npsScore: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalFeedbacks">Tổng số phản hồi</Label>
              <Input
                id="totalFeedbacks"
                type="number"
                value={formData.totalFeedbacks}
                onChange={(e) => setFormData(prev => ({ ...prev, totalFeedbacks: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          {/* Customer Segmentation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newCustomers">Khách hàng mới</Label>
              <Input
                id="newCustomers"
                type="number"
                value={formData.newCustomers}
                onChange={(e) => setFormData(prev => ({ ...prev, newCustomers: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="returningCustomers">Khách hàng quay lại</Label>
              <Input
                id="returningCustomers"
                type="number"
                value={formData.returningCustomers}
                onChange={(e) => setFormData(prev => ({ ...prev, returningCustomers: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          {/* Feedback Sources */}
          <div className="space-y-4">
            <h3 className="font-semibold">Nguồn phản hồi</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {feedbackSources.map((source) => (
                <div key={source.value} className="space-y-2">
                  <Label>{source.label}</Label>
                  <Input
                    type="number"
                    value={formData.feedbackSources[source.value]}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      feedbackSources: {
                        ...prev.feedbackSources,
                        [source.value]: parseInt(e.target.value) || 0
                      }
                    }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Add Negative Feedback */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-4">
            <h3 className="font-semibold">Thêm phản hồi tiêu cực</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <Select
                  value={newNegativeFeedback.rating.toString()}
                  onValueChange={(value) => setNewNegativeFeedback(prev => ({ ...prev, rating: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} sao
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nguồn</Label>
                <Select
                  value={newNegativeFeedback.source}
                  onValueChange={(value) => setNewNegativeFeedback(prev => ({ ...prev, source: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackSources.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Thời gian xử lý</Label>
                <Input
                  type="datetime-local"
                  value={newNegativeFeedback.resolutionTime}
                  onChange={(e) => setNewNegativeFeedback(prev => ({ ...prev, resolutionTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nội dung phản hồi</Label>
              <Textarea
                value={newNegativeFeedback.comment}
                onChange={(e) => setNewNegativeFeedback(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Nội dung phản hồi tiêu cực từ khách hàng..."
              />
            </div>

            <div className="space-y-2">
              <Label>Cách xử lý</Label>
              <Textarea
                value={newNegativeFeedback.resolution}
                onChange={(e) => setNewNegativeFeedback(prev => ({ ...prev, resolution: e.target.value }))}
                placeholder="Mô tả cách xử lý phản hồi..."
              />
            </div>

            <Button onClick={addNegativeFeedback}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm phản hồi tiêu cực
            </Button>
          </div>

          {/* Negative Feedbacks List */}
          {formData.negativeFeedbacks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Phản hồi tiêu cực</h3>
                {requiresActionCount > 0 && (
                  <Badge variant="destructive">
                    {requiresActionCount} cần xử lý
                  </Badge>
                )}
              </div>
              
              {formData.negativeFeedbacks.map((feedback, index) => (
                <Card key={feedback.id} className={`${feedback.rating <= 2 ? 'border-red-500' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={feedback.rating <= 2 ? "destructive" : "secondary"}>
                          {feedback.rating} sao
                        </Badge>
                        <Badge variant="outline">
                          {feedbackSources.find(s => s.value === feedback.source)?.label}
                        </Badge>
                        <Badge variant={resolutionStatus.find(s => s.value === feedback.status)?.color as any}>
                          {resolutionStatus.find(s => s.value === feedback.status)?.label}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(feedback.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>

                    <p className="text-sm mb-3"><strong>Phản hồi:</strong> {feedback.comment}</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Cách xử lý</Label>
                        <Textarea
                          value={feedback.resolution}
                          onChange={(e) => updateNegativeFeedback(index, 'resolution', e.target.value)}
                          placeholder="Mô tả cách xử lý..."
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Trạng thái</Label>
                        <Select
                          value={feedback.status}
                          onValueChange={(value) => updateNegativeFeedback(index, 'status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {resolutionStatus.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Lưu thông tin phản hồi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}