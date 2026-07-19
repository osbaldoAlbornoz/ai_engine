// src/data/seoData.ts

export const categorySeoContent: Record<string, { title: string; content: string }> = {
  gpus: {
    title: "AI Hardware 101: How to Choose a GPU for Deep Learning",
    content: `
      <h3>Why is the GPU the most important component for AI?</h3>
      <p>In the world of Artificial Intelligence, Machine Learning, and Deep Learning, the Graphics Processing Unit (GPU) is the undisputed king. Unlike traditional CPUs that have a few very powerful cores designed for sequential processing, GPUs contain thousands of smaller, efficient cores designed for parallel processing. Neural networks—the foundation of modern AI like Large Language Models (LLMs) and Image Generators (Stable Diffusion)—rely on massive matrix multiplications. GPUs can perform these calculations exponentially faster than CPUs.</p>
      
      <h3>VRAM: The Ultimate Bottleneck</h3>
      <p>When selecting a GPU for AI, <strong>Video RAM (VRAM)</strong> is often more critical than raw compute speed (TFLOPS). VRAM dictates the size of the model you can load into memory. For example:</p>
      <ul>
        <li><strong>8GB VRAM:</strong> Good for basic computer vision, small LLMs (e.g., Llama-3 8B quantized), and basic Stable Diffusion.</li>
        <li><strong>12GB - 16GB VRAM:</strong> The sweet spot for enthusiasts. Can comfortably run mid-sized models and train smaller networks (LoRAs).</li>
        <li><strong>24GB VRAM (e.g., RTX 4090, RTX 3090):</strong> The gold standard for home labs. Allows running 70B parameter models (heavily quantized) or training large LoRAs without running Out of Memory (OOM).</li>
        <li><strong>48GB+ (e.g., RTX 6000 Ada, A6000):</strong> Professional workstation tier, required for serious fine-tuning and running uncompressed enterprise models.</li>
      </ul>

      <h3>Tensor Cores vs CUDA Cores</h3>
      <p>NVIDIA dominates the AI hardware market largely due to its software ecosystem (CUDA) and specialized hardware (Tensor Cores). While CUDA cores handle general parallel math, <strong>Tensor Cores</strong> are specifically designed to accelerate matrix multiplications—the exact math AI uses. When buying an AI GPU, newer generations (Ada Lovelace, Hopper) feature significantly faster Tensor Cores compared to older generations, drastically reducing training and inference times.</p>
      
      <h3>Do I need multiple GPUs?</h3>
      <p>If a model is too large to fit in a single GPU's VRAM, you have two choices: offload to system RAM (which is incredibly slow), or split the model across multiple GPUs. Multi-GPU setups require careful consideration of your Power Supply (PSU), PCIe lane availability on your motherboard, and cooling solutions.</p>
    `
  },
  laptops: {
    title: "AI Laptops 101: Portable Machine Learning Workstations",
    content: `
      <h3>Can you do AI on a laptop?</h3>
      <p>Absolutely. While desktop GPUs offer the best price-to-performance ratio, modern laptops equipped with dedicated AI hardware (like NVIDIA RTX Laptop GPUs or Apple Silicon) are highly capable of running inference and light training on the go.</p>
      
      <h3>Apple Silicon (M-Series) vs NVIDIA RTX</h3>
      <p>The laptop AI landscape is currently split into two main philosophies:</p>
      <ul>
        <li><strong>Apple Silicon (M1/M2/M3/M4 Max/Ultra):</strong> Apple's Unified Memory Architecture (UMA) is a game-changer for AI. Because the CPU and GPU share the same massive pool of memory (up to 128GB or 192GB), a MacBook Pro can load massive AI models (like Llama 70B) entirely into memory. The catch? Compute speed is slower than high-end NVIDIA chips.</li>
        <li><strong>NVIDIA RTX Laptops:</strong> These offer superior raw compute speed and full CUDA compatibility (the industry standard). However, you are strictly limited by the dedicated VRAM of the laptop GPU (usually maxing out at 16GB on the RTX 4090 Mobile).</li>
      </ul>

      <h3>What to look for in an AI Laptop</h3>
      <p>If you're buying a laptop primarily for AI development, prioritize Memory/VRAM above all else. For Apple, get as much Unified Memory as your budget allows (32GB minimum, 64GB+ recommended). For PC, aim for a laptop with an RTX 4080 (12GB VRAM) or RTX 4090 (16GB VRAM) Mobile GPU, paired with at least 32GB of system RAM to handle data preprocessing.</p>
    `
  },
  npus: {
    title: "NPUs 101: The Future of Edge AI",
    content: `
      <h3>What is an NPU?</h3>
      <p>A Neural Processing Unit (NPU) is a specialized hardware accelerator designed specifically for artificial intelligence tasks. Unlike CPUs (general purpose) or GPUs (graphics first, parallel math second), NPUs are built from the ground up to execute neural network operations with maximum energy efficiency.</p>
      
      <h3>Why NPUs matter for AI PCs</h3>
      <p>With the rise of "AI PCs" (like Microsoft's Copilot+ PCs), NPUs are being integrated directly into the processor (SoC). Their primary goal isn't to train massive models like GPT-4, but rather to run smaller, background AI tasks (like background blurring in video calls, local text generation, or real-time translation) continuously without draining the battery.</p>
      
      <h3>TOPS: Measuring NPU Performance</h3>
      <p>NPU performance is typically measured in <strong>TOPS (Trillions of Operations Per Second)</strong>. Microsoft dictates that a true "Copilot+ PC" requires an NPU capable of at least 40 TOPS to ensure smooth, local AI experiences without relying on the cloud.</p>
    `
  },
  workstations: {
    title: "AI Workstations 101: Enterprise-Grade Deep Learning",
    content: `
      <h3>Desktop vs Workstation for AI</h3>
      <p>While high-end consumer desktops (using RTX 4090s) are incredible for AI, true enterprise AI Workstations differ in three key areas: <strong>Reliability, Memory Capacity, and Multi-GPU Scaling</strong>.</p>
      
      <h3>The Power of Professional GPUs</h3>
      <p>Workstations utilize professional-grade GPUs like the NVIDIA RTX 6000 Ada Generation or the A100/H100 series. These cards offer massive VRAM pools (48GB, 80GB, or more) and use blower-style coolers designed to be stacked tightly next to each other in 2x, 4x, or even 8x configurations without overheating.</p>
      
      <h3>CPU and Motherboard Considerations</h3>
      <p>In a true AI workstation, the CPU and motherboard must support massive amounts of PCIe lanes (e.g., AMD Threadripper Pro or Intel Xeon) to ensure that multiple GPUs can communicate with each other and the CPU at full PCIe x16 speeds without bottlenecks. Furthermore, they support Error-Correcting Code (ECC) RAM, which prevents data corruption during weeks-long model training runs.</p>
    `
  }
};

export function generateProductFaqs(productName: string, category: string, vram: string | number | null) {
  const faqs = [];
  
  faqs.push({
    question: `Is the ${productName} good for Artificial Intelligence and Deep Learning?`,
    answer: `Yes, the ${productName} is highly capable for AI tasks. Its architecture is well-suited for matrix multiplications, making it efficient for running and, depending on the specifications, training Machine Learning models locally.`
  });

  if (vram) {
    faqs.push({
      question: `How much VRAM does the ${productName} have, and is it enough for AI?`,
      answer: `The ${productName} comes with ${vram} of memory. This dictates the maximum size of the AI model you can load. For reference, an 8GB VRAM card can run 8B parameter models easily, while 24GB+ is recommended for running 70B parameter models or training via LoRA.`
    });
  }

  faqs.push({
    question: `Can I use the ${productName} for Stable Diffusion or Image Generation?`,
    answer: `Absolutely. The ${productName} provides the parallel processing power required for diffusion models. Higher memory configurations will allow you to generate higher resolution images and utilize more complex workflows (like ComfyUI or ControlNet) without running out of memory.`
  });

  if (category === 'gpus') {
    faqs.push({
      question: `Should I buy one ${productName} or multiple cheaper GPUs for AI?`,
      answer: `For AI, it is almost always better to buy a single, more powerful GPU like the ${productName} with the most VRAM you can afford. Multi-GPU setups introduce complexities, PCIe bandwidth bottlenecks, and significantly higher power consumption.`
    });
  }

  return faqs;
}
