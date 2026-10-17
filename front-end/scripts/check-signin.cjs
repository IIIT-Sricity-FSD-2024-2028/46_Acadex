const { buildSync } = require('esbuild');
const vm = require('vm');
const result = buildSync({
  stdin: { contents: `
    import React from 'react';
    import { renderToString } from 'react-dom/server';
    import { MemoryRouter } from 'react-router-dom';
    import SignIn from './src/pages/Signin.jsx';
    import SuperAdminLogin from './src/pages/super-admin/Login.jsx';
    const storage = new Map();
    globalThis.localStorage = { getItem: k => storage.get(k) || null, setItem: (k,v) => storage.set(k,v), removeItem: k => storage.delete(k) };
    for (const role of ['Student', 'Instructor', 'Organization', 'Admin', 'SuperAdmin']) {
      const html = renderToString(React.createElement(MemoryRouter, { initialEntries: ['/signin?role=' + role] }, React.createElement(SignIn)));
      if (!html.includes('Platform Super Admin') || !html.includes('type="password"')) throw new Error(role + ' login form failed to render');
      console.log('PASS ' + role + ' sign-in render');
    }
    const html = renderToString(React.createElement(MemoryRouter, { initialEntries: ['/super-admin/login'] }, React.createElement(SuperAdminLogin)));
    if (!html.includes('password')) throw new Error('Super admin form failed');
    console.log('PASS dedicated super-admin sign-in render');
  `, resolveDir: require('path').resolve(__dirname, '..'), loader: 'jsx' },
  bundle: true, platform: 'node', format: 'cjs', write: false, define: { 'import.meta.env': '{}' }, logLevel: 'silent'
});
const context = { require, console: { log: console.log, warn: () => {}, error: () => {} }, process, Buffer, setTimeout, clearTimeout, TextEncoder, TextDecoder, URL, URLSearchParams };
vm.runInNewContext(result.outputFiles[0].text, context);
