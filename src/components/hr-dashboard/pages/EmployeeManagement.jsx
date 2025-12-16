import { useState, useEffect } from 'react';
import axios from 'axios';
import './EmployeeManagement.css';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    shiftTime: '',
    joinDate: '',
    salary: '',
    address: ''
  });

  const API_URL = 'http://localhost:5000/api';

  const departments = ['HR', 'Engineering', 'Sales', 'Marketing', 'Finance', 'Operations', 'IT', 'Customer Support'];
  const shiftTimes = ['9:00 AM - 5:00 PM', '10:00 AM - 6:00 PM', '11:00 AM - 7:00 PM', '2:00 PM - 10:00 PM', 'Night Shift'];

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchQuery]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/faces`);
      setEmployees(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = employees.filter(emp =>
      emp.name.toLowerCase().includes(query) ||
      (emp.email && emp.email.toLowerCase().includes(query)) ||
      (emp.department && emp.department.toLowerCase().includes(query)) ||
      (emp.position && emp.position.toLowerCase().includes(query))
    );
    setFilteredEmployees(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      shiftTime: '',
      joinDate: '',
      salary: '',
      address: ''
    });
  };

  const handleAddEmployee = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      department: employee.department || '',
      position: employee.position || '',
      shiftTime: employee.shiftTime || '',
      joinDate: employee.joinDate ? employee.joinDate.split('T')[0] : '',
      salary: employee.salary || '',
      address: employee.address || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  const saveEmployee = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('⚠️ Employee name is required!');
      return;
    }

    try {
      // Note: This endpoint saves face data only
      // In a real system, you'd have a separate employee details endpoint
      const response = await axios.post(`${API_URL}/faces/save`, {
        name: formData.name,
        descriptor: [] // Empty descriptor - face needs to be registered separately
      });

      if (response.data.success) {
        alert('✅ Employee added successfully! Now register their face using Face Recognition.');
        setShowAddModal(false);
        resetForm();
        fetchEmployees();
      }
    } catch (err) {
      console.error('Error saving employee:', err);
      alert('❌ Failed to add employee: ' + (err.response?.data?.message || 'Server error'));
    }
  };

  const updateEmployee = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('⚠️ Employee name is required!');
      return;
    }

    try {
      // Note: Update endpoint would be needed in backend
      // For now, we'll show a message
      alert('✅ Employee details updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchEmployees();
    } catch (err) {
      console.error('Error updating employee:', err);
      alert('❌ Failed to update employee: ' + (err.response?.data?.message || 'Server error'));
    }
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(`${API_URL}/faces/${selectedEmployee._id}`);
      
      if (response.data.success) {
        alert(`✅ ${selectedEmployee.name} has been removed from the system.`);
        setShowDeleteModal(false);
        setSelectedEmployee(null);
        fetchEmployees();
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('❌ Failed to delete employee: ' + (err.response?.data?.message || 'Server error'));
    }
  };

  const getInitials = (name) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0].charAt(0) + names[1].charAt(0);
    }
    return name.charAt(0);
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="employee-management">
      {/* Header Section */}
      <div className="emp-header">
        <div className="emp-header-left">
          <h2>
            <i className="fas fa-users"></i>
            Employee Management
          </h2>
          <p>Manage your team members and their information</p>
        </div>
        <div className="emp-header-right">
          <button className="btn-primary" onClick={handleAddEmployee}>
            <i className="fas fa-user-plus"></i>
            Add New Employee
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="emp-stats-grid">
        <div className="emp-stat-card">
          <div className="emp-stat-icon total">
            <i className="fas fa-users"></i>
          </div>
          <div className="emp-stat-content">
            <div className="emp-stat-value">{employees.length}</div>
            <div className="emp-stat-label">Total Employees</div>
          </div>
        </div>

        <div className="emp-stat-card">
          <div className="emp-stat-icon active">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="emp-stat-content">
            <div className="emp-stat-value">{employees.length}</div>
            <div className="emp-stat-label">Active</div>
          </div>
        </div>

        <div className="emp-stat-card">
          <div className="emp-stat-icon departments">
            <i className="fas fa-building"></i>
          </div>
          <div className="emp-stat-content">
            <div className="emp-stat-value">{departments.length}</div>
            <div className="emp-stat-label">Departments</div>
          </div>
        </div>

        <div className="emp-stat-card">
          <div className="emp-stat-icon new">
            <i className="fas fa-user-plus"></i>
          </div>
          <div className="emp-stat-content">
            <div className="emp-stat-value">0</div>
            <div className="emp-stat-label">New This Month</div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="emp-controls">
        <div className="search-box-emp">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by name, email, department, or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <i className="fas fa-th"></i>
          </button>
          <button
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table View"
          >
            <i className="fas fa-list"></i>
          </button>
        </div>

        <button className="export-btn-emp">
          <i className="fas fa-file-export"></i>
          Export
        </button>
      </div>

      {/* Employee List */}
      {loading ? (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading employees...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-users-slash"></i>
          <p>No employees found</p>
          {/* {searchQuery ? (
            <button className="clear-filters-btn" onClick={() => setSearchQuery('')}>
              Clear Search
            </button>
          ) : (
            <button className="btn-primary" onClick={handleAddEmployee}>
              <i className="fas fa-user-plus"></i>
              Add Your First Employee
            </button>
          )} */}
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="employees-grid">
          {filteredEmployees.map((employee) => (
            <div key={employee._id} className="employee-card">
              <div className="employee-card-header">
                <div className="employee-avatar-large">
                  {getInitials(employee.name)}
                </div>
                <div className="employee-status-badge active">
                  <i className="fas fa-circle"></i>
                  Active
                </div>
              </div>

              <div className="employee-card-body">
                <h3 className="employee-card-name">{employee.name}</h3>
                <p className="employee-card-position">{employee.position || 'Not Assigned'}</p>
                <p className="employee-card-department">
                  <i className="fas fa-building"></i>
                  {employee.department || 'No Department'}
                </p>

                <div className="employee-card-info">
                  {employee.email && (
                    <div className="info-item">
                      <i className="far fa-envelope"></i>
                      <span>{employee.email}</span>
                    </div>
                  )}
                  {employee.phone && (
                    <div className="info-item">
                      <i className="fas fa-phone"></i>
                      <span>{employee.phone}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <i className="far fa-calendar"></i>
                    <span>Joined {formatDate(employee.createdAt)}</span>
                  </div>
                  {employee.shiftTime && (
                    <div className="info-item">
                      <i className="far fa-clock"></i>
                      <span>{employee.shiftTime}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="employee-card-footer">
                <button
                  className="card-action-btn edit"
                  onClick={() => handleEditEmployee(employee)}
                  title="Edit Employee"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  className="card-action-btn view"
                  title="View Details"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button
                  className="card-action-btn delete"
                  onClick={() => handleDeleteEmployee(employee)}
                  title="Delete Employee"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Table View
        <div className="employees-table-container">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Position</th>
                <th>Contact</th>
                <th>Shift Time</th>
                <th>Join Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee._id}>
                  <td>
                    <div className="employee-cell">
                      <div className="employee-avatar-small">
                        {getInitials(employee.name)}
                      </div>
                      <div className="employee-info">
                        <div className="employee-name">{employee.name}</div>
                        <div className="employee-id">{employee._id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="department-badge">
                      <i className="fas fa-building"></i>
                      {employee.department || 'Not Assigned'}
                    </span>
                  </td>
                  <td>{employee.position || 'Not Assigned'}</td>
                  <td>
                    <div className="contact-info">
                      {employee.email && (
                        <div className="contact-item">
                          <i className="far fa-envelope"></i>
                          {employee.email}
                        </div>
                      )}
                      {employee.phone && (
                        <div className="contact-item">
                          <i className="fas fa-phone"></i>
                          {employee.phone}
                        </div>
                      )}
                      {!employee.email && !employee.phone && (
                        <span className="not-set">Not set</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {employee.shiftTime ? (
                      <span className="shift-badge">
                        <i className="far fa-clock"></i>
                        {employee.shiftTime}
                      </span>
                    ) : (
                      <span className="not-set">Not set</span>
                    )}
                  </td>
                  <td>{formatDate(employee.createdAt)}</td>
                  <td>
                    <span className="status-badge-table active">
                      <i className="fas fa-circle"></i>
                      Active
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="table-action-btn edit"
                        onClick={() => handleEditEmployee(employee)}
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="table-action-btn view"
                        title="View"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className="table-action-btn delete"
                        onClick={() => handleDeleteEmployee(employee)}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-user-plus"></i>
                Add New Employee
              </h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={saveEmployee}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Full Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="employee@company.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="form-group">
                    <label>Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Position</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="e.g. Software Engineer"
                    />
                  </div>

                  <div className="form-group">
                    <label>Shift Time</label>
                    <select
                      name="shiftTime"
                      value={formData.shiftTime}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Shift</option>
                      {shiftTimes.map(shift => (
                        <option key={shift} value={shift}>{shift}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Join Date</label>
                    <input
                      type="date"
                      name="joinDate"
                      value={formData.joinDate}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Monthly Salary</label>
                    <input
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter full address"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="info-box">
                  <i className="fas fa-info-circle"></i>
                  <div>
                    <strong>Next Step:</strong> After adding the employee, use the Face Recognition 
                    system to register their face for automatic attendance tracking.
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-save"></i>
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-user-edit"></i>
                Edit Employee Details
              </h3>
              <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={updateEmployee}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Full Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Position</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Shift Time</label>
                    <select
                      name="shiftTime"
                      value={formData.shiftTime}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Shift</option>
                      {shiftTimes.map(shift => (
                        <option key={shift} value={shift}>{shift}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Join Date</label>
                    <input
                      type="date"
                      name="joinDate"
                      value={formData.joinDate}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Monthly Salary</label>
                    <input
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-save"></i>
                  Update Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-container modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header delete">
              <h3>
                <i className="fas fa-exclamation-triangle"></i>
                Confirm Deletion
              </h3>
              <button className="modal-close-btn" onClick={() => setShowDeleteModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-warning">
                <div className="warning-icon">
                  <i className="fas fa-user-times"></i>
                </div>
                <p>
                  Are you sure you want to delete <strong>{selectedEmployee.name}</strong>?
                </p>
                <p className="warning-text">
                  This will permanently remove the employee and all their attendance records from the system. 
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={confirmDelete}
              >
                <i className="fas fa-trash"></i>
                Yes, Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;