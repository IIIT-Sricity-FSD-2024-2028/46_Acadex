const fs=require('fs'), path=require('path');
process.chdir(path.resolve(__dirname, '../..'));
let broken = 0;
const parser=require(process.cwd()+'/front-end/node_modules/@babel/parser');
const files=[]; function scan(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())scan(f);else if(f.endsWith('.jsx'))files.push(f)}} scan('front-end/src');
function walk(n,fn){if(!n||typeof n!=='object')return;fn(n);for(const [k,v]of Object.entries(n)){if(k==='loc')continue;if(Array.isArray(v))v.forEach(x=>walk(x,fn));else if(v&&typeof v==='object')walk(v,fn)}}
const routes=[]; const ast=parser.parse(fs.readFileSync('front-end/src/App.jsx','utf8'),{sourceType:'module',plugins:['jsx']});
function routeWalk(n,parent=''){if(!n||typeof n!=='object')return;let base=parent;if(n.type==='JSXElement'&&n.openingElement.name.name==='Route'){const a=n.openingElement.attributes.find(a=>a.name?.name==='path');if(a?.value?.value){base=a.value.value.startsWith('/')?a.value.value:parent+'/'+a.value.value;if(!base.includes('*'))routes.push(base)}}for(const [k,v]of Object.entries(n)){if(k==='loc')continue;if(Array.isArray(v))v.forEach(x=>routeWalk(x,base));else if(v&&typeof v==='object')routeWalk(v,base)}}routeWalk(ast);
const patterns=routes.map(r=>new RegExp('^'+r.replace(/:[^/]+/g,'[^/]+')+'/?$'));
for(const f of files){const text=fs.readFileSync(f,'utf8'); const ast=parser.parse(text,{sourceType:'module',plugins:['jsx']});walk(ast,n=>{let v;if(n.type==='JSXAttribute'&&['to','href'].includes(n.name?.name))v=n.value?.type==='StringLiteral'?n.value:n.value?.expression;if(n.type==='CallExpression'&&n.callee.name==='navigate')v=n.arguments[0];if(!v)return;const url=v.type==='StringLiteral'?v.value:v.type==='TemplateLiteral'?v.quasis.map(x=>x.value.cooked).join('DYNAMIC'):'';if(!url.startsWith('/')||url.startsWith('//'))return;const clean=url.split(/[?#]/)[0];if(!patterns.some(p=>p.test(clean))) { broken++; console.error(f+':'+n.loc.start.line+' '+url); }})}

if (broken) process.exit(1);
console.log("PASS: internal static and detail links match registered routes.");
