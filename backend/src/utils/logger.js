/* eslint-disable no-console */
const levels = ['error', 'warn', 'info', 'debug'];

function format(level, args) {
  const ts = new Date().toISOString();
  return [`[${ts}] [${level.toUpperCase()}]`, ...args];
}

const logger = levels.reduce((acc, level) => {
  acc[level] = (...args) => {
    const stream = level === 'error' ? console.error : console.log;
    stream(...format(level, args));
  };
  return acc;
}, {});

module.exports = logger;
