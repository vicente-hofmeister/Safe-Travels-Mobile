const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '../node_modules/expo/node_modules/@expo/cli/build/src/api/rest/cache/wrapFetchWithCache.js'
);

if (!fs.existsSync(target)) {
  console.log('patch-expo-cache: target file not found, skipping.');
  process.exit(0);
}

const original = `            // Cache the response
            cachedResponse = await cache.set(cacheKey, {
                body: response.body,
                info: (0, _ResponseCache.getResponseInfo)(response)
            });
            // Warn through debug logs that caching failed
            if (!cachedResponse) {
                debug(\`Failed to cache response for: \${url}\`);
                await cache.remove(cacheKey);
                return response;
            }`;

const patched = `            // Cache the response (clone so body stays readable if caching fails)
            const responseClone = response.clone();
            cachedResponse = await cache.set(cacheKey, {
                body: responseClone.body,
                info: (0, _ResponseCache.getResponseInfo)(responseClone)
            });
            // Warn through debug logs that caching failed
            if (!cachedResponse) {
                debug(\`Failed to cache response for: \${url}\`);
                await cache.remove(cacheKey);
                return response;
            }`;

const content = fs.readFileSync(target, 'utf8');

if (content.includes('responseClone')) {
  console.log('patch-expo-cache: already applied, skipping.');
  process.exit(0);
}

if (!content.includes(original)) {
  console.log('patch-expo-cache: target text not found — file may have changed. Skipping.');
  process.exit(0);
}

fs.writeFileSync(target, content.replace(original, patched), 'utf8');
console.log('patch-expo-cache: applied successfully.');
