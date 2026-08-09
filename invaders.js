// ==========================================
// 1. CONSTANTES, ESTRUCTURAS DE ESTADO Y KEYLOG
// ==========================================
const canvas = document.getElementById('lienzo-invaders');
const ctx = canvas.getContext('2d');

// ESTADOS DE CONTROL DE FLUJO
let partidaEnCurso = false;
let gameOver = false;
let victoria = false;
let puntuacionBugs = 0;
let integridadMemoria = 100;
let highScoreGabinete = parseInt(localStorage.getItem('invaders_high_score')) || 0;

// ONDAS VECTORIALES DE ENEMIGOS (BUGS)
let oleadaActual = 1;
const enemigos = [];
const enemigoAncho = 40;
const enemigoAlto = 30;
let enemigosDireccionX = 1; // 1 = Derecha, -1 = Izquierda
let enemigosVelocidadX = 1.5;
let enemigosVelocidadY = 15; // Cuánto bajan al tocar un borde

// PROYECTILES DEL JUGADOR (RÁFAGAS ANTIVIRUS BINARIAS)
const proyectilesAntivirus = [];
const velocidadProyectil = 7;
// Array de caracteres ASCII y bits para el efecto de inyección flotante
const CODIGOS_ANTIVIRUS = ["0", "1", "X", "{", "}", ";", "OK", "KRNL"];

// PROYECTILES ENEMY (GLITCH DISPAROS)
const proyectilesGlitch = [];
const velocidadGlitchProyectil = 4;
let cadenciaFuegoEnemigo = 0.015; // Probabilidad de que un bug dispare por fotograma

// REGISTRO DE TECLADO MULTI-BOTÓN
const teclas = {};
window.addEventListener('keydown', e => {
    teclas[e.key] = true;
    // Evita el scroll con la barra espaciadora o las flechas mientras juegas
    if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
    }
});
window.addEventListener('keyup', e => teclas[e.key] = false);

// ==========================================
// 1.1. NÚCLEO DEL JUGADOR (TERMINAL HACKER INTERACTIVA)
// ==========================================
const jugadorTerminal = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 50,
    ancho: 80,
    alto: 25,
    velocidad: 5,
    ultimoDisparo: 0,
    cadenciaFuego: 250 // Milisegundos mínimos entre ráfagas de antivirus
};

// Sincronizamos el High Score inicial en la marquesina superior
document.getElementById('txt-high-score').innerText = highScoreGabinete.toString().padStart(5, '0');

// ==========================================
// 2. ENGRANAJE DE INICIALIZACIÓN DE MATRICES
// ==========================================

// REPARADO: Agregamos la función que despierta el movimiento de los marcianitos al pulsar START
function iniciarPartidaFisica_Invaders() {
    if (partidaEnCurso || gameOver || victoria) return;
    partidaEnCurso = true;
    
    // Cambiamos cosméticamente el botón para indicar que el kernel está inyectándose
    const btnStart = document.getElementById('btn-start-invaders');
    if (btnStart) {
        btnStart.innerText = "✔ KERNEL_RUNNING";
        btnStart.style.borderColor = "rgba(255, 119, 0, 0.4)";
        btnStart.style.color = "rgba(255, 119, 0, 0.4)";
    }
    
    inyectarLogConsola("[KERNEL]: Execution sequence triggered. Antivirus payloads armed.");
    sonarTonoRetro(500, 0.15, 'square');
}


// Despliega el escuadrón de naves corruptas en el ciberespacio por renglones y columnas
function inicializarEjercitoBugs() {
    enemigos.length = 0; // Limpiamos la matriz por si es un reinicio
    
    const columnas = 9;
    const renglones = 4;
    const espacioX = 25; // Separación horizontal entre bugs
    const espacioY = 20; // Separación vertical entre bugs
    const margenIzquierdo = 70;
    const margenSuperior = 50;

    // Tipos de bugs corruptos que bajan desde el techo de la memoria
    const GLITCH_TIPOS = ["👾", "🛸", "⚡", "💀"];

    for (let r = 0; renglones > r; r++) {
        for (let c = 0; columnas > c; c++) {
            const bugX = margenIzquierdo + c * (enemigoAncho + espacioX);
            const bugY = margenSuperior + r * (enemigoAlto + espacioY);
            
            // Cada renglón de naves corruptas tendrá un icono y una recompensa de datos distinta
            enemigos.push({
                x: bugX,
                y: bugY,
                ancho: enemigoAncho,
                alto: enemigoAlto,
                icono: GLITCH_TIPOS[r % GLITCH_TIPOS.length],
                puntos: (4 - r) * 10, // Los renglones más altos dan más puntos
                vivo: true
            });
        }
    }
    
    inyectarLogConsola(`[SYSTEM]: Matrix deployment completed. ${enemigos.length} malicious bugs mapped.`);
}

// Inyecta alertas estéticas estilo hacker en el sub-panel inferior de la pantalla
function inyectarLogConsola(texto) {
    const cajaLogs = document.getElementById('caja-logs-sistema');
    if (!cajaLogs) return;

    const nuevaLinea = document.createElement('div');
    nuevaLinea.className = 'log-linea system-green';
    
    const ahora = new Date();
    const marcaTiempo = `[${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}:${ahora.getSeconds().toString().padStart(2, '0')}]`;
    
    nuevaLinea.innerHTML = `<span style="color: #00f2fe;">${marcaTiempo}</span> ${texto}`;
    cajaLogs.appendChild(nuevaLinea);
    
    // Auto-scrolleamos la terminal de inyección de código hacia abajo
    cajaLogs.scrollTop = cajaLogs.scrollHeight;
}

// Dispara una ráfaga de antivirus (Bit 0 o 1) si la cadencia de fuego lo permite
function inyectarRáfagaAntivirus() {
    if (!partidaEnCurso || gameOver || victoria) return;

    const tiempoActual = Date.now();
    if (jugadorTerminal.ultimoDisparo + jugadorTerminal.cadenciaFuego > tiempoActual) return;

    // Elegimos un bit binario o carácter ASCII al azar del arsenal de la Parte 1
    const bitElegido = CODIGOS_ANTIVIRUS[Math.floor(Math.random() * CODIGOS_ANTIVIRUS.length)];

    // El proyectil nace justo en el centro superior de tu terminal de comandos hacker
    proyectilesAntivirus.push({
        x: jugadorTerminal.x + jugadorTerminal.ancho / 2,
        y: jugadorTerminal.y,
        caracter: bitElegido,
        // Pequeño desvío aleatorio horizontal para que las letras floten con dinamismo cyberpunk
        desvioX: (Math.random() - 0.5) * 1.5
    });

    jugadorTerminal.ultimoDisparo = tiempoActual;
    
    // Sonido agudo de disparo láser de 8 bits
    sonarTonoRetro(900, 0.06, 'triangle');
}

// REPARADO: El reset de partida ahora restaura también el estado visual de los botones del menú superior
function reiniciarPartidaCompleta() {
    partidaEnCurso = false; // Espera a que vuelvas a pulsar START MATCH
    gameOver = false;
    victoria = false;
    puntuacionBugs = 0;
    integridadMemoria = 100;
    oleadaActual = 1;
    enemigosVelocidadX = 1.5;
    
    jugadorTerminal.x = canvas.width / 2 - jugadorTerminal.ancho / 2;
    proyectilesAntivirus.length = 0;
    proyectilesGlitch.length = 0;

    // Restauramos los marcadores neón de la marquesina superior
    document.getElementById('txt-score-bugs').innerText = "0000";
    document.getElementById('txt-integrity').innerText = "100%";

    // Restauramos el botón de START MATCH a su verde de encendido inicial
    const btnStart = document.getElementById('btn-start-invaders');
    if (btnStart) {
        btnStart.innerText = "⚡ START MATCH";
        btnStart.style.borderColor = "#ff7700";
        btnStart.style.color = "#ff7700";
    }

    inicializarEjercitoBugs();
    dibujar(); // Pinta el ejército listo en congelamiento esperando el inicio
    sonarTonoRetro(300, 0.2, 'square'); 
    inyectarLogConsola("[SYSTEM]: Core re-initialized. Memory buffers cleared.");
}

// ==========================================
// 3. MOTOR DE RENDERIZADO GRÁFICO (DIBUJAR)
// ==========================================
function dibujar() {
    // Limpiamos el lienzo en cada cuadro de animación con el fondo petróleo puro
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. PINTAMOS TU TERMINAL HACKER (LA NAVE) CON ESTILO DE CONSOLA DE COMANDOS
    ctx.fillStyle = '#ff7700'; // Naranja Industrial
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ff7700';
    // Dibujamos el chasis de la terminal
    ctx.fillRect(jugadorTerminal.x, jugadorTerminal.y, jugadorTerminal.ancho, jugadorTerminal.ancho * 0.2);
    // Pequeño relieve superior que simula el cañón de inyección de código
    ctx.fillRect(jugadorTerminal.x + jugadorTerminal.ancho / 2 - 6, jugadorTerminal.y - 6, 12, 6);

    // Decantamos el texto interno de la terminal como si fuera una línea de código viva
    ctx.fillStyle = '#040a12'; // Texto teñido en petróleo oscuro
    ctx.shadowBlur = 0;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText("[AV_CORE]", jugadorTerminal.x + jugadorTerminal.ancho / 2, jugadorTerminal.y + 11);

    // 2. PINTAMOS LAS RÁFAGAS ANTIVIRUS BINARIAS FLOTANTES DEL JUGADOR
    ctx.fillStyle = '#ffaa00'; // Ámbar brillante para los proyectiles del jugador
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffaa00';
    ctx.font = '16px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';

    proyectilesAntivirus.forEach(p => {
        // Pintamos el bit o carácter ASCII flotando en el ciberespacio
        ctx.fillText(p.caracter, p.x, p.y);
    });

    // 3. PINTAMOS LOS ESCUADRONES DE BUGS INFECTADOS (LOS EXTRATERRESTRES)
    ctx.font = '24px monospace'; // Tamaño ideal para los emojis vectoriales
    ctx.textAlign = 'center';
    
    enemigos.forEach(bug => {
        if (bug.vivo) {
            // Si el juego está corriendo, añadimos un pequeño parpadeo neón a los bugs corruptos
            ctx.shadowBlur = Math.random() > 0.8 ? 15 : 4;
            ctx.shadowColor = '#ff0055'; // Brillo corrupto
            ctx.fillText(bug.icono, bug.x + bug.ancho / 2, bug.y + bug.alto - 2);
        }
    });

    // 4. PINTAMOS LOS DISPAROS DE GLITCH ENEMIGOS
    ctx.fillStyle = '#00f2fe'; // Azul cian / Petróleo eléctrico para los virus enemigos
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f2fe';
    ctx.font = 'bold 18px monospace';
    
    proyectilesGlitch.forEach(p => {
        // Los disparos enemigos caen como caracteres corruptos de exclamación o error
        ctx.fillText("!", p.x, p.y);
    });

    // Desactivamos las sombras blur pesadas para no colapsar los FPS del bucle principal
    ctx.shadowBlur = 0;

    // 5. PANTALLAS DE INTERFAZ INTEGRALES (ALERTA DE STATUS FINALES)
    if (!partidaEnCurso && !gameOver && !victoria) {
        // Pantalla de espera en el menú inicial
        mostrarPantallaStatusGabinete("KERNEL_STANDBY", "PRESS 'START MATCH' ON APEX PANEL TO DEPLOY KERNEL.");
    } else if (gameOver) {
        // Alerta roja de memoria colapsada
        mostrarPantallaStatusGabinete("CRITICAL_ERROR: SYSTEM_COLLAPSED", "MEMORY OVERFLOW. INFECTION RATIO 100%. PRESS RESET.", '#ff0055');
    } else if (victoria) {
        // Alerta de éxito de desinfección total
        mostrarPantallaStatusGabinete("SYSTEM_SECURED // 100%", "ALL MALICIOUS TRANSACTIONS PURGED SUCCESSFULLY.", '#00ff66');
    }
}

// Sub-función auxiliar para maquetar textos neón centrados en el Canvas
function mostrarPantallaStatusGabinete(titulo, subtitulo, colorResaltado = '#ffcc00') {
    ctx.fillStyle = 'rgba(6, 12, 18, 0.85)'; // Cortina de opacidad petróleo oscuro
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = colorResaltado;
    ctx.font = 'bold 28px "Share Tech Mono", monospace';
    ctx.fillText(titulo, canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = '#bfa7db';
    ctx.font = '14px "Share Tech Mono", monospace';
    ctx.fillText(subtitulo, canvas.width / 2, canvas.height / 2 + 15);
}


// ==========================================
// 4. MOTOR FÍSICO Y ACTUALIZADOR DE MOVIMIENTOS
// ==========================================
function actualizar() {
    if (!partidaEnCurso || gameOver || victoria) return;

    // 1. CONTROL LATERAL JUGADOR (Mueve tu terminal de código)
    if (teclas['a'] || teclas['A'] || teclas['ArrowLeft']) {
        jugadorTerminal.x = Math.max(10, jugadorTerminal.x - jugadorTerminal.velocidad);
    }
    if (teclas['d'] || teclas['D'] || teclas['ArrowRight']) {
        jugadorTerminal.x = Math.min(canvas.width - jugadorTerminal.ancho - 10, jugadorTerminal.x + jugadorTerminal.velocidad);
    }

    // DISPARO AUTOMÁTICO AL PULSAR BARRA ESPACIADORA
    if (teclas[' ']) {
        inyectarRáfagaAntivirus();
    }

    // 2. DESPLAZAMIENTO FLUIDO DE TUS BITS BINARIOS hacia el techo de la memoria
    for (let i = proyectilesAntivirus.length - 1; i >= 0; i--) {
        const p = proyectilesAntivirus[i];
        p.y -= velocidadProyectil;
        p.x += p.desvioX; // Desvío sutil para darle el efecto flotante

        // Limpieza de memoria: si el bit sale del canvas, lo eliminamos
        if (p.y < 0) {
            proyectilesAntivirus.splice(i, 1);
        }
    }

    // 3. DESPLAZAMIENTO FLUIDO DE LOS DISPAROS ENEMIGOS (GLITCH) hacia el piso
    for (let i = proyectilesGlitch.length - 1; i >= 0; i--) {
        const p = proyectilesGlitch[i];
        p.y += velocidadGlitchProyectil;

        // Limpieza de memoria: si el virus toca el fondo, daña la integridad del sistema
        if (p.y > canvas.height) {
            proyectilesGlitch.splice(i, 1);
            modificarIntegridadMemoria(-5); // Resta 5% de vida si dejas pasar virus
        }
    }

    // 4. MOTOR DE AVANCE DEL EJÉRCITO DE BUGS INFECTADOS
    let tocarBordeLateral = false;
    let totalBugsVivos = 0;

    enemigos.forEach(bug => {
        if (bug.vivo) {
            totalBugsVivos++;
            // Desplazamiento horizontal sincronizado
            bug.x += enemigosVelocidadX * enemigosDireccionX;

            // Verificamos si algún bug toca los límites laterales de la pantalla
            if (bug.x <= 10 || bug.x + bug.ancho >= canvas.width - 10) {
                tocarBordeLateral = true;
            }

            // CONDICIÓN INFECCIÓN TOTAL: Si los marcianitos tocan tu terminal, es Game Over de inmediato
            if (bug.y + bug.alto >= jugadorTerminal.y) {
                forzarFinPartidaInfeccion();
            }
        }
    });

    // CONDICIÓN VICTORIA ARCADE: Si exterminaste la oleada de naves
    if (totalBugsVivos === 0) {
        activarVictoriaSistema();
        return;
    }

    // Si algún bug tocó una pared, todo el bloque baja un renglón e invierte su dirección
    if (tocarBordeLateral) {
        enemigosDireccionX *= -1;
        enemigos.forEach(bug => {
            if (bug.vivo) bug.y += enemigosVelocidadY;
        });
    }

    // 5. INTELIGENCIA DE BUGS: Disparos aleatorios desde el techo
    enemigos.forEach(bug => {
        if (bug.vivo && Math.random() < cadenciaFuegoEnemigo) {
            proyectilesGlitch.push({
                x: bug.x + bug.ancho / 2,
                y: bug.y + bug.alto
            });
        }
    });
}

// Sub-funciones auxiliares para la integridad de tu núcleo
function modificarIntegridadMemoria(valor) {
    integridadMemoria = Math.max(0, integridadMemoria + valor);
    document.getElementById('txt-integrity').innerText = `${integridadMemoria}%`;
    
    if (integridadMemoria <= 0) {
        forzarFinPartidaInfeccion();
    } else {
        sonarTonoRetro(150, 0.1, 'sawtooth'); // Pitido de advertencia de daño
    }
}

function forzarFinPartidaInfeccion() {
    partidaEnCurso = false;
    gameOver = true;
    proyectilesAntivirus.length = 0;
    proyectilesGlitch.length = 0;
    inyectarLogConsola("[ALERT]: CORE COLLAPSED. Malicious glitches corrupted 100% of memory.");
    sonarTonoRetro(80, 0.4, 'sawtooth'); // Sonido grave de explosión/caída
}

function activarVictoriaSistema() {
    partidaEnCurso = false;
    victoria = true;
    proyectilesAntivirus.length = 0;
    proyectilesGlitch.length = 0;
    inyectarLogConsola("[SUCCESS]: KERNEL CLEANSED. Segment 04 memory sectors re-secured.");
    sonarTonoRetro(600, 0.15, 'sine');
    setTimeout(() => sonarTonoRetro(900, 0.2, 'sine'), 120);
}

// ===================================================
// 5. SECCIÓN B: DETECCIÓN DE IMPACTOS, BEEPERS Y CICLO CRT
// ===================================================

// Escanea intersecciones geométricas entre tus bits binarios y las naves corruptas
function procesarColisionesGeometricas() {
    if (!partidaEnCurso || gameOver || victoria) return;

    // COLISIÓN 1: Tus ráfagas antivirus (Bits) impactan contra los Bugs Invasores
    // Recorremos el bucle de atrás hacia adelante para evitar saltos de índice al borrar
    for (let i = proyectilesAntivirus.length - 1; i >= 0; i--) {
        const p = proyectilesAntivirus[i];
        
        // REPARADO: Candado de seguridad. Si el proyectil fue borrado en este ciclo, lo saltamos
        if (!p) continue;

        let proyectilBorrado = false;

        for (let j = 0; j < enemigos.length; j++) {
            const bug = enemigos[j];

            // Si el bug está vivo y el bit binario entra en sus coordenadas X/Y
            if (bug.vivo && 
                p.x >= bug.x && p.x <= bug.x + bug.ancho && 
                p.y >= bug.y && p.y <= bug.y + bug.alto) {
                
                bug.vivo = false; // Desinfectamos el bug
                proyectilesAntivirus.splice(i, 1); // Eliminamos el bit binario del aire
                proyectilBorrado = true;
                
                // Sumamos los datos recuperados a tu casillero neón
                puntuacionBugs += bug.puntos;
                document.getElementById('txt-score-bugs').innerText = puntuacionBugs.toString().padStart(4, '0');
                
                // Registro estético en la consola inferior
                inyectarLogConsola(`[DELETED]: Bug ${bug.icono} purged. Recalculating memory sectors (+${bug.puntos} bytes).`);
                
                // Sonido agudo de explosión cibernética mini
                sonarTonoRetro(500, 0.05, 'square');
                
                // GESTIÓN DE HIGH SCORE RECURRENTE: Si superas tu récord, se clava en el disco duro
                if (puntuacionBugs > highScoreGabinete) {
                    highScoreGabinete = puntuacionBugs;
                    localStorage.setItem('invaders_high_score', highScoreGabinete);
                    document.getElementById('txt-high-score').innerText = highScoreGabinete.toString().padStart(5, '0');
                }
                break; // Rompemos el ciclo de bugs para este proyectil desinfectado
            }
        }
        
        // REPARADO: Si el proyectil ya impactó y fue borrado, forzamos la ruptura del ciclo del proyectil
        if (proyectilBorrado) continue;
    }

    // COLISIÓN 2: Los disparos de glitch enemigo (!) impactan contra tu Terminal Hacker
    for (let i = proyectilesGlitch.length - 1; i >= 0; i--) {
        const p = proyectilesGlitch[i];
        if (!p) continue; // Candado de resguardo para disparos enemigos

        if (p.x >= jugadorTerminal.x && p.x <= jugadorTerminal.x + jugadorTerminal.ancho &&
            p.y >= jugadorTerminal.y && p.y <= jugadorTerminal.y + jugadorTerminal.alto) {
            
            proyectilesGlitch.splice(i, 1); // Removemos el proyectil de virus
            modificarIntegridadMemoria(-15); // Los impactos directos dañan un 15% tu núcleo
            inyectarLogConsola("[WARNING]: Core impacted by external code injection. Shield integrity dropping.");
        }
    }
}

// OSCILADOR SYNTH RETRO DE 8 BITS EXCLUSIVO (Web Audio API)
function sonarTonoRetro(frecuencia, duracion, tipoOnda = 'sine') {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = tipoOnda; 
        osc.frequency.setValueAtTime(frecuencia, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime); // Volumen balanceado confortable
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duracion);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duracion);
    } catch(e) {
        console.log("Audio en espera de comandos del panel.");
    }
}

// BUCLE DE FOTOGRAMAS INFINITO (60 FPS CONSTANTES CON AUTORIDAD LOCAL)
function buclePrincipalJuego() {
    actualizar();
    procesarColisionesGeometricas();
    dibujar();
    requestAnimationFrame(buclePrincipalJuego);
}

// AUTO-RUN DE CARGA: Desplegamos la pantalla base lista para cuando pulses START MATCH en el HTML
inicializarEjercitoBugs();
dibujar(); // Pinta el escenario inicial en standby
requestAnimationFrame(buclePrincipalJuego);
