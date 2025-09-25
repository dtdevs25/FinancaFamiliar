export default function Navigation() {
  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-card/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-wallet text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-semibold text-foreground">FinanFamily</h1>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <button className="text-primary hover:text-primary/80 font-medium flex items-center space-x-2" data-testid="nav-dashboard-desktop">
              <i className="fas fa-home"></i>
              <span>Dashboard</span>
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-2" data-testid="nav-bills-desktop">
              <i className="fas fa-receipt"></i>
              <span>Contas</span>
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-2" data-testid="nav-reports-desktop">
              <i className="fas fa-chart-line"></i>
              <span>Relatórios</span>
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-2" data-testid="nav-calendar-desktop">
              <i className="fas fa-calendar"></i>
              <span>Calendário</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors" data-testid="notifications-button">
              <i className="fas fa-bell"></i>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-medium">D</div>
              <span className="hidden sm:inline text-sm font-medium">Daniel</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
