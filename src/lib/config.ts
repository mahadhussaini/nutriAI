import { z } from 'zod'

// Environment variable schema validation
const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  OPENAI_API_BASE_URL: z.string().url().optional().default('https://api.openai.com/v1'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// Type for the validated environment configuration
type EnvConfig = z.infer<typeof envSchema>

/**
 * Validates and returns environment configuration
 * Throws an error if required environment variables are missing or invalid
 */
function validateEnvironment(): EnvConfig {
  try {
    const env = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_API_BASE_URL: process.env.OPENAI_API_BASE_URL,
      NODE_ENV: process.env.NODE_ENV,
    }

    // Validate the environment variables
    const validatedEnv = envSchema.parse(env)

    return validatedEnv
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .filter((err) => err.code === 'invalid_type' && 'received' in err && err.received === 'undefined')
        .map((err) => err.path.join('.'))

      if (missingVars.length > 0) {
        throw new Error(
          `Missing required environment variables: ${missingVars.join(', ')}\n` +
          'Please check your .env file and ensure all required variables are set.\n' +
          'See README.md for setup instructions.'
        )
      }

      throw new Error(
        `Invalid environment configuration: ${error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ')}`
      )
    }

    throw error
  }
}

// Lazy environment validation - only validate when config is accessed
let cachedEnv: EnvConfig | null = null

function getValidatedEnvironment(): EnvConfig {
  if (!cachedEnv) {
    cachedEnv = validateEnvironment()
  }
  return cachedEnv
}

/**
 * Application configuration object
 * Provides type-safe access to validated environment variables
 */
export const config = {
  get openai() {
    const env = getValidatedEnvironment()
    return {
      apiKey: env.OPENAI_API_KEY,
      baseURL: env.OPENAI_API_BASE_URL,
    }
  },
  get nodeEnv() {
    return getValidatedEnvironment().NODE_ENV
  },
  get isDevelopment() {
    return getValidatedEnvironment().NODE_ENV === 'development'
  },
  get isProduction() {
    return getValidatedEnvironment().NODE_ENV === 'production'
  },
  get isTest() {
    return getValidatedEnvironment().NODE_ENV === 'test'
  },
} as const

/**
 * Utility function to check if OpenAI API key is configured
 * Useful for conditional feature enabling
 */
export function isOpenAIConfigured(): boolean {
  try {
    getValidatedEnvironment()
    return true
  } catch {
    return false
  }
}

/**
 * Get a safe display version of the API key for logging/debugging
 * Shows only first 4 and last 4 characters
 */
export function getSafeApiKeyDisplay(): string {
  const key = config.openai.apiKey
  if (key.length <= 8) return '****'
  return `${key.slice(0, 4)}****${key.slice(-4)}`
}
