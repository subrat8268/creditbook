import { Redirect } from "expo-router";

export default function CreateCustomerRoute() {
  return <Redirect href={{ pathname: "/(main)/people", params: { action: "add" } }} />;
}
