export function AuthBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Deep Institutional Gradient Backdrop */}
      <div className="absolute inset-0 bg-[#070B14]" />

      {/* Subtle Financial Radial Glows */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-cyan-950/20 rounded-full blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-[650px] h-[650px] bg-indigo-950/25 rounded-full blur-[140px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-slate-900/30 rounded-full blur-[160px]" />

      {/* Institutional Micro-Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #06b6d4 1px, transparent 1px),
            linear-gradient(to bottom, #06b6d4 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Restrained Depth Geometry Lines (respects prefers-reduced-motion) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.07] stroke-cyan-500" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="auth-isometric-grid" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M 0 60 L 60 0 L 120 60 L 60 120 Z" fill="none" strokeWidth="0.75" />
            <circle cx="60" cy="60" r="1.5" fill="#06b6d4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-isometric-grid)" />
      </svg>

      {/* Subtle vignette border to keep focus on form card */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,11,20,0.75)_100%)]" />
    </div>
  )
}
