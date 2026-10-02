from pathlib import Path
from PIL import Image
import numpy as np


# Dataset location
DATASET_DIR = Path("../dataset/deepglobe/train")


# Find satellite images
satellite_images = sorted(
    DATASET_DIR.glob("*_sat.jpg")
)


print("=" * 60)
print("GeoVision AI - Dataset Verification")
print("=" * 60)

print(f"\nDataset path: {DATASET_DIR.resolve()}")
print(f"Satellite images found: {len(satellite_images)}")


if len(satellite_images) == 0:
    print("\n❌ No satellite images found.")
    exit()


# Check first 5 image/mask pairs
print("\nChecking image-mask pairs:\n")


for image_path in satellite_images[:5]:

    mask_path = image_path.parent / (
        image_path.name.replace(
            "_sat.jpg",
            "_mask.png"
        )
    )

    print(f"Satellite : {image_path.name}")
    print(f"Mask      : {mask_path.name}")

    if not mask_path.exists():

        print("❌ MASK NOT FOUND\n")
        continue

    try:

        image = Image.open(image_path)
        mask = Image.open(mask_path)

        print(
            f"Image size : {image.size}"
        )

        print(
            f"Mask size  : {mask.size}"
        )

        # Read mask colors
        mask_array = np.array(
            mask.convert("RGB")
        )

        unique_colors = np.unique(
            mask_array.reshape(-1, 3),
            axis=0
        )

        print(
            f"Mask colors found: "
            f"{len(unique_colors)}"
        )

        print(
            "First colors:",
            unique_colors[:10]
        )

        print("✅ Pair OK\n")

    except Exception as e:

        print(
            f"❌ Error reading files: {e}\n"
        )


print("=" * 60)
print("Verification complete")
print("=" * 60)