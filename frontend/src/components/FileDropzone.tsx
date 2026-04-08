import { UploadCloud, FileText } from 'lucide-react';
import { useRef, useState } from 'react';
import { Card, CardContent } from './ui/Card';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

export default function FileDropzone({ onFileSelected }: { onFileSelected: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { theme } = useTheme();

  function handleFile(fileList: FileList | null) {
    const file = fileList?.[0];
    if (file) {
      onFileSelected(file);
    }
  }

  return (
    <Card
      className={cn(
        'border-dashed transition',
        dragActive
          ? theme === 'dark'
            ? 'border-sky-400 bg-sky-500/10'
            : 'border-sky-400 bg-sky-100'
          : theme === 'dark'
            ? 'border-white/15 bg-white/6'
            : 'border-slate-300 bg-slate-50'
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);
        handleFile(event.dataTransfer.files);
      }}
    >
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className={cn(
          'rounded-full border p-5',
          theme === 'dark'
            ? 'border-white/10 bg-white/10 text-sky-200'
            : 'border-sky-200 bg-sky-50 text-sky-600'
        )}>
          <UploadCloud className="h-8 w-8" />
        </div>
        <div>
          <p className={cn('text-lg font-semibold', theme === 'dark' ? 'text-white' : 'text-slate-900')}>Drag and drop your project files</p>
          <p className={cn('mt-2 text-sm', theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}>Support for single files, ZIP archives, or full project folders.</p>
        </div>
        <button
          className={cn(
            'inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition',
            theme === 'dark'
              ? 'bg-white text-slate-950 hover:bg-slate-100'
              : 'bg-sky-600 text-white hover:bg-sky-700'
          )}
          onClick={() => inputRef.current?.click()}
        >
          <FileText className="h-4 w-4" />
          Choose a file
        </button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.txt,.py,.js,.java,.ts,.tsx,.md,.zip"
          aria-label="Select a project file or ZIP archive to upload"
          title="Select a project file or ZIP archive to upload"
          onChange={(event) => handleFile(event.target.files)}
        />
      </CardContent>
    </Card>
  );
}
