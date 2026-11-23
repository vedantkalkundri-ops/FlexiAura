const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function getCurrentLevel() {
  return LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;
}

function write(level, message, meta) {
  if (LEVELS[level] > getCurrentLevel()) {
    return;
  }

  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;

  if (meta === undefined) {
    console[level](line);
    return;
  }

  console[level](line, meta);
}

export const logger = {
  error: (message, meta) => write("error", message, meta),
  warn: (message, meta) => write("warn", message, meta),
  info: (message, meta) => write("info", message, meta),
  debug: (message, meta) => write("debug", message, meta),
};
