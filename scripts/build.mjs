import {readFileSync, writeFileSync, mkdirSync, copyFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const assets={
  '/':{body:readFileSync(resolve(root,'dist/index.html'),'utf8'),type:'text/html; charset=utf-8'},
  '/app.js':{body:readFileSync(resolve(root,'dist/app.js'),'utf8'),type:'text/javascript; charset=utf-8'},
  '/styles.css':{body:readFileSync(resolve(root,'dist/styles.css'),'utf8'),type:'text/css; charset=utf-8'}
};
mkdirSync(resolve(root,'dist/server'),{recursive:true});
mkdirSync(resolve(root,'dist/.openai'),{recursive:true});
writeFileSync(resolve(root,'dist/server/index.js'),`const ASSETS = ${JSON.stringify(assets)};\n`+readFileSync(resolve(root,'worker/handler.js'),'utf8'));
copyFileSync(resolve(root,'.openai/hosting.json'),resolve(root,'dist/.openai/hosting.json'));
