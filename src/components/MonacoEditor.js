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
        // Configure Monaco's base path for workers
        if (typeof window !== 'undefined') {
          window.MonacoEnvironment = {
            getWorkerUrl: function (moduleId, label) {
              if (label === 'typescript' || label === 'javascript') {
                return '_next/static/chunks/monaco-editor/ts.worker.js';
              }
              return '_next/static/chunks/monaco-editor/editor.worker.js';
            },
          };
        }

        // Use dynamic import to load Monaco
        const monaco = await import('monaco-editor/esm/vs/editor/editor.api');
        
        if (isMounted) {
          // Configure TypeScript/JavaScript defaults
          monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: false
          });

          monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ES2015,
            allowNonTsExtensions: true
          });

          setMonacoInstance(monaco);
        }
      } catch (error) {
        console.error('Failed to load Monaco Editor:', error);
      }
    };

    loadMonaco();

    return () => {
      isMounted = false;
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []);

  // Create or update editor when Monaco is loaded or language/container changes
  useEffect(() => {
    if (!monacoInstance || !containerRef.current) return;

    // If editor already exists, dispose it
    if (editorRef.current) {
      editorRef.current.dispose();
    }

    try {
      // Create editor
      const editor = monacoInstance.editor.create(containerRef.current, {
        value: value,
        language: language,
        theme: 'vs-dark',
        minimap: { enabled: false },
        automaticLayout: true,
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        renderWhitespace: 'none',
        contextmenu: true,
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible'
        }
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
        if (editor) {
          try {
            const model = editor.getModel();
            if (model) {
              model.dispose();
            }
            editor.dispose();
          } catch (e) {
            console.error('Error disposing editor:', e);
          }
        }
      };
    } catch (error) {
      console.error('Error creating editor:', error);
    }
  }, [monacoInstance, language, containerRef.current]);

  // Update editor value when prop changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      try {
        editorRef.current.setValue(value);
      } catch (error) {
        console.error('Error updating editor value:', error);
      }
    }
  }, [value]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try {
          const model = editorRef.current.getModel();
          if (model) {
            model.dispose();
          }
          editorRef.current.dispose();
          editorRef.current = null;
        } catch (e) {
          console.error('Error during cleanup:', e);
        }
      }
    };
  }, []);

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
