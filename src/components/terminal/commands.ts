import type { Achievement, Certification, Credit, Project, Site, StackGroup } from "@/lib/content";

/** Datos de /content disponibles para los comandos. */
export interface TerminalData {
  site: Site;
  projects: Project[];
  certifications: Certification[];
  achievements: Achievement[];
  stack: StackGroup[];
  credits: Credit[];
}

/** Una línea de salida. `href` la vuelve link; `tone` define el brillo. */
export interface OutputLine {
  text: string;
  tone?: "hot" | "dim" | "error";
  href?: string;
}

export type CommandResult = { lines: OutputLine[] } | { clear: true };

interface Command {
  description: string;
  run: (args: string[], data: TerminalData) => CommandResult;
}

const out = (...lines: (OutputLine | string)[]): CommandResult => ({
  lines: lines.map((l) => (typeof l === "string" ? { text: l } : l)),
});

/** Nombre de usuario del prompt: primer nombre en minúsculas, sin acentos. */
export function handle(site: Site) {
  return site.name.split(" ")[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function findProject(arg: string | undefined, projects: Project[]) {
  if (!arg) return undefined;
  const n = Number(arg);
  if (Number.isInteger(n)) return projects[n - 1];
  return projects.find((p) => p.slug === arg.toLowerCase() || p.meta.title.toLowerCase() === arg.toLowerCase());
}

export const COMMANDS: Record<string, Command> = {
  help: {
    description: "Lista los comandos disponibles",
    run: () =>
      out(
        { text: "COMANDOS DISPONIBLES", tone: "hot" },
        ...Object.entries(COMMANDS)
          .filter(([name]) => !HIDDEN.has(name))
          .map(([name, c]) => `  ${name.padEnd(12)}${c.description}`),
        { text: "TAB autocompleta · ↑↓ historial · ESC sale de la terminal", tone: "dim" },
      ),
  },
  whoami: {
    description: "Quién soy",
    run: (_, { site }) => out({ text: site.name.toUpperCase(), tone: "hot" }, site.title, { text: site.location, tone: "dim" }),
  },
  about: {
    description: "Presentación",
    run: (_, { site }) => out(site.about),
  },
  experience: {
    description: "Experiencia laboral",
    run: (_, { site }) =>
      out(
        ...site.experience.flatMap((e) => [
          { text: `${e.role} @ ${e.company}`, tone: "hot" as const },
          { text: e.period, tone: "dim" as const },
          ...e.highlights.map((h) => `  > ${h}`),
        ]),
      ),
  },
  projects: {
    description: "Lista de proyectos (open <n> para ver uno)",
    run: (_, { projects }) =>
      out(
        ...projects.map((p, i) => `  [${i + 1}] ${p.meta.title.padEnd(16)}${p.meta.year}  ${p.meta.summary}`),
        { text: "Escribí open <n> para ver el detalle.", tone: "dim" },
      ),
  },
  open: {
    description: "Detalle de un proyecto: open <n|nombre>",
    run: ([arg], { projects }) => {
      const p = findProject(arg, projects);
      if (!p) return out({ text: `open: no existe el proyecto "${arg ?? ""}". Probá: projects`, tone: "error" });
      const { meta } = p;
      return out(
        { text: meta.title.toUpperCase(), tone: "hot" },
        meta.summary,
        { text: `YEAR    ${meta.year}`, tone: "dim" },
        { text: `STACK   ${meta.stack.join(" · ")}`, tone: "dim" },
        { text: `STATUS  ${meta.status}`, tone: "dim" },
        ...(meta.repo ? [{ text: `  > repo  ${meta.repo}`, href: meta.repo }] : []),
        ...(meta.demo ? [{ text: `  > demo  ${meta.demo}`, href: meta.demo }] : []),
      );
    },
  },
  stack: {
    description: "Tecnologías",
    run: (_, { stack }) => out(...stack.map((g) => `  ${g.group.padEnd(18)}${g.items.join(" · ")}`)),
  },
  certs: {
    description: "Certificaciones y logros",
    run: (_, { certifications, achievements }) =>
      out(
        { text: "CERTIFICACIONES", tone: "hot" },
        ...certifications.map((c) => `  ${c.title} — ${[c.issuer, c.date].filter(Boolean).join(", ")}`),
        { text: "LOGROS", tone: "hot" },
        ...achievements.map((a) => `  ★ ${a.title}`),
      ),
  },
  contact: {
    description: "Cómo contactarme",
    run: (_, { site }) => out(...site.contact.map((c) => ({ text: `  > ${c.label.padEnd(10)}${c.value}`, href: c.href }))),
  },
  cv: {
    description: "Modo reclutador: CV completo e imprimible",
    run: () => out({ text: "  > /cv  (abrir el CV completo)", href: "/cv" }),
  },
  credits: {
    description: "Créditos de modelos 3D y recursos",
    run: (_, { credits }) =>
      out(
        ...credits.flatMap((c) => [
          { text: `${c.work} — ${c.author}`, href: c.source },
          { text: `  ${c.license}`, tone: "dim" as const },
        ]),
      ),
  },
  clear: {
    description: "Limpia la pantalla",
    run: () => ({ clear: true }),
  },
  date: {
    description: "Fecha y hora del sistema",
    run: () => out(new Date().toLocaleString("es-AR")),
  },
  echo: {
    description: "Repite el texto",
    run: (args) => out(args.join(" ")),
  },
  exit: {
    description: "Salir del CRT",
    run: () => out({ text: "No hay salida por acá. Scrolleá hacia arriba para volver a la estación.", tone: "dim" }),
  },
  // Ocultos: no aparecen en help.
  sudo: {
    description: "",
    run: (args, data) => {
      if (!args.join(" ").toLowerCase().startsWith("hire")) {
        return out({ text: "guest no está en el archivo sudoers. Este incidente será reportado.", tone: "error" });
      }
      const contact = COMMANDS.contact.run([], data);
      return out({ text: "ACCESS GRANTED. Abriendo canal de contacto...", tone: "hot" }, ...("lines" in contact ? contact.lines : []));
    },
  },
  ls: {
    description: "",
    run: () => out("about.txt  experience.log  projects/  stack.cfg  certs/  contact.vcf"),
  },
  cat: {
    description: "",
    run: ([file], data) => {
      const map: Record<string, string> = {
        "about.txt": "about",
        "experience.log": "experience",
        "stack.cfg": "stack",
        "contact.vcf": "contact",
      };
      const target = file && map[file];
      return target ? COMMANDS[target].run([], data) : out({ text: `cat: ${file ?? ""}: no existe el archivo`, tone: "error" });
    },
  },
};

const HIDDEN = new Set(["sudo", "ls", "cat"]);

export function runCommand(input: string, data: TerminalData): CommandResult {
  const [name, ...args] = input.trim().split(/\s+/);
  if (!name) return out();
  const command = COMMANDS[name.toLowerCase()];
  if (!command) return out({ text: `${name}: comando no encontrado. Escribí help.`, tone: "error" });
  return command.run(args, data);
}

/** Autocompleta el nombre del comando (solo la primera palabra). */
export function complete(input: string): string {
  if (input.includes(" ")) return input;
  const matches = Object.keys(COMMANDS).filter((c) => !HIDDEN.has(c) && c.startsWith(input.toLowerCase()));
  return matches.length === 1 ? `${matches[0]} ` : input;
}
