import { spawn } from 'node:child_process';
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = ['backend:dev','frontend:dev'].map(script => spawn(npm,['run',script],{stdio:'inherit',shell:process.platform==='win32',detached:process.platform!=='win32'}));
let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children){if(!child.pid)continue;try{if(process.platform==='win32')child.kill('SIGTERM');else process.kill(-child.pid,'SIGTERM');}catch(e){if(e.code!=='ESRCH')console.error(e.message);}}process.exitCode=code;}
for(const child of children){child.on('error',e=>{console.error(e.message);stop(1);});child.on('exit',code=>stop(code||0));}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
