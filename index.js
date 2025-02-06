// Copyright (C) 2025 Adam K Dean <adamkdean@googlemail.com>
// Use of this source code is governed by the GPL-3.0
// license that can be found in the LICENSE file.

import fs from 'fs'
import path from 'path'
import express from 'express'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)

/**
 * Attempts to get the caller's directory using the error stack
 *
 * This function parses the stack trace to retrieve the file name of the caller
 * It is a heuristic and may not work in every environment
 *
 * @returns {string} The directory name of the calling module
 */
function resolveCallerDir() {
  const err = new Error()
  const stack = err.stack.split('\n')
  // The stack trace format varies; this assumes the third or fourth line contains the caller
  // E.g. "    at file:///Users/person/projects/magic/src/index.js:10:5"
  const callerLine = stack[3] || stack[2] || ''
  const match = callerLine.match(/\(?([^\s\)]+):\d+:\d+\)?/)
  if (match && match[1]) {
    let callerPath = match[1]
    if (callerPath.startsWith('file:')) {
      callerPath = fileURLToPath(callerPath)
    }
    return path.dirname(callerPath)
  }
  return process.cwd()
}

/**
 * Recursively scans a directory and mounts any JavaScript route modules
 *
 * For every folder, its name is appended to the current route path
 * For every file:
 *   - If the file is named "index.js", its router is mounted at the current route
 *   - Otherwise, the file name (without the ".js" extension) is appended to form the route
 *
 * Assumes each route module exports either:
 *   - An Express Router
 *   - A function that returns an Express Router
 *
 * @param {express.Router} router - The Express router to mount routes onto
 * @param {string} dirPath - Absolute path to the directory containing route modules
 * @param {string} [baseRoute=''] - Accumulated base route (using POSIX-style joins)
 */
const mountRoutes = (router, dirPath, baseRoute = '') => {

  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      const newBaseRoute = path.posix.join(baseRoute, entry.name)
      mountRoutes(router, fullPath, newBaseRoute)
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      let routePath
      if (entry.name === 'index.js') {
        routePath = baseRoute
      } else {
        const fileName = entry.name.slice(0, -3) // remove .js
        routePath = path.posix.join(baseRoute, fileName)
      }

      // Load the route module and mount it
      const mod = require(fullPath)
      const routeModule = mod.default || mod

      // Determine if routeModule is an Express router or a function that returns a router
      // If it's a router, use it directly; if it's a function, call it to get the router
      // Throw an error if it's neither a router nor a function returning a router
      let loadedRoute
      if (typeof routeModule === 'function' && typeof routeModule.handle === 'function') {
        loadedRoute = routeModule
      } else if (typeof routeModule === 'function') {
        loadedRoute = routeModule()
      } else {
        throw new Error(`The module at ${fullPath} did not return a valid Express router`)
      }

      // Mount the loaded route. If routePath is empty, mount at '/'
      router.use(routePath ? `/${routePath}` : '/', loadedRoute)
    }
  }
}

/**
 * express-magic
 *
 * Dynamically loads Express routes from a specified directory
 *
 * @param {string} routesDir - The path to the routes directory (absolute or relative)
 * @param {object} [options={}] - Optional settings
 * @param {string} [options.prefix] - A prefix to apply to all loaded routes (e.g. '/api')
 * @returns {express.Router} An Express Router with all routes automagically mounted
 */
export default function magic(routesDir, options = {}) {
  const router = express.Router()
  const prefix = options.prefix || ''

  // Resolve routesDir: if it's not absolute, assume it's relative to process.cwd().
  const baseDir = path.isAbsolute(routesDir)
    ? routesDir
    : path.join(resolveCallerDir(), routesDir)

  // Ensure the routes directory exists
  if (!fs.existsSync(baseDir)) {
    throw new Error(`Routes directory "${baseDir}" does not exist`)
  }

  // Mount routes using the mountRoutes function
  mountRoutes(router, baseDir)

  // If a prefix is provided, wrap the router
  if (prefix) {
    const outerRouter = express.Router()
    outerRouter.use(prefix, router)
    return outerRouter
  }

  return router
}