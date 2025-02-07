import { Router } from 'express'

interface MagicOptions {
  /**
   * Optional prefix to apply to all loaded routes (e.g. '/api')
   */
  prefix?: string
}

/**
 * express-magic
 * 
 * Dynamically loads Express routes from a specified directory
 * 
 * @param routesDir - The path to the routes directory (absolute or relative)
 * @param options - Optional settings
 * @returns An Express Router with all routes automagically mounted
 */
declare function magic(routesDir: string, options?: MagicOptions): Router

export default magic
