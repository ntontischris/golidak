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

      // Optimized single-query approach using database functions
      const [
        dashboardStatsRes,
        recentStatsRes
      ] = await Promise.all([
        // Get all main statistics in one optimized query
        supabase.rpc('get_dashboard_stats'),
        
        // Get recent activity stats
        supabase.rpc('get_recent_activity_stats', { 
          start_date: startDate.toISOString()
        })
      ])

      if (dashboardStatsRes.error || recentStatsRes.error) {
        console.error('Error loading statistics:', dashboardStatsRes.error || recentStatsRes.error)
        return
      }

      const dashboardStats = dashboardStatsRes.data || {}
      const recentStats = recentStatsRes.data || {}

      // Process optimized data from database functions
      const statistics: StatisticsData = {
        totalCitizens: dashboardStats.total_citizens || 0,
        totalMilitary: dashboardStats.total_military || 0,
        totalRequests: dashboardStats.total_requests || 0,
        totalReminders: dashboardStats.total_reminders || 0,

        // Pre-aggregated data from database
        citizensByMunicipality: dashboardStats.citizens_by_municipality || {},
        militaryByRank: dashboardStats.military_by_rank || {},
        requestsByStatus: dashboardStats.requests_by_status || {},
        essoStatistics: dashboardStats.esso_statistics || {},
        citizensByDistrict: dashboardStats.citizens_by_district || {},

        // Recent activity from optimized query
        recentActivity: {
          newCitizens: recentStats.new_citizens || 0,
          newMilitary: recentStats.new_military || 0,
          newRequests: recentStats.new_requests || 0,
          completedRequests: recentStats.completed_requests || 0
        },

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
  }, [timeRange]) // eslint-disable-line react-hooks/exhaustive-deps

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