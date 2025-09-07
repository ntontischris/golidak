import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { CitizenSearch } from '@/components/citizens/CitizenSearch'
import { CitizenManagement } from '@/components/citizens/CitizenManagement'
import { MilitaryManagement } from '@/components/military/MilitaryManagement'
import { RequestManagement } from '@/components/requests/RequestManagement'
import { RemindersManagement } from '@/components/reminders/RemindersManagement'
import { StatisticsDashboard } from '@/components/statistics/StatisticsDashboard'
import { UserManagement } from '@/components/users/UserManagement'
import AdminPanel from '@/components/admin/AdminPanel'
import { 
  Users, 
  Shield, 
  FileText, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut,
  Search,
  Crown
} from 'lucide-react'

type ActiveTab = 'search' | 'citizens' | 'military' | 'requests' | 'reminders' | 'statistics' | 'users' | 'admin'

export const Dashboard: React.FC = () => {
  const { user, userProfile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<ActiveTab>('search')

  // Κρυφό keyboard shortcut για admin panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        setActiveTab('admin')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const tabs = [
    { id: 'search' as const, name: 'Αναζήτηση Πολιτών', icon: Search },
    { id: 'citizens' as const, name: 'Διαχείριση Πολιτών', icon: Users },
    { id: 'military' as const, name: 'Στρατιωτικό Προσωπικό', icon: Shield },
    { id: 'requests' as const, name: 'Αιτήματα', icon: FileText },
    { id: 'reminders' as const, name: 'Υπενθυμίσεις', icon: Calendar },
    { id: 'statistics' as const, name: 'Στατιστικά', icon: BarChart3 },
    { id: 'users' as const, name: 'Χρήστες', icon: Settings },
    { id: 'admin' as const, name: 'Admin Panel', icon: Crown, adminOnly: true },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return <CitizenSearch />
      
      case 'citizens':
        return <CitizenManagement />
      
      case 'military':
        return <MilitaryManagement />
      
      case 'requests':
        return <RequestManagement />
      
      case 'reminders':
        return <RemindersManagement />
      
      case 'statistics':
        return <StatisticsDashboard />
      
      case 'users':
        return <UserManagement />
      
      case 'admin':
        return <AdminPanel />
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-domotic">
      {/* Modern Header with Glass Effect */}
      <header className="glass-card border-0 border-b border-card-border backdrop-blur-xl bg-card/60 sticky top-0 z-50">
        <div className="container-responsive">
          <div className="flex items-center justify-between py-4 lg:py-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gradient-primary">
                  Domotic Assistant
                </h1>
                <p className="text-sm text-foreground-muted">
                  Καλώς ήρθατε, {userProfile?.full_name || user?.email}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Mobile menu button */}
              <button 
                className="lg:hidden p-2 glass-card"
                onClick={() => {/* Toggle mobile menu */}}
              >
                <Settings className="h-5 w-5" />
              </button>
              
              <Button 
                variant="outline" 
                onClick={signOut}
                className="glass-card border-card-border hover:border-border-hover transition-all duration-300"
              >
                <LogOut className="h-4 w-4 mr-0 lg:mr-2" />
                <span className="hidden sm:inline">Αποσύνδεση</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Modern Sidebar with Glass Effect */}
        <aside className="hidden lg:block w-72 xl:w-80 glass-card border-0 border-r border-card-border min-h-[calc(100vh-89px)] backdrop-blur-xl bg-card/40">
          <div className="section-padding">
            {/* Sidebar Header */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-2">Κεντρικός Έλεγχος</h2>
              <p className="text-sm text-muted-foreground">Διαχείριση συστήματος</p>
            </div>
            
            {/* Navigation Menu */}
            <nav className="sidebar-nav">
              {tabs.map((tab) => {
                // Κρύψε το Admin Panel για μη-admin χρήστες
                if (tab.adminOnly && userProfile?.role !== 'ADMIN') {
                  return null
                }
                
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`sidebar-nav-item animate-fade-in-up ${
                      activeTab === tab.id ? 'active' : ''
                    } ${tab.adminOnly ? 'border border-destructive/50 bg-destructive/5' : ''}`}
                  >
                    <div className="p-2 rounded-lg bg-card/30">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{tab.name}</span>
                    {tab.adminOnly && (
                      <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded-full ml-auto">
                        ADMIN
                      </span>
                    )}
                  </button>
                )
              })}
              
              {/* Status Indicator */}
              <div className="mt-8 p-4 glass-card bg-success/10 border-success/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse-glow"></div>
                  <div>
                    <p className="text-sm font-medium text-success">Σύστημα Ενεργό</p>
                    <p className="text-xs text-success/70">Όλες οι υπηρεσίες λειτουργούν</p>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 section-padding">
          <div className="container-responsive max-w-none">
            {/* Content Header */}
            <div className="mb-6 lg:mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-primary to-accent rounded-full"></div>
            </div>
            
            {/* Content Container */}
            <div className="animate-fade-in-up">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass-card bg-card/90 backdrop-blur-xl border-0 border-t border-card-border">
        <div className="flex justify-around py-2">
          {tabs.slice(0, 5).map((tab) => {
            if (tab.adminOnly && userProfile?.role !== 'ADMIN') {
              return null
            }
            
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{tab.name.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}