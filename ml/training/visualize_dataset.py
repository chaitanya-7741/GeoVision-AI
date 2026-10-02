from pathlib import Path
from PIL import Image
import matplotlib.pyplot as plt

DATASET_DIR = Path("../dataset/deepglobe/train")

# Pick one sample
sat_path = next(DATASET_DIR.glob("*_sat.jpg"))
mask_path = DATASET_DIR / sat_path.name.replace("_sat.jpg", "_mask.png")

satellite = Image.open(sat_path)
mask = Image.open(mask_path)

print("Satellite:", sat_path.name)
print("Mask:", mask_path.name)
print("Satellite size:", satellite.size)
print("Mask size:", mask.size)

plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
plt.imshow(satellite)
plt.title("Satellite Image")
plt.axis("off")

plt.subplot(1, 2, 2)
plt.imshow(mask)
plt.title("Ground Truth Mask")
plt.axis("off")

plt.tight_layout()
plt.show()