import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Request, RequestStatus } from '@/types'
import { RequestForm } from './RequestForm'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FileText, Plus, Edit, Trash2, Eye, Filter, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type ViewMode = 'list' | 'form' | 'view'

interface RequestWithDetails extends Request {
  citizen?: {
    surname: string
    name: string
    mobile_phone?: string
  }
  military_personnel?: {
    surname: string
    name: string
    rank?: string
    esso?: string
  }
}

export const RequestManagement: React.FC = () => {
  const [requests, setRequests] = useState<RequestWithDetails[]>([])
  const [selectedRequest, setSelectedRequest] = useState<RequestWithDetails | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [loading, setLoading] = useState(false)
  
  const [filters, setFilters] = useState({
    status: '' as RequestStatus | '',
    request_type: '',
    search: ''
  })

  const statusConfig = {
    'ΕΚΚΡΕΜΕΙ': { 
      label: 'Εκκρεμεί', 
      variant: 'warning' as const, 
      icon: Clock,
      color: 'text-yellow-600'
    },
    'ΟΛΟΚΛΗΡΩΘΗΚΕ': { 
      label: 'Ολοκληρώθηκε', 
      variant: 'success' as const, 
      icon: CheckCircle,
      color: 'text-green-600'
    },
    'ΑΠΟΡΡΙΦΘΗΚΕ': { 
      label: 'Απορρίφθηκε', 
      variant: 'destructive' as const, 
      icon: AlertCircle,
      color: 'text-red-600'
    }
  }

  const loadRequests = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('requests')
        .select(`
          *,
          citizens:citizen_id (
            surname,
            name,
            mobile_phone
          ),
          military_personnel:military_personnel_id (
            surname,
            name,
            rank,
            esso
          )
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.request_type) {
        query = query.ilike('request_type', `%${filters.request_type}%`)
      }
      if (filters.search) {
        query = query.ilike('description', `%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading requests:', error)
        return
      }

      // Transform the data to flatten citizen/military info
      const transformedData = data?.map(request => ({
        ...request,
        citizen: request.citizens,
        military_personnel: request.military_personnel
      })) || []

      setRequests(transformedData)
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [filters])

  // Check for pending requests over 25 days
  const checkPendingRequests = () => {
    const now = new Date()
    const overdueDays = 25

    return requests.filter(request => {
      if (request.status !== 'ΕΚΚΡΕΜΕΙ' || !request.send_date) return false
      
      const sendDate = new Date(request.send_date)
      const diffTime = Math.abs(now.getTime() - sendDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return diffDays >= overdueDays
    })
  }

  const overdueRequests = checkPendingRequests()

  const handleAddNew = () => {
    setSelectedRequest(null)
    setViewMode('form')
  }

  const handleEdit = (request: RequestWithDetails) => {
    setSelectedRequest(request)
    setViewMode('form')
  }

  const handleView = (request: RequestWithDetails) => {
    setSelectedRequest(request)
    setViewMode('view')
  }

  const handleDelete = async (request: RequestWithDetails) => {
    if (!window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε το αίτημα "${request.request_type}";`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', request.id)

      if (error) {
        console.error('Error deleting request:', error)
        return
      }

      await loadRequests()
    } catch (error) {
      console.error('Error deleting request:', error)
    }
  }

  const handleSave = async () => {
    await loadRequests()
    setViewMode('list')
  }

  const handleCancel = () => {
    setSelectedRequest(null)
    setViewMode('list')
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      request_type: '',
      search: ''
    })
  }

  const getRequesterName = (request: RequestWithDetails) => {
    if (request.citizen) {
      return `${request.citizen.surname} ${request.citizen.name}`
    }
    if (request.military_personnel) {
      const rank = request.military_personnel.rank ? `${request.military_personnel.rank} ` : ''
      return `${rank}${request.military_personnel.surname} ${request.military_personnel.name}`
    }
    return 'Άγνωστος αιτών'
  }

  if (viewMode === 'form') {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={handleCancel}>
          ← Επιστροφή στη Λίστα
        </Button>
        <RequestForm
          request={selectedRequest || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  if (viewMode === 'view' && selectedRequest) {
    const statusInfo = statusConfig[selectedRequest.status]
    const StatusIcon = statusInfo.icon

    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            ← Επιστροφή στη Λίστα
          </Button>
          <Button onClick={() => handleEdit(selectedRequest)}>
            <Edit className="h-4 w-4 mr-2" />
            Επεξεργασία
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Λεπτομέρειες Αιτήματος
              </span>
              <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusInfo.label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Αιτών */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Αιτών</h3>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">{getRequesterName(selectedRequest)}</p>
                <div className="text-sm text-muted-foreground mt-1">
                  {selectedRequest.citizen && selectedRequest.citizen.mobile_phone && (
                    <p>Τηλέφωνο: {selectedRequest.citizen.mobile_phone}</p>
                  )}
                  {selectedRequest.military_personnel && selectedRequest.military_personnel.esso && (
                    <p>ESSO: {selectedRequest.military_personnel.esso}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Στοιχεία Αιτήματος */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Στοιχεία Αιτήματος</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Τύπος</label>
                  <p className="font-medium">{selectedRequest.request_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Κατάσταση</label>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                    <span className="font-medium">{statusInfo.label}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground">Περιγραφή</label>
                <p className="mt-1 p-3 bg-muted rounded-md">{selectedRequest.description}</p>
              </div>
            </div>

            {/* Ημερομηνίες */}
            {(selectedRequest.send_date || selectedRequest.completion_date) && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Ημερομηνίες</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRequest.send_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Αποστολή</label>
                      <p>{formatDate(selectedRequest.send_date)}</p>
                    </div>
                  )}
                  {selectedRequest.completion_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ολοκλήρωση</label>
                      <p>{formatDate(selectedRequest.completion_date)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Σημειώσεις */}
            {selectedRequest.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Σημειώσεις</h3>
                <p className="p-3 bg-muted rounded-md">{selectedRequest.notes}</p>
              </div>
            )}

            {/* Στοιχεία Δημιουργίας */}
            <div className="border-t pt-4">
              <div className="text-sm text-muted-foreground">
                <p>Δημιουργία: {formatDate(selectedRequest.created_at)}</p>
                <p>Τελευταία ενημέρωση: {formatDate(selectedRequest.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Διαχείριση Αιτημάτων ({requests.length})
            </span>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Νέο Αίτημα
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Overdue Requests Alert */}
      {overdueRequests.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              Εκκρεμή Αιτήματα (25+ ημέρες)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-3">
              Υπάρχουν {overdueRequests.length} αιτήματα που εκκρεμούν για περισσότερες από 25 ημέρες:
            </p>
            <div className="space-y-2">
              {overdueRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="text-sm p-2 bg-yellow-100/20 rounded">
                  <span className="font-medium">{getRequesterName(request)}</span> - {request.request_type}
                  {request.send_date && (
                    <span className="text-muted-foreground ml-2">
                      (Αποστολή: {formatDate(request.send_date)})
                    </span>
                  )}
                </div>
              ))}
              {overdueRequests.length > 5 && (
                <p className="text-sm text-muted-foreground">
                  ... και {overdueRequests.length - 5} ακόμη
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Φίλτρα Αναζήτησης
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Κατάσταση</label>
              <select
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Όλες οι καταστάσεις</option>
                {Object.entries(statusConfig).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Τύπος Αιτήματος</label>
              <Input
                placeholder="Τύπος αιτήματος"
                value={filters.request_type}
                onChange={(e) => handleFilterChange('request_type', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Αναζήτηση</label>
              <Input
                placeholder="Αναζήτηση στην περιγραφή"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          <Button variant="outline" onClick={clearFilters} className="w-full">
            Καθαρισμός Φίλτρων
          </Button>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Λίστα Αιτημάτων</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Φόρτωση αιτημάτων...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {Object.values(filters).some(value => value) 
                  ? 'Δεν βρέθηκαν αιτήματα με τα συγκεκριμένα κριτήρια'
                  : 'Δεν υπάρχουν αιτήματα'
                }
              </p>
              {!Object.values(filters).some(value => value) && (
                <Button onClick={handleAddNew} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Προσθήκη Πρώτου Αιτήματος
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => {
                const statusInfo = statusConfig[request.status]
                const StatusIcon = statusInfo.icon
                
                return (
                  <div
                    key={request.id}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-4">
                          <h3 className="font-semibold text-lg">{request.request_type}</h3>
                          <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        
                        <p className="text-sm font-medium">
                          Αιτών: {getRequesterName(request)}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {request.description.slice(0, 150)}
                          {request.description.length > 150 && '...'}
                        </p>

                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Δημιουργία: {formatDate(request.created_at)}</span>
                          {request.send_date && (
                            <span>Αποστολή: {formatDate(request.send_date)}</span>
                          )}
                          {request.completion_date && (
                            <span>Ολοκλήρωση: {formatDate(request.completion_date)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(request)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(request)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}