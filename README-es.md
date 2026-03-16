# 🎷 Tetris 1920 — Los Bloques Rugientes

> *"Así seguimos adelante, bloques contra la corriente, arrastrados incesantemente hacia el tablero."*
> — F. Scott Fitzgerald (probablemente)

Un clon de **Tetris Art Deco de los años 1920** completamente funcional, construido con **Angular 17**, usando la **Web Audio API** para música jazz generativa — sin archivos de audio externos.

Este es un proyecto experimental para probar el **Vibe Coding** y ha sido desarrollado enteramente en la web de **Claude** usando **Sonnet 4.5**. No ha sido tecleada una sola línea de código.

---

## ✨ Características

- 🎨 **Tema visual Art Deco completo** — Fuentes Cinzel Decorative, paleta dorada, paneles ornamentados, acentos en las esquinas
- 🎷 **Música jazz generativa** — Generada en vivo con Web Audio API (bajo stride + acordes)
- 🎮 **Modos de uno y dos jugadores** con pantalla dividida
- 👤 **4 avatares únicos** — Gatsby, La Flapper, El Jazzman, El Contrabandista
- 🏆 **14 logros temáticos** — con animación de fanfarria y confeti
- ⚙️ **Panel de configuración** — Volumen de música/efectos, 3 niveles de dificultad, pieza fantasma, cuadrícula
- 📊 **Marcador** — Top 20 puntajes por modo, con duración y fecha
- 👻 **Pieza fantasma** — Muestra la posición de aterrizaje
- 🔄 **Guardar pieza** — Guarda una pieza para después
- 🔁 **SRS Wall Kicks** — Sistema de rotación estándar con wall kicks
- 🎰 **Aleatorizador 7-bag** — Sin sequías de tu pieza favorita
- ⌨️ **Auto-repetición** — Movimiento fluido al mantener teclas
- 📱 **Responsivo** — Funciona en cualquier navegador moderno

---

## 🚀 Inicio Rápido

### Requisitos previos
- **Node.js** >= 18
- **npm** >= 9

### Instalar y ejecutar

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm start
# → Abre http://localhost:4200
```

### Compilar para producción

```bash
npm run build:prod
# Salida: dist/tetris-1920/
```

---

## 🎮 Controles

### Jugador 1
| Tecla | Acción |
|-------|--------|
| `←` `→` | Mover izquierda / derecha |
| `↓` | Caída suave |
| `↑` | Caída rápida |
| `X` | Rotar en sentido horario |
| `Z` | Rotar en sentido antihorario |
| `Left Shift` | Guardar pieza |
| `Esc` | Pausar / Reanudar |

### Jugador 2 (modo 2 jugadores)
| Tecla | Acción |
|-------|--------|
| `A` `D` | Mover izquierda / derecha |
| `S` | Caída suave |
| `W` | Caída rápida |
| `G` | Rotar en sentido horario |
| `F` | Rotar en sentido antihorario |
| `Right Shift` | Guardar pieza |

---

## 🏗️ Arquitectura

```
src/app/
├── core/
│   ├── models/
│   │   ├── tetromino.model.ts      — 7 piezas, rotaciones, colores
│   │   ├── player.model.ts         — Definiciones de jugador y avatar
│   │   ├── game-state.model.ts     — Tablero, celda, estado del juego
│   │   ├── score.model.ts          — Puntaje, tabla de puntos por línea
│   │   ├── settings.model.ts       — Configuración, dificultad, velocidad de caída
│   │   └── achievement.model.ts    — 14 logros con rareza
│   └── services/
│       ├── game-engine.service.ts  — Bucle principal y estado del juego (OCP)
│       ├── tetromino.service.ts    — Fábrica + 7-bag + SRS kicks
│       ├── collision.service.ts    — Detección de colisiones (SRP)
│       ├── score.service.ts        — Cálculo y persistencia de puntaje (SRP)
│       ├── achievement.service.ts  — Chequeo y desbloqueo de logros
│       ├── audio.service.ts        — Jazz generativo (Web Audio API)
│       ├── input.service.ts        — Teclado + auto-repetición
│       ├── settings.service.ts     — Estado de configuración (BehaviorSubject)
│       ├── storage.service.ts      — Abstracción de localStorage (SRP)
│       └── timer.service.ts        — Cronómetro
├── shared/
│   ├── components/
│   │   └── art-deco-button/        — Botón reutilizable dorado
│   └── pipes/
│       └── title-case.pipe.ts
└── features/
    ├── menu/
    │   ├── main-menu/              — Pantalla de inicio con notas de jazz
    │   ├── player-select/          — Selector de nombre y avatar
    │   ├── settings/               — Volumen, dificultad, display
    │   └── scoreboard/             — Puntajes altos + logros
    └── game/
        ├── game/                   — Contenedor: orquesta todo
        ├── game-board/             — Renderizador canvas (30px)
        ├── game-panel/             — Puntaje, nivel, líneas, combo
        ├── next-piece/             — Vista previa canvas próxima/guardada
        ├── achievement-overlay/    — Popup de logro
        └── pause-overlay/          — Pantalla de pausa
```

### Principios SOLID Aplicados

| Principio | Cómo |
|-----------|------|
| **S** — SRP | `CollisionService`, `ScoreService`, `StorageService` hacen solo una cosa |
| **O** — OCP | `GameEngineService` abierto a nuevos modos, cerrado a modificación |
| **L** — LSP | Los componentes aceptan la interfaz `PlayerGameState`, no clases concretas |
| **I** — ISP | Enlaces `@Input()` separados, sin interfaces grandes |
| **D** — DIP | Todos los servicios inyectados vía DI de Angular, nunca instanciados manualmente |

---

## 🎨 Sistema de Diseño

| Token | Valor |
|-------|-------|
| Fuente principal | Cinzel Decorative (títulos) |
| Fuente de cuerpo | Josefin Sans |
| Fuente de acento | Dancing Script (subtítulos) |
| Oro | `#D4AF37` |
| Negro | `#0D0900` |
| Turquesa (pieza I) | `#17A398` |
| Carmesí (pieza T) | `#8B0000` |

---

## 🔊 Audio

Toda la música y efectos de sonido se generan proceduralmente en tiempo real usando **Web Audio API**. El secuenciador de jazz toca una progresión de acordes estilo años 20 (C7 → F7 → G7 → Am) con bajo stride y acordes, humanizado con desafinación aleatoria.

No se incluyen archivos de audio — el juego funciona completamente offline tras la primera carga.

---

## 📜 Licencia

MIT — ¡juega libremente, viejo sport!