import torch
import segmentation_models_pytorch as smp


NUM_CLASSES = 7


def create_model():
    model = smp.Unet(
        encoder_name="resnet34",
        encoder_weights=None,
        in_channels=3,
        classes=NUM_CLASSES,
    )

    return model


if __name__ == "__main__":

    print("=" * 60)
    print("GeoVision AI - U-Net Model Test")
    print("=" * 60)

    model = create_model()

    print("\nModel created successfully!")
    print("Architecture: U-Net")
    print("Encoder: ResNet34")
    print("Input channels: 3")
    print("Output classes:", NUM_CLASSES)

    # Test with a fake satellite image
    test_input = torch.randn(1, 3, 512, 512)

    with torch.no_grad():
        output = model(test_input)

    print("\nInput shape :", test_input.shape)
    print("Output shape:", output.shape)

    print("\nExpected output:")
    print("torch.Size([1, 7, 512, 512])")

    if output.shape == (1, 7, 512, 512):
        print("\n✅ U-Net model test PASSED!")
    else:
        print("\n❌ Unexpected output shape!")