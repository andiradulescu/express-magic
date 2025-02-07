# express-magic

[![npm version](https://img.shields.io/npm/v/express-magic.svg)](https://www.npmjs.com/package/express-magic)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![npm downloads](https://img.shields.io/npm/dm/express-magic.svg)](https://www.npmjs.com/package/express-magic)
[![GitHub Issues](https://img.shields.io/github/issues/adamkdean/express-magic.svg)](https://github.com/adamkdean/express-magic/issues)

> 🪄 Automagically load and mount Express routes with zero configuration

Express Magic is a lightweight, zero-configuration route loader for Express.js that automatically discovers and mounts your route files using a simple, convention-based approach. Stop manually registering routes and let the magic happen!

## Features

- 🚀 Zero configuration required
- 📁 Automatic route discovery and mounting
- 🌳 Support for nested directory structures
- 🎯 Optional route prefixing
- 💪 TypeScript friendly
- 🪶 Lightweight with no dependencies

## Installation

```bash
npm install express-magic
```

## Quick Start

```javascript
import express from 'express'
import magic from 'express-magic'

const app = express()

// Mount all routes from the 'routes' directory
app.use(magic('routes'))

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

## Path Resolution

Express Magic intelligently resolves your routes directory using three methods:

1. **Absolute paths** - Use a full system path
   ```javascript
   app.use(magic('/absolute/path/to/routes'))
   ```

2. **Relative paths** - Use `./` or `../` notation
   ```javascript
   app.use(magic('./routes'))
   ```

3. **Named paths** - Just use the directory name
   ```javascript
   app.use(magic('routes'))
   ```

When using a named path, Express Magic automatically resolves it relative to the file that calls it, not the current working directory. For example:

```
project/
├── src/
│   ├── index.js     # Your server file
│   └── routes/      # Your routes directory
│       └── users.js
└── package.json
```

In `src/index.js`, you can simply use:
```javascript
app.use(magic('routes'))
```

Express Magic will automatically find the `routes` directory next to your `index.js` file. No need to use `src/routes` or worry about the current working directory!

## Directory Structure

Express Magic follows a simple convention for route mounting. Here's an example structure:

```
server.js
routes/
├── index.js         # mounted at /
├── users.js         # mounted at /users
├── auth/
│   ├── index.js     # mounted at /auth
│   ├── login.js     # mounted at /auth/login
│   └── register.js  # mounted at /auth/register
└── api/
    └── v1/
        ├── users.js # mounted at /api/v1/users
        └── posts.js # mounted at /api/v1/posts
```

## Route File Examples

### Simple Route File (users.js)

```javascript
import express from 'express'

const router = express.Router()

router.get('/', (req, res) => {
  res.json({ message: 'Users endpoint' })
})

export default router
```

### Function-Based Route File (auth/login.js)

```javascript
import express from 'express'

export default function() {
  const router = express.Router()

  router.post('/', (req, res) => {
    res.json({ message: 'Login endpoint' })
  })

  return router
}
```

## Advanced Usage

### Adding a Global Prefix

```javascript
// Mount all routes with '/api' prefix
app.use(magic('routes', { prefix: '/api' }))
```

## How It Works

Express Magic recursively scans the specified directory and:

1. For directories: uses the directory name in the route path
2. For files:
   - `index.js` files are mounted at the current path level
   - Other `.js` files are mounted using their filename
3. Supports both direct router exports and function-based exports

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Author

Adam K Dean <adamkdean@googlemail.com>

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.