"use client";

export function AnimatedGPU() {
  return (
    <div className="relative w-full flex items-center justify-center">
      {/* Inject CSS keyframes once per instance — negligible cost */}
      <style>{`
        @keyframes gpuFanSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes gpuMetalSweep {
          0%   { left: -150%; }
          30%  { left: 150%; }
          100% { left: 150%; }
        }
      `}</style>

      <div
        className="relative inline-block w-full max-w-[280px] group transition-transform duration-500 scale-[1.30]"
      >
        {/* Glow effect behind the GPU (Original subtle static glow) */}
        <div className="absolute top-[15%] bottom-[15%] left-[30%] right-[30%] bg-primary/40 blur-[15px] rounded-full z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>

        {/* GPU Base */}
        <img
          src="/images/GPU_1024.png"
          alt="GPU Base"
          className="relative z-10 w-full h-auto block drop-shadow-2xl contrast-125 saturate-110"
        />

        {/* Metal Sweep Effect (Lateral Reflection) */}
        <div
          className="absolute inset-0 z-[15] pointer-events-none mix-blend-overlay"
          style={{
            maskImage: 'url(/images/GPU_1024.png)',
            maskSize: '100% 100%',
            WebkitMaskImage: 'url(/images/GPU_1024.png)',
            WebkitMaskSize: '100% 100%',
          }}
        >
          <div
            className="absolute top-0 bottom-0 w-[100%] bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-30deg]"
            style={{
              animation: "gpuMetalSweep 5s ease-in-out infinite",
            }}
          />
        </div>

        {/* Fan Container */}
        <div
          className="absolute z-20 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ top: "68%", width: "28%", aspectRatio: "1/1" }}
        >
          {/* Frame (static) */}
          <img
            src="/images/frame_315.png"
            alt="GPU Frame"
            className="absolute inset-0 w-full h-full object-contain z-20 contrast-125 saturate-105"
          />

          {/* Spinning Fan — pure CSS */}
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <img
              src="/images/fan_315.png"
              alt="GPU Fan"
              className="w-full h-full object-contain contrast-110 saturate-110 opacity-80"
              style={{
                animation: "gpuFanSpin 1.8s linear infinite",
                transformOrigin: "center center",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

