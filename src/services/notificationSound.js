/**
 * Starts a looping phone-ringtone using the Web Audio API.
 * Returns a stop() function — call it to immediately silence the ring.
 * No external audio files required.
 */
export function startRingtone() {
  let active = true;

  let ctx;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    return () => {}; // AudioContext unavailable
  }

  // Ringtone pattern: [timeOffset (s), frequency (Hz), duration (s)]
  const pattern = [
    [0.0, 880, 0.28],
    [0.33, 660, 0.28],
    [0.66, 880, 0.28],
    [0.99, 660, 0.28],
  ];
  const CYCLE = 2.6; // seconds per full ring + pause

  function playOneCycle(startAt) {
    pattern.forEach(([offset, freq, dur]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, startAt + offset);
      gain.gain.linearRampToValueAtTime(0.45, startAt + offset + 0.01);
      gain.gain.setValueAtTime(0.45, startAt + offset + dur - 0.04);
      gain.gain.linearRampToValueAtTime(0, startAt + offset + dur);
      osc.start(startAt + offset);
      osc.stop(startAt + offset + dur + 0.05);
    });
  }

  function loop() {
    if (!active) return;
    playOneCycle(ctx.currentTime);
    setTimeout(loop, (CYCLE - 0.05) * 1000);
  }

  loop();

  return function stop() {
    active = false;
    try {
      ctx.close();
    } catch {
      /* already closed */
    }
  };
}
