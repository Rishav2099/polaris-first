import { useEffect, useMemo, useRef } from "react";
import { indentWithTab } from "@codemirror/commands";
import { basicSetup } from "codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { customTheme } from "../extensions/theme";
import {indentationMarkers} from '@replit/codemirror-indentation-markers'
import { getLanguageExtension } from "../extensions/language-extension";
import { minimap } from "../extensions/minimap";
import { customSetup } from "../extensions/custom-setup";

interface Props {
  fileName: string;
}

const CodeEditor = ({ fileName }: Props) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const languageExtension = useMemo(
    () => getLanguageExtension(fileName),
    [fileName],
  );

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: "Start document",
      parent: editorRef.current,
      extensions: [
        customSetup,
        oneDark,
        customTheme,
        languageExtension,
        keymap.of([indentWithTab]),
        minimap(), 
        indentationMarkers(),
      ],
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  return <div ref={editorRef} className="flex-1 min-h-0 pl-4 bg-background" />;
};

export default CodeEditor;
