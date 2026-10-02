// Tudo exibido no fuso de São Paulo, independente de onde o navegador está.
const FUSO = "America/Sao_Paulo";

function partes(iso: string) {
  const f = new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    day: "2-digit",
    month: "short",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    year: "numeric",
  });
  const p = Object.fromEntries(f.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return {
    dia: p.day,
    mes: (p.month ?? "").replace(".", ""),
    semana: (p.weekday ?? "").replace(".", ""),
    hora: `${p.hour}:${p.minute}`,
    ano: p.year,
  };
}

/** Data (yyyy-mm-dd) em São Paulo, pra comparar dias. */
function diaSP(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO }).format(d);
}

function diferencaDias(iso: string) {
  const a = new Date(diaSP(new Date()) + "T00:00:00Z").getTime();
  const b = new Date(diaSP(new Date(iso)) + "T00:00:00Z").getTime();
  return Math.round((b - a) / 86_400_000);
}

export function blocoData(iso: string) {
  return partes(iso);
}

/** "hoje às 23:59", "amanhã às 18:00", "em 5 dias", "há 2 dias" */
export function quandoVence(iso: string) {
  const d = diferencaDias(iso);
  const { hora } = partes(iso);
  if (d === 0) return new Date(iso) < new Date() ? `venceu hoje às ${hora}` : `vence hoje às ${hora}`;
  if (d === 1) return `vence amanhã às ${hora}`;
  if (d === -1) return `venceu ontem às ${hora}`;
  if (d > 1) return `vence em ${d} dias, às ${hora}`;
  return `venceu há ${-d} dias`;
}

/** Vence em até 2 dias e ainda não passou. */
export function venceLogo(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  return ms >= 0 && ms <= 2 * 86_400_000;
}

/** ISO (UTC) -> valor do <input type="datetime-local"> no fuso de SP. */
export function paraInputLocal(iso: string) {
  const f = new Intl.DateTimeFormat("sv-SE", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return f.format(new Date(iso)).replace(" ", "T");
}

/** Valor do <input type="datetime-local"> (horário de SP) -> ISO com fuso -03:00. */
export function deInputLocal(valor: string) {
  // São Paulo não tem horário de verão desde 2019: sempre -03:00.
  return `${valor}:00-03:00`;
}
