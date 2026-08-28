import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys'
import pino from 'pino'
import express from 'express'
const app = express()
app.get('/', (req,res)=>res.send('Sir Allan Tech143 AI Online 24/7!'))
app.listen(process.env.PORT || 3000)

function reply(t){
 t=t.toLowerCase()
 if(t.includes('price')||t.includes('how much')) return "Hi dear 😊 Welcome to Sir Allan Tech143! Shoes 60k, Clothes 30-50k, Phones. Which one you need?"
 if(t.includes('hi')||t.includes('hello')||t.includes('oli otya')) return "Heyy! Oli otya? 😊 Karibu to Sir Allan Tech143! How can I help?"
 if(t.includes('location')) return "We are in Uganda - delivery everywhere. Where are you dear?"
 return "Okay dear 😊 What product you want? Sir Allan will help!"
}

async function start(){
 const { state, saveCreds } = await useMultiFileAuthState('auth')
 const sock = makeWASocket({ auth: state, logger: pino({level:'silent'}), browser: ["Ubuntu","Chrome","20"] })
 sock.ev.on('creds.update', saveCreds)
 if(!state.creds.registered){
  setTimeout(async()=>{
   let code = await sock.requestPairingCode('256706815444')
   console.log('CODE:', code)
  },4000)
 }
 sock.ev.on('connection.update', u=>{ if(u.connection==='open') console.log('ONLINE'); if(u.connection==='close') start() })
 sock.ev.on('messages.upsert', async ({messages})=>{
  const msg=messages[0]; if(!msg.message||msg.key.fromMe) return
  const from=msg.key.remoteJid; const text=msg.message.conversation||msg.message.extendedTextMessage?.text||""; if(!text) return
  await sock.sendPresenceUpdate('composing', from)
  await new Promise(r=>setTimeout(r,1500))
  await sock.sendMessage(from, {text: reply(text)})
 })
}
start()
