import GoogleSvg from "../../../assets/images/googlelogo.svg";

/** Google logo loaded from local SVG asset */
export default function GoogleLogo({ size = 20 }: { size?: number }) {
  return <GoogleSvg width={size} height={size} />;
}
