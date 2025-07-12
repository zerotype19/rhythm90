import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

interface FeatureRequest {
  id: string;
  category: string;
  subject: string;
  description: string;
  created_at: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function FeatureRequests() {
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatureRequests();
  }, [pagination.page]);

  const loadFeatureRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/feature-requests?page=${pagination.page}`);
      if (response.ok) {
        const data = await response.json();
        setFeatureRequests(data.feedback || []);
        setPagination(data.pagination || pagination);
      }
    } catch (error) {
      console.error('Error loading feature requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'enhancement':
        return 'bg-blue-100 text-blue-800';
      case 'bug':
        return 'bg-red-100 text-red-800';
      case 'feature':
        return 'bg-green-100 text-green-800';
      case 'ui/ux':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feature requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Feature Requests
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what features our community is requesting and track the progress of upcoming improvements.
          </p>
        </div>

        <div className="grid gap-6">
          {featureRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{request.subject}</CardTitle>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getCategoryColor(request.category)}>
                        {request.category}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(request.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {request.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {featureRequests.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 text-lg">
                No public feature requests available yet.
              </p>
              <p className="text-gray-400 mt-2">
                Check back soon for updates!
              </p>
            </CardContent>
          </Card>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}

        <div className="mt-12 text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Have a feature request?</h3>
              <p className="text-gray-600 mb-4">
                We'd love to hear your ideas for improving Rhythm90!
              </p>
              <Button
                onClick={() => window.location.href = '/feedback'}
                className="w-full"
              >
                Submit Feature Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 