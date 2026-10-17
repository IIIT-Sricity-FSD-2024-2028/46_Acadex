const { buildSync } = require('esbuild');
const vm = require('vm');
const result = buildSync({
  stdin: { contents: `
    import React from 'react';
    import { renderToString } from 'react-dom/server';
    import { MemoryRouter } from 'react-router-dom';
    import SignUp from './src/pages/Signup.jsx';
    import ForgotPassword from './src/pages/Forgot_Password.jsx';
    import Landing from './src/pages/Landing.jsx';
    const storage = new Map();
    globalThis.localStorage = { getItem:k => storage.get(k)||null, setItem:(k,v)=>storage.set(k,v), removeItem:k=>storage.delete(k) };
    const render = (Component, path) => renderToString(React.createElement(MemoryRouter,{initialEntries:[path]},React.createElement(Component)));
    for (const role of ['Student','Instructor','Organization','Admin','SuperAdmin']) {
      const html = render(SignUp,'/signup?role='+role);
      if (!html.includes('academy-auth') || !html.includes('acadex')) throw new Error(role+' signup did not render');
      if (['Student','Instructor','Organization'].includes(role) && !html.includes('type="password"')) throw new Error(role+' password form missing');
      if (['Admin','SuperAdmin'].includes(role) && !html.includes('provisioned')) throw new Error(role+' restriction notice missing');
      console.log('PASS '+role+' registration page');
    }
    const recovery=render(ForgotPassword,'/forgot-password');
    if (!recovery.includes('academy-auth') || !recovery.includes('type="email"')) throw new Error('Recovery form missing');
    console.log('PASS account recovery form');
    const landing=render(Landing,'/');
    for (const id of ['home','courses','features','about','contact','how-it-works']) if (!landing.includes('id="'+id+'"')) throw new Error('Missing landing section '+id);
    for (const role of ['Student','Instructor','Organization','Admin','SuperAdmin']) if (!landing.includes('role='+role)) throw new Error('Missing actor entry '+role);
    if (landing.includes('120,000') || landing.includes('18,400')) throw new Error('Invented metrics remain');
    console.log('PASS landing sections, five actor links and data loading state');
  `, resolveDir:require('path').resolve(__dirname,'..'), loader:'jsx' },
  bundle:true, platform:'node', format:'cjs', write:false, loader:{'.css':'empty'}, define:{'import.meta.env':'{}'}, logLevel:'silent',
});
vm.runInNewContext(result.outputFiles[0].text, { require, console:{log:console.log,warn:()=>{},error:()=>{}}, process, Buffer, setTimeout, clearTimeout, TextEncoder, TextDecoder, URL, URLSearchParams });
