// src/pages/PurchaseHistory.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package } from 'lucide-react';

const PurchaseHistory: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.email) return;

      const { data, error } = await supabase
        .from('invoices')
        .select('id, date, total, products (name, quantity, price)')
        .eq('client_email', user.user.email)
        .order('date', { ascending: false });

      if (!error) {
        setHistory(data || []);
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-6">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Package className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-green-700">Purchase History</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-500" />
            <p className="mt-2 text-gray-600">Loading your purchases...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center text-gray-500">No purchases found.</div>
        ) : (
          history.map((invoice) => (
            <Card key={invoice.id} className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">
                  Invoice #{invoice.id} • {new Date(invoice.date).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {invoice.products?.map((prod: any, i: number) => (
                    <li key={i} className="text-sm text-gray-700">
                      • {prod.quantity}x {prod.name} — {(prod.price * prod.quantity).toFixed(2)} MAD
                    </li>
                  ))}
                </ul>
                <div className="text-right mt-4 font-semibold text-green-700">
                  Total: {invoice.total} MAD
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;
