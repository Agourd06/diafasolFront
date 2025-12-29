import React, { Suspense, useEffect, useMemo, useState } from "react";

const SunEditor = React.lazy(() => import("suneditor-react"));

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  rows?: number;
}

const fallbackView = (
  <div className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
    <div className="flex items-center gap-2">
      <svg className="h-5 w-5 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span>Chargement de l'éditeur...</span>
    </div>
  </div>
);

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Commencez à écrire...",
  rows = 6,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [cssLoaded, setCssLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);
    import("suneditor/dist/css/suneditor.min.css")
      .then(() => setCssLoaded(true))
      .catch(() => setCssLoaded(true));
  }, []);

  const editorHeight = useMemo(() => `${Math.max(rows * 1.6, 8)}rem`, [rows]);

  // Memoize options to prevent re-initialization issues
  const editorOptions = useMemo(
    () => ({
      buttonList: [
        ["undo", "redo"],
        ["bold", "italic", "underline", "strike"],
        ["fontColor", "hiliteColor"],
        ["fontSize", "formatBlock"],
        ["align", "list", "link"],
        ["removeFormat"],
      ],
      fontSize: [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 30, 36, 48],
      minHeight: "200px",
      maxHeight: "600px",
      resizingBar: true,
      showPathLabel: false,
      // Disable charCounter to avoid the getCharCount function error
      charCounter: false,
      placeholder: placeholder,
    }),
    [placeholder]
  );

  if (!isClient || !cssLoaded) {
    return fallbackView;
  }

  return (
    <div className="w-full">
      <Suspense fallback={fallbackView}>
        <SunEditor
          onChange={(content: string) => onChange(content)}
          setContents={value}
          height={editorHeight}
          setOptions={editorOptions}
        />
      </Suspense>
    </div>
  );
};

export default RichTextEditor;

