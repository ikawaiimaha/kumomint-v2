        {/* MAIN PROFILE CARD */}
        <div className="bg-[#EAE4FF] rounded-[32px] p-6 shadow-xl shadow-[var(--accent)]/10 relative overflow-hidden text-[#1A1A1A] z-10 mt-12">
          {/* subtle mint background blur */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-[var(--accent)] opacity-20 blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-6 mb-8 relative z-10">
            {/* Added shrink-0 to prevent squishing */}
            <div className="w-24 h-24 shrink-0 rounded-full border-2 border-[var(--accent)] flex items-center justify-center shadow-[0_0_15px_rgba(163,137,244,0.3)] bg-white relative">
              <span className="text-4xl font-black text-[var(--accent)]">{username.charAt(0)}</span>
              <button onClick={() => navigate('/edit-profile')} className="absolute -bottom-2 -right-2 p-1.5 bg-[var(--accent)] text-white rounded-full">
                <Edit3 size={14} />
              </button>
            </div>

            {/* Added pr-12 to keep text away from the absolute gear icon */}
            <div className="flex-1 pr-12">
              <h2 className="text-2xl font-black mb-1 break-all">{username}</h2>
              {/* Pronouns and Buddy will go here later! */}
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> Syncing with Stars
              </p>
            </div>

            {/* GEAR ICON: Now absolutely positioned to the top right corner */}
            <button 
              onClick={() => navigate('/edit-profile')}
              className="absolute top-0 right-0 p-3 bg-white/60 text-[var(--accent)] rounded-2xl"
            >
              <Settings size={20} />
            </button>
          </div>

          {/* ... Rest of the stats and logout button remain exactly the same ... */}
