from dataset import DeepGlobeDataset
import torch

DATASET_PATH = "../dataset/deepglobe/train"

print("=" * 60)
print("GeoVision AI - Dataset Loader Test")
print("=" * 60)

dataset = DeepGlobeDataset(
    DATASET_PATH,
    image_size=512
)

print("Total images:", len(dataset))

# Load first image
image, mask = dataset[0]

print()
print("Image information:")
print("Shape:", image.shape)
print("Data type:", image.dtype)
print("Minimum:", image.min().item())
print("Maximum:", image.max().item())

print()
print("Mask information:")
print("Shape:", mask.shape)
print("Data type:", mask.dtype)

# Find classes present in this mask
classes = torch.unique(mask)

print("Classes present:", classes.tolist())

print()
print("Expected:")
print("Image shape: [3, 512, 512]")
print("Mask shape : [512, 512]")
print("Image range: 0.0 - 1.0")
print("Class IDs  : 0 - 6")

print()
print("✅ Dataset loader test completed!")