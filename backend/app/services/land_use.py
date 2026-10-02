import cv2
import numpy as np
import base64


LABELS = [
    "Water",
    "Crops / Vegetation",
    "Desert / Dry Land",
    "Roads / Buildings",
    "Other Land"
]

COLORS = [
    [0, 120, 255],      # Water
    [50, 190, 70],      # Crops
    [220, 170, 70],     # Dry land
    [140, 140, 140],    # Roads / buildings
    [180, 180, 100]     # Other
]


def image_to_base64(image):

    success, buffer = cv2.imencode(
        ".png",
        cv2.cvtColor(
            image,
            cv2.COLOR_RGB2BGR
        )
    )

    if not success:
        raise RuntimeError(
            "Could not encode image"
        )

    return base64.b64encode(
        buffer.tobytes()
    ).decode("utf-8")


def mask_to_base64(mask):

    success, buffer = cv2.imencode(
        ".png",
        mask
    )

    if not success:
        raise RuntimeError(
            "Could not encode mask"
        )

    return base64.b64encode(
        buffer.tobytes()
    ).decode("utf-8")


def analyze_land_use(image):

    # PIL → RGB NumPy
    rgb = np.array(
        image.convert("RGB")
    )

    # RGB → HSV
    hsv = cv2.cvtColor(
        rgb,
        cv2.COLOR_RGB2HSV
    )

    # --------------------------------------------------------
    # Water
    # --------------------------------------------------------

    water_mask = cv2.inRange(
        hsv,
        np.array([85, 40, 40]),
        np.array([135, 255, 255])
    )

    # --------------------------------------------------------
    # Crops / Vegetation
    # --------------------------------------------------------

    crop_mask = cv2.inRange(
        hsv,
        np.array([25, 35, 30]),
        np.array([85, 255, 255])
    )

    # --------------------------------------------------------
    # Desert / Dry Land
    # --------------------------------------------------------

    desert_mask = cv2.inRange(
        hsv,
        np.array([10, 40, 50]),
        np.array([35, 255, 230])
    )

    # --------------------------------------------------------
    # Roads / Buildings
    # --------------------------------------------------------

    gray_mask = cv2.inRange(
        hsv,
        np.array([0, 0, 40]),
        np.array([180, 45, 210])
    )

    # --------------------------------------------------------
    # Remove overlap
    # --------------------------------------------------------

    remaining = np.ones(
        hsv.shape[:2],
        dtype=np.uint8
    ) * 255

    def assign(mask):

        nonlocal remaining

        clean = cv2.bitwise_and(
            mask,
            remaining
        )

        remaining[clean > 0] = 0

        return clean

    water_mask = assign(water_mask)
    crop_mask = assign(crop_mask)
    desert_mask = assign(desert_mask)
    gray_mask = assign(gray_mask)

    other_mask = remaining

    masks = [
        water_mask,
        crop_mask,
        desert_mask,
        gray_mask,
        other_mask
    ]

    # --------------------------------------------------------
    # Pixel statistics
    # --------------------------------------------------------

    total_pixels = (
        rgb.shape[0] *
        rgb.shape[1]
    )

    counts = [
        int(cv2.countNonZero(mask))
        for mask in masks
    ]

    percentages = [
        count / total_pixels * 100
        for count in counts
    ]

    # --------------------------------------------------------
    # Classification map
    # --------------------------------------------------------

    classification = np.zeros_like(
        rgb,
        dtype=np.uint8
    )

    for mask, color in zip(
        masks,
        COLORS
    ):
        classification[mask > 0] = color

    # --------------------------------------------------------
    # Overlay
    # --------------------------------------------------------

    overlay = cv2.addWeighted(
        rgb,
        0.55,
        classification,
        0.45,
        0
    )

    # --------------------------------------------------------
    # Category information
    # --------------------------------------------------------

    categories = []

    for label, count, percentage in zip(
        LABELS,
        counts,
        percentages
    ):
        categories.append({
            "name": label,
            "pixels": count,
            "percentage": round(
                float(percentage),
                2
            )
        })

    return {
        "categories": categories,
        "total_pixels": total_pixels,

        "water_percentage": round(
            float(percentages[0]),
            2
        ),

        "land_percentage": round(
            float(100 - percentages[0]),
            2
        ),

        # Images for React
        "classification_image": image_to_base64(
            classification
        ),

        "overlay_image": image_to_base64(
            overlay
        ),

        "water_mask": mask_to_base64(
            water_mask
        ),

        "crop_mask": mask_to_base64(
            crop_mask
        )
    }