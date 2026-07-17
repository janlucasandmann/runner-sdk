import { mountPlatformClient } from "./app/index.js";
import "./app/platform-client.css";

const root = document.getElementById("app");
if (root) {
  mountPlatformClient(root);
}
