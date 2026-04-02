export async function fireConfetti() {
  try {
    const confetti = (await import("canvas-confetti")).default;
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#14b8a6", "#06b6d4", "#a78bfa", "#34d399", "#fbbf24"],
    });
  } catch {}
}
