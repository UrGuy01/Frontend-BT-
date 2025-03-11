import React, { useEffect, useRef, useState } from 'react';

export function MonacoEditor({ language, value = '// Write your code here', onChange, height = '300px' }) {
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const [monacoInstance, setMonacoInstance] = useState(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Initialize Monaco
  useEffect(() => {
    let isMounted = true;

    const loadMonaco = async () => {
      try {
        // Use dynamic import to load Monaco
        const monaco = await import('monaco-editor');
        if (isMounted) {
          setMonacoInstance(monaco);
        }
      } catch (error) {
        console.error('Failed to load Monaco Editor:', error);
      }
    };

    loadMonaco();

    return () => {
      isMounted = false;
    };
  }, []);

  // Create or update editor when Monaco is loaded or language/container changes
  useEffect(() => {
    if (!monacoInstance || !containerRef.current) return;

    // If editor already exists, dispose it
    if (editorRef.current) {
      editorRef.current.dispose();
    }

    // Create editor
    const editor = monacoInstance.editor.create(containerRef.current, {
      value: value,
      language: language,
      theme: 'vs-dark',
      minimap: { enabled: false },
      automaticLayout: true,
    });

    // Set up change handler
    if (onChange) {
      editor.onDidChangeModelContent(() => {
        onChange(editor.getValue());
      });
    }

    editorRef.current = editor;
    setIsEditorReady(true);

    return () => {
      editor.dispose();
    };
  }, [monacoInstance, language, containerRef.current]);

  // Update editor value when prop changes (if editor exists and value is different)
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  // Provide method to get current editor value
  const getValue = () => {
    if (editorRef.current) {
      return editorRef.current.getValue();
    }
    return '';
  };

  return (
    <div ref={containerRef} style={{ height, width: '100%' }} data-is-ready={isEditorReady} />
  );
}
