'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Calendar } from 'lucide-react';

interface TextEditorProps {
  content: string;
  fileName: string;
  createdDate?: string;
  hasUnsavedChanges: boolean;
  onSave: (content: string, newFileName?: string, newDate?: string) => Promise<void>;
  onClose: () => void;
  onUnsavedChanges: (hasChanges: boolean) => void;
  onContentChange: (content: string, date: string) => void;
}

export function TextEditor({
  content,
  fileName,
  createdDate,
  hasUnsavedChanges,
  onSave,
  onClose,
  onContentChange,
  onUnsavedChanges
}: TextEditorProps) {
  const [text, setText] = useState('');
  const [metadata, setMetadata] = useState<{ date?: string }>({});
  const [title, setTitle] = useState(fileName.replace(/\.md$/, ''));
  const [date, setDate] = useState('');
  const [showMarkdownGuide, setShowMarkdownGuide] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    const { parsedMetadata, parsedContent } = parseMetadata(content);
    setText(parsedContent);
    setMetadata(parsedMetadata);
    setTitle(fileName.replace(/\.md$/, ''));
    setDate(parsedMetadata.date || createdDate || new Date().toISOString().split('T')[0]);
  }, [content, fileName, createdDate]);

  const parseMetadata = (content: string) => {
    const lines = content.split('\n');
    const metadata: { [key: string]: string } = {};
    let contentStart = 0;

    if (lines[0] === '---') {
      for (let i = 1; i < lines.length; i++) {
        if (lines[i] === '---') {
          contentStart = i + 1;
          break;
        }
        const [key, value] = lines[i].split(': ');
        if (key && value) {
          metadata[key.trim()] = value.trim();
        }
      }
    }

    return {
      parsedMetadata: metadata,
      parsedContent: lines.slice(contentStart).join('\n').trim()
    };
  };

  const handlePreviewToggle = async () => {
    if (!isPreview && hasUnsavedChanges) {
      await handleSave();
    }
    setIsPreview(!isPreview);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onUnsavedChanges(true);
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    onUnsavedChanges(true);
    onContentChange(newText, date);
  };
  
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    onUnsavedChanges(true);
    onContentChange(text, newDate);
  };

  const handleSave = async () => {
    const metadataContent = `---\ndate: ${date}\n---\n\n${text}`;
    const newFileName = `${title}.md`;
    await onSave(metadataContent, newFileName, date);
    onUnsavedChanges(false);
  };

  return (
    <div className="w-full h-full flex flex-col p-8 pt-4 bg-white">
      <div className="flex justify-end gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMarkdownGuide(true)}
          className="text-gray-500"
        >
          Markdown Guide
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviewToggle}
          className="text-gray-500"
        >
          {isPreview ? 'Edit' : 'Preview'}
        </Button>
        <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
          Save
        </Button>
      </div>

      <div className="flex flex-col space-y-2">
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="text-3xl font-semibold focus:outline-none border-b-2 border-gray-200 pb-1"
          placeholder="Untitled"
        />
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="focus:outline-none text-gray-500 w-auto"
          />
        </div>
        <div className="prose prose-sm max-w-none mt-4">
          {isPreview ? (
            <div 
              className="w-full min-h-[500px] cursor-pointer"
              onClick={() => setIsPreview(false)}
            >
              <ReactMarkdown>{text}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full min-h-[500px] focus:outline-none resize-none"
              placeholder="Start writing..."
            />
          )}
        </div>
      </div>

      <Dialog open={showMarkdownGuide} onOpenChange={setShowMarkdownGuide}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Markdown Guide</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 p-4">
            <div>
              <h3 className="font-semibold mb-2">Headers</h3>
              <pre className="text-sm"># H1{'\n'}## H2{'\n'}### H3</pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Emphasis</h3>
              <pre className="text-sm">**bold**{'\n'}*italic*{'\n'}~~strike~~</pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Lists</h3>
              <pre className="text-sm">- bullet{'\n'}1. numbered{'\n'}  - nested</pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Other</h3>
              <pre className="text-sm">[Link](url){'\n'}&gt; quote{'\n'}```code```</pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}