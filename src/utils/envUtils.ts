export function getEnvVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

export function getOptionalEnvVariable(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}
