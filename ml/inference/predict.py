from pathlib import Path
import sys

import cv2
import numpy as np
import torch

# Allow importing model.py from training
TRAINING_DIR = Path(__file__).resolve().parent.parent / "training"
sys.path.append(str(TRAINING_DIR))

from model import create_model


# --------------------------------------------------
# Configuration
# --------------------------------------------------

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "trained_models"
    / "geovision_unet.pth"
)

IMAGE_SIZE = 256


# --------------------------------------------------
# Class information
# --------------------------------------------------

CLASS_NAMES = {
    0: "Urban",
    1: "Agriculture",
    2: "Rangeland",
    3: "Forest",
    4: "Water",
    5: "Barren",
    6: "Unknown",
}


# --------------------------------------------------
# Load model
# --------------------------------------------------

def load_model():

    model = create_model()

    model.load_state_dict(
        torch.load(
            MODEL_PATH,
            map_location=DEVICE
        )
    )

    model = model.to(DEVICE)

    model.eval()

    return model


# --------------------------------------------------
# Predict
# --------------------------------------------------

def predict(image_path):

    image = cv2.imread(str(image_path))

    if image is None:
        raise RuntimeError(
            f"Could not read image: {image_path}"
        )

    image = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    image = cv2.resize(
        image,
        (IMAGE_SIZE, IMAGE_SIZE)
    )

    image = image.astype(
        np.float32
    ) / 255.0

    image = np.transpose(
        image,
        (2, 0, 1)
    )

    image = torch.tensor(
        image,
        dtype=torch.float32
    )

    image = image.unsqueeze(0)

    image = image.to(DEVICE)

    model = load_model()

    with torch.no_grad():

        output = model(image)

        prediction = torch.argmax(
            output,
            dim=1
        )

    return prediction.squeeze(0).cpu().numpy()


# --------------------------------------------------
# Main test
# --------------------------------------------------

if __name__ == "__main__":

    print("=" * 60)
    print("GeoVision AI - Inference Test")
    print("=" * 60)

    print("Device:", DEVICE)
    print("Model:", MODEL_PATH)

    # Use one dataset image for testing
    dataset_dir = (
        Path(__file__).resolve().parent.parent
        / "dataset"
        / "deepglobe"
        / "train"
    )

    image_path = next(
        dataset_dir.glob("*_sat.jpg")
    )

    print("Test image:", image_path.name)

    prediction = predict(image_path)

    print()
    print("Prediction shape:", prediction.shape)

    unique_classes = np.unique(prediction)

    print("Predicted class IDs:")

    for class_id in unique_classes:

        print(
            f"  {class_id} → "
            f"{CLASS_NAMES[int(class_id)]}"
        )

    print()
    print("✅ Inference test completed!")