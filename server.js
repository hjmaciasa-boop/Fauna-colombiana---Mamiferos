const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');

// Servir archivos estáticos (HTML, CSS, JS e imágenes)
app.use(express.static('public'));
app.use('/img', express.static('public/img'));

// ========== MAMÍFEROS COLOMBIANOS (33 cartas con imágenes) ==========
const cartas = [
  { id:1, nombre:"JAGUAR", imagen:"/img/01_jaguar.png", peso:75, longitud:170, velocidad:80, vida:13, crias:3 },
  { id:2, nombre:"OSO DE ANTEOJOS", imagen:"/img/02_oso_de_anteojos.png", peso:150, longitud:170, velocidad:48, vida:25, crias:2 },
  { id:3, nombre:"DELFÍN ROSADO", imagen:"/img/03_delfin_rosado.png", peso:120, longitud:200, velocidad:25, vida:25, crias:1 },
  { id:4, nombre:"TAPIR TERRESTRE", imagen:"/img/04_tapir_terrestre.png", peso:225, longitud:200, velocidad:48, vida:27, crias:1 },
  { id:5, nombre:"VENADO COLA BLANCA", imagen:"/img/05_venado_cola_blanca.png", peso:90, longitud:175, velocidad:64, vida:10, crias:2 },
  { id:6, nombre:"PEREZOSO DE TRES DEDOS", imagen:"/img/06_perezoso_de_tres_dedos.png", peso:4, longitud:55, velocidad:0.2, vida:25, crias:1 },
  { id:7, nombre:"ARMADILLO GIGANTE", imagen:"/img/07_armadillo_gigante.png", peso:25, longitud:120, velocidad:30, vida:13, crias:1 },
  { id:8, nombre:"CHIGÜIRO (CAPIBARA)", imagen:"/img/08_chiguiro_capibara.png", peso:50, longitud:115, velocidad:35, vida:9, crias:5 },
  { id:9, nombre:"MONO AULLADOR ROJO", imagen:"/img/09_mono_aullador_rojo.png", peso:7.5, longitud:110, velocidad:40, vida:17, crias:1 },
  { id:10, nombre:"ZORRO PERRO", imagen:"/img/10_zorro_perro.png", peso:6.5, longitud:90, velocidad:45, vida:11, crias:4 },
  { id:11, nombre:"NUTRIA GIGANTE", imagen:"/img/11_nutria_gigante.png", peso:27, longitud:165, velocidad:25, vida:12, crias:2 },
  { id:12, nombre:"CUSUMBO (COATÍ)", imagen:"/img/12_cusumbo_coati.png", peso:4.5, longitud:100, velocidad:25, vida:14, crias:4 },
  { id:13, nombre:"TIGRILLO", imagen:"/img/13_tigrillo.png", peso:2.5, longitud:65, velocidad:55, vida:12, crias:2 },
  { id:14, nombre:"PUMA", imagen:"/img/14_puma.png", peso:70, longitud:180, velocidad:70, vida:13, crias:3 },
  { id:15, nombre:"DANTA DE PÁRAMO", imagen:"/img/15_danta_de_paramo.png", peso:180, longitud:190, velocidad:45, vida:30, crias:1 },
  { id:16, nombre:"OSO HORMIGUERO GIGANTE", imagen:"/img/16_oso_hormiguero_gigante.png", peso:35, longitud:200, velocidad:30, vida:15, crias:1 },
  { id:17, nombre:"MURCIÉLAGO VAMPIRO COMÚN", imagen:"/img/17_murcielago_vampiro_comun.png", peso:0.05, longitud:9, velocidad:40, vida:9, crias:1 },
  { id:18, nombre:"RATÓN DE MONTE", imagen:"/img/18_raton_de_monte.png", peso:0.02, longitud:15, velocidad:12, vida:2, crias:5 },
  { id:19, nombre:"CHUCHA COMÚN (ZARIGÜEYA)", imagen:"/img/19_chucha_comun_zarigueya.png", peso:1.5, longitud:50, velocidad:15, vida:3, crias:7 },
  { id:20, nombre:"MONO CAPUCHINO", imagen:"/img/20_mono_capuchino.png", peso:3.5, longitud:80, velocidad:45, vida:25, crias:1 },
  { id:21, nombre:"ARDILLA ROJA", imagen:"/img/21_ardilla_roja.png", peso:0.2, longitud:25, velocidad:20, vida:6, crias:3 },
  { id:22, nombre:"GUAGUA LOBA (PACA)", imagen:"/img/22_guagua_loba_paca.png", peso:8, longitud:70, velocidad:30, vida:12, crias:1 },
  { id:23, nombre:"PERRO DE MONTE", imagen:"/img/23_perro_de_monte.png", peso:7, longitud:75, velocidad:60, vida:10, crias:4 },
  { id:24, nombre:"MANATÍ ANTILLANO", imagen:"/img/24_manati_antillano.png", peso:400, longitud:300, velocidad:15, vida:40, crias:1 },
  { id:25, nombre:"NUTRIA NEOTROPICAL", imagen:"/img/25_nutria_neotropical.png", peso:10, longitud:110, velocidad:25, vida:10, crias:2 },
  { id:26, nombre:"VENADO DE PÁRAMO", imagen:"/img/26_venado_de_paramo.png", peso:80, longitud:160, velocidad:60, vida:12, crias:1 },
  { id:27, nombre:"ZORRILLO (MOFETA)", imagen:"/img/27_zorrillo_mofeta.png", peso:1.5, longitud:40, velocidad:12, vida:7, crias:5 },
  { id:28, nombre:"CONEJO SILVESTRE", imagen:"/img/28_conejo_silvestre.png", peso:1.2, longitud:35, velocidad:40, vida:4, crias:4 },
  { id:29, nombre:"GUATÍN (AGUTÍ)", imagen:"/img/29_guatin_aguti.png", peso:3, longitud:50, velocidad:35, vida:10, crias:2 },
  { id:30, nombre:"TITÍ GRIS (ENDÉMICO)", imagen:"/img/30_titi_gris_endemico.png", peso:0.45, longitud:45, velocidad:35, vida:15, crias:2 },
  { id:31, nombre:"MONO NOCTURNO", imagen:"/img/31_mono_nocturno.png", peso:1, longitud:50, velocidad:35, vida:20, crias:1 },
  { id:32, nombre:"BORUGO (CONEJO DE PÁRAMO)", imagen:"/img/32_borugo_conejo_de_paramo.png", peso:3.5, longitud:60, velocidad:25, vida:10, crias:1 },
  { id:33, nombre:"DELFÍN DORADO (COMODÍN)", imagen:"/img/33_comodin_delfin_dorado.png", peso:99, longitud:99, velocidad:99, vida:99, crias:99, comodin:true }
];

const salas = {};

function barajar(a) { for (let i=a.length-1;i>0;i--) { let j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function valorCarta(carta, atributo) { return carta.comodin ? 99 : carta[atributo]; }
function repartir(jugadores) {
  let mazo = barajar([...cartas]);
  let idx=0;
  jugadores.forEach(j => { j.cartas = mazo.slice(idx, idx+8); j.bazas=[]; idx+=8; });
}
function siguienteTurno(idSala) {
  const sala = salas[idSala];
  if (!sala || sala.estado !== 'jugando') return;
  io.to(sala.jugadores[sala.turno].id).emit('elegirAtributo');
}
function resolverBaza(idSala, jugadas, atributo, ganadorId) {
  const sala = salas[idSala];
  const ganador = sala.jugadores.find(j => j.id === ganadorId);
  jugadas.forEach(j => {
    ganador.bazas.push(j.carta);
    const jug = sala.jugadores.find(p => p.id === j.jugadorId);
    const idx = jug.cartas.findIndex(c => c.id === j.carta.id);
    if(idx !== -1) jug.cartas.splice(idx,1);
  });
  if (sala.jugadores.some(j => j.cartas.length===0)) {
    let max=0, ganadorFinal=null;
    sala.jugadores.forEach(j => { if(j.bazas.length>max) { max=j.bazas.length; ganadorFinal=j; } });
    io.to(idSala).emit('juegoTerminado', { ganador: ganadorFinal.nombre });
    delete salas[idSala];
    return;
  }
  sala.turno = sala.jugadores.findIndex(j => j.id === ganadorId);
  io.to(idSala).emit('actualizarEstado', { jugadores: sala.jugadores.map(j => ({ id:j.id, nombre:j.nombre, numCartas:j.cartas.length, bazas:j.bazas.length })) });
  siguienteTurno(idSala);
}
function manejarEmpate(idSala, empates, atributo, originales) {
  const sala = salas[idSala];
  const nuevas = [];
  empates.forEach(e => {
    const jug = sala.jugadores.find(j => j.id === e.id);
    if(jug.cartas.length) nuevas.push({ jugadorId: jug.id, carta: jug.cartas[0], valor: valorCarta(jug.cartas[0], atributo) });
  });
  const maxValor = Math.max(...nuevas.map(n=>n.valor));
  const ganadores = nuevas.filter(n=>n.valor===maxValor);
  io.to(idSala).emit('mostrarDesempate', nuevas);
  setTimeout(() => {
    if(ganadores.length===1) resolverBaza(idSala, [...originales, ...nuevas], atributo, ganadores[0].jugadorId);
    else manejarEmpate(idSala, ganadores, atributo, [...originales, ...nuevas]);
  }, 3000);
}

io.on('connection', (socket) => {
  console.log('Conectado:', socket.id);
  socket.on('crearSala', (nombre) => {
    const idSala = uuidv4().slice(0,6);
    salas[idSala] = {
      id: idSala,
      jugadores: [{ id: socket.id, nombre: nombre || 'Jugador', cartas:[], bazas:[] }],
      estado: 'esperando',
      turno: 0,
      chat: []
    };
    socket.join(idSala);
    socket.emit('salaCreada', idSala);
    io.to(idSala).emit('actualizarJugadores', salas[idSala].jugadores.map(j=>({id:j.id,nombre:j.nombre})));
  });
  socket.on('unirseSala', (idSala, nombre) => {
    const sala = salas[idSala];
    if(sala && sala.jugadores.length < 4 && sala.estado === 'esperando') {
      sala.jugadores.push({ id: socket.id, nombre: nombre || 'Jugador', cartas:[], bazas:[] });
      socket.join(idSala);
      io.to(idSala).emit('actualizarJugadores', sala.jugadores.map(j=>({id:j.id,nombre:j.nombre})));
      socket.emit('chatBot', { mensaje: `🐾 ¡Bienvenido ${nombre}! Espera a que el creador inicie la partida.`, autor: 'Bot' });
      io.to(idSala).emit('chatBot', { mensaje: `🎉 ${nombre} se unió a la sala.`, autor: 'Bot' });
    } else socket.emit('error', 'Sala llena o partida en curso');
  });
  socket.on('iniciarPartida', (idSala) => {
    const sala = salas[idSala];
    if(sala && sala.jugadores.length >= 2 && sala.estado === 'esperando' && sala.jugadores[0].id === socket.id) {
      repartir(sala.jugadores);
      sala.estado = 'jugando';
      sala.turno = 0;
      io.to(idSala).emit('partidaIniciada', { jugadores: sala.jugadores.map(j=>({id:j.id,nombre:j.nombre,numCartas:j.cartas.length})) });
      sala.jugadores.forEach(j => io.to(j.id).emit('tusCartas', j.cartas));
      siguienteTurno(idSala);
    } else socket.emit('error', 'Mínimo 2 jugadores y debes ser el creador');
  });
  socket.on('elegirAtributo', ({ idSala, atributo }) => {
    const sala = salas[idSala];
    if(!sala || sala.estado !== 'jugando') return;
    if(sala.jugadores[sala.turno].id !== socket.id) return;
    const jugadas = sala.jugadores.map(j => ({ jugadorId: j.id, carta: j.cartas[0], valor: valorCarta(j.cartas[0], atributo) }));
    io.to(idSala).emit('mostrarCartas', jugadas.map(j=>({jugadorId:j.jugadorId, carta: j.carta, valor: j.valor})));
    const maxValor = Math.max(...jugadas.map(j=>j.valor));
    const ganadores = jugadas.filter(j=>j.valor===maxValor);
    setTimeout(() => {
      if(ganadores.length===1) resolverBaza(idSala, jugadas, atributo, ganadores[0].jugadorId);
      else manejarEmpate(idSala, ganadores, atributo, jugadas);
    }, 3000);
  });
  socket.on('mensajeChat', ({ idSala, texto, autor }) => {
    const sala = salas[idSala];
    if(sala) {
      sala.chat.push({ autor, texto, hora: new Date().toLocaleTimeString() });
      io.to(idSala).emit('nuevoMensaje', { autor, texto });
      if(texto.toLowerCase().includes('hola')) 
        io.to(idSala).emit('chatBot', { mensaje: `👋 ¡Hola ${autor}! ¿Listo para jugar?`, autor: 'Bot' });
      else if(texto.toLowerCase().includes('gracias'))
        io.to(idSala).emit('chatBot', { mensaje: `😊 ¡De nada! Disfruta la partida.`, autor: 'Bot' });
      else if(texto.toLowerCase().includes('como se juega'))
        io.to(idSala).emit('chatBot', { mensaje: `📖 Elige un atributo (Peso, Longitud, Velocidad, Vida o Crías). Gana el número más alto. El comodín vale 99.`, autor: 'Bot' });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
