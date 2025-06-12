import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, MessageSquare, Upload, Link as LinkIcon, LogOut } from 'lucide-react';

interface Props {
  userEmail: string;
  onLogout: () => void;
  onNavigate: (section: string) => void;
}

const AdminDashboard: React.FC<Props> = ({ userEmail, onLogout, onNavigate }) => {
  const sections = [
    { id: 'mindmap', title: 'Invoice Mind Map', icon: BarChart3, desc: 'Visualize invoices hierarchically' },
    { id: 'forum', title: 'Q&A Forum', icon: MessageSquare, desc: 'Engage with discussions' },
    { id: 'csv-upload', title: 'CSV Import', icon: Upload, desc: 'Upload and parse CSV invoices' },
    { id: 'zoho', title: 'Zoho Integration', icon: LinkIcon, desc: 'Sync Zoho Books invoices' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-700">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {userEmail}</p>
          </div>
          <Button onClick={onLogout} variant="outline" className="text-green-700 border-green-200">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map(({ id, title, icon: Icon, desc }) => (
            <Card key={id} onClick={() => onNavigate(id)} className="cursor-pointer hover:scale-105 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Icon className="w-6 h-6 text-green-600" />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
