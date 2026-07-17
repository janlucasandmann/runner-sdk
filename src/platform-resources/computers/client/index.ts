export {
  createComputerResourceRepository,
  deleteComputerResource,
  saveComputerResource,
} from "./computer-resource-client.js";
export type {
  ComputerResourceRepository,
  ComputerResourceClientOptions,
  SaveComputerResourceInput,
  SaveComputerResourceOptions,
  SaveComputerResourceResult,
} from "./computer-resource-client.js";
export { useComputerResourceRepository } from "./use-computer-resource-repository.js";
