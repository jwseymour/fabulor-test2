'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';

interface TextEditorProps {
    content: string;
    fileName: string;  // Add this line
    onSave: (content: string) => Promise<void>;
    onClose: () => void;
  }
  
  export function TextEditor({ content, fileName, onSave, onClose }: TextEditorProps) {
    const [text, setText] = useState(content);
    const [isEditing, setIsEditing] = useState(false);
  
    // Add this effect to update text when content changes
    useEffect(() => {
      setText(content);
      setIsEditing(false);
    }, [content]);
  
    const handleSave = async () => {
      await onSave(text);
      setIsEditing(false);
    };
  
    return (
      <div className="w-full h-full flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">{fileName}</h2>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </>
            )}
          </div>
        </div>
        {isEditing ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-[500px] p-4 border rounded-md font-mono"
          />
        ) : (
          <pre className="w-full h-[500px] p-4 border rounded-md overflow-auto whitespace-pre-wrap">
            {text}
          </pre>
        )}
      </div>
    );
  }