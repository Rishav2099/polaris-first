import { useEffect, useMemo, useRef } from "react";
import { indentWithTab } from "@codemirror/commands";
import { EditorView, keymap } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { customTheme } from "../extensions/theme";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { getLanguageExtension } from "../extensions/language-extension";
import { minimap } from "../extensions/minimap";
import { customSetup } from "../extensions/custom-setup";
import { suggestion } from "../extensions/suggestions";
import { quickEdit } from "../extensions/quick-edit";
import { selectionTooltip } from "../extensions/suggestions/selection-tooltip";

interface Props {
  fileName: string;
  initialValue?: string;
  onChange: (value: string) => void;
}

const CodeEditor = ({ fileName, initialValue = '', onChange }: Props) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const languageExtension = useMemo(
    () => getLanguageExtension(fileName),
    [fileName],
  );

  // 1. THE MOUNTING EFFECT
  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: initialValue,
      parent: editorRef.current,
      extensions: [
        customSetup,
        oneDark,
        customTheme,
        languageExtension,
        suggestion(fileName),
        quickEdit(fileName),
        selectionTooltip(),
        keymap.of([indentWithTab]),
        minimap(),
        indentationMarkers(),
        EditorView.updateListener.of((update) => {
          // Only trigger onChange if the user ACTUALLY typed something.
          // This prevents infinite loops when we update the doc programmatically below.
          if (update.docChanged && update.transactions.some(tr => tr.isUserEvent('input') || tr.isUserEvent('delete'))) {
            onChange(update.state.doc.toString());
          }
        }),
      ],
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // FIX: Depend on fileName! This forces a complete editor reset (clearing history/selection) 
    // whenever you switch to a different tab, completely preventing the RangeError crash.
  }, [fileName, languageExtension]); 


  // 2. THE REAL-TIME SYNC EFFECT
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentValue = view.state.doc.toString();
    
    // If Convex passes down a new initialValue (e.g. Gemini wrote code), 
    // and it doesn't match what is currently in the editor, inject it!
    if (initialValue !== currentValue) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: initialValue,
        },
      });
    }
  }, [initialValue]);

  return <div ref={editorRef} className="flex-1 min-h-0 pl-4 bg-background" />;
};

export default CodeEditor;