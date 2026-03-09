import { Image } from "expo-image";

/** Google logo loaded from local SVG asset */
export default function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Image
      source={require("../../../assets/images/googlelogo.svg")}
      style={{ width: size, height: size }}
      contentFit="contain"
    />
  );
}
