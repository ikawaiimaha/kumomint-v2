// Inside your Home return...
<header className="mb-12">
  <h1 className="text-4xl heading-italic leading-none">
    Your <span className="text-[var(--accent)]">Orbit</span>
  </h1>
  <div className="flex items-center gap-2 mt-2">
    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Active Voyager</span>
  </div>
</header>

<div className="grid grid-cols-2 gap-4 mb-10">
  {/* Update your Link cards to use .glass-panel and better padding */}
  <Link to="/notifications" className="glass-panel p-6 bg-gradient-to-br from-[var(--bg-card)] to-transparent">
     <Bell className="text-[var(--accent)] mb-3" size={24} />
     <h3 className="text-[10px] font-black uppercase tracking-widest">Signals</h3>
     <p className="text-[7px] font-bold opacity-40">GALAXY IS QUIET</p>
  </Link>
  {/* Repeat for others... */}
</div>
