import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Network } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import MindMapNode from './MindMapNode';

interface NodeData {
  id: string;
  type: 'name' | 'date' | 'purchase';
  label: string;
  children?: NodeData[];
  value?: string | number;
}

const MindMap: React.FC = () => {
  const [mindMapData, setMindMapData] = useState<NodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterName, setFilterName] = useState('');

  const fetchInvoiceData = async () => {
    setLoading(true);
    try {
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const filtered = invoices?.filter(inv => {
        const matchDate = filterDate ? inv.invoice_date.startsWith(filterDate) : true;
        const matchName = filterName
          ? inv.client_name?.toLowerCase().includes(filterName.toLowerCase())
          : true;
        return matchDate && matchName;
      }) || [];

      const grouped = filtered.reduce((acc, curr) => {
        const client = curr.client_name || 'Unknown';
        const date = curr.invoice_date || 'Unknown Date';

        if (!acc[client]) acc[client] = {};
        if (!acc[client][date]) acc[client][date] = [];

        acc[client][date].push({
          id: `purchase-${curr.id}`,
          type: 'purchase',
          label: curr.description || 'Purchase',
          value: curr.amount
        });

        return acc;
      }, {} as Record<string, Record<string, NodeData[]>>);

      const nodes: NodeData[] = Object.entries(grouped).map(([clientName, dates]) => ({
        id: `name-${clientName}`,
        type: 'name',
        label: clientName,
        children: Object.entries(dates).map(([date, purchases]) => ({
          id: `date-${clientName}-${date}`,
          type: 'date',
          label: date,
          children: purchases
        }))
      }));

      setMindMapData(nodes);
    } catch (error) {
      console.error('❌ Error fetching invoice data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceData();
  }, [filterDate, filterName]);

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 to-teal-50 min-h-screen">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Network className="w-6 h-6" />
              <div>
                <CardTitle className="text-xl font-bold">Client Mind Map</CardTitle>
                <p className="text-green-100 text-sm">Interactive client data visualization</p>
              </div>
            </div>
            <Button
              onClick={fetchInvoiceData}
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Filter by client name"
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-md w-64"
            />
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-md"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600">Loading mind map...</span>
            </div>
          ) : mindMapData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No client data available</p>
              <p className="text-sm">Import invoices to see the mind map</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Client Hierarchy</h3>
                <p className="text-sm text-gray-600">
                  Click on nodes to expand and explore client relationships, dates, and purchases
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-auto max-h-96">
                {mindMapData.map((node) => (
                  <MindMapNode key={node.id} node={node} level={0} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MindMap;
