import { Redirect } from "expo-router";

/**
 * Phantom route for the center FAB tab in the main tab bar.
 * The FAB button entirely replaces the tab touch target and navigates
 * imperatively to /orders/create — this screen is never normally rendered.
 * If a user navigates here directly the redirect ensures they land on the
 * create-order flow.
 */
export default function NewBillPhantom() {
  return <Redirect href="/orders/create" />;
}
