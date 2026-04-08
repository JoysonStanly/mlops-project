import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileUp, FileText } from 'lucide-react';
import Layout from '../components/Layout';
import FileDropzone from '../components/FileDropzone';
import Button from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { api } from '../lib/api';

export default function UploadPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const preview = useMemo(() => {
    if (!selectedFile) return null;
    return {
      name: selectedFile.name,
      size: `${(selectedFile.size / 1024).toFixed(1)} KB`,
      type: selectedFile.type || 'application/octet-stream',
    };
  }, [selectedFile]);

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    setProgress(10);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', description);

    try {
      const { data } = await api.post<{ resultId: string }>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (!event.total) return;
          setProgress(Math.round((event.loaded / event.total) * 100));
        },
      });
      navigate(`/app/results/${data.resultId}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <Layout>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload submission</CardTitle>
              <CardDescription>Drop a code file or PDF and let the evaluation pipeline do the heavy lifting.</CardDescription>
            </CardHeader>
            <CardContent>
              <FileDropzone onFileSelected={setSelectedFile} />
              <div className="mt-5 space-y-4">
                <label className="block text-sm text-slate-300">
                  Context note
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="mt-2 min-h-32 w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none backdrop-blur-md"
                    placeholder="Optional notes for the evaluator"
                  />
                </label>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Start evaluation'}
                  </Button>
                  <Button variant="secondary" onClick={() => setSelectedFile(null)}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>
                {uploading ? (
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Upload progress</span>
                      <span>{progress}%</span>
                    </div>
                    <progress
                      className="h-2 w-full overflow-hidden rounded-full bg-white/10 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-white/10 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-sky-400 [&::-webkit-progress-value]:to-emerald-400"
                      value={progress}
                      max={100}
                      aria-label="Upload progress"
                    />
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>File preview</CardTitle>
            <CardDescription>Confirm the payload before sending it to the ML service.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {preview ? (
              <>
                <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-sky-400/15 p-3 text-sky-200">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{preview.name}</p>
                      <p className="text-sm text-slate-400">{preview.size}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-400">{preview.type}</div>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-sky-500/12 to-emerald-500/12 p-5 text-sm text-slate-300">
                  The backend will store the upload, forward text to the ML microservice, and persist the prediction for history tracking.
                  The returned score is calibrated to avoid false certainty on boilerplate-heavy code.
                </div>
              </>
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-white/6 p-6 text-sm text-slate-400">
                No file selected yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
