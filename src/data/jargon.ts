export const jargonDictionary: Record<string, { title: string, definition: string }> = {
  "vram": {
    title: "VRAM (Video RAM)",
    definition: "Dedicated memory on the graphics card. It is the most critical factor for running AI models locally: more VRAM allows running smarter models (with more parameters) without relying on the slower system RAM."
  },
  "cuda cores": {
    title: "CUDA Cores",
    definition: "NVIDIA's general processing cores. They are the 'workers' of the GPU, responsible for performing thousands of calculations simultaneously. More cores mean faster speeds in AI tasks and rendering."
  },
  "tensor cores": {
    title: "Tensor Cores",
    definition: "Specialized cores introduced by NVIDIA focused purely on matrix multiplications (the primary mathematical operation in Deep Learning). They massively multiply AI performance."
  },
  "npu": {
    title: "NPU (Neural Processing Unit)",
    definition: "A specialized chip or circuit designed to accelerate Artificial Intelligence tasks (like background blur or voice recognition) while consuming a fraction of the energy a CPU or GPU would use."
  },
  "tops": {
    title: "TOPS (Tera Operations Per Second)",
    definition: "Theoretical metric indicating how many trillions of mathematical operations the chip can perform per second. It is the standard way to measure NPU performance."
  },
  "memory bandwidth": {
    title: "Memory Bandwidth",
    definition: "The speed at which memory can send data to the graphics processor. In Large Language Models (LLMs), a higher bandwidth means words (tokens) are generated much faster."
  },
  "unified memory": {
    title: "Unified Memory",
    definition: "Architecture (used primarily by Apple) where the CPU and GPU share the same pool of RAM. It allows loading gigantic AI models that wouldn't fit in traditional consumer graphics cards."
  },
  "pcie lanes": {
    title: "PCIe Lanes",
    definition: "The 'highways' where data travels between the rest of the computer and the graphics card. Critical when loading large models into VRAM from storage drives."
  },
  "fp16": {
    title: "FP16 (Half-Precision)",
    definition: "A medium-precision mathematical calculation format. In AI, calculating in FP16 is much faster and consumes less memory than FP32, with almost no loss in model response quality."
  }
};
