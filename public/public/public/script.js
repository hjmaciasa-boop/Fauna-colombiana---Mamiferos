let socket = io();
let idSalaActual = null;
let esCreador = false;

function crearSala() {
    const nombre = document.getElementById('nombre').value.trim();
    if(!nombre) return alert('Escribe tu nombre');
    socket.emit('crearSala', nombre);
}

function unirseSala() {
    const idSala = document.getElementById('codigoSala').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    if(!idSala || !nombre) return alert('Código y nombre requeridos');
    socket.emit('unirseSala', idSala, nombre);
    idSalaActual = idSala;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('salaEspera').style.display = 'block';
}

socket.on('salaCreada', (idSala) => {
    idSalaActual = idSala;
    esCreador = true;
    document.getElementById('codigoSalaMostrar').textContent = idSala;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('salaEspera').style.display = 'block';
    document.getElementById('btnIniciar').style.display = 'inline-block';
});

socket.on('actualizarJugadores', (jugadores) => {
    const lista = document.getElementById('listaJugadores');
    lista.innerHTML = '';
    jugadores.forEach(j => {
        const li = document.createElement('li');
        li.textContent = `👤 ${j.nombre}`;
        lista.appendChild(li);
    });
    if(esCreador && jugadores.length >= 2) 
        document.getElementById('btnIniciar').style.display = 'inline-block';
    else if(esCreador)
        document.getElementById('btnIniciar').style.display = 'none';
});

function iniciarPartida() {
    if(!esCreador) return alert('Solo el creador puede iniciar');
    socket.emit('iniciarPartida', idSalaActual);
}

socket.on('partidaIniciada', (data) => {
    document.getElementById('salaEspera').style.display = 'none';
    document.getElementById('juego').style.display = 'block';
    actualizarOponentes(data.jugadores);
});

socket.on('tusCartas', (cartas) => {
    document.getElementById('numCartas').textContent = cartas.length;
    const contenedor = document.getElementById('tusCartas');
    contenedor.innerHTML = '';
    cartas.forEach(carta => {
        const div = document.createElement('div');
        div.className = 'carta';
        div.innerHTML = `<strong>${carta.nombre}</strong><br>⚖️${carta.peso} kg<br>📏${carta.longitud} cm<br>💨${carta.velocidad} km/h<br>🕰️${carta.vida} años<br>👶${carta.crias}`;
        if(carta.comodin) div.style.background = '#ffd966';
        contenedor.appendChild(div);
    });
});

function actualizarOponentes(jugadores) {
    const contenedor = document.getElementById('oponentes');
    contenedor.innerHTML = '';
    jugadores.forEach(j => {
        if(j.id !== socket.id) {
            const div = document.createElement('div');
            div.className = 'jugador-oponente';
            div.innerHTML = `<div><strong>${j.nombre}</strong></div><div>🃏 ${j.numCartas}</div><div>🏆 ${j.bazas||0}</div>`;
            contenedor.appendChild(div);
        }
    });
}

socket.on('actualizarEstado', (data) => {
    actualizarOponentes(data.jugadores);
    const yo = data.jugadores.find(j=>j.id===socket.id);
    if(yo) document.getElementById('numCartas').textContent = yo.numCartas;
});

socket.on('elegirAtributo', () => {
    document.getElementById('selectorAtributo').style.display = 'flex';
    document.getElementById('infoTurno').textContent = '🎲 ¡Elige un atributo!';
});

function enviarAtributo(atributo) {
    document.getElementById('selectorAtributo').style.display = 'none';
    socket.emit('elegirAtributo', { idSala: idSalaActual, atributo });
    document.getElementById('infoTurno').textContent = '⏳ Esperando resultados...';
}

socket.on('mostrarCartas', (cartas) => {
    const contenedor = document.getElementById('cartasMesa');
    contenedor.innerHTML = '';
    cartas.forEach(c => {
        const div = document.createElement('div');
        div.className = 'carta-mesa';
        div.innerHTML = `<strong>${c.carta.nombre}</strong> ${c.valor}`;
        contenedor.appendChild(div);
    });
});

socket.on('juegoTerminado', (data) => {
    document.getElementById('juego').style.display = 'none';
    document.getElementById('finJuego').style.display = 'block';
    document.getElementById('ganadorTexto').innerHTML = `🏆 ${data.ganador} GANÓ LA PARTIDA 🏆`;
});

// Chat
function enviarMensaje() {
    const input = document.getElementById('chatInput');
    const texto = input.value.trim();
    if(!texto) return;
    const nombre = document.getElementById('nombre').value.trim();
    socket.emit('mensajeChat', { idSala: idSalaActual, texto, autor: nombre });
    input.value = '';
}
function enviarMensajeJuego() {
    const input = document.getElementById('chatInputJuego');
    const texto = input.value.trim();
    if(!texto) return;
    const nombre = document.getElementById('nombre').value.trim();
    socket.emit('mensajeChat', { idSala: idSalaActual, texto, autor: nombre });
    input.value = '';
}
socket.on('nuevoMensaje', ({autor, texto}) => {
    const contenedorEspera = document.getElementById('mensajesChat');
    const contenedorJuego = document.getElementById('mensajesJuego');
    const msg = `<div><strong>${autor}:</strong> ${texto}</div>`;
    if(contenedorEspera) contenedorEspera.innerHTML += msg;
    if(contenedorJuego) contenedorJuego.innerHTML += msg;
});
socket.on('chatBot', ({mensaje, autor}) => {
    const contenedorEspera = document.getElementById('mensajesChat');
    const contenedorJuego = document.getElementById('mensajesJuego');
    const msg = `<div><em>🤖 ${autor}:</em> ${mensaje}</div>`;
    if(contenedorEspera) contenedorEspera.innerHTML += msg;
    if(contenedorJuego) contenedorJuego.innerHTML += msg;
});
