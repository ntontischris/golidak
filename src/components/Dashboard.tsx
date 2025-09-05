import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CitizenSearch } from '@/components/citizens/CitizenSearch'
import { CitizenManagement } from '@/components/citizens/CitizenManagement'
import { MilitaryManagement } from '@/components/military/MilitaryManagement'
import { RequestManagement } from '@/components/requests/RequestManagement'
import { RemindersManagement } from '@/components/reminders/RemindersManagement'
import { StatisticsDashboard } from '@/components/statistics/StatisticsDashboard'
import { UserManagement } from '@/components/users/UserManagement'
import { 
  Users, 
  Shield, 
  FileText, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus,
  Search,
  Bell
} from 'lucide-react'

type ActiveTab = 'search' | 'citizens' | 'military' | 'requests' | 'reminders' | 'statistics' | 'users'

export const Dashboard: React.FC = () => {
  const { user, userProfile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<ActiveTab>('search')

  const tabs = [
    { id: 'search' as const, name: 'Αναζήτηση Πολιτών', icon: Search },
    { id: 'citizens' as const, name: 'Διαχείριση Πολιτών', icon: Users },
    { id: 'military' as const, name: 'Στρατιωτικό Προσωπικό', icon: Shield },
    { id: 'requests' as const, name: 'Αιτήματα', icon: FileText },
    { id: 'reminders' as const, name: 'Υπενθυμίσεις', icon: Calendar },
    { id: 'statistics' as const, name: 'Στατιστικά', icon: BarChart3 },
    { id: 'users' as const, name: 'Χρήστες', icon: Settings },
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
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">Σύστημα Διαχείρισης Πολιτών</h1>
            <p className="text-sm text-muted-foreground">
              Καλώς ήρθατε, {userProfile?.full_name || user?.email}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Αποσύνδεση
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}