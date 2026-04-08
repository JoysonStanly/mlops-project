from pathlib import Path

from pipeline.data_generator import build_dataset
from train import train_and_save


if __name__ == '__main__':
    dataset_path = Path('data/dataset.csv')
    if not dataset_path.exists():
        dataset = build_dataset(samples_per_class=200, seed=42)
        dataset_path.parent.mkdir(parents=True, exist_ok=True)
        dataset.to_csv(dataset_path, index=False)

    result = train_and_save(
        dataset_path=dataset_path,
        output_dir=Path('artifacts'),
        model_name='logreg',
    )
    print(result)
