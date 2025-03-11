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
            getWorker: function (moduleId, label) {
              const getWorkerModule = (label) => {
                switch (label) {
                  case 'typescript':
                  case 'javascript':
                    return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker', import.meta.url));
                  default:
                    return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url));
                }
              };

              try {
                return getWorkerModule(label);
              } catch (e) {
                console.error('Worker initialization error:', e);
                return null;
              }
            }
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
        try {
          const model = editorRef.current.getModel();
          if (model) {
            model.dispose();
          }
          editorRef.current.dispose();
          editorRef.current = null;
        } catch (e) {
          console.error('Error disposing editor:', e);
        }
      }
    };
  }, []);

  // Create or update editor when Monaco is loaded or language/container changes
  useEffect(() => {
    if (!monacoInstance || !containerRef.current) return;

    let editor;
    try {
      // If editor already exists, dispose it
      if (editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          model.dispose();
        }
        editorRef.current.dispose();
      }

      // Create editor
      editor = monacoInstance.editor.create(containerRef.current, {
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
        },
        model: monacoInstance.editor.createModel(value, language)
      });

      // Set up change handler
      if (onChange) {
        editor.onDidChangeModelContent(() => {
          onChange(editor.getValue());
        });
      }

      editorRef.current = editor;
      setIsEditorReady(true);
    } catch (error) {
      console.error('Error creating editor:', error);
    }

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
  }, [monacoInstance, language, containerRef.current]);

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

          // Clean up Monaco Environment
          if (typeof window !== 'undefined' && window.MonacoEnvironment) {
            window.MonacoEnvironment = undefined;
          }
        } catch (e) {
          console.error('Error during cleanup:', e);
        }
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ height, width: '100%' }} data-is-ready={isEditorReady} />
  );
}
