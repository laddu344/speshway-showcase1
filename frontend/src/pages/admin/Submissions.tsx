import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api, { getBaseUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LogOut, ArrowLeft } from 'lucide-react';

const Submissions = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['submissions', statusFilter, typeFilter],
    queryFn: () => api.get('/contact/submissions').then(res => res.data.data || res.data || []),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/contact/submission/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast({
        title: 'Status updated successfully',
        description: 'The submission status has been updated.',
      });
    },
    onError: () => {
      toast({
        title: 'Error updating status',
        description: 'Failed to update the submission status.',
        variant: 'destructive',
      });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out.",
    });
  };

  const filteredData = data?.filter((submission: any) => {
    if (statusFilter !== 'all' && submission.status !== statusFilter) {
      return false;
    }
    if (typeFilter !== 'all' && submission.type !== typeFilter) {
      return false;
    }
    return true;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default">New</Badge>;
      case 'read':
        return <Badge variant="secondary">Read</Badge>;
      case 'replied':
        return <Badge variant="outline">Replied</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'contact':
        return <Badge color="primary">Contact</Badge>;
      case 'resume':
        return <Badge color="secondary">Resume</Badge>;
      case 'message':
        return <Badge color="info">Message</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </section>
      <Footer />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">An error has occurred: {error.message}</div>
        </div>
      </section>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Submissions</h1>
                  <p className="text-muted-foreground">Manage contact form submissions and resumes</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </Button>
            </div>

            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle>Submissions</CardTitle>
                <CardDescription>View and manage all contact form submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="contact">Contact</SelectItem>
                      <SelectItem value="resume">Resume</SelectItem>
                      <SelectItem value="message">Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {filteredData.map((submission: any) => (
                    <Card key={submission._id} className="border-l-4 border-l-primary bg-card/30">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{submission.name}</CardTitle>
                            <CardDescription>{submission.email}</CardDescription>
                            {submission.phone && <p className="text-sm text-muted-foreground">{submission.phone}</p>}
                          </div>
                          <div className="flex gap-2">
                            {getTypeBadge(submission.type)}
                            {getStatusBadge(submission.status)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {submission.subject && (
                            <div>
                              <h4 className="font-medium text-sm">Subject</h4>
                              <p className="text-sm">{submission.subject}</p>
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-sm">Message</h4>
                            <p className="text-sm text-muted-foreground">{submission.message}</p>
                          </div>
                          {submission.resume && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`${getBaseUrl()}/${submission.resume.path}`, '_blank')}
                              >
                                View Resume
                              </Button>
                              <span className="text-xs text-muted-foreground">
                                {submission.resume.originalName} ({(submission.resume.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 pt-2">
                            <Select
                              value={submission.status}
                              onValueChange={(newStatus) => updateStatusMutation.mutate({ id: submission._id, status: newStatus })}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="read">Read</SelectItem>
                                <SelectItem value="replied">Replied</SelectItem>
                              </SelectContent>
                            </Select>
                            <span className="text-xs text-muted-foreground">
                              {new Date(submission.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredData.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No submissions found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Submissions;