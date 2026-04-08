import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { api } from '../lib/api';
import type { Prediction } from '../types';

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<Prediction[]>([]);

  useEffect(() => {
    api.get<{ predictions: Prediction[] }>('/history').then(({ data }) => setItems(data.predictions ?? [])).catch(() => setItems([]));
  }, []);

  const filteredItems = items.filter((item) => item.fileName.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Search previous uploads and review their evaluation state.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input placeholder="Search files" value={search} onChange={(event) => setSearch(event.target.value)} />
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-4 font-medium">File</th>
                  <th className="pb-4 font-medium">Uploaded</th>
                  <th className="pb-4 font-medium">AI probability</th>
                  <th className="pb-4 font-medium">Effort</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-t border-white/8">
                    <td className="py-4 text-slate-200">{item.fileName}</td>
                    <td className="py-4 text-slate-400">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="py-4 text-slate-300">{(item.aiProbability * 100).toFixed(2)}%</td>
                    <td className="py-4 text-slate-300">{Math.round(item.effortScore)}/100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
