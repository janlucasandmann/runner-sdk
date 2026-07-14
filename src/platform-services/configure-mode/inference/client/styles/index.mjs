import { INFERENCE_STYLE_ENDPOINT } from "./endpoint.mjs";
import { INFERENCE_STYLE_LOCAL_RUNNERS } from "./local-runners.mjs";
import { INFERENCE_STYLE_RUNTIME } from "./runtime.mjs";

export const INFERENCE_STYLE_FRAGMENTS = Object.freeze({
  endpoint: INFERENCE_STYLE_ENDPOINT,
  runtime: INFERENCE_STYLE_RUNTIME,
  localRunners: INFERENCE_STYLE_LOCAL_RUNNERS,
});

export const INFERENCE_PAGE_CSS = [
  INFERENCE_STYLE_ENDPOINT,
  "\n",
  INFERENCE_STYLE_RUNTIME,
  "\n",
  INFERENCE_STYLE_LOCAL_RUNNERS,
].join("");
