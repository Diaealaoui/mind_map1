import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, LogOut } from 'lucide-react';

interface Props {
  userEmail: string;
  onLogout: () => void;
  onNavigate: (section: string) => void;
}

const ClientDashboard: React.FC<Props> = ({ userEmail, onLogout, onNavigate }) => {
  const sections = [
    { id: 'history', title: 'Purchase History', icon: Users, desc: 'View your invoice records' },
    { id: 'forum', title: 'Q&A Forum', icon: MessageSquare, desc: 'Ask and answer questions' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-700">Client Portal</h1>
            <p className="text-sm text-gray-600">Welcome back, {userEmail}</p>
          </div>
          <Button onClick={onLogout} variant="outline" className="text-green-700 border-green-200">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

export default ClientDashboard;
