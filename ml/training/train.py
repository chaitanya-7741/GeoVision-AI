import torch
from torch.utils.data import DataLoader, random_split

from dataset import DeepGlobeDataset
from model import create_model


# --------------------------------------------------
# Configuration
# --------------------------------------------------

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

IMAGE_SIZE = 512
BATCH_SIZE = 1
EPOCHS = 5

DATASET_PATH = "../dataset/deepglobe/train"

TRAIN_RATIO = 0.83


# --------------------------------------------------
# Dataset
# --------------------------------------------------
dataset = DeepGlobeDataset(
    DATASET_PATH,
    image_size=IMAGE_SIZE
)

# Temporary fast training test
dataset.images = dataset.images[:120]
print("Total images:", len(dataset))


# --------------------------------------------------
# Train / Validation Split
# --------------------------------------------------

train_size = int(TRAIN_RATIO * len(dataset))
val_size = len(dataset) - train_size

train_dataset, val_dataset = random_split(
    dataset,
    [train_size, val_size],
    generator=torch.Generator().manual_seed(42)
)

print("Training images:", len(train_dataset))
print("Validation images:", len(val_dataset))


# --------------------------------------------------
# DataLoaders
# --------------------------------------------------

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)


# --------------------------------------------------
# Model
# --------------------------------------------------

model = create_model()
model = model.to(DEVICE)


# --------------------------------------------------
# Loss and Optimizer
# --------------------------------------------------

loss_function = torch.nn.CrossEntropyLoss(
    ignore_index=6
)

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.0001
)


# --------------------------------------------------
# Training
# --------------------------------------------------

print()
print("=" * 60)
print("GeoVision AI - U-Net Training")
print("=" * 60)
print("Device:", DEVICE)
print("Image size:", IMAGE_SIZE)
print("Batch size:", BATCH_SIZE)
print("Epochs:", EPOCHS)
print("=" * 60)


for epoch in range(EPOCHS):

    # -----------------------------
    # Training
    # -----------------------------

    model.train()

    train_loss = 0.0

    for images, masks in train_loader:

        images = images.to(DEVICE)
        masks = masks.to(DEVICE)

        optimizer.zero_grad()

        outputs = model(images)

        loss = loss_function(
            outputs,
            masks
        )

        loss.backward()

        optimizer.step()

        train_loss += loss.item()

    average_train_loss = (
        train_loss / len(train_loader)
    )


    # -----------------------------
    # Validation
    # -----------------------------

    model.eval()

    val_loss = 0.0

    with torch.no_grad():

        for images, masks in val_loader:

            images = images.to(DEVICE)
            masks = masks.to(DEVICE)

            outputs = model(images)

            loss = loss_function(
                outputs,
                masks
            )

            val_loss += loss.item()

    average_val_loss = (
        val_loss / len(val_loader)
    )


    # -----------------------------
    # Results
    # -----------------------------

    print(
        f"Epoch {epoch + 1}/{EPOCHS} "
        f"- Train Loss: {average_train_loss:.4f} "
        f"- Val Loss: {average_val_loss:.4f}"
    )


# --------------------------------------------------
# Save Model
# --------------------------------------------------

torch.save(
    model.state_dict(),
    "../trained_models/geovision_unet.pth"
)

print()
print("✅ Model saved successfully!")
print(
    "Location: ../trained_models/geovision_unet.pth"
)