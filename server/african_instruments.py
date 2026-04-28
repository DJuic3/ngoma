import re
from typing import List

AFRICAN_INSTRUMENTS = [
    'djembe',
    'talking drum',
    'kora',
    'mbira',
    'balafon',
    'udu drum',
    'kalimba',
    'shekere',
    'ngoni',
    'marimba',
    'bougarabou',
    'sabar',
    'doundoun',
    'ashiko',
    'xalam',
    'kudu horn',
    'sega',
    'bokar',
    'zither',
    'berimbau',
]

AFRICAN_STYLES = [
    'afrobeat',
    'afro-house',
    'amapiano',
    'highlife',
    'juju',
    'soukous',
    'gqom',
    'mbaqanga',
    'afro-jazz',
    'southern house',
]

REQUIRED_HINT = (
    'Please use African instruments or African styles only, such as djembe, kora, mbira, kalimba, ' 
    'talking drum, Afrobeat, amapiano, or highlife.'
)


def normalize_text(text: str) -> str:
    return re.sub(r"[^a-z0-9 ]+", ' ', text.lower())


def contains_exact_term(text: str, terms: List[str]) -> bool:
    normalized = normalize_text(text)
    return any(term in normalized for term in terms)


def is_valid_african_prompt(prompt: str) -> bool:
    normalized = normalize_text(prompt)
    return contains_exact_term(normalized, AFRICAN_INSTRUMENTS) or contains_exact_term(normalized, AFRICAN_STYLES)


def sample_instrument_list() -> List[str]:
    return AFRICAN_INSTRUMENTS[:7]
