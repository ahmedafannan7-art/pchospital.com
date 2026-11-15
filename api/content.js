import {put,list} from '@vercel/blob';
const KEY='content.json';
async function read(){const {blobs}=await list({prefix:KEY,limit:1});if(!blobs.length)return null;const r=await fetch(blobs[0].url+'?t='+Date.now());return r.ok?await r.json():null}
export default async function handler(req,res){
 const js=req.query&&req.query.js;
 try{
  if(req.method==='POST'){
   if(!process.env.ADMIN_PASSWORD||req.headers['x-admin']!==process.env.ADMIN_PASSWORD)return res.status(401).json({error:'كلمة السر غلط'});
   if(req.query.check)return res.json({ok:true});
   const b=req.body;if(!b||typeof b!=='object')return res.status(400).json({error:'بيانات غلط'});
   await put(KEY,JSON.stringify(b),{access:'public',addRandomSuffix:false,allowOverwrite:true,contentType:'application/json',cacheControlMaxAge:60});
   return res.json({ok:true});
  }
  const d=await read();
  if(js){res.setHeader('Content-Type','application/javascript; charset=utf-8');res.setHeader('Cache-Control','public, s-maxage=30, stale-while-revalidate=300');return res.send('window.SITE='+JSON.stringify(d)+';')}
  res.setHeader('Cache-Control','no-store');return res.json(d);
 }catch(e){
  if(js){res.setHeader('Content-Type','application/javascript');return res.send('window.SITE=null;')}
  return res.status(500).json({error:String(e.message||e)});
 }
}
