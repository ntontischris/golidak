import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { UserProfile } from '@/types'

const AdminPanel: React.FC = () => {
  const { userProfile } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [secretCode, setSecretCode] = useState('')
  const [showSecretPrompt, setShowSecretPrompt] = useState(false)

  // Κρυφό κωδικό για admin πρόσβαση
  const ADMIN_SECRET = 'GOLIDAK2024'

  useEffect(() => {
    if (userProfile?.role === 'ADMIN') {
      loadUsers()
    }
  }, [userProfile])

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const promoteToAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: 'ADMIN', updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error
      
      alert('Ο χρήστης αναβαθμίστηκε σε Administrator!')
      loadUsers()
    } catch (error) {
      console.error('Error promoting user:', error)
      alert('Σφάλμα κατά την αναβάθμιση του χρήστη')
    }
  }

  const demoteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: 'USER', updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error
      
      alert('Ο χρήστης υποβαθμίστηκε σε κανονικό χρήστη')
      loadUsers()
    } catch (error) {
      console.error('Error demoting user:', error)
      alert('Σφάλμα κατά την υποβάθμιση του χρήστη')
    }
  }

  const enableCurrentUserAsAdmin = async () => {
    console.log('🔍 Debug Info:')
    console.log('Entered code:', `"${secretCode}"`)
    console.log('Expected code:', `"${ADMIN_SECRET}"`)
    console.log('Code match:', secretCode.trim() === ADMIN_SECRET)
    console.log('User profile:', userProfile)
    
    if (secretCode.trim() === ADMIN_SECRET) {
      // If no userProfile, try to get current user and create/update profile
      if (!userProfile) {
        console.log('⚠️ No userProfile, attempting to get current user...')
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          alert('❌ Δεν είστε συνδεδεμένος! Παρακαλώ συνδεθείτε πρώτα.')
          return
        }
        
        console.log('👤 Current user found:', user.id)
        
        // Try to update directly with user ID from auth
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .upsert({ 
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email || 'Admin User',
              role: 'ADMIN', 
              updated_at: new Date().toISOString(),
              is_active: true
            })
            .select()

          console.log('Database response:', { data, error })

          if (error) {
            console.error('❌ Database error:', error)
            alert(`Σφάλμα βάσης δεδομένων: ${error.message}`)
            return
          }
          
          alert('🎉 Συγχαρητήρια! Αναβαθμίστηκες σε Administrator!')
          window.location.reload()
          return
        } catch (error) {
          console.error('❌ Unexpected error:', error)
          alert(`Σφάλμα: ${error instanceof Error ? error.message : String(error)}`)
          return
        }
      }
      try {
        console.log('✅ Code is correct, attempting to update user...')
        
        const { data, error } = await supabase
          .from('user_profiles')
          .update({ role: 'ADMIN', updated_at: new Date().toISOString() })
          .eq('id', userProfile.id)
          .select()

        console.log('Database response:', { data, error })

        if (error) {
          console.error('❌ Database error:', error)
          alert(`Σφάλμα βάσης δεδομένων: ${error.message}\n\nDetails: ${error.details}\nHint: ${error.hint}`)
          return
        }
        
        alert('🎉 Συγχαρητήρια! Αναβαθμίστηκες σε Administrator!')
        // Reload the page to refresh the auth context
        window.location.reload()
      } catch (error) {
        console.error('❌ Unexpected error:', error)
        alert(`Σφάλμα κατά την αναβάθμιση: ${error instanceof Error ? error.message : String(error)}`)
      }
    } else {
      console.log('❌ Validation failed:')
      console.log('Code correct:', secretCode.trim() === ADMIN_SECRET)
      console.log('User profile exists:', !!userProfile)
      
      if (!userProfile) {
        alert('❌ Δεν βρέθηκε το προφίλ χρήστη! Παρακαλώ συνδεθείτε ξανά.')
      } else {
        alert(`❌ Λάθος κωδικός! Δοκιμάστε: "${ADMIN_SECRET}"`)
      }
      setSecretCode('')
    }
  }

  // Αν δεν είσαι admin, δείξε την κρυφή επιλογή
  if (userProfile?.role !== 'ADMIN') {
    return (
      <div className="p-6 max-w-md mx-auto bg-card rounded-lg shadow-lg border">
        <h2 className="text-2xl font-bold mb-4 text-foreground">🔐 Κρυφή Περιοχή</h2>
        
        {!showSecretPrompt ? (
          <div>
            <p className="text-muted-foreground mb-4">
              Αυτή η περιοχή είναι προσβάσιμη μόνο σε administrators.
            </p>
            <button
              onClick={() => setShowSecretPrompt(true)}
              className="w-full bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent/90 transition-colors"
            >
              💎 Έχω κρυφό κωδικό
            </button>
          </div>
        ) : (
          <div>
            <p className="text-muted-foreground mb-4">
              Εισάγετε τον κρυφό κωδικό για admin πρόσβαση:
            </p>
            <input
              type="password"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              placeholder="Κρυφός κωδικός..."
              className="w-full p-3 bg-input border border-border rounded-md mb-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            />
            <div className="flex gap-2">
              <button
                onClick={enableCurrentUserAsAdmin}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                🚀 Activate Admin
              </button>
              <button
                onClick={() => {
                  setShowSecretPrompt(false)
                  setSecretCode('')
                }}
                className="flex-1 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors"
              >
                Ακύρωση
              </button>
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground">
                💡 Hint: GOLIDAK + έτος
              </p>
              <p className="text-xs text-primary font-mono bg-muted px-2 py-1 rounded">
                Debug: Αναμενόμενος κωδικός: {ADMIN_SECRET}
              </p>
              <button 
                onClick={async () => {
                  console.log('=== DEBUG TEST ===')
                  console.log('Current user:', userProfile)
                  console.log('Auth UID:', (await supabase.auth.getUser()).data.user?.id)
                  
                  // Test database connection
                  const { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', userProfile?.id)
                  
                  console.log('Profile query result:', { data, error })
                  
                  alert(`User ID: ${userProfile?.id}\nAuth works: ${!error}\nProfile exists: ${!!data?.length}`)
                }}
                className="mt-2 w-full text-xs bg-yellow-500 text-white px-2 py-1 rounded"
              >
                🐛 Debug Test
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Admin Panel
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-3xl font-bold text-foreground">🛠️ Admin Panel</h1>
        <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded-md text-sm font-medium">ADMINISTRATOR</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 rounded-lg border">
          <h3 className="text-xl font-bold mb-2">👥 Σύνολο Χρηστών</h3>
          <p className="text-3xl font-bold">{users.length}</p>
        </div>
        
        <div className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground p-6 rounded-lg border">
          <h3 className="text-xl font-bold mb-2">⚡ Ενεργοί Admins</h3>
          <p className="text-3xl font-bold">{users.filter(u => u.role === 'ADMIN').length}</p>
        </div>
        
        <div className="bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground p-6 rounded-lg border">
          <h3 className="text-xl font-bold mb-2">🔥 Κρυφές Επιλογές</h3>
          <p className="text-xl font-bold">ENABLED</p>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-lg border p-6">
        <h2 className="text-2xl font-bold mb-4 text-foreground">👤 Διαχείριση Χρηστών</h2>
        
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Φόρτωση χρηστών...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-3 text-left font-medium text-foreground">Όνομα</th>
                  <th className="border border-border p-3 text-left font-medium text-foreground">ID</th>
                  <th className="border border-border p-3 text-left font-medium text-foreground">Role</th>
                  <th className="border border-border p-3 text-left font-medium text-foreground">Τελευταία Σύνδεση</th>
                  <th className="border border-border p-3 text-left font-medium text-foreground">Ενέργειες</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={user.role === 'ADMIN' ? 'bg-destructive/10' : 'hover:bg-muted/50'}>
                    <td className="border border-border p-3 text-foreground">
                      {user.full_name || 'N/A'}
                      {user.role === 'ADMIN' && <span className="ml-2 text-accent">👑</span>}
                    </td>
                    <td className="border border-border p-3 text-xs text-muted-foreground font-mono">
                      {user.id.substring(0, 8)}...
                    </td>
                    <td className="border border-border p-3">
                      <span className={`px-2 py-1 rounded-md text-sm font-medium ${
                        user.role === 'ADMIN' 
                          ? 'bg-destructive text-destructive-foreground' 
                          : 'bg-primary text-primary-foreground'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="border border-border p-3 text-sm text-muted-foreground">
                      {user.last_login_at 
                        ? new Date(user.last_login_at).toLocaleString('el-GR')
                        : 'Ποτέ'
                      }
                    </td>
                    <td className="border border-border p-3">
                      {user.role === 'USER' ? (
                        <button
                          onClick={() => promoteToAdmin(user.id)}
                          className="bg-accent text-accent-foreground px-3 py-1 rounded-md text-sm hover:bg-accent/90 transition-colors"
                        >
                          ↗️ Make Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => demoteUser(user.id)}
                          className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm hover:bg-secondary/80 transition-colors disabled:opacity-50"
                          disabled={user.id === userProfile?.id}
                        >
                          ↘️ Make User
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <h3 className="font-bold text-accent mb-2">⚠️ Κρυφές Επιλογές Admin</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Προβολή όλων των χρηστών</li>
            <li>• Αναβάθμιση/Υποβάθμιση χρηστών</li>
            <li>• Στατιστικά συστήματος</li>
            <li>• Κρυφός κωδικός: <span className="text-primary font-mono">GOLIDAK2024</span></li>
          </ul>
        </div>
        
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="font-bold text-destructive mb-2">🔒 Ασφάλεια</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Μόνο admins βλέπουν αυτό το panel</li>
            <li>• Ο κρυφός κωδικός δίνει admin δικαιώματα</li>
            <li>• Οι admins δεν μπορούν να υποβαθμίσουν τον εαυτό τους</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel