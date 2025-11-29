import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Home, ArrowLeft, CheckCircle, XCircle, Clock, Filter, AlertTriangle, Settings } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionType, setActionType] = useState('accept');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [covidDialogOpen, setCovidDialogOpen] = useState(false);
  const [covidRestrictions, setCovidRestrictions] = useState({
    level: 'medium',
    density_limits: '1 person per 4 sqm',
    mask_required: true,
    quarantine_required: false,
    message: 'Current restrictions recommend remote services. Masks required for in-person visits.'
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchBookings();
    fetchCovidRestrictions();
  }, [user]);

  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.status === filterStatus));
    }
  }, [filterStatus, bookings]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/admin/bookings`);
      setBookings(response.data);
      setFilteredBookings(response.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchCovidRestrictions = async () => {
    try {
      const response = await axios.get(`${API}/covid/restrictions`);
      setCovidRestrictions(response.data);
    } catch (error) {
      toast.error('Failed to load COVID restrictions');
    }
  };

  const handleUpdateCovidRestrictions = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/admin/covid/restrictions`, covidRestrictions);
      toast.success('COVID-19 restrictions updated successfully! All users have been notified.');
      setCovidDialogOpen(false);
      fetchCovidRestrictions();
    } catch (error) {
      toast.error('Failed to update COVID restrictions');
    }
  };

  const handleActionDialog = (booking, action) => {
    setSelectedBooking(booking);
    setActionType(action);
    setAdminNotes('');
    setDialogOpen(true);
  };

  const handleSubmitAction = async () => {
    try {
      await axios.put(`${API}/admin/bookings/${selectedBooking.id}`, {
        action: actionType,
        admin_notes: adminNotes
      });

      toast.success(`Booking ${actionType}ed successfully`);
      setDialogOpen(false);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update booking');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300';
      case 'declined': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    accepted: bookings.filter(b => b.status === 'accepted').length,
    declined: bookings.filter(b => b.status === 'declined').length
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading admin dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Home className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">Manage service requests</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Button variant="outline" onClick={() => navigate('/dashboard')} data-testid="back-to-dashboard-btn">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8" data-testid="admin-dashboard-container">
        {/* COVID Restrictions Management */}
        <Card className="mb-6 border-l-4 border-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
                <div>
                  <CardTitle>COVID-19 Restrictions Management</CardTitle>
                  <CardDescription>Update current restriction levels for all users</CardDescription>
                </div>
              </div>
              <Dialog open={covidDialogOpen} onOpenChange={setCovidDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Update Restrictions
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Update COVID-19 Restrictions</DialogTitle>
                    <DialogDescription>
                      Changes will be applied immediately and all users will be notified
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleUpdateCovidRestrictions} className="space-y-4">
                    <div>
                      <Label htmlFor="level">Restriction Level *</Label>
                      <Select 
                        value={covidRestrictions.level} 
                        onValueChange={(value) => setCovidRestrictions({...covidRestrictions, level: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - Normal Operations</SelectItem>
                          <SelectItem value="medium">Medium - Caution Advised</SelectItem>
                          <SelectItem value="high">High - Restricted Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="density_limits">Density Limits *</Label>
                      <Input
                        id="density_limits"
                        value={covidRestrictions.density_limits}
                        onChange={(e) => setCovidRestrictions({...covidRestrictions, density_limits: e.target.value})}
                        placeholder="e.g., 1 person per 4 sqm"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="mask_required">Masks Required</Label>
                      <Switch
                        id="mask_required"
                        checked={covidRestrictions.mask_required}
                        onCheckedChange={(checked) => setCovidRestrictions({...covidRestrictions, mask_required: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="quarantine_required">Quarantine Required</Label>
                      <Switch
                        id="quarantine_required"
                        checked={covidRestrictions.quarantine_required}
                        onCheckedChange={(checked) => setCovidRestrictions({...covidRestrictions, quarantine_required: checked})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Public Message *</Label>
                      <Textarea
                        id="message"
                        value={covidRestrictions.message}
                        onChange={(e) => setCovidRestrictions({...covidRestrictions, message: e.target.value})}
                        placeholder="Message to display to all users..."
                        rows={3}
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setCovidDialogOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1">
                        Update & Notify Users
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                covidRestrictions.level === 'low' ? 'bg-green-100 text-green-800' :
                covidRestrictions.level === 'high' ? 'bg-red-100 text-red-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {covidRestrictions.level?.toUpperCase()} LEVEL
              </span>
              <p className="text-gray-700">{covidRestrictions.message}</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card data-testid="stat-card-total">
            <CardHeader className="pb-3">
              <CardDescription>Total Requests</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>

          <Card data-testid="stat-card-pending">
            <CardHeader className="pb-3">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>

          <Card data-testid="stat-card-accepted">
            <CardHeader className="pb-3">
              <CardDescription>Accepted</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.accepted}</CardTitle>
            </CardHeader>
          </Card>

          <Card data-testid="stat-card-declined">
            <CardHeader className="pb-3">
              <CardDescription>Declined</CardDescription>
              <CardTitle className="text-3xl text-red-600">{stats.declined}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <Label>Filter by Status:</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48" data-testid="filter-status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="pending">Pending Only</SelectItem>
                  <SelectItem value="accepted">Accepted Only</SelectItem>
                  <SelectItem value="declined">Declined Only</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-500">Showing {filteredBookings.length} of {bookings.length} bookings</span>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card data-testid="bookings-list-card">
          <CardHeader>
            <CardTitle>Service Requests</CardTitle>
            <CardDescription>Review and manage all booking requests</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500" data-testid="no-bookings-message">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No bookings to display</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="border-2 rounded-lg p-4 hover:shadow-md transition-all" data-testid={`admin-booking-item-${booking.id}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-lg">{booking.service_type}</h4>
                        <p className="text-sm text-gray-600">Requested by: {booking.user_name} ({booking.user_email})</p>
                        <p className="text-xs text-gray-500">ID: {booking.id}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`} data-testid={`admin-booking-status-${booking.id}`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-4 gap-3 mb-3 text-sm">
                      <div>
                        <strong>Date:</strong> {new Date(booking.preferred_date).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Duration:</strong> {booking.duration} min
                      </div>
                      <div>
                        <strong>Cost:</strong> ${booking.cost}
                      </div>
                      <div>
                        <strong>COVID Level:</strong> {booking.covid_restrictions}
                      </div>
                    </div>

                    {booking.details && (
                      <div className="bg-gray-50 rounded p-2 mb-3 text-sm">
                        <strong>Details:</strong> {booking.details}
                      </div>
                    )}

                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleActionDialog(booking, 'accept')}
                          data-testid={`accept-booking-btn-${booking.id}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleActionDialog(booking, 'decline')}
                          data-testid={`decline-booking-btn-${booking.id}`}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    )}

                    {booking.status !== 'pending' && (
                      <div className="text-sm text-gray-600 italic">
                        Already {booking.status}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid="action-dialog">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'accept' ? 'Accept' : 'Decline'} Booking
            </DialogTitle>
            <DialogDescription>
              Booking ID: {selectedBooking?.id}<br />
              Service: {selectedBooking?.service_type}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="admin_notes">Notes to Customer (optional)</Label>
              <Textarea
                id="admin_notes"
                placeholder="Add any notes or instructions for the customer..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                data-testid="admin-notes-textarea"
              />
            </div>

            <div className="privacy-notice text-xs">
              Customer will receive an email notification with your decision and notes.
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1" data-testid="action-cancel-btn">
                Cancel
              </Button>
              <Button
                onClick={handleSubmitAction}
                className={`flex-1 ${actionType === 'decline' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                data-testid="action-submit-btn">
                Confirm {actionType === 'accept' ? 'Accept' : 'Decline'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
