// ═══════════════════════════════════════════════════════════════
//  AUDIO SERVICE  v2
//  Procedural 1920s stride-piano jazz — Web Audio API lookahead
//  scheduler for rock-solid timing (no more setInterval drift!)
// ═══════════════════════════════════════════════════════════════

import { Injectable, OnDestroy } from "@angular/core";
import { SettingsService } from "./settings.service";
import { Subscription } from "rxjs";
import { MusicTrack } from "../models/settings.model";

export type SoundEffect =
  | "piece_land"
  | "line_clear"
  | "tetris"
  | "level_up"
  | "game_over"
  | "achievement"
  | "rotate"
  | "move"
  | "hold"
  | "menu_select"
  | "menu_hover"
  | "hard_drop";

// ── Music constants ───────────────────────────────────────────
const BPM = 138;
const BEAT = 60 / BPM;
const SIXTEENTH = BEAT / 4;
const LOOKAHEAD = 0.15; // seconds to look ahead
const SCHEDULER_MS = 30; // scheduler poll interval (ms)

// ── Note frequencies ──────────────────────────────────────────
const N = {
  C2: 65.41,
  G2: 98.0,
  Bb2: 116.5,
  F2: 87.31,
  D2: 73.42,
  C3: 130.8,
  D3: 146.8,
  E3: 164.8,
  F3: 174.6,
  G3: 196.0,
  A3: 220.0,
  Bb3: 233.1,
  B3: 246.9,
  C4: 261.6,
  D4: 293.7,
  Eb4: 311.1,
  E4: 329.6,
  F4: 349.2,
  G4: 392.0,
  Ab4: 415.3,
  A4: 440.0,
  Bb4: 466.2,
  B4: 493.9, // ← Ab4 añadida
  C5: 523.3,
  D5: 587.3,
  Eb5: 622.3,
  E5: 659.3,
  F5: 698.5,
  G5: 784.0,
  Ab5: 830.6,
  A5: 880.0,
  Bb5: 932.3,
  B5: 987.8, // ← Ab5 añadida
  C6: 1046.5,
  D6: 1174.7,
  E6: 1318.5,
  G6: 1568.0,
};

// ── Chord voicings for 12-bar blues in C ─────────────────────
interface Bar {
  root: number;
  fifth: number;
  ch1: number;
  ch2: number;
  mel: number[];
}

const BARS: Bar[] = [
  // C7
  {
    root: N.C2,
    fifth: N.G2,
    ch1: N.E4,
    ch2: N.Bb4,
    mel: [N.C5, N.E5, N.G5, N.Bb5],
  },
  {
    root: N.C2,
    fifth: N.G2,
    ch1: N.G4,
    ch2: N.Bb4,
    mel: [N.G5, N.E5, N.C5, N.Bb4],
  },
  {
    root: N.C2,
    fifth: N.G2,
    ch1: N.E4,
    ch2: N.G4,
    mel: [N.C5, N.D5, N.E5, N.G5],
  },
  {
    root: N.C2,
    fifth: N.G2,
    ch1: N.Bb3,
    ch2: N.E4,
    mel: [N.Bb4, N.C5, N.D5, N.E5],
  },
  // F7
  {
    root: N.F2,
    fifth: N.C3,
    ch1: N.A3,
    ch2: N.Eb4,
    mel: [N.F5, N.A5, N.C6, N.Eb5],
  },
  {
    root: N.F2,
    fifth: N.C3,
    ch1: N.A3,
    ch2: N.C4,
    mel: [N.F5, N.G5, N.A5, N.C6],
  },
  // C7
  {
    root: N.C2,
    fifth: N.G2,
    ch1: N.E4,
    ch2: N.Bb4,
    mel: [N.E5, N.G5, N.Bb5, N.G5],
  },
  {
    root: N.C2,
    fifth: N.G2,
    ch1: N.G4,
    ch2: N.Bb4,
    mel: [N.C5, N.E5, N.G5, N.C6],
  },
  // G7
  {
    root: N.G2,
    fifth: N.D3,
    ch1: N.B3,
    ch2: N.F4,
    mel: [N.G5, N.B4, N.D5, N.F5],
  },
  // F7
  {
    root: N.F2,
    fifth: N.C3,
    ch1: N.A3,
    ch2: N.Eb4,
    mel: [N.F5, N.A4, N.C5, N.Eb5],
  },
  // C7
  {
    root: N.C2,
    fifth: N.G2,
    ch1: N.E4,
    ch2: N.G4,
    mel: [N.C5, N.E5, N.G5, N.E5],
  },
  // G7 turnaround
  {
    root: N.G2,
    fifth: N.D3,
    ch1: N.B3,
    ch2: N.D4,
    mel: [N.D5, N.F5, N.G5, N.B5],
  },
];

// 16th-note melody rhythm — 1=play, 0=rest (syncopated ragtime feel)
const MEL_RHYTHM = [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1];

// ── TRACK 2: Ragtime in G (Scott Joplin style) ───────────────
// Más staccato, más rápido en feeling, notas cortas y picadas
interface RagBar {
  root: number;
  fifth: number;
  ch1: number;
  ch2: number;
  mel: number[];
}

const RAG_BARS: RagBar[] = [
  {
    root: N["G2"],
    fifth: N["D3"],
    ch1: N["B3"],
    ch2: N["D4"],
    mel: [N["G5"], N["B4"], N["D5"], N["G5"]],
  },
  {
    root: N["G2"],
    fifth: N["D3"],
    ch1: N["F4"],
    ch2: N["B3"],
    mel: [N["B4"], N["D5"], N["F5"], N["G5"]],
  },
  {
    root: N["G2"],
    fifth: N["D3"],
    ch1: N["B3"],
    ch2: N["E4"],
    mel: [N["G5"], N["D5"], N["B4"], N["D5"]],
  },
  {
    root: N["G2"],
    fifth: N["D3"],
    ch1: N["D4"],
    ch2: N["F4"],
    mel: [N["D5"], N["F5"], N["G5"], N["B5"]],
  },
  {
    root: N["C3"],
    fifth: N["G3"],
    ch1: N["E4"],
    ch2: N["G4"],
    mel: [N["C5"], N["E5"], N["G5"], N["C6"]],
  },
  {
    root: N["C3"],
    fifth: N["G3"],
    ch1: N["G4"],
    ch2: N["Bb4"],
    mel: [N["E5"], N["G5"], N["Bb5"], N["G5"]],
  },
  {
    root: N["G2"],
    fifth: N["D3"],
    ch1: N["B3"],
    ch2: N["D4"],
    mel: [N["G5"], N["B4"], N["D5"], N["F5"]],
  },
  {
    root: N["G2"],
    fifth: N["D3"],
    ch1: N["F4"],
    ch2: N["A3"],
    mel: [N["B4"], N["D5"], N["G5"], N["D5"]],
  },
  {
    root: N["D3"],
    fifth: N["A3"],
    ch1: N["F4"],
    ch2: N["C4"],
    mel: [N["D5"], N["F5"], N["A5"], N["C6"]],
  },
  {
    root: N["C3"],
    fifth: N["G3"],
    ch1: N["E4"],
    ch2: N["Bb4"],
    mel: [N["C5"], N["E5"], N["G5"], N["Bb5"]],
  },
  {
    root: N["G2"],
    fifth: N["D3"],
    ch1: N["B3"],
    ch2: N["G4"],
    mel: [N["G5"], N["D5"], N["B4"], N["G5"]],
  },
  {
    root: N["D3"],
    fifth: N["A3"],
    ch1: N["C4"],
    ch2: N["F4"],
    mel: [N["D5"], N["G5"], N["B5"], N["D6"]],
  },
];
// Ritmo ragtime: muy sincopado, acentos en las semicorcheas "off"
const RAG_RHYTHM = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0];

// ── TRACK 3: Charleston in F ──────────────────────────────────
// El ritmo Charleston es inconfundible: long-short-long (♩♪♩)
// Patrón rítmico: beat 1 fuerte, y-of-2 acentuado, beat 4
interface ChaBar {
  root: number;
  fifth: number;
  ch: number[];
  mel: number[];
}

const CHA_BARS: ChaBar[] = [
  {
    root: N["F2"],
    fifth: N["C3"],
    ch: [N["A3"], N["C4"], N["Eb4"]],
    mel: [N["F5"], N["A5"], N["C6"], N["Eb5"]],
  },
  {
    root: N["F2"],
    fifth: N["C3"],
    ch: [N["C4"], N["Eb4"], N["A3"]],
    mel: [N["A5"], N["F5"], N["Eb5"], N["C5"]],
  },
  {
    root: N["F2"],
    fifth: N["C3"],
    ch: [N["A3"], N["C4"], N["F4"]],
    mel: [N["F5"], N["C5"], N["A5"], N["F5"]],
  },
  {
    root: N["F2"],
    fifth: N["C3"],
    ch: [N["Eb4"], N["A3"], N["C4"]],
    mel: [N["Eb5"], N["C5"], N["A4"], N["C5"]],
  },
  {
    root: N["Bb2"],
    fifth: N["F3"],
    ch: [N["D4"], N["F4"], N["Ab4"]],
    mel: [N["Bb5"], N["D5"], N["F5"], N["Ab5"]],
  },
  {
    root: N["Bb2"],
    fifth: N["F3"],
    ch: [N["F4"], N["Ab4"], N["D4"]],
    mel: [N["D5"], N["F5"], N["Bb5"], N["F5"]],
  },
  {
    root: N["F2"],
    fifth: N["C3"],
    ch: [N["A3"], N["C4"], N["Eb4"]],
    mel: [N["A5"], N["F5"], N["C5"], N["Eb5"]],
  },
  {
    root: N["F2"],
    fifth: N["C3"],
    ch: [N["C4"], N["F4"], N["A3"]],
    mel: [N["F5"], N["A5"], N["C6"], N["A5"]],
  },
  {
    root: N["C3"],
    fifth: N["G3"],
    ch: [N["E4"], N["G4"], N["Bb4"]],
    mel: [N["C5"], N["E5"], N["G5"], N["Bb5"]],
  },
  {
    root: N["Bb2"],
    fifth: N["F3"],
    ch: [N["D4"], N["F4"], N["Ab4"]],
    mel: [N["Bb4"], N["D5"], N["F5"], N["D5"]],
  },
  {
    root: N["F2"],
    fifth: N["C3"],
    ch: [N["A3"], N["C4"], N["F4"]],
    mel: [N["F5"], N["C5"], N["A4"], N["F5"]],
  },
  {
    root: N["C3"],
    fifth: N["G3"],
    ch: [N["Bb3"], N["E4"], N["G4"]],
    mel: [N["C5"], N["E5"], N["G5"], N["C6"]],
  },
];
// Patrón Charleston: el acento cae en el "and" del 1 y en el 3
const CHA_RHYTHM = [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0];

@Injectable({ providedIn: "root" })
export class AudioService implements OnDestroy {
  private ctx!: AudioContext;
  private masterGain!: GainNode;
  private musicGain!: GainNode;
  private sfxGain!: GainNode;

  private schedulerTimer: ReturnType<typeof setInterval> | null = null;
  private nextNoteTime = 0;
  private currentStep = 0;
  private totalSteps = this.trackBars * 16;
  private currentTrack: MusicTrack = "blues";

  private readonly settingsSub: Subscription;

  constructor(private readonly settings: SettingsService) {
    this.settingsSub = this.settings.settings$.subscribe((s) => {
      if (!this.ctx) return;
      this.musicGain.gain.setTargetAtTime(
        s.musicVolume,
        this.ctx.currentTime,
        0.05,
      );
      this.sfxGain.gain.setTargetAtTime(
        s.soundVolume,
        this.ctx.currentTime,
        0.05,
      );
      this.currentTrack = s.musicTrack ?? "blues"; // ← añade esta línea
    });
  }

  private get trackBars(): number {
    switch (this.currentTrack) {
      case "ragtime":
        return RAG_BARS.length;
      case "charleston":
        return CHA_BARS.length;
      default:
        return BARS.length;
    }
  }

  // ── Init (must be called after a user gesture) ────────────────
  init(): void {
    if (this.ctx) return;
    this.ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    this.masterGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();

    // Music → light reverb → master
    const reverb = this.buildReverb();
    this.musicGain.connect(reverb);
    reverb.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    const s = this.settings.snapshot;
    this.musicGain.gain.value = s.musicVolume;
    this.sfxGain.gain.value = s.soundVolume;
    this.masterGain.gain.value = 1;
  }

  setTrack(track: MusicTrack): void {
    this.currentTrack = track;
  }

  // ── Music control ─────────────────────────────────────────────
  startMusic(): void {
    this.init();
    this.stopMusic();
    this.currentStep = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.schedulerTimer = setInterval(() => this.tick(), SCHEDULER_MS);
  }

  stopMusic(): void {
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  pauseMusic(): void {
    this.stopMusic();
  }

  resumeMusic(): void {
    if (!this.ctx) return;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.schedulerTimer = setInterval(() => this.tick(), SCHEDULER_MS);
  }

  // ── Sound Effects ─────────────────────────────────────────────
  playSfx(sound: SoundEffect): void {
    if (!this.ctx) return;
    const vol = this.settings.snapshot.soundVolume;
    if (vol === 0) return;

    switch (sound) {
      case "move":
        this.tone(280, "sine", 0.005, 0, 0.06, vol * 0.25);
        break;
      case "rotate":
        this.tone(420, "triangle", 0.01, 0.01, 0.08, vol * 0.35);
        break;
      case "piece_land":
        this.noise(0.07, vol * 0.45);
        break;
      case "hard_drop":
        this.noise(0.1, vol * 0.6);
        this.tone(90, "sawtooth", 0.005, 0, 0.1, vol * 0.4);
        break;
      case "hold":
        this.tone(330, "sine", 0.01, 0.01, 0.12, vol * 0.35);
        break;
      case "line_clear":
        this.sfxLineClear(vol);
        break;
      case "tetris":
        this.sfxTetris(vol);
        break;
      case "level_up":
        this.sfxLevelUp(vol);
        break;
      case "game_over":
        this.sfxGameOver(vol);
        break;
      case "achievement":
        this.sfxAchievement(vol);
        break;
      case "menu_select":
        this.tone(520, "sine", 0.01, 0, 0.1, vol * 0.4);
        break;
      case "menu_hover":
        this.tone(380, "sine", 0.005, 0, 0.05, vol * 0.25);
        break;
    }
  }

  // ── Private: Lookahead scheduler ─────────────────────────────
  private tick(): void {
    this.totalSteps = this.trackBars * 16; // ← añade esta línea
    while (this.nextNoteTime < this.ctx.currentTime + LOOKAHEAD) {
      this.scheduleStep(this.currentStep, this.nextNoteTime);
      this.nextNoteTime += SIXTEENTH;
      this.currentStep = (this.currentStep + 1) % this.totalSteps;
    }
  }

  private scheduleStep(step: number, t: number): void {
    switch (this.currentTrack) {
      case "ragtime":
        this.scheduleRagtime(step, t);
        break;
      case "charleston":
        this.scheduleCharleston(step, t);
        break;
      default:
        this.scheduleBlues(step, t);
        break;
    }
  }

  // ── Blues (pista original, renombrada) ────────────────────────
  private scheduleBlues(step: number, t: number): void {
    const bar = BARS[Math.floor(step / 16) % BARS.length];
    const stepInBar = step % 16;
    const beat = Math.floor(stepInBar / 4);
    const sub = stepInBar % 4;

    if (sub === 0) {
      if (beat === 0 || beat === 2) {
        const bassFreq = beat === 0 ? bar.root : bar.fifth;
        this.note(bassFreq, "triangle", t, BEAT * 0.85, 0.2, 0);
        this.note(bassFreq * 2, "sine", t, BEAT * 0.7, 0.08, 0);
      } else {
        this.note(bar.ch1, "triangle", t, BEAT * 0.45, 0.11, 0);
        this.note(bar.ch2, "triangle", t, BEAT * 0.45, 0.09, 0.008);
      }
    }
    if (MEL_RHYTHM[stepInBar]) {
      const melFreq = bar.mel[beat % bar.mel.length];
      const octave = stepInBar === 5 || stepInBar === 13 ? 0.5 : 1;
      this.note(melFreq * octave, "triangle", t, SIXTEENTH * 1.7, 0.08, 0.5);
      this.note(melFreq * octave * 2, "sine", t, SIXTEENTH * 1.4, 0.02, 0.3);
    }
    if (stepInBar === 14) {
      const nextBar = BARS[(Math.floor(step / 16) + 1) % BARS.length];
      this.note(
        nextBar.root * 2 * 0.944,
        "sine",
        t + SIXTEENTH,
        SIXTEENTH * 0.8,
        0.06,
        0,
      );
    }
  }

  // ── Ragtime (Scott Joplin style) ──────────────────────────────
  private scheduleRagtime(step: number, t: number): void {
    const bar = RAG_BARS[Math.floor(step / 16) % RAG_BARS.length];
    const stepInBar = step % 16;
    const beat = Math.floor(stepInBar / 4);
    const sub = stepInBar % 4;

    // Stride bass — igual que blues pero notas más cortas y picadas
    if (sub === 0) {
      if (beat === 0 || beat === 2) {
        this.note(bar.root, "triangle", t, BEAT * 0.55, 0.22, 0);
        this.note(bar.root * 2, "sine", t, BEAT * 0.45, 0.09, 0);
      } else {
        // Acorde staccato — la clave del ragtime
        this.note(bar.ch1, "triangle", t, BEAT * 0.25, 0.14, 0);
        this.note(bar.ch2, "triangle", t, BEAT * 0.25, 0.11, 0);
        // Nota extra de octava para dar brillo
        this.note(bar.ch2 * 2, "sine", t, BEAT * 0.2, 0.05, 0);
      }
    }
    // Melodía con ritmo más sincopado
    if (RAG_RHYTHM[stepInBar]) {
      const melFreq = bar.mel[beat % bar.mel.length];
      this.note(melFreq, "triangle", t, SIXTEENTH * 1.3, 0.1, 0.4);
      this.note(melFreq * 2, "sine", t, SIXTEENTH * 1.0, 0.03, 0.2);
    }
    // Trino de adorno en el último tiempo de cada 2 compases
    if (stepInBar === 15 && Math.floor(step / 16) % 2 === 1) {
      const trill = bar.mel[0];
      this.note(trill, "triangle", t, SIXTEENTH * 0.4, 0.07, 0);
      this.note(
        trill * 1.12,
        "triangle",
        t + SIXTEENTH * 0.4,
        SIXTEENTH * 0.4,
        0.07,
        0,
      );
      this.note(
        trill,
        "triangle",
        t + SIXTEENTH * 0.8,
        SIXTEENTH * 0.4,
        0.05,
        0,
      );
    }
  }

  // ── Charleston ────────────────────────────────────────────────
  private scheduleCharleston(step: number, t: number): void {
    const bar = CHA_BARS[Math.floor(step / 16) % CHA_BARS.length];
    const stepInBar = step % 16;
    const beat = Math.floor(stepInBar / 4);

    // Patrón rítmico Charleston: BOOM-chk-BOOM-BOOM
    // Beat 0: bajo gordo
    if (stepInBar === 0) {
      this.note(bar.root, "triangle", t, BEAT * 0.9, 0.24, 0);
      this.note(bar.root * 2, "sine", t, BEAT * 0.8, 0.1, 0);
    }
    // "And" of 1 (step 2): acorde stab — la firma del charleston
    if (stepInBar === 2) {
      bar.ch.forEach((f, i) =>
        this.note(f, "triangle", t + i * 0.006, BEAT * 0.3, 0.12 - i * 0.02, 0),
      );
    }
    // Beat 2 (step 8): bajo de nuevo
    if (stepInBar === 8) {
      this.note(bar.fifth, "triangle", t, BEAT * 0.75, 0.2, 0);
      this.note(bar.fifth * 2, "sine", t, BEAT * 0.6, 0.08, 0);
    }
    // "And" of 3 (step 10): otro acorde stab
    if (stepInBar === 10) {
      bar.ch.forEach((f, i) =>
        this.note(f, "triangle", t + i * 0.006, BEAT * 0.3, 0.11 - i * 0.02, 0),
      );
    }
    // Beat 4 (step 12): acorde final del compás
    if (stepInBar === 12) {
      bar.ch.forEach((f, i) =>
        this.note(f, "triangle", t + i * 0.008, BEAT * 0.4, 0.1 - i * 0.02, 0),
      );
    }
    // Melodía con el ritmo charleston
    if (CHA_RHYTHM[stepInBar]) {
      const melFreq = bar.mel[beat % bar.mel.length];
      this.note(melFreq, "triangle", t, SIXTEENTH * 1.5, 0.09, 0.3);
      this.note(melFreq * 2, "sine", t, SIXTEENTH * 1.2, 0.025, 0.2);
    }
  }

  // ── Private: Note scheduler (precise timed note) ─────────────
  private note(
    freq: number,
    type: OscillatorType,
    time: number,
    dur: number,
    vol: number,
    detuneFactor: number,
  ): void {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = (Math.random() - 0.5) * detuneFactor * 14;

    // Piano-style envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.012);
    gain.gain.setTargetAtTime(vol * 0.4, time + 0.025, 0.055);
    gain.gain.setTargetAtTime(0, time + dur * 0.6, dur * 0.18);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + dur + 0.08);
  }

  // ── Private: Synthetic reverb (short room) ───────────────────
  private buildReverb(): ConvolverNode {
    const node = this.ctx.createConvolver();
    const len = this.ctx.sampleRate * 1.2;
    const impulse = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = impulse.getChannelData(c);
      for (let i = 0; i < len; i++) {
        ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8);
      }
    }
    node.buffer = impulse;

    // Mix: 80% dry / 20% wet
    const wet = this.ctx.createGain();
    wet.gain.value = 0.2;
    node.connect(wet);
    wet.connect(this.masterGain);

    return node;
  }

  // ── Private: SFX tone helper ──────────────────────────────────
  private tone(
    freq: number,
    type: OscillatorType,
    attack: number,
    decay: number,
    sustain: number,
    vol: number,
  ): void {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.setTargetAtTime(0, t + attack + decay, sustain / 3);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + attack + decay + sustain + 0.1);
  }

  private noise(duration: number, vol: number): void {
    const len = this.ctx.sampleRate * duration;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    const g = this.ctx.createGain();
    const fil = this.ctx.createBiquadFilter();
    src.buffer = buf;
    fil.type = "bandpass";
    fil.frequency.value = 700;
    fil.Q.value = 0.8;
    g.gain.setValueAtTime(vol, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(
      0.0001,
      this.ctx.currentTime + duration,
    );
    src.connect(fil);
    fil.connect(g);
    g.connect(this.sfxGain);
    src.start();
  }

  // ── Private: SFX jingles ──────────────────────────────────────
  private sfxLineClear(vol: number): void {
    const t = this.ctx.currentTime;
    [N.C5, N.E5, N.G5, N.C6].forEach((f, i) =>
      this.note(f, "triangle", t + i * 0.055, 0.22, vol * 0.42, 0),
    );
  }

  private sfxTetris(vol: number): void {
    const t = this.ctx.currentTime;
    [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6].forEach((f, i) =>
      this.note(f, "triangle", t + i * 0.065, 0.28, vol * 0.48, 0),
    );
  }

  private sfxLevelUp(vol: number): void {
    const t = this.ctx.currentTime;
    [N.C5, N.E5, N.G5, N.C6, N.G5, N.C6].forEach((f, i) =>
      this.note(f, "sawtooth", t + i * 0.07, 0.18, vol * 0.32, 0),
    );
  }

  private sfxAchievement(vol: number): void {
    // G G G Eb / Bb G Eb Bb G
    const seq = [
      [N.G5, 0.0],
      [N.G5, 0.13],
      [N.G5, 0.26],
      [N.Eb5, 0.39],
      [N.Bb5, 0.49],
      [N.G5, 0.62],
      [N.Eb5, 0.75],
      [N.Bb5, 0.88],
      [N.G6, 1.05],
    ] as [number, number][];
    const t = this.ctx.currentTime;
    seq.forEach(([f, dt]) => {
      this.note(f, "triangle", t + dt, 0.22, vol * 0.48, 0);
      this.note(f * 0.5, "sine", t + dt, 0.22, vol * 0.18, 0);
    });
  }

  private sfxGameOver(vol: number): void {
    const t = this.ctx.currentTime;
    [N.G4, N.F4, N.Eb4, N.C4].forEach((f, i) =>
      this.note(f, "sawtooth", t + i * 0.22, 0.32, vol * 0.38, 0),
    );
  }

  ngOnDestroy(): void {
    this.stopMusic();
    this.settingsSub.unsubscribe();
    this.ctx?.close();
  }
}
