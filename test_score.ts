
import { calculateAIScore } from "./src/utils/scoring";
console.log("RTX 4090:", calculateAIScore({ category: "GPU", name: "NVIDIA RTX 4090", specs: { VRAM: "24 GB", "CUDA Cores": "16384" } }));
console.log("Empty GPU:", calculateAIScore({ category: "GPU", name: "Generic", specs: {} }));

