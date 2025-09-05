import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { UserProfile } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  Users, 
  Globe, 
  Clock, 
  Shield, 
  Eye,
  UserCheck,
  UserX
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface UserWithAuth extends UserProfile {
  email?: string
  created_at_auth?: string
}

export const UserManagement: React.FC = () => {
  const { userProfile } = useAuth()
  const [users, setUsers] = useState<UserWithAuth[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserWithAuth | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')

  const loadUsers = async () => {
    setLoading(true)
    try {
      // Get user profiles with auth data
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) {
        console.error('Error loading user profiles:', profilesError)
        return
      }

      // Get auth users (admin only feature - in production this should be restricted)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

      const combinedUsers = profiles?.map(profile => {
        const authUser = authUsers?.users?.find(u => u.id === profile.id)
        return {
          ...profile,
          email: authUser?.email,
          created_at_auth: authUser?.created_at
        }
      }) || []

      setUsers(combinedUsers)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const toggleUserStatus = async (user: UserWithAuth) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: !user.is_active })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating user status:', error)
        return
      }

      await loadUsers()
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const updateUserRole = async (user: UserWithAuth, newRole: 'USER' | 'ADMIN') => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating user role:', error)
        return
      }

      await loadUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const viewUserDetails = (user: UserWithAuth) => {
    setSelectedUser(user)
    setViewMode('detail')
  }

  const goBackToList = () => {
    setSelectedUser(null)
    setViewMode('list')
  }

  // Check if current user is admin
  const isAdmin = userProfile?.role === 'ADMIN'

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Περιορισμένη Πρόσβαση</h3>
          <p className="text-muted-foreground">
            Δεν έχετε δικαιώματα διαχειριστή για πρόσβαση σε αυτή την ενότητα.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (viewMode === 'detail' && selectedUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={goBackToList}>
            ← Επιστροφή στη Λίστα
          </Button>
          <h2 className="text-2xl font-bold">Λεπτομέρειες Χρήστη</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {selectedUser.full_name || selectedUser.email}
              </span>
              <div className="flex gap-2">
                <Badge variant={selectedUser.is_active ? 'success' : 'destructive'}>
                  {selectedUser.is_active ? 'Ενεργός' : 'Ανενεργός'}
                </Badge>
                <Badge variant={selectedUser.role === 'ADMIN' ? 'default' : 'secondary'}>
                  {selectedUser.role === 'ADMIN' ? 'Διαχειριστής' : 'Χρήστης'}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Βασικά Στοιχεία</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ονοματεπώνυμο</label>
                  <p>{selectedUser.full_name || 'Δεν έχει οριστεί'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ρόλος</label>
                  <p>{selectedUser.role === 'ADMIN' ? 'Διαχειριστής' : 'Χρήστης'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Κατάσταση</label>
                  <p>{selectedUser.is_active ? 'Ενεργός' : 'Ανενεργός'}</p>
                </div>
              </div>
            </div>

            {/* Login Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Στοιχεία Σύνδεσης</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Τελευταία Σύνδεση</label>
                  <p>
                    {selectedUser.last_login_at 
                      ? formatDateTime(selectedUser.last_login_at)
                      : 'Ποτέ'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">IP Τελευταίας Σύνδεσης</label>
                  <p>{selectedUser.last_login_ip || 'Άγνωστο'}</p>
                </div>
              </div>
            </div>

            {/* Account Dates */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Ημερομηνίες Λογαριασμού</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Εγγραφή</label>
                  <p>
                    {selectedUser.created_at_auth
                      ? formatDateTime(selectedUser.created_at_auth)
                      : formatDateTime(selectedUser.created_at)
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Τελευταία Ενημέρωση Προφίλ</label>
                  <p>{formatDateTime(selectedUser.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Ενέργειες</h3>
              <div className="flex gap-4">
                <Button
                  variant={selectedUser.is_active ? "destructive" : "default"}
                  onClick={() => toggleUserStatus(selectedUser)}
                  disabled={selectedUser.id === userProfile?.id}
                >
                  {selectedUser.is_active ? (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Απενεργοποίηση
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Ενεργοποίηση
                    </>
                  )}
                </Button>
                
                {selectedUser.role === 'USER' ? (
                  <Button
                    variant="outline"
                    onClick={() => updateUserRole(selectedUser, 'ADMIN')}
                    disabled={selectedUser.id === userProfile?.id}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Κάντε Διαχειριστή
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => updateUserRole(selectedUser, 'USER')}
                    disabled={selectedUser.id === userProfile?.id}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Κάντε Χρήστη
                  </Button>
                )}
              </div>
              
              {selectedUser.id === userProfile?.id && (
                <p className="text-sm text-muted-foreground mt-2">
                  Δεν μπορείτε να τροποποιήσετε τον δικό σας λογαριασμό
                </p>
              )}
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
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Διαχείριση Χρηστών ({users.length})
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Λίστα Χρηστών</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Φόρτωση χρηστών...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Δεν υπάρχουν εγγεγραμμένοι χρήστες</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">
                            {user.full_name || user.email}
                          </h3>
                          <Badge variant={user.is_active ? 'success' : 'destructive'}>
                            {user.is_active ? 'Ενεργός' : 'Ανενεργός'}
                          </Badge>
                          <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                            {user.role === 'ADMIN' ? 'Admin' : 'User'}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>{user.email}</span>
                          {user.last_login_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Τελ. σύνδεση: {formatDateTime(user.last_login_at)}
                            </span>
                          )}
                          {user.last_login_ip && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              IP: {user.last_login_ip}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewUserDetails(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant={user.is_active ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleUserStatus(user)}
                        disabled={user.id === userProfile?.id}
                      >
                        {user.is_active ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Σύνολο Χρηστών</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ενεργοί Χρήστες</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.is_active).length}
                </p>
              </div>
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Διαχειριστές</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'ADMIN').length}
                </p>
              </div>
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}