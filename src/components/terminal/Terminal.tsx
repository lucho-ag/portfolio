"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useReveal } from "@/animation/reveal";
import { complete, handle, runCommand, type OutputLine, type TerminalData } from "./commands";

interface Entry {
  id: number;
  command?: string;
  lines: OutputLine[];
}

/** Líneas cortas se tipean; las largas se barren línea por línea (tipearlas sería eterno). */
const TYPE_MAX_CHARS = 90;

const TONE: Record<NonNullable<OutputLine["tone"]> | "base", string> = {
  base: "text-phosphor",
  hot: "text-phosphor-hot",
  dim: "text-phosphor-dim",
  error: "text-alert",
};

/**
 * Terminal del acto 4. Los comandos leen /content (ver commands.ts), así que todo lo que
 * muestra la interfaz también se puede consultar escribiendo.
 */
export default function Terminal({ data, active }: { data: TerminalData; active: boolean }) {
  const prompt = `guest@${handle(data.site)}:~$`;
  const nextId = useRef(1);
  const [entries, setEntries] = useState<Entry[]>(() => [
    {
      id: 0,
      lines: [
        { text: `${data.site.name.toUpperCase()} — PHOSPHOR OS`, tone: "hot" },
        { text: data.site.title },
        { text: "Escribí help para ver los comandos, o usá el menú de arriba.", tone: "dim" },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const history = useRef<string[]>([]);
  const historyIndex = useRef(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Al entrar al CRT, el foco va al prompt (sin mover el scroll de la página).
  useEffect(() => {
    if (active) inputRef.current?.focus({ preventScroll: true });
  }, [active]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  const submit = () => {
    const command = input.trim();
    setInput("");
    historyIndex.current = -1;
    if (!command) return;
    history.current.unshift(command);
    const result = runCommand(command, data);
    if ("clear" in result) setEntries([]);
    else setEntries((prev) => [...prev, { id: nextId.current++, command, lines: result.lines }]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submit();
    } else if (e.key === "Tab") {
      e.preventDefault();
      setInput((v) => complete(v));
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const max = history.current.length - 1;
      const i = Math.max(-1, Math.min(max, historyIndex.current + (e.key === "ArrowUp" ? 1 : -1)));
      historyIndex.current = i;
      setInput(i === -1 ? "" : history.current[i]);
    } else if (e.key === "Escape") {
      inputRef.current?.blur();
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col text-sm" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
      <div ref={scrollRef} data-lenis-prevent className="crt-scroll min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
        {entries.map((entry) => (
          <Block key={entry.id} entry={entry} prompt={prompt} play={entry.id === 0 ? active : true} />
        ))}
      </div>
      <label className="mt-3 flex shrink-0 items-baseline gap-2">
        <span className="shrink-0 text-phosphor-hot">{prompt}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
          aria-label="Comando"
          className="min-w-0 flex-1 bg-transparent text-phosphor caret-phosphor-hot outline-none"
        />
      </label>
    </div>
  );
}

/** Un comando y su salida. Se revela una sola vez al montarse (o al entrar al CRT, el MOTD). */
function Block({ entry, prompt, play }: { entry: Entry; prompt: string; play: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref, play);

  return (
    <div ref={ref} className="whitespace-pre-wrap break-words">
      {entry.command !== undefined && (
        <p>
          <span className="text-phosphor-hot">{prompt}</span> <span className="text-phosphor">{entry.command}</span>
        </p>
      )}
      {entry.lines.map((line, i) => {
        const fx = line.text.length > TYPE_MAX_CHARS ? "lines" : "type";
        const className = TONE[line.tone ?? "base"];
        return line.href ? (
          <a
            key={i}
            data-fx={fx}
            href={line.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`block ${className} underline decoration-phosphor-dim underline-offset-4 hover:text-phosphor-hot`}
          >
            {line.text}
          </a>
        ) : (
          <p key={i} data-fx={fx} className={className}>
            {line.text}
          </p>
        );
      })}
    </div>
  );
}
