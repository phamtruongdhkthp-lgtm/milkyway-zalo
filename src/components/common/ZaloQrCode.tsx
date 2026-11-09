import React, { useMemo } from 'react';

interface ZaloQrCodeProps {
  value?: string;
  size?: number;
  showScanBeam?: boolean;
  isExpired?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export const ZaloQrCode: React.FC<ZaloQrCodeProps> = ({
  value = 'zalo-auth-session-token',
  size = 200,
  showScanBeam = true,
  isExpired = false,
  onRefresh,
  className = ''
}) => {
  // Generate deterministic 25x25 QR matrix based on value seed
  const matrix = useMemo(() => {
    const N = 25;
    const grid: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));

    // Simple hash function for pseudo-random data modules
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }

    const prng = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    // Helper to draw 7x7 finder pattern
    const drawFinder = (startRow: number, startCol: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
          const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[startRow + r][startCol + c] = isOuter || isCenter;
        }
      }
    };

    // Draw 3 finder patterns
    drawFinder(0, 0); // Top-Left
    drawFinder(0, N - 7); // Top-Right
    drawFinder(N - 7, 0); // Bottom-Left

    // Draw timing patterns
    for (let i = 8; i < N - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // Reserved center zone for Zalo Logo badge (9x9 modules around center)
    const centerStart = Math.floor(N / 2) - 3;
    const centerEnd = Math.floor(N / 2) + 3;

    // Fill remaining data area with pseudo-random modules
    let step = 1;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        // Skip finders and separators (8x8 corners)
        if (
          (r <= 7 && c <= 7) ||
          (r <= 7 && c >= N - 8) ||
          (r >= N - 8 && c <= 7)
        ) {
          continue;
        }
        // Skip timing patterns
        if (r === 6 || c === 6) continue;

        // Skip center logo zone
        if (r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd) {
          grid[r][c] = false;
          continue;
        }

        // Fill with hash-dependent pseudo-random bit
        step++;
        const rand = prng(hash + step * 31);
        grid[r][c] = rand > 0.48;
      }
    }

    return grid;
  }, [value]);

  const N = matrix.length;
  const cellSize = size / N;

  return (
    <div
      className={`relative inline-block bg-white p-3.5 rounded-2xl shadow-xl overflow-hidden select-none ${className}`}
      style={{ width: size + 28, height: size + 28 }}
    >
      {/* SVG QR Code Matrix */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full block"
      >
        <rect width={size} height={size} fill="#ffffff" />
        {matrix.map((row, r) =>
          row.map((filled, c) => {
            if (!filled) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize + 0.2}
                height={cellSize + 0.2}
                fill="#0f172a"
                rx={cellSize > 8 ? 1 : 0}
              />
            );
          })
        )}
      </svg>

      {/* Central Authentic Zalo Icon Badge */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-1 shadow-md border border-slate-200 flex items-center justify-center pointer-events-none"
        style={{ width: size * 0.24, height: size * 0.24 }}
      >
        <div className="w-full h-full rounded-lg bg-[#0068ff] flex items-center justify-center shadow-inner">
          <span className="text-white font-black text-sm tracking-tighter select-none font-sans">
            Zalo
          </span>
        </div>
      </div>

      {/* Futuristic Laser Scan Animation */}
      {showScanBeam && !isExpired && (
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#0068ff] to-transparent shadow-[0_0_12px_#0068ff] animate-[scan_2.5s_ease-in-out_infinite] pointer-events-none opacity-80" />
      )}

      {/* Expired Overlay */}
      {isExpired && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center">
          <p className="text-xs text-rose-300 font-semibold mb-2">Mã QR đã hết hạn</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1.5 rounded-lg bg-[#0068ff] hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
            >
              <span>Lấy mã mới</span>
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 12px; opacity: 0; }
          15% { opacity: 0.9; }
          50% { top: calc(100% - 16px); opacity: 0.9; }
          85% { opacity: 0.9; }
          100% { top: 12px; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
