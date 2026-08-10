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
// REPARADO: Bajamos la cadencia de fuego para que las naves no disparen ráfagas masivas injustas
let cadenciaFuegoEnemigo = 0.008; // Antes era 0.015 (Dispararán la mitad de proyectiles)


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
    cadenciaFuego: 250,
    // INYECTADO: Estados para la habilidad del escudo por eliminación
    campoActivo: false,
    tiempoCampo: 0
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

// REPARADO: El reset de partida ahora restaura el motor gráfico de forma segura sin acumular bucles
function reiniciarPartidaCompleta() {
    // 1. Apagamos de raíz cualquier estado de fin de partida previo
    partidaEnCurso = false; 
    gameOver = false;
    victoria = false;
    puntuacionBugs = 0;
    integridadMemoria = 100;
    oleadaActual = 1;
    enemigosVelocidadX = 1.5;
    enemigosDireccionX = 1;

    // Vaciamos por completo los buffers de los proyectiles viejos
    proyectilesAntivirus.length = 0;
    proyectilesGlitch.length = 0;

    // Restauramos las etiquetas de la marquesina superior
    document.getElementById('txt-score-bugs').innerText = "0000";
    document.getElementById('txt-integrity').innerText = "100%";

    // Encendemos el botón de START MATCH en naranja brillante original
    const btnStart = document.getElementById('btn-start-invaders');
    if (btnStart) {
        btnStart.innerText = "⚡ START MATCH";
        btnStart.style.borderColor = "#ff7700";
        btnStart.style.color = "#ff7700";
    }

    // 2. Volvemos a mapear la grilla de naves enemigas en el techo
    inicializarEjercitoBugs();
    inyectarLogConsola("[SYSTEM]: Core re-initialized. Memory buffers cleared. Engine ready.");
    sonarTonoRetro(300, 0.2, 'square'); 

    // 3. RE-ENCENDIDO DEL MOTOR: Como el bucle se apagó al perder, lo reactivamos limpiamente desde 0
    dibujar(); // Pinta el ejército listo en congelamiento esperando el saque
    buclePrincipalJuego(); 
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
    // INYECTADO: DIBUJAR CAMPO DE SEGURIDAD CIRCULAR ÁMBAR
    if (jugadorTerminal.campoActivo) {
        ctx.strokeStyle = '#ffaa00'; // Ámbar brillante
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffaa00';
        
        ctx.beginPath();
        // Dibujamos un arco circular rodeando por completo la terminal hacker
        ctx.arc(
            jugadorTerminal.x + jugadorTerminal.ancho / 2, 
            jugadorTerminal.y + jugadorTerminal.alto / 2, 
            jugadorTerminal.ancho * 0.7, 
            Math.PI, 0 // Medio círculo superior protector
        );
        ctx.stroke();
        ctx.shadowBlur = 0; // Apagamos blur para estabilizar
    }
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
    // CANDADO DE SEGURIDAD INDUSTRIAL: Detiene por completo las físicas si el juego acabó
    if (!partidaEnCurso || gameOver || victoria) return;

    // 1. CONTROL LATERAL JUGADOR
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

    // 2. DESPLAZAMIENTO FLUIDO DE TUS BITS BINARIOS
    for (let i = proyectilesAntivirus.length - 1; i >= 0; i--) {
        const p = proyectilesAntivirus[i];
        p.y -= velocidadProyectil;
        p.x += p.desvioX;
        if (p.y < 0) proyectilesAntivirus.splice(i, 1);
    }

    // 3. DESPLAZAMIENTO FLUIDO DE LOS DISPAROS ENEMIGOS (GLITCH) hacia el piso
    for (let i = proyectilesGlitch.length - 1; i >= 0; i--) {
        const p = proyectilesGlitch[i];
        p.y += velocidadGlitchProyectil;

        // Limpieza de memoria: si el virus toca el fondo, se remueve de forma segura
        if (p.y > canvas.height) {
            proyectilesGlitch.splice(i, 1);
            
            // REPARADO: Se elimina por completo la penalización de modificarIntegridadMemoria(-1)
            // ¡El suelo ahora absorbe el impacto de forma segura! 0% de daño al sistema.
        }
    }


    // 4. MOTOR DE AVANCE DEL EJÉRCITO DE BUGS INFECTADOS
    let tocarBordeLateral = false;
    let totalBugsVivos = 0;

    enemigos.forEach(bug => {
        if (bug.vivo) {
            totalBugsVivos++;
            bug.x += enemigosVelocidadX * enemigosDireccionX;

            if (bug.x <= 10 || bug.x + bug.ancho >= canvas.width - 10) {
                tocarBordeLateral = true;
            }

            if (bug.y + bug.alto >= jugadorTerminal.y) {
                forzarFinPartidaInfeccion();
            }
        }
    });

    if (totalBugsVivos === 0) {
        activarVictoriaSistema();
        return;
    }

    if (tocarBordeLateral) {
        enemigosDireccionX *= -1;
        enemigos.forEach(bug => {
            if (bug.vivo) bug.y += enemigosVelocidadY;
        });
    }

    // 5. INTELIGENCIA DE BUGS: Disparos aleatorios
    enemigos.forEach(bug => {
        if (bug.vivo && Math.random() < cadenciaFuegoEnemigo) {
            proyectilesGlitch.push({
                x: bug.x + bug.ancho / 2,
                y: bug.y + bug.alto
            });
        }
    });
}


// REPARADO: Candado atómico. Apaga las físicas al instante y dibuja el cartel de fin de memoria
function modificarIntegridadMemoria(valor) {
    // Si el juego ya se acabó por un Game Over previo, ignoramos cualquier cálculo extra
    if (gameOver || victoria || !partidaEnCurso) return;

    integridadMemoria = integridadMemoria + valor;
    
    // Forzamos el límite visual para que nunca muestre números negativos raros
    if (integridadMemoria < 0) integridadMemoria = 0;
    
    document.getElementById('txt-integrity').innerText = `${integridadMemoria}%`;
    
    // INTERRUPTOR DE SEGURIDAD MÁXIMA
    if (integridadMemoria <= 0) {
        forzarFinPartidaInfeccion();
    } else {
        sonarTonoRetro(150, 0.1, 'sawtooth'); // Pitido de daño estándar
    }
}

// REPARADO: Detiene en seco los fotogramas y obliga a pintar la alerta neón de reinicio
function forzarFinPartidaInfeccion() {
    partidaEnCurso = false;
    gameOver = true;
    
    // Limpiamos los buffers de proyectiles para liberar al procesador de inmediato
    proyectilesAntivirus.length = 0;
    proyectilesGlitch.length = 0;
    
    inyectarLogConsola("[ALERT]: CORE COLLAPSED. Malicious glitches corrupted 100% of memory.");
    sonarTonoRetro(80, 0.4, 'sawtooth'); // Tono grave retro de explosión
    
    // OBLIGAMOS A DIBUJAR: Forzamos al motor gráfico a pintar el cartel de error crítico al instante
    dibujar();
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

    if (jugadorTerminal.campoActivo && Date.now() > jugadorTerminal.tiempoCampo) {
        jugadorTerminal.campoActivo = false;
        inyectarLogConsola("[SHIELD]: Safety shield depleted. Core exposed.");
    }

    for (let i = proyectilesAntivirus.length - 1; i >= 0; i--) {
        const p = proyectilesAntivirus[i];
        if (!p) continue;

        let proyectilBorrado = false;

        for (let j = 0; j < enemigos.length; j++) {
            const bug = enemigos[j];

            if (bug.vivo && p.x >= bug.x && p.x <= bug.x + bug.ancho && p.y >= bug.y && p.y <= bug.y + bug.alto) {
                bug.vivo = false; 
                proyectilesAntivirus.splice(i, 1); 
                proyectilBorrado = true;
                
                puntuacionBugs += bug.puntos;
                document.getElementById('txt-score-bugs').innerText = puntuacionBugs.toString().padStart(4, '0');
                inyectarLogConsola(`[DELETED]: Bug ${bug.icono} purged. Recalculating memory sectors (+${bug.puntos} bytes).`);
                
                if (!jugadorTerminal.campoActivo) {
                    inyectarLogConsola("[SHIELD]: Security shield INITIALIZED. Core invulnerable.");
                }
                jugadorTerminal.campoActivo = true;
                jugadorTerminal.tiempoCampo = Date.now() + 2500; 

                sonarTonoRetro(500, 0.05, 'square');
                
                if (puntuacionBugs > highScoreGabinete) {
                    highScoreGabinete = puntuacionBugs;
                    localStorage.setItem('invaders_high_score', highScoreGabinete);
                    document.getElementById('txt-high-score').innerText = highScoreGabinete.toString().padStart(5, '0');
                }
                break; 
            }
        }
        if (proyectilBorrado) continue;
    }

    for (let i = proyectilesGlitch.length - 1; i >= 0; i--) {
        const p = proyectilesGlitch[i];
        if (!p) continue;

        let radioProteccion = jugadorTerminal.campoActivo ? jugadorTerminal.ancho * 0.7 : jugadorTerminal.ancho / 2;
        let centroJugadorX = jugadorTerminal.x + jugadorTerminal.ancho / 2;

        if (p.x >= centroJugadorX - radioProteccion && p.x <= centroJugadorX + radioProteccion &&
            p.y >= jugadorTerminal.y - 10 && p.y <= jugadorTerminal.y + jugadorTerminal.alto) {
            
            proyectilesGlitch.splice(i, 1); 
            
            if (jugadorTerminal.campoActivo) {
                inyectarLogConsola("[ABSORBED]: Glitch laser deflected by security shield. 0% damage.");
                sonarTonoRetro(700, 0.04, 'sine'); 
            } else {
                // REPARADO: El daño directo ahora solo resta 5% en lugar de 15%
                modificarIntegridadMemoria(-5);
                inyectarLogConsola("[WARNING]: Core impacted by external code injection. Shield integrity dropping (-5%).");
            }
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
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime); 
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duracion);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duracion);
    } catch(e) {
        console.log("Audio en espera de comandos del panel.");
    }
}


// BUCLE DE FOTOGRAMAS INFINITO (60 FPS CONSTANTES CON FRENO DE EMERGENCIA REJUGABLE)
function buclePrincipalJuego() {
    // CANDADO DE ESTABILIDAD: Si ocurre un Game Over o una Victoria, cortamos el procesamiento físico
    // de raíz para liberar la memoria del navegador y dejar los botones interactivos al 100%
    if (gameOver || victoria) {
        dibujar(); // Pintamos el último fotograma estático con la alerta neón correspondiente
        return;    // FRENO DE EMERGENCIA: Detiene el requestAnimationFrame por completo
    }

    // Si la partida está activa, corremos las rutinas físicas y de colisiones normales
    if (partidaEnCurso) {
        actualizar();
        procesarColisionesGeometricas();
    }
    
    dibujar();
    // El motor solo se llama a sí mismo si la partida sigue en curso de forma saludable
    requestAnimationFrame(buclePrincipalJuego);
}


// AUTO-RUN DE ARRANQUE INMUTABLE (SÓLO SE EJECUTA AL CARGAR LA PÁGINA)
inicializarEjercitoBugs();
buclePrincipalJuego(); // Encendemos el único motor eterno de animación del juego

