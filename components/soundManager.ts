// components/soundManager.ts

const soundUrls = {
  buttonClick: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_ClicBotonArcade.mp3',
  menuNavigate: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_Navegacio%CC%81nMenu.mp3',
  modalClose: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_CerrarModal.mp3',
  levelStart: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_InicioNivel.mp3',
  rebound: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_EfectoRebote.mp3',
  collectPrize: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_RecogerPremio.mp3',
  takeDamage: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_PierdeVida.mp3',
  cubeNeutralize: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_NeutralizarCubo.mp3',
  inverter: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_MaquinaInversora.mp3',
  cubeInSlot: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_CuboRanura.mp3',
  dispenseCube: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_GenerandoCubo.mp3',
  laserDoorOpen: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_PuertaLaser.mp3',
  puzzleSuccess: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_ExitoPuzzle.mp3',
  puzzleFail: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_ErrorPuzzle.mp3',
  rockEmitter: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_EmisorDeRocas.mp3',
  fireballFly: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_BolaDeFuego.mp3',
  gameOver: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_GameOver.mp3',
  shipTakeoff: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_DespegueNave.mp3',
  menuMusic: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_MusicaMenuPrincipal.mp3',
  prologueAmbience: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_AmbientePrologo.mp3',
  iceCavernAmbience: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z_AmbienteCaverna.mp3',
  gameMusic: 'https://raw.githubusercontent.com/vdhuerta/assets-aplications/main/Z-MusicaCentral.mp3'
};

export type SoundKey = keyof typeof soundUrls;

// Use a Set for faster lookups.
const musicKeys: Set<SoundKey> = new Set(['menuMusic', 'prologueAmbience', 'iceCavernAmbience', 'gameMusic']);

class SoundManager {
  private musicAudio: HTMLAudioElement | null = null;
  private longSfx: HTMLAudioElement | null = null;
  private isMuted = false;
  private preloaded = false;

  preload() {
    if (this.preloaded) return;
    // This will request the browser to start downloading the audio files and cache them.
    Object.values(soundUrls).forEach(url => {
      const audio = new Audio(url);
      audio.preload = 'auto';
    });
    this.preloaded = true;
    console.log('All sounds preloaded.');
  }

  play(key: SoundKey, options: { volume?: number; loop?: boolean; trackable?: boolean } = {}) {
    if (this.isMuted) return;

    if (musicKeys.has(key)) {
      // Stop any existing music track before starting a new one.
      if (this.musicAudio) {
        this.musicAudio.pause();
        this.musicAudio.currentTime = 0;
      }
      
      const audio = new Audio(soundUrls[key]);
      audio.volume = options.volume ?? 1;
      audio.loop = options.loop ?? true; // Music generally loops by default.
      audio.play().catch(e => {
        // Don't log AbortError, which is expected on fast scene changes.
        if (e.name !== 'AbortError') {
            console.error(`Error playing music ${key}:`, e);
        }
      });
      this.musicAudio = audio;

    } else {
      // For SFX, create a new Audio object to play it.
      const sfx = new Audio(soundUrls[key]);
      sfx.volume = options.volume ?? 0.12; // Default SFX volume.
      sfx.loop = options.loop ?? false;
      sfx.play().catch(e => {
        // The "interrupted by a call to pause" error is an AbortError.
        // We can safely ignore it for short, non-critical sound effects.
        if (e.name !== 'AbortError') {
          console.error(`Error playing sound ${key}:`, e);
        }
      });
      
      if (options.trackable) {
        if (this.longSfx) {
          this.longSfx.pause();
        }
        this.longSfx = sfx;
      }
    }
  }

  stopAll() {
    // Stop the main music track.
    if (this.musicAudio) {
      this.musicAudio.pause();
      this.musicAudio.currentTime = 0;
      this.musicAudio = null;
    }
    // Stop any long-running SFX.
    if (this.longSfx) {
      this.longSfx.pause();
      this.longSfx.currentTime = 0;
      this.longSfx = null;
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAll();
    }
    // Music will be restarted by the app's `useEffect` hook if needed.
    return this.isMuted;
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const soundManager = new SoundManager();