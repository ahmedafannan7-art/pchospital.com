import {put,del} from '@vercel/blob';
export default async function handler(req,res){
 if(!process.env.ADMIN_PASSWORD||req.headers['x-admin']!==process.env.ADMIN_PASSWORD)return res.status(401).json({error:'كلمة السر غلط'});
 try{
  if(req.method==='DELETE'){const u=req.query.url;if(u&&/blob\.vercel-storage\.com/.test(u))await del(u);return res.json({ok:true})}
  if(req.method!=='POST')return res.status(405).end();
  const m=/^data:image\/(jpeg|png|webp);base64,(.+)$/.exec((req.body&&req.body.data)||'');
  if(!m)return res.status(400).json({error:'صورة غير صالحة'});
  const buf=Buffer.from(m[2],'base64');
  if(buf.length>3.5e6)return res.status(413).json({error:'الصورة كبيرة'});
  const r=await put('img/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.'+(m[1]==='jpeg'?'jpg':m[1]),buf,{access:'public',contentType:'image/'+m[1],cacheControlMaxAge:31536000});
  return res.json({url:r.url});
 }catch(e){return res.status(500).json({error:String(e.message||e)})}
}
