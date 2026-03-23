"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

import "@xterm/xterm/css/xterm.css";

interface PreviewTerminalProps {
  output: string;
}

export const PreviewTerminal = ({ output }: PreviewTerminalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  
  const lastLengthRef = useRef(0);

  // Initialize terminal
  useEffect(() => {
    if (!containerRef.current || terminalRef.current) return;

    const terminal = new Terminal({
      convertEol: true,
      disableStdin: true,
      fontSize: 12,
      fontFamily: "monospace",
      theme: { 
        background: "#1e1e1e", // Standard dark mode bg
        foreground: "#ffffff"
      },
      cursorBlink: false,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Write existing output on mount
    if (output) {
      terminal.write(output);
      lastLengthRef.current = output.length;
    }

    // Fit on mount and window resize
    requestAnimationFrame(() => fitAddon.fit());
    
    const handleResize = () => fitAddon.fit();
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, []); // Run once on mount

  // Handle new output
  useEffect(() => {
    if (!terminalRef.current) return;

    // If output shrank (e.g. restart), clear terminal
    if (output.length < lastLengthRef.current) {
      terminalRef.current.clear();
      lastLengthRef.current = 0;
    }

    // Only write the *new* part of the string
    const newData = output.slice(lastLengthRef.current);
    if (newData) {
      terminalRef.current.write(newData);
      lastLengthRef.current = output.length;
    }
    
    // Auto-scroll to bottom
    // terminalRef.current.scrollToBottom(); // Optional: Enable if you want auto-scroll
  }, [output]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-[#1e1e1e]" // Ensure container has background
      style={{ overflow: "hidden" }} // Prevents double scrollbars
    />
  );
};