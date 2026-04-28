from typing import Dict

from .african_instruments import REQUIRED_HINT, is_valid_african_prompt
from .audio_generator import generate_audio_file


def generate_music(prompt: str, style: str = 'afro-house', length_seconds: int = 30) -> Dict[str, str]:
    """Generate placeholder audio and enforce African instrument/style prompts."""
    if not is_valid_african_prompt(prompt):
        return {
            'status': 'failed',
            'message': f'Invalid prompt. {REQUIRED_HINT}',
            'audioUrl': None,
        }

    filename, audio_url = generate_audio_file(prompt, style=style, length_seconds=length_seconds)
    return {
        'status': 'completed',
        'message': f'Generated African instrument placeholder audio file: {filename}',
        'audioUrl': audio_url,
    }
