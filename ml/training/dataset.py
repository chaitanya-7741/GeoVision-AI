from pathlib import Path

import cv2
import numpy as np
import torch
from torch.utils.data import Dataset


CLASS_COLORS = {
    0: (0, 255, 255),      # Urban
    1: (255, 255, 0),      # Agriculture
    2: (255, 0, 255),      # Rangeland
    3: (0, 255, 0),        # Forest
    4: (0, 0, 255),        # Water
    5: (255, 255, 255),    # Barren
    6: (0, 0, 0),          # Unknown
}


class DeepGlobeDataset(Dataset):

    def __init__(self, root_dir, image_size=512):
        self.root_dir = Path(root_dir)
        self.image_size = image_size

        self.images = sorted(
            self.root_dir.glob("*_sat.jpg")
        )

        if not self.images:
            raise RuntimeError(
                f"No satellite images found in {self.root_dir}"
            )

    def __len__(self):
        return len(self.images)

    def mask_to_class(self, mask):

        class_mask = np.full(
            mask.shape[:2],
            6,
            dtype=np.uint8
        )

        for class_id, color in CLASS_COLORS.items():

            matches = np.all(
                mask == np.array(color),
                axis=2
            )

            class_mask[matches] = class_id

        return class_mask

    def __getitem__(self, index):

        image_path = self.images[index]

        mask_path = image_path.parent / (
            image_path.name.replace(
                "_sat.jpg",
                "_mask.png"
            )
        )

        image = cv2.imread(
            str(image_path)
        )

        image = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2RGB
        )

        mask = cv2.imread(
            str(mask_path)
        )

        mask = cv2.cvtColor(
            mask,
            cv2.COLOR_BGR2RGB
        )

        image = cv2.resize(
            image,
            (self.image_size, self.image_size)
        )

        mask = cv2.resize(
            mask,
            (self.image_size, self.image_size),
            interpolation=cv2.INTER_NEAREST
        )

        mask = self.mask_to_class(mask)

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

        mask = torch.tensor(
            mask,
            dtype=torch.long
        )

        return image, mask