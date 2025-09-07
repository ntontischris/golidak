import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Reminder, ReminderType } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Bell, Plus, Edit, Trash2, CheckCircle, AlertCircle, Heart } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ReminderWithRequest extends Reminder {
  related_request?: {
    request_type: string
    description: string
  }
}

export const RemindersManagement: React.FC = () => {
  const { user } = useAuth()
  const [reminders, setReminders] = useState<ReminderWithRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingReminder, setEditingReminder] = useState<ReminderWithRequest | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminder_date: '',
    reminder_type: 'ΓΕΝΙΚΗ' as ReminderType
  })

  // Greek holidays for 2025
  const greekHolidays = [
    { date: '2025-01-01', name: 'Πρωτοχρονιά' },
    { date: '2025-01-06', name: 'Θεοφάνια' },
    { date: '2025-03-03', name: 'Καθαρά Δευτέρα' },
    { date: '2025-03-25', name: '25η Μαρτίου - Ευαγγελισμός' },
    { date: '2025-04-18', name: 'Μεγάλη Παρασκευή' },
    { date: '2025-04-20', name: 'Κυριακή του Πάσχα' },
    { date: '2025-04-21', name: 'Δευτέρα του Πάσχα' },
    { date: '2025-05-01', name: 'Πρωτομαγιά' },
    { date: '2025-06-08', name: 'Αγίου Πνεύματος' },
    { date: '2025-08-15', name: 'Κοίμηση της Θεοτόκου' },
    { date: '2025-10-28', name: '28η Οκτωβρίου' },
    { date: '2025-12-25', name: 'Χριστούγεννα' },
    { date: '2025-12-26', name: 'Σύναξις Θεοτόκου' }
  ]

  const reminderTypeConfig = {
    'ΕΟΡΤΗ': { 
      label: 'Εορτή', 
      icon: Heart, 
      color: 'text-pink-600', 
      variant: 'secondary' as const 
    },
    'ΑΙΤΗΜΑ': { 
      label: 'Αίτημα', 
      icon: AlertCircle, 
      color: 'text-orange-600', 
      variant: 'warning' as const 
    },
    'ΓΕΝΙΚΗ': { 
      label: 'Γενική', 
      icon: Bell, 
      color: 'text-blue-600', 
      variant: 'outline' as const 
    }
  }

  const loadReminders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          requests:related_request_id (
            request_type,
            description
          )
        `)
        .order('reminder_date', { ascending: true })

      if (error) {
        console.error('Error loading reminders:', error)
        return
      }

      // Transform data
      const transformedData = data?.map(reminder => ({
        ...reminder,
        related_request: reminder.requests
      })) || []

      setReminders(transformedData)
    } catch (error) {
      console.error('Error loading reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReminders()
  }, [])

  const createHolidayReminders = async () => {
    try {
      // const currentYear = new Date().getFullYear() // Currently not used
      const existingHolidays = reminders.filter(r => r.reminder_type === 'ΕΟΡΤΗ')
      
      const holidaysToAdd = greekHolidays.filter(holiday => {
        return !existingHolidays.some(existing => 
          existing.reminder_date === holiday.date
        )
      })

      if (holidaysToAdd.length === 0) {
        alert('Όλες οι εορτές για το τρέχον έτος υπάρχουν ήδη')
        return
      }

      const remindersData = holidaysToAdd.map(holiday => ({
        title: holiday.name,
        description: `Εθνική εορτή: ${holiday.name}`,
        reminder_date: holiday.date,
        reminder_type: 'ΕΟΡΤΗ' as ReminderType,
        is_completed: false,
        created_by: user?.id
      }))

      const { error } = await supabase
        .from('reminders')
        .insert(remindersData)

      if (error) {
        console.error('Error creating holiday reminders:', error)
        alert('Σφάλμα κατά τη δημιουργία υπενθυμίσεων εορτών')
        return
      }

      alert(`Προστέθηκαν ${holidaysToAdd.length} υπενθυμίσεις εορτών`)
      await loadReminders()
    } catch (error) {
      console.error('Error creating holiday reminders:', error)
      alert('Σφάλμα κατά τη δημιουργία υπενθυμίσεων εορτών')
    }
  }

  const checkPendingRequests = async () => {
    try {
      // Get pending requests older than 25 days
      const { data: pendingRequests, error } = await supabase
        .from('requests')
        .select('*')
        .eq('status', 'ΕΚΚΡΕΜΕΙ')
        .not('send_date', 'is', null)

      if (error) {
        console.error('Error fetching pending requests:', error)
        return
      }

      const now = new Date()
      const overdueDays = 25
      
      const overdueRequests = pendingRequests?.filter(request => {
        const sendDate = new Date(request.send_date!)
        const diffTime = Math.abs(now.getTime() - sendDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays >= overdueDays
      }) || []

      if (overdueRequests.length === 0) {
        alert('Δεν υπάρχουν εκκρεμή αιτήματα άνω των 25 ημερών')
        return
      }

      // Check for existing reminders for these requests
      const existingReminders = reminders.filter(r => 
        r.reminder_type === 'ΑΙΤΗΜΑ' && 
        overdueRequests.some(req => req.id === r.related_request_id)
      )

      const requestsNeedingReminders = overdueRequests.filter(request =>
        !existingReminders.some(reminder => 
          reminder.related_request_id === request.id && !reminder.is_completed
        )
      )

      if (requestsNeedingReminders.length === 0) {
        alert('Υπάρχουν ήδη υπενθυμίσεις για όλα τα εκκρεμή αιτήματα')
        return
      }

      // Create reminders for overdue requests
      const remindersData = requestsNeedingReminders.map(request => ({
        title: `Εκκρεμές αίτημα - ${request.request_type}`,
        description: `Το αίτημα εκκρεμεί για περισσότερες από ${overdueDays} ημέρες`,
        reminder_date: now.toISOString().split('T')[0],
        reminder_type: 'ΑΙΤΗΜΑ' as ReminderType,
        related_request_id: request.id,
        is_completed: false,
        created_by: user?.id
      }))

      const { error: insertError } = await supabase
        .from('reminders')
        .insert(remindersData)

      if (insertError) {
        console.error('Error creating request reminders:', insertError)
        alert('Σφάλμα κατά τη δημιουργία υπενθυμίσεων αιτημάτων')
        return
      }

      alert(`Προστέθηκαν ${requestsNeedingReminders.length} υπενθυμίσεις για εκκρεμή αιτήματα`)
      await loadReminders()
    } catch (error) {
      console.error('Error checking pending requests:', error)
      alert('Σφάλμα κατά τον έλεγχο εκκρεμών αιτημάτων')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.reminder_date) {
      alert('Ο τίτλος και η ημερομηνία είναι υποχρεωτικά')
      return
    }

    try {
      const dataToSubmit = {
        ...formData,
        description: formData.description || null,
        is_completed: false,
        created_by: user?.id
      }

      let result
      if (editingReminder) {
        result = await supabase
          .from('reminders')
          .update(dataToSubmit)
          .eq('id', editingReminder.id)
          .select()
          .single()
      } else {
        result = await supabase
          .from('reminders')
          .insert(dataToSubmit)
          .select()
          .single()
      }

      if (result.error) {
        console.error('Error saving reminder:', result.error)
        alert('Σφάλμα κατά την αποθήκευση')
        return
      }

      setShowForm(false)
      setEditingReminder(null)
      setFormData({
        title: '',
        description: '',
        reminder_date: '',
        reminder_type: 'ΓΕΝΙΚΗ'
      })
      await loadReminders()
    } catch (error) {
      console.error('Error saving reminder:', error)
      alert('Σφάλμα κατά την αποθήκευση')
    }
  }

  const handleEdit = (reminder: ReminderWithRequest) => {
    setEditingReminder(reminder)
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      reminder_date: reminder.reminder_date,
      reminder_type: reminder.reminder_type
    })
    setShowForm(true)
  }

  const handleDelete = async (reminder: ReminderWithRequest) => {
    if (!window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε την υπενθύμιση "${reminder.title}";`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminder.id)

      if (error) {
        console.error('Error deleting reminder:', error)
        return
      }

      await loadReminders()
    } catch (error) {
      console.error('Error deleting reminder:', error)
    }
  }

  const toggleComplete = async (reminder: ReminderWithRequest) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_completed: !reminder.is_completed })
        .eq('id', reminder.id)

      if (error) {
        console.error('Error updating reminder:', error)
        return
      }

      await loadReminders()
    } catch (error) {
      console.error('Error updating reminder:', error)
    }
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingReminder(null)
    setFormData({
      title: '',
      description: '',
      reminder_date: '',
      reminder_type: 'ΓΕΝΙΚΗ'
    })
  }

  // Get today's and upcoming reminders
  const today = new Date().toISOString().split('T')[0]
  const todayReminders = reminders.filter(r => r.reminder_date === today && !r.is_completed)
  const upcomingReminders = reminders.filter(r => r.reminder_date > today && !r.is_completed)
  const completedReminders = reminders.filter(r => r.is_completed)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Υπενθυμίσεις ({reminders.length})
            </span>
            <div className="flex gap-2">
              <Button onClick={createHolidayReminders} variant="outline">
                <Heart className="h-4 w-4 mr-2" />
                Εορτές {new Date().getFullYear()}
              </Button>
              <Button onClick={checkPendingRequests} variant="outline">
                <AlertCircle className="h-4 w-4 mr-2" />
                Έλεγχος Αιτημάτων
              </Button>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Νέα Υπενθύμιση
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Today's Reminders */}
      {todayReminders.length > 0 && (
        <Card className="border-blue-500 bg-blue-50/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Bell className="h-5 w-5" />
              Σημερινές Υπενθυμίσεις ({todayReminders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayReminders.map((reminder) => {
                const config = reminderTypeConfig[reminder.reminder_type]
                const Icon = config.icon
                
                return (
                  <div key={reminder.id} className="flex items-center gap-3 p-3 bg-blue-100/20 rounded-lg">
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    <div className="flex-1">
                      <p className="font-medium">{reminder.title}</p>
                      {reminder.description && (
                        <p className="text-sm text-muted-foreground">{reminder.description}</p>
                      )}
                    </div>
                    <Badge variant={config.variant}>{config.label}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleComplete(reminder)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingReminder ? 'Επεξεργασία Υπενθύμισης' : 'Νέα Υπενθύμιση'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Τίτλος *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Τίτλος υπενθύμισης"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Τύπος</label>
                  <select
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                    value={formData.reminder_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminder_type: e.target.value as ReminderType }))}
                  >
                    {Object.entries(reminderTypeConfig).map(([value, config]) => (
                      <option key={value} value={value}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ημερομηνία *</label>
                <Input
                  type="date"
                  value={formData.reminder_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, reminder_date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Περιγραφή</label>
                <textarea
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Περιγραφή υπενθύμισης"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  {editingReminder ? 'Ενημέρωση' : 'Δημιουργία'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelForm} className="flex-1">
                  Ακύρωση
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Reminders */}
      <Card>
        <CardHeader>
          <CardTitle>Επερχόμενες Υπενθυμίσεις</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Φόρτωση υπενθυμίσεων...</p>
            </div>
          ) : upcomingReminders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Δεν υπάρχουν επερχόμενες υπενθυμίσεις</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingReminders.map((reminder) => {
                const config = reminderTypeConfig[reminder.reminder_type]
                const Icon = config.icon
                
                return (
                  <div
                    key={reminder.id}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon className={`h-5 w-5 ${config.color} mt-0.5`} />
                        <div className="space-y-1">
                          <h3 className="font-semibold">{reminder.title}</h3>
                          {reminder.description && (
                            <p className="text-sm text-muted-foreground">{reminder.description}</p>
                          )}
                          {reminder.related_request && (
                            <p className="text-xs text-blue-600">
                              Σχετικό αίτημα: {reminder.related_request.request_type}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <Badge variant={config.variant}>{config.label}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(reminder.reminder_date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleComplete(reminder)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(reminder)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(reminder)}
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

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ολοκληρωμένες Υπενθυμίσεις ({completedReminders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedReminders.slice(0, 10).map((reminder) => {
                const config = reminderTypeConfig[reminder.reminder_type]
                const Icon = config.icon
                
                return (
                  <div key={reminder.id} className="flex items-center gap-3 p-2 opacity-60">
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-through">{reminder.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(reminder.reminder_date)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleComplete(reminder)}
                    >
                      Επαναφορά
                    </Button>
                  </div>
                )
              })}
              {completedReminders.length > 10 && (
                <p className="text-sm text-muted-foreground text-center">
                  ... και {completedReminders.length - 10} ακόμη
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}