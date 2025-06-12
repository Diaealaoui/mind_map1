// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import AdminDashboard from '@/components/AdminDashboard';
import ClientDashboard from '@/components/ClientDashboard';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [userType, setUserType] = useState<'admin' | 'client' | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (user?.email) setUserEmail(user.email);

      if (user?.id) {
        const { data: profile } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (profile?.user_type === 'admin' || profile?.user_type === 'client') {
          setUserType(profile.user_type);
        }
      }
    };
    fetchUser();
  }, []);

  const handleNavigate = (section: string) => {
    switch (section) {
      case 'mindmap':
        navigate('/mindmap');
        break;
      case 'forum':
        navigate('/forum');
        break;
      case 'csv-upload':
        navigate('/csv');
        break;
      case 'zoho':
        navigate('/zoho');
        break;
      case 'history':
        navigate('/history');
        break;
      default:
        console.warn('Unknown section:', section);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!userType) return <div className="p-6">Loading...</div>;

  return userType === 'admin' ? (
    <AdminDashboard
      userType="admin"
      userEmail={userEmail}
      onLogout={handleLogout}
      onNavigate={handleNavigate}
    />
  ) : (
    <ClientDashboard
      userType="client"
      userEmail={userEmail}
      onLogout={handleLogout}
      onNavigate={handleNavigate}
    />
  );
};

export default DashboardPage;
