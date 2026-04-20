import pino from 'pino';

const logger = pino({ name: 'env-validator' });

export interface EnvValidationOptions {
  /**
   * Custom error message to display when validation fails
   */
  message?: string;

  /**
   * Whether this environment variable is optional
   * If true, returns undefined when not set instead of throwing
   */
  optional?: boolean;

  /**
   * Custom validation function
   * Throws an error if validation fails
   */
  validate?: (value: string) => void;

  /**
   * Transform function to convert string to desired type
   */
  transform?: <T>(value: string) => T;
}

/**
 * Retrieves environment variable value from process.env
 * @param name - Environment variable name
 * @returns The raw environment variable value or undefined
 */
function getEnvValue(name: string): string | undefined {
  return process.env[name];
}

/**
 * Creates standardized error message for missing environment variable
 * @param name - Environment variable name
 * @param customMessage - Optional custom error message
 * @returns Formatted error message
 */
function createMissingEnvMessage(name: string, customMessage?: string): string {
  return customMessage || `${name} environment variable is required but not provided`;
}

/**
 * Logs error and throws for missing required environment variable
 * @param message - Error message to log and throw
 * @throws Error with the provided message
 */
function handleMissingEnv(message: string): never {
  logger.error(message);
  throw new Error(message);
}

/**
 * Validates that environment variable value exists if required
 * @param name - Environment variable name
 * @param value - Environment variable value
 * @param isOptional - Whether the variable is optional
 * @param customMessage - Optional custom error message
 * @returns true if validation passes, never returns if validation fails
 * @throws Error if value is missing and variable is required
 */
function validateEnvExists(
  name: string,
  value: string | undefined,
  isOptional: boolean,
  customMessage?: string,
): value is string {
  if (!value && !isOptional) {
    const errorMessage = createMissingEnvMessage(name, customMessage);
    handleMissingEnv(errorMessage);
  }
  return Boolean(value);
}

/**
 * Executes custom validation function on environment variable value
 * @param name - Environment variable name
 * @param value - Environment variable value to validate
 * @param validateFn - Custom validation function
 * @throws Error if validation fails
 */
function runCustomValidation(
  name: string,
  value: string,
  validateFn: (value: string) => void,
): void {
  try {
    validateFn(value);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : `${name} environment variable validation failed`;

    logger.error({ err: error }, errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Transforms environment variable value using provided transformer function
 * @param name - Environment variable name
 * @param value - Environment variable value to transform
 * @param transformFn - Transformation function
 * @returns Transformed value
 * @throws Error if transformation fails
 */
function transformEnvValue<T>(name: string, value: string, transformFn: (value: string) => T): T {
  try {
    return transformFn(value);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : `${name} environment variable transformation failed`;

    logger.error({ err: error }, errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Validates that an environment variable is set and returns its value
 * Throws an error with logging if the variable is not set or fails validation
 *
 * @param name - The name of the environment variable (e.g., 'DATABASE_URL')
 * @param options - Optional configuration for validation behavior
 * @returns The environment variable value
 * @throws Error if the variable is not set (unless optional: true)
 *
 * @example
 * // Basic validation
 * const dbUrl = requireEnv('DATABASE_URL');
 *
 * @example
 * // Optional variable
 * const optionalVar = requireEnv('OPTIONAL_VAR', { optional: true });
 *
 * @example
 * // With custom validation
 * const port = requireEnv('PORT', {
 *   validate: (value) => {
 *     const num = parseInt(value, 10);
 *     if (isNaN(num)) throw new Error('PORT must be a number');
 *   }
 * });
 *
 * @example
 * // With transformation
 * const port = requireEnv('PORT', {
 *   transform: (value) => {
 *     const num = parseInt(value, 10);
 *     if (isNaN(num)) throw new Error('PORT must be a number');
 *     return num;
 *   }
 * });
 */
export function requireEnv(name: string, options?: EnvValidationOptions): string;
export function requireEnv<T>(
  name: string,
  options: EnvValidationOptions & { transform: (value: string) => T },
): T;
export function requireEnv<T>(
  name: string,
  options?: EnvValidationOptions,
): string | T | undefined {
  const value = getEnvValue(name);
  const isOptional = Boolean(options?.optional);

  // Return undefined for missing optional variables
  if (!value && isOptional) {
    return undefined;
  }

  // Validate value exists for required variables
  validateEnvExists(name, value, isOptional, options?.message);

  // At this point, value is guaranteed to be a string
  const envValue = value as string;

  // Run custom validation if provided
  if (options?.validate) {
    runCustomValidation(name, envValue, options.validate);
  }

  // Transform and return if transformer provided
  if (options?.transform) {
    return transformEnvValue(name, envValue, options.transform) as T;
  }

  return envValue;
}

/**
 * Parses string value to integer
 * @param value - String value to parse
 * @returns Parsed integer or NaN
 */
function parseEnvInteger(value: string): number {
  return parseInt(value, 10);
}

/**
 * Validates that parsed number is valid (not NaN)
 * @param name - Environment variable name
 * @param parsedValue - Parsed number to validate
 * @throws Error if value is NaN
 */
function validateEnvNumber(name: string, parsedValue: number): void {
  if (Number.isNaN(parsedValue)) {
    const errorMessage = `${name} must be a valid number`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Validates and returns a numeric environment variable
 *
 * @param name - The name of the environment variable
 * @param options - Optional configuration
 * @returns The parsed number
 * @throws Error if the variable is not set or not a valid number
 *
 * @example
 * const port = requireEnvNumber('PORT');
 * const maxRetries = requireEnvNumber('MAX_RETRIES', { optional: true });
 */
export function requireEnvNumber(
  name: string,
  options?: Omit<EnvValidationOptions, 'transform' | 'validate'>,
): number | undefined {
  const value = getEnvValue(name);
  const isOptional = Boolean(options?.optional);

  // Return undefined for missing optional variables
  if (!value && isOptional) {
    return undefined;
  }

  // Validate value exists for required variables
  validateEnvExists(name, value, isOptional, options?.message);

  // At this point, value is guaranteed to be a string
  const envValue = value as string;

  // Parse and validate number
  const parsedNumber = parseEnvInteger(envValue);
  validateEnvNumber(name, parsedNumber);

  return parsedNumber;
}

/**
 * Validates that multiple environment variables are set
 * Useful for validating related credentials together
 *
 * @param names - Array of environment variable names
 * @param options - Optional configuration applied to all variables
 * @returns Object mapping variable names to their values
 *
 * @example
 * const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = requireEnvGroup([
 *   'AWS_ACCESS_KEY_ID',
 *   'AWS_SECRET_ACCESS_KEY'
 * ]);
 */
export function requireEnvGroup(names: string[]): Record<string, string>;
export function requireEnvGroup(
  names: string[],
  options: EnvValidationOptions & { optional: true },
): Record<string, string | undefined>;
export function requireEnvGroup(
  names: string[],
  options?: EnvValidationOptions,
): Record<string, string> | Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};

  for (const name of names) {
    result[name] = requireEnv(name, options);
  }

  return result as Record<string, string> | Record<string, string | undefined>;
}

/**
 * Attempts to validate environment variable value with custom validator
 * @param value - Environment variable value
 * @param validateFn - Custom validation function
 * @returns true if validation passes or no validator provided, false if validation fails
 */
function tryValidateEnvValue(value: string, validateFn?: (value: string) => void): boolean {
  if (!validateFn) {
    return true;
  }

  try {
    validateFn(value);
    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * Finds first valid environment variable from list of names
 * @param names - Array of environment variable names
 * @param validateFn - Optional validation function
 * @returns First valid value found or undefined
 */
function findFirstValidEnv(
  names: string[],
  validateFn?: (value: string) => void,
): string | undefined {
  for (const name of names) {
    const value = getEnvValue(name);
    if (value && tryValidateEnvValue(value, validateFn)) {
      return value;
    }
  }
  return undefined;
}

/**
 * Creates error message for missing OneOf environment variables
 * @param names - Array of environment variable names
 * @param customMessage - Optional custom error message
 * @returns Formatted error message
 */
function createMissingOneOfMessage(names: string[], customMessage?: string): string {
  return (
    customMessage || `At least one of [${names.join(', ')}] environment variables must be provided`
  );
}

/**
 * Validates that at least one of the provided environment variables is set
 *
 * @param names - Array of environment variable names
 * @param options - Optional configuration
 * @returns The first non-empty value found
 * @throws Error if none of the variables are set
 *
 * @example
 * const baseUrl = requireEnvOneOf(['BETTER_AUTH_URL', 'AUTH_URL']);
 */
export function requireEnvOneOf(
  names: string[],
  options?: Omit<EnvValidationOptions, 'optional'>,
): string {
  const foundValue = findFirstValidEnv(names, options?.validate);

  if (!foundValue) {
    const errorMessage = createMissingOneOfMessage(names, options?.message);
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  return foundValue;
}
