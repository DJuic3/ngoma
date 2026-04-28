import hashlib
import math
import os
import struct
import wave
from typing import Tuple

GENERATED_DIR = os.path.join(os.path.dirname(__file__), 'generated')

if not os.path.exists(GENERATED_DIR):
    os.makedirs(GENERATED_DIR, exist_ok=True)


def _prompt_to_seed(prompt: str) -> int:
    digest = hashlib.sha256(prompt.encode('utf-8')).digest()
    return int.from_bytes(digest[:4], 'little')


def _wav_filename(prompt: str, style: str, length_seconds: int) -> str:
    safe_name = hashlib.sha256(f'{prompt}-{style}-{length_seconds}'.encode('utf-8')).hexdigest()
    return f'ngoma-{safe_name[:16]}.wav'


def _build_frequencies(seed: int, style: str) -> Tuple[float, float, float]:
    base = 220.0 + (seed % 88)  # A3 range
    factor = 1.0 if style == 'modern' else 1.25
    return (base * factor, base * 1.5 * factor, base * 2.0 * factor)


def generate_audio_file(prompt: str, style: str = 'modern', length_seconds: int = 30) -> Tuple[str, str]:
    """Generate a placeholder WAV audio file from a prompt.

    Returns a tuple of (filename, relative_url).
    """
    filename = _wav_filename(prompt, style, length_seconds)
    path = os.path.join(GENERATED_DIR, filename)

    if os.path.exists(path):
        return filename, f'/generated/{filename}'

    sample_rate = 22050
    samples = length_seconds * sample_rate
    volume = 0.55
    seed = _prompt_to_seed(prompt)
    a_freq, b_freq, c_freq = _build_frequencies(seed, style)

    with wave.open(path, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)

        for i in range(samples):
            t = i / sample_rate
            carrier = math.sin(2.0 * math.pi * a_freq * t)
            tone = math.sin(2.0 * math.pi * b_freq * t)
            lead = math.sin(2.0 * math.pi * c_freq * t)
            shape = math.sin(2.0 * math.pi * (0.25 + (seed % 8) * 0.05) * t)
            sample = carrier * 0.55 + tone * 0.33 + lead * 0.12
            sample = sample * shape * volume
            sample_value = int(max(-32767, min(32767, sample * 32767)))
            wav_file.writeframes(struct.pack('<h', sample_value))

    return filename, f'/generated/{filename}'
