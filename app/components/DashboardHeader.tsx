"use client";

interface DashboardHeaderProps {
  toggleSidebar?: () => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

export default function DashboardHeader({ 
  toggleSidebar, 
  isDarkMode = false, 
  toggleDarkMode
}: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="hamburger-btn" aria-label="Menu Navigasi" onClick={toggleSidebar}>
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      <div className="header-actions">
        {/* Animated Sliding Theme Switch */}
        <button 
          type="button"
          className={`theme-sliding-switch ${isDarkMode ? "dark" : "light"}`}
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
          title={isDarkMode ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
        >
          <div className="theme-switch-track">
            {/* Sun Icon */}
            <span className="theme-switch-icon sun-icon">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" strokeWidth="2" fill="currentColor" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            </span>

            {/* Moon Icon */}
            <span className="theme-switch-icon moon-icon">
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" fill="currentColor" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </span>

            {/* Sliding Thumb */}
            <div className="theme-switch-thumb">
              {isDarkMode ? (
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" fill="currentColor" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3.5" strokeWidth="2" fill="#f59e0b" stroke="#f59e0b" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="#f59e0b" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              )}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
