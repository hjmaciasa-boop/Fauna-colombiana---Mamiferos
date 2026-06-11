// Mostrar mensajes de error en pantalla
function mostrarError(msg) {
    const divError = document.getElementById('mensajeError');
    if (divError) {
        divError.innerHTML = `❌ ${msg}`;
        setTimeout(() => { divError.innerHTML = ''; }, 5000);
    } else {
        alert(msg);
    }
}

let socket = null;
let idSalaActual = null;
let esCreador = false;

// Intentar conectar a Socket.IO
function conectarSocket() {
    socket = io({
        reconnection: true,
        reconnectionAttempts: 5,
        timeout: 10000
    });
    
    socket.on('connect', () => {
        console.log('Conectado al servidor');
        mostrarError('✅ Conectado al servidor');
    });
    
    socket.on('connect_error', (err) => {
        console.error('Error de conexión:', err);
        mostrarError('⚠️ No se pudo conectar al servidor. Recarga la página.');
    });
    
    socket.on('error', (msg) => {
        mostrarError(msg);
    });
    
    // ========== EVENTOS DEL SERVIDOR ==========
    socket.on('salaCreada', (idSala) => {
        idSalaActual = idSala;
        esCreador = true;
        document.getElementById('codigoSalaMostrar').textContent = idSala;
        document.getElementById('menu').style.display = 'none';
        document.getElementById('salaEspera').style.display = 'block';
        document.getElementById('btnIniciar').style.display = 'inline-block';
        mostrarError(`✅ Sala creada con código: ${idSala}`);
    });
    
    socket.on('actualizarJugadores', (jugadores) => {
        const lista = document.getElementById('listaJugadores');
        lista.innerHTML = '';
        jugadores.forEach(j => {
            const li = document.createElement('li');
            li.textContent = `👤 ${j.nombre}`;
            lista.appendChild(li);
        });
        if (esCreador && jugadores.length >= 2) {
            document.getElementById('btnIniciar').style.display = 'inline-block';
        } else if (esCreador) {
            document.getElementById('btnIniciar').style.display = 'none';
        }
    });
    
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
            // Si existe imagen, la mostramos
            let imgHtml = '';
            if (carta.imagen) {
                imgHtml = `<img src="${carta.imagen}" style="width:60px; height:80px; object-fit:cover; border-radius:8px;">`;
            }
            div.innerHTML = imgHtml + `<strong>${carta.nombre}</strong><br>⚖️${carta.peso} kg<br>📏${carta.longitud} cm<br>💨${carta.velocidad} km/h<br>🕰️${carta.vida} años<br>👶${carta.crias}`;
            if(carta.comodin) div.style.background = '#ffd966';
            contenedor.appendChild(div);
        });
    });
    
    socket.on('actualizarEstado', (data) => {
        actualizarOponentes(data.jugadores);
        const yo = data.jugadores.find(j=>j.id===socket.id);
        if(yo) document.getElementById('numCartas').textContent = yo.numCartas;
    });
    
    socket.on('elegirAtributo', () => {
        document.getElementById('selectorAtributo').style.display = 'flex';
        document.getElementById('infoTurno').textContent = '🎲 ¡Elige un atributo!';
    });
    
    socket.on('mostrarCartas', (cartas) => {
        const contenedor = document.getElementById('cartasMesa');
        contenedor.innerHTML = '';
        cartas.forEach(c => {
            const div = document.createElement('div');
            div.className = 'carta-mesa';
            let img = '';
            if (c.carta.imagen) img = `<img src="${c.carta.imagen}" style="width:40px; height:50px;"><br>`;
            div.innerHTML = img + `<strong>${c.carta.nombre}</strong><br>Valor: ${c.valor}`;
            contenedor.appendChild(div);
        });
    });
    
    socket.on('juegoTerminado', (data) => {
        document.getElementById('juego').style.display = 'none';
        document.getElementById('finJuego').style.display = 'block';
        document.getElementById('ganadorTexto').innerHTML = `🏆 ${data.ganador} GANÓ LA PARTIDA 🏆`;
    });
    
    socket.on('nuevoMensaje', ({autor, texto}) => {
        agregarMensajeChat(autor, texto);
    });
    
    socket.on('chatBot', ({mensaje, autor}) => {
        agregarMensajeChat(`🤖 ${autor}`, mensaje);
    });
}

function agregarMensajeChat(autor, texto) {
    const contenedorEspera = document.getElementById('mensajesChat');
    const contenedorJuego = document.getElementById('mensajesJuego');
    const msg = `<div><strong>${autor}:</strong> ${texto}</div>`;
    if(contenedorEspera) contenedorEspera.innerHTML += msg;
    if(contenedorJuego) contenedorJuego.innerHTML += msg;
}

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

// Enviar atributo
function enviarAtributo(atributo) {
    if (!socket || !idSalaActual) return;
    document.getElementById('selectorAtributo').style.display = 'none';
    socket.emit('elegirAtributo', { idSala: idSalaActual, atributo });
    document.getElementById('infoTurno').textContent = '⏳ Esperando resultados...';
}

// Configurar botones una vez que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    conectarSocket();
    
    // Botones principales
    document.getElementById('btnCrearSala').onclick = () => {
        const nombre = document.getElementById('nombre').value.trim();
        if (!nombre) {
            mostrarError('Escribe tu nombre');
            return;
        }
        if (!socket) {
            mostrarError('No hay conexión. Recarga la página.');
            return;
        }
        socket.emit('crearSala', nombre);
    };
    
    document.getElementById('btnUnirseSala').onclick = () => {
        const idSala = document.getElementById('codigoSala').value.trim();
        const nombre = document.getElementById('nombre').value.trim();
        if (!idSala || !nombre) {
            mostrarError('Código y nombre requeridos');
            return;
        }
        socket.emit('unirseSala', idSala, nombre);
        idSalaActual = idSala;
        document.getElementById('menu').style.display = 'none';
        document.getElementById('salaEspera').style.display = 'block';
    };
    
    document.getElementById('btnIniciar').onclick = () => {
        if (!socket || !idSalaActual) return;
        socket.emit('iniciarPartida', idSalaActual);
    };
    
    // Enviar mensajes chat
    document.getElementById('btnEnviarChat').onclick = () => {
        const input = document.getElementById('chatInput');
        const texto = input.value.trim();
        if (!texto) return;
        const nombre = document.getElementById('nombre').value.trim();
        socket.emit('mensajeChat', { idSala: idSalaActual, texto, autor: nombre });
        input.value = '';
    };
    document.getElementById('btnEnviarChatJuego').onclick = () => {
        const input = document.getElementById('chatInputJuego');
        const texto = input.value.trim();
        if (!texto) return;
        const nombre = document.getElementById('nombre').value.trim();
        socket.emit('mensajeChat', { idSala: idSalaActual, texto, autor: nombre });
        input.value = '';
    };
    
    // Atributos dinámicos
    document.querySelectorAll('.botones-atributos button').forEach(btn => {
        btn.onclick = () => enviarAtributo(btn.getAttribute('data-atributo'));
    });
});
