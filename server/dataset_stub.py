from typing import Dict, List

DATASETS = [
    {
        'name': 'NSynth',
        'description': 'A large-scale dataset of musical notes from diverse instruments suitable for synthesis research.',
        'sourceUrl': 'https://magenta.tensorflow.org/datasets/nsynth',
    },
    {
        'name': 'IRMAS',
        'description': 'A dataset for instrument recognition with labeled audio snippets across many musical instruments.',
        'sourceUrl': 'https://www.upf.edu/web/mtg/irmas',
    },
    {
        'name': 'MedleyDB',
        'description': 'A multitrack dataset with instrument stems and annotations for source separation and analysis.',
        'sourceUrl': 'https://medleydb.weebly.com/',
    },
    {
        'name': 'Kaggle Instrument Sounds',
        'description': 'A collection of instrument samples from Kaggle for model training and evaluation.',
        'sourceUrl': 'https://www.kaggle.com/datasets',
    },
]


def get_dataset_summary() -> Dict[str, List]:
    return {
        'datasets': DATASETS,
        'sampleInstruments': [
            'djembe',
            'kora',
            'mbira',
            'kalimba',
            'talking drum',
            'shaker',
            'ngoni',
        ],
        'sampleStyles': [
            'afro-house',
            'afrobeat',
            'amapiano',
            'highlife',
            'soukous',
        ],
    }


def load_dataset(name: str) -> Dict[str, str]:
    for dataset in DATASETS:
        if dataset['name'].lower() == name.lower():
            return {
                'status': 'loaded',
                'message': f"Dataset '{dataset['name']}' is available for future model integration.",
            }

    return {
        'status': 'failed',
        'message': f"Dataset '{name}' is not recognized. Choose one of the available datasets.",
    }
