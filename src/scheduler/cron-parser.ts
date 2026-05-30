export interface CronFields {
  minutes: Set<number>;
  hours: Set<number>;
  daysOfMonth: Set<number>;
  months: Set<number>;
  daysOfWeek: Set<number>;
}

const FIELD_RANGES: ReadonlyArray<{ min: number; max: number }> = [
  { min: 0, max: 59 }, // minutes
  { min: 0, max: 23 }, // hours
  { min: 1, max: 31 }, // day-of-month
  { min: 1, max: 12 }, // month
  { min: 0, max: 6 }, // day-of-week
];

const FIELD_NAMES = ["minute", "hour", "day-of-month", "month", "day-of-week"] as const;

export function parseCron(expr: string): CronFields {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(
      `Invalid cron: expected 5 fields (min hour dom month dow), got ${parts.length}`,
    );
  }

  const parsed = parts.map((part, i) => {
    const range = FIELD_RANGES[i]!;
    const name = FIELD_NAMES[i]!;
    return parseField(part, range.min, range.max, name);
  });

  return {
    minutes: parsed[0]!,
    hours: parsed[1]!,
    daysOfMonth: parsed[2]!,
    months: parsed[3]!,
    daysOfWeek: parsed[4]!,
  };
}

function parseField(field: string, min: number, max: number, name: string): Set<number> {
  const values = new Set<number>();

  for (const part of field.split(",")) {
    const stepMatch = part.match(/^(.+)\/(\d+)$/);
    const step = stepMatch ? Number.parseInt(stepMatch[2]!, 10) : 1;
    const base = stepMatch ? stepMatch[1]! : part;

    if (base === "*") {
      for (let v = min; v <= max; v += step) values.add(v);
    } else if (base.includes("-")) {
      const parts = base.split("-");
      const start = Number.parseInt(parts[0]!, 10);
      const end = Number.parseInt(parts[1]!, 10);
      if (
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        start < min ||
        end > max ||
        start > end
      ) {
        throw new Error(`Invalid cron ${name}: invalid range '${base}'`);
      }
      for (let v = start; v <= end; v += step) values.add(v);
    } else {
      const v = Number.parseInt(base, 10);
      if (!Number.isFinite(v) || v < min || v > max) {
        throw new Error(`Invalid cron ${name}: '${base}' out of range [${min}-${max}]`);
      }
      values.add(v);
    }
  }

  return values;
}

export function matchesCron(expr: string, date: Date): boolean {
  const fields = parseCron(expr);

  const minute = date.getMinutes();
  const hour = date.getHours();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1;
  const dayOfWeek = date.getDay();

  return (
    fields.minutes.has(minute) &&
    fields.hours.has(hour) &&
    fields.daysOfMonth.has(dayOfMonth) &&
    fields.months.has(month) &&
    fields.daysOfWeek.has(dayOfWeek)
  );
}

export function nextRun(expr: string, from: Date): Date {
  const fields = parseCron(expr);

  const current = new Date(from.getTime());
  current.setSeconds(0, 0);
  current.setMinutes(current.getMinutes() + 1);

  for (let i = 0; i < 1440; i++) {
    const minute = current.getMinutes();
    const hour = current.getHours();
    const dayOfMonth = current.getDate();
    const month = current.getMonth() + 1;
    const dayOfWeek = current.getDay();

    if (
      fields.minutes.has(minute) &&
      fields.hours.has(hour) &&
      fields.daysOfMonth.has(dayOfMonth) &&
      fields.months.has(month) &&
      fields.daysOfWeek.has(dayOfWeek)
    ) {
      return current;
    }

    current.setMinutes(current.getMinutes() + 1);
  }

  throw new Error(`No matching time found within 24 hours for cron expression: ${expr}`);
}

export function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    return `Invalid cron expression: ${expr}`;
  }

  const min = parts[0]!;
  const hour = parts[1]!;
  const dom = parts[2]!;
  const month = parts[3]!;
  const dow = parts[4]!;

  if (min === "*" && hour === "*") {
    const stepMatch = min.match(/^\*\/(\d+)$/);
    if (stepMatch) return `every ${stepMatch[1]} minutes`;
    return "every minute";
  }

  if (min.startsWith("*/")) {
    const n = min.slice(2);
    return `every ${n} minutes`;
  }

  if (hour === "*" && dom === "*" && month === "*" && dow === "*") {
    return `every hour at minute ${min}`;
  }

  if (hour.startsWith("*/")) {
    const n = hour.slice(2);
    return `every ${n} hours at minute ${min}`;
  }

  if (dom === "*" && month === "*") {
    const time = formatTime(hour, min);

    if (dow === "*") {
      return `daily at ${time}`;
    }

    const dowDesc = describeDayOfWeek(dow);
    if (dowDesc) return `${dowDesc} at ${time}`;
  }

  if (dom === "1" && month === "*" && dow === "*") {
    const time = formatTime(hour, min);
    return `first of every month at ${time}`;
  }

  if (dom.startsWith("*/")) {
    const n = dom.slice(2);
    const time = formatTime(hour, min);
    return `every ${n} days at ${time}`;
  }

  return `${min} ${hour} ${dom} ${month} ${dow}`;
}

function formatTime(hour: string, minute: string): string {
  const h = hour.padStart(2, "0");
  const m = minute.padStart(2, "0");
  return `${h}:${m}`;
}

function describeDayOfWeek(dow: string): string | null {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (dow === "1-5") return "weekdays";
  if (dow === "0,6" || dow === "6,0") return "weekends";

  const days = dow.split(",").map((d) => {
    const n = Number.parseInt(d, 10);
    return Number.isFinite(n) && n >= 0 && n <= 6 ? dayNames[n] : null;
  });

  if (days.every((d) => d !== null)) {
    return days.join(", ");
  }

  return null;
}
