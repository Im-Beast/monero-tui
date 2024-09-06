import { Block } from "@tui/nice";
import { View, view } from "../../mod.ts";

export async function Popup(
  previousView: View,
  component: (resolve: () => void, reject: (err?: unknown) => void) => Block,
) {
  return await new Promise<void>((resolve, reject) => {
    view.set(() => component(resolve, reject));
  })
    .then(() => {
      view.set(previousView);
    })
    .catch((error) => {
      view.set(previousView);
      return Promise.reject(error);
    });
}
