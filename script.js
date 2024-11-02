document.addEventListener('DOMContentLoaded', () => {
    const selectorDificultad = document.getElementById('dificultad');
    const configuracionPersonalizada = document.getElementById('configuracion-personalizada');
    const botonIniciar = document.getElementById('iniciar');
    const contenedorJuego = document.getElementById('juego');

    let primerClick = true;
    let tablero = [];
    let filas, columnas, minas;

    const dificultades = {
        'facil': { filas: 8, columnas: 8, minas: 10 },
        'medio': { filas: 16, columnas: 16, minas: 40 },
        'dificil': { filas: 16, columnas: 30, minas: 99 },
        'muy-dificil': { filas: 20, columnas: 40, minas: 200 },
        'hardcore': { filas: 24, columnas: 50, minas: 350 },
        'leyenda': { filas: 30, columnas: 60, minas: 500 }
    };

    selectorDificultad.addEventListener('change', () => {
        if (selectorDificultad.value === 'personalizado') {
            configuracionPersonalizada.style.display = 'block';
        } else {
            configuracionPersonalizada.style.display = 'none';
        }
    });

    botonIniciar.addEventListener('click', () => {
        if (selectorDificultad.value === 'personalizado') {
            filas = parseInt(document.getElementById('filas').value);
            columnas = parseInt(document.getElementById('columnas').value);
            minas = parseInt(document.getElementById('minas').value);

            if (filas < 5 || columnas < 5) {
                alert('El tamaño mínimo es de 5x5');
                return;
            }
        } else {
            const dificultad = dificultades[selectorDificultad.value];
            filas = dificultad.filas;
            columnas = dificultad.columnas;
            minas = dificultad.minas;
        }
        primerClick = true;
        crearTablero();
    });

    function crearTablero() {
        contenedorJuego.innerHTML = '';
        tablero = [];
        for (let r = 0; r < filas; r++) {
            const fila = [];
            const divFila = document.createElement('div');
            divFila.classList.add('fila');
            for (let c = 0; c < columnas; c++) {
                const celda = document.createElement('div');
                celda.classList.add('celda');
                celda.dataset.fila = r;
                celda.dataset.columna = c;
                celda.addEventListener('click', clickCelda);
                celda.addEventListener('contextmenu', clickDerechoCelda);
                divFila.appendChild(celda);
                fila.push({
                    mina: false,
                    revelada: false,
                    marcada: false,
                    minasAdyacentes: 0,
                    elemento: celda
                });
            }
            contenedorJuego.appendChild(divFila);
            tablero.push(fila);
        }
    }

    function colocarMinas(filaExcluida, columnaExcluida) {
        let minasColocadas = 0;
        while (minasColocadas < minas) {
            const r = Math.floor(Math.random() * filas);
            const c = Math.floor(Math.random() * columnas);
            if (
                !tablero[r][c].mina &&
                !(r === filaExcluida && c === columnaExcluida)
            ) {
                tablero[r][c].mina = true;
                minasColocadas++;
            }
        }
        calcularMinasAdyacentes();
    }

    function calcularMinasAdyacentes() {
        for (let r = 0; r < filas; r++) {
            for (let c = 0; c < columnas; c++) {
                if (tablero[r][c].mina) continue;
                let contador = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < filas && nc >= 0 && nc < columnas) {
                            if (tablero[nr][nc].mina) contador++;
                        }
                    }
                }
                tablero[r][c].minasAdyacentes = contador;
            }
        }
    }

    function clickCelda(e) {
        const elementoCelda = e.target;
        const r = parseInt(elementoCelda.dataset.fila);
        const c = parseInt(elementoCelda.dataset.columna);
        if (tablero[r][c].marcada || tablero[r][c].revelada) return;

        if (primerClick) {
            colocarMinas(r, c);
            primerClick = false;
        }

        if (tablero[r][c].mina) {
            elementoCelda.classList.add('revelada');
            elementoCelda.textContent = '💣';
            alert('¡Has perdido! Dale click al boton "Iniciar Juego" para volver a jugar');
            crearTablero();
            return;
        }

        revelarCelda(r, c);
        verificarVictoria();
    }

    function clickDerechoCelda(e) {
        e.preventDefault();
        const elementoCelda = e.target;
        const r = parseInt(elementoCelda.dataset.fila);
        const c = parseInt(elementoCelda.dataset.columna);
        if (tablero[r][c].revelada) return;

        tablero[r][c].marcada = !tablero[r][c].marcada;
        elementoCelda.classList.toggle('marcada');
    }

    function revelarCelda(r, c) {
        if (r < 0 || r >= filas || c < 0 || c >= columnas) return;
        const celda = tablero[r][c];
        if (celda.revelada || celda.marcada) return;

        celda.revelada = true;
        celda.elemento.classList.add('revelada');
        if (celda.minasAdyacentes > 0) {
            celda.elemento.textContent = celda.minasAdyacentes;
        } else {
            // Revelar celdas adyacentes
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    revelarCelda(r + dr, c + dc);
                }
            }
        }
    }

    function verificarVictoria() {
        let celdasPorRevelar = filas * columnas - minas;
        let celdasReveladas = 0;
        for (let r = 0; r < filas; r++) {
            for (let c = 0; c < columnas; c++) {
                if (tablero[r][c].revelada) celdasReveladas++;
            }
        }
        if (celdasReveladas === celdasPorRevelar) {
            alert('¡Felicidades, has ganado!. Para volver a jugar presiona el boton "Iniciar Juego"');
            crearTablero();
        }
    }
});
