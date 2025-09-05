import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Users, 
  Shield, 
  FileText, 
  Calendar,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface StatisticsData {
  totalCitizens: number
  totalMilitary: number
  totalRequests: number
  totalReminders: number
  
  // Citizens by municipality
  citizensByMunicipality: Record<string, number>
  
  // Military by rank
  militaryByRank: Record<string, number>
  
  // Requests by status
  requestsByStatus: Record<string, number>
  
  // Recent activity
  recentActivity: {
    newCitizens: number
    newMilitary: number
    newRequests: number
    completedRequests: number
  }
  
  // ESSO statistics
  essoStatistics: Record<string, number>
  
  // Electoral districts
  citizensByDistrict: Record<string, number>
  
  // Monthly statistics
  monthlyStats: {
    month: string
    citizens: number
    military: number
    requests: number
  }[]
}

export const StatisticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatisticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  const loadStatistics = async () => {
    setLoading(true)
    try {
      // Get date ranges based on selected time range
      const now = new Date()
      const startDate = new Date()
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }

      // Parallel data fetching
      const [
        citizensRes,
        militaryRes,
        requestsRes,
        remindersRes,
        recentCitizensRes,
        recentMilitaryRes,
        recentRequestsRes,
        completedRequestsRes
      ] = await Promise.all([
        // Total counts
        supabase.from('citizens').select('*'),
        supabase.from('military_personnel').select('*'),
        supabase.from('requests').select('*'),
        supabase.from('reminders').select('*'),
        
        // Recent activity
        supabase.from('citizens').select('*').gte('created_at', startDate.toISOString()),
        supabase.from('military_personnel').select('*').gte('created_at', startDate.toISOString()),
        supabase.from('requests').select('*').gte('created_at', startDate.toISOString()),
        supabase.from('requests').select('*').eq('status', 'ΟΛΟΚΛΗΡΩΘΗΚΕ').gte('updated_at', startDate.toISOString())
      ])

      if (citizensRes.error || militaryRes.error || requestsRes.error || remindersRes.error) {
        console.error('Error loading statistics')
        return
      }

      const citizens = citizensRes.data || []
      const military = militaryRes.data || []
      const requests = requestsRes.data || []
      const reminders = remindersRes.data || []

      // Process data
      const statistics: StatisticsData = {
        totalCitizens: citizens.length,
        totalMilitary: military.length,
        totalRequests: requests.length,
        totalReminders: reminders.length,

        // Citizens by municipality
        citizensByMunicipality: citizens.reduce((acc, citizen) => {
          const municipality = citizen.municipality || 'Άγνωστο'
          acc[municipality] = (acc[municipality] || 0) + 1
          return acc
        }, {} as Record<string, number>),

        // Military by rank
        militaryByRank: military.reduce((acc, person) => {
          const rank = person.rank || 'Άγνωστος'
          acc[rank] = (acc[rank] || 0) + 1
          return acc
        }, {} as Record<string, number>),

        // Requests by status
        requestsByStatus: requests.reduce((acc, request) => {
          acc[request.status] = (acc[request.status] || 0) + 1
          return acc
        }, {} as Record<string, number>),

        // Recent activity
        recentActivity: {
          newCitizens: recentCitizensRes.data?.length || 0,
          newMilitary: recentMilitaryRes.data?.length || 0,
          newRequests: recentRequestsRes.data?.length || 0,
          completedRequests: completedRequestsRes.data?.length || 0
        },

        // ESSO statistics
        essoStatistics: military.reduce((acc, person) => {
          if (person.esso) {
            acc[person.esso] = (acc[person.esso] || 0) + 1
          }
          return acc
        }, {} as Record<string, number>),

        // Citizens by electoral district
        citizensByDistrict: citizens.reduce((acc, citizen) => {
          const district = citizen.electoral_district || 'Άγνωστη'
          acc[district] = (acc[district] || 0) + 1
          return acc
        }, {} as Record<string, number>),

        // Monthly statistics (simplified)
        monthlyStats: []
      }

      setStats(statistics)
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatistics()
  }, [timeRange])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Φόρτωση στατιστικών...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Δεν ήταν δυνατή η φόρτωση των στατιστικών</p>
      </div>
    )
  }

  const timeRangeLabels = {
    week: 'Τελευταία εβδομάδα',
    month: 'Τελευταίος μήνας',
    year: 'Τελευταίος χρόνος'
  }

  const topMunicipalities = Object.entries(stats.citizensByMunicipality)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const topRanks = Object.entries(stats.militaryByRank)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const topESSOTypes = Object.entries(stats.essoStatistics)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  const pendingRequests = stats.requestsByStatus['ΕΚΚΡΕΜΕΙ'] || 0
  const completedRequests = stats.requestsByStatus['ΟΛΟΚΛΗΡΩΘΗΚΕ'] || 0
  const rejectedRequests = stats.requestsByStatus['ΑΠΟΡΡΙΦΘΗΚΕ'] || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Στατιστικά Dashboard
            </span>
            <div className="flex gap-2">
              {Object.entries(timeRangeLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTimeRange(key as any)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeRange === key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Σύνολο Πολιτών</p>
                <p className="text-3xl font-bold">{stats.totalCitizens.toLocaleString('el-GR')}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">
                +{stats.recentActivity.newCitizens} ({timeRangeLabels[timeRange].toLowerCase()})
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Στρατιωτικό Προσωπικό</p>
                <p className="text-3xl font-bold">{stats.totalMilitary.toLocaleString('el-GR')}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">
                +{stats.recentActivity.newMilitary} ({timeRangeLabels[timeRange].toLowerCase()})
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Σύνολο Αιτημάτων</p>
                <p className="text-3xl font-bold">{stats.totalRequests.toLocaleString('el-GR')}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">
                +{stats.recentActivity.newRequests} ({timeRangeLabels[timeRange].toLowerCase()})
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Υπενθυμίσεις</p>
                <p className="text-3xl font-bold">{stats.totalReminders.toLocaleString('el-GR')}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Κατάσταση Αιτημάτων</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50/10 rounded-lg border">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium">Εκκρεμή</p>
                  <p className="text-sm text-muted-foreground">Αναμένουν επεξεργασία</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {pendingRequests.toLocaleString('el-GR')}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50/10 rounded-lg border">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Ολοκληρωμένα</p>
                  <p className="text-sm text-muted-foreground">Επιτυχής ολοκλήρωση</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {completedRequests.toLocaleString('el-GR')}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50/10 rounded-lg border">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium">Απορριφθέντα</p>
                  <p className="text-sm text-muted-foreground">Μη εγκρίθηκαν</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {rejectedRequests.toLocaleString('el-GR')}
              </span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6 p-4 bg-blue-50/10 rounded-lg border">
            <h4 className="font-medium mb-3">Πρόσφατη Δραστηριότητα ({timeRangeLabels[timeRange]})</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.recentActivity.newCitizens}</p>
                <p className="text-muted-foreground">Νέοι πολίτες</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.recentActivity.newMilitary}</p>
                <p className="text-muted-foreground">Νέο στρατιωτικό προσωπικό</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.recentActivity.newRequests}</p>
                <p className="text-muted-foreground">Νέα αιτήματα</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.recentActivity.completedRequests}</p>
                <p className="text-muted-foreground">Ολοκληρώθηκαν</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Κατανομή Πολιτών ανά Δήμο
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topMunicipalities.map(([municipality, count]) => (
                <div key={municipality} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{municipality}</span>
                  <Badge variant="outline">{count.toLocaleString('el-GR')}</Badge>
                </div>
              ))}
            </div>
            {topMunicipalities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Δεν υπάρχουν δεδομένα
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Εκλογικές Περιφέρειες</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.citizensByDistrict).map(([district, count]) => (
                <div key={district} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{district}</span>
                  <Badge variant="outline">{count.toLocaleString('el-GR')}</Badge>
                </div>
              ))}
            </div>
            {Object.keys(stats.citizensByDistrict).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Δεν υπάρχουν δεδομένα
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Military Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Κατανομή ανά Βαθμό
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRanks.map(([rank, count]) => (
                <div key={rank} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{rank}</span>
                  <Badge variant="secondary">{count.toLocaleString('el-GR')}</Badge>
                </div>
              ))}
            </div>
            {topRanks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Δεν υπάρχουν δεδομένα
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ESSO Στατιστικά</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {topESSOTypes.map(([esso, count]) => (
                <div key={esso} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="text-sm font-mono font-bold">{esso}</span>
                  <Badge variant="outline" className="text-xs">{count}</Badge>
                </div>
              ))}
            </div>
            {topESSOTypes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Δεν υπάρχουν δεδομένα ESSO
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}