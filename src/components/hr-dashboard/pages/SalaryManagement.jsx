import { useState, useEffect } from 'react';
import axios from 'axios';
import './SalaryManagement.css';

const SalaryManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditSalaryModal, setShowEditSalaryModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const [salaryForm, setSalaryForm] = useState({
    baseSalary: 0,
    allowances: 0,
    bonus: 0,
    deductions: 0,
    overtimeHours: 0,
    overtimeRate: 0
  });

  const API_URL = 'http://localhost:5000/api';

  const departments = [
    'Engineering',
    'Sales',
    'Marketing',
    'HR',
    'Finance',
    'Operations',
    'IT',
    'Customer Support'
  ];

  const paymentStatuses = [
    { value: 'pending', label: 'Pending', color: '#f57c00', icon: 'fa-clock' },
    { value: 'processing', label: 'Processing', color: '#1976d2', icon: 'fa-spinner' },
    { value: 'paid', label: 'Paid', color: '#2e7d32', icon: 'fa-check-circle' },
    { value: 'failed', label: 'Failed', color: '#c62828', icon: 'fa-times-circle' }
  ];

  useEffect(() => {
    fetchEmployees();
    generateMockSalaryData();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, salaryRecords, searchQuery, filterDepartment, filterMonth]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/faces`);
      const employeesWithSalary = response.data.map(emp => ({
        ...emp,
        baseSalary: Math.floor(Math.random() * 50000) + 30000,
        department: departments[Math.floor(Math.random() * departments.length)],
        accountNumber: `ACC${Math.floor(Math.random() * 1000000)}`,
        bankName: 'National Bank'
      }));
      setEmployees(employeesWithSalary);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const generateMockSalaryData = () => {
    const mockRecords = [
      {
        id: 'sal-1',
        employeeId: 'emp1',
        employeeName: 'John Doe',
        month: '2024-12',
        baseSalary: 50000,
        allowances: 5000,
        bonus: 3000,
        deductions: 2000,
        overtimeHours: 10,
        overtimeRate: 500,
        overtimePay: 5000,
        grossSalary: 63000,
        netSalary: 61000,
        taxAmount: 8000,
        status: 'paid',
        paymentDate: new Date('2024-12-01'),
        processedBy: 'Finance Manager'
      },
      {
        id: 'sal-2',
        employeeId: 'emp2',
        employeeName: 'Sarah Williams',
        month: '2024-12',
        baseSalary: 45000,
        allowances: 4500,
        bonus: 0,
        deductions: 1500,
        overtimeHours: 0,
        overtimeRate: 0,
        overtimePay: 0,
        grossSalary: 49500,
        netSalary: 48000,
        taxAmount: 6500,
        status: 'pending',
        paymentDate: null,
        processedBy: null
      },
      {
        id: 'sal-3',
        employeeId: 'emp3',
        employeeName: 'Mike Johnson',
        month: '2024-12',
        baseSalary: 55000,
        allowances: 6000,
        bonus: 5000,
        deductions: 2500,
        overtimeHours: 15,
        overtimeRate: 600,
        overtimePay: 9000,
        grossSalary: 75000,
        netSalary: 72500,
        taxAmount: 10000,
        status: 'processing',
        paymentDate: null,
        processedBy: 'Finance Manager'
      }
    ];

    setSalaryRecords(mockRecords);
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Department filter
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(emp => emp.department === filterDepartment);
    }

    // Add salary record info to each employee
    filtered = filtered.map(emp => {
      const record = salaryRecords.find(r => 
        r.employeeId === emp._id && r.month === filterMonth
      );
      return {
        ...emp,
        salaryRecord: record || null
      };
    });

    setFilteredEmployees(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSalaryForm(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const calculateSalary = () => {
    const overtimePay = salaryForm.overtimeHours * salaryForm.overtimeRate;
    const grossSalary = salaryForm.baseSalary + salaryForm.allowances + salaryForm.bonus + overtimePay;
    const taxAmount = grossSalary * 0.15; // 15% tax
    const netSalary = grossSalary - salaryForm.deductions - taxAmount;

    return {
      overtimePay,
      grossSalary,
      taxAmount,
      netSalary
    };
  };

  const openProcessModal = (employee) => {
    setSelectedEmployee(employee);
    setSalaryForm({
      baseSalary: employee.baseSalary || 0,
      allowances: 0,
      bonus: 0,
      deductions: 0,
      overtimeHours: 0,
      overtimeRate: 0
    });
    setSelectedMonth(filterMonth);
    setShowProcessModal(true);
  };

  const processSalary = (e) => {
    e.preventDefault();

    const calculations = calculateSalary();
    
    const newRecord = {
      id: `sal-${Date.now()}`,
      employeeId: selectedEmployee._id,
      employeeName: selectedEmployee.name,
      month: selectedMonth,
      baseSalary: salaryForm.baseSalary,
      allowances: salaryForm.allowances,
      bonus: salaryForm.bonus,
      deductions: salaryForm.deductions,
      overtimeHours: salaryForm.overtimeHours,
      overtimeRate: salaryForm.overtimeRate,
      overtimePay: calculations.overtimePay,
      grossSalary: calculations.grossSalary,
      netSalary: calculations.netSalary,
      taxAmount: calculations.taxAmount,
      status: 'processing',
      paymentDate: null,
      processedBy: 'Finance Manager'
    };

    setSalaryRecords(prev => [...prev, newRecord]);
    setShowProcessModal(false);
    alert('✅ Salary processed successfully!');
  };

  const markAsPaid = (recordId) => {
    if (window.confirm('Mark this salary as paid?')) {
      setSalaryRecords(prev => prev.map(record =>
        record.id === recordId
          ? { ...record, status: 'paid', paymentDate: new Date() }
          : record
      ));
      alert('✅ Salary marked as paid!');
    }
  };

  const viewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  const openEditSalary = (employee) => {
    setSelectedEmployee(employee);
    setSalaryForm({
      baseSalary: employee.baseSalary || 0,
      allowances: 0,
      bonus: 0,
      deductions: 0,
      overtimeHours: 0,
      overtimeRate: 0
    });
    setShowEditSalaryModal(true);
  };

  const updateBaseSalary = (e) => {
    e.preventDefault();

    setEmployees(prev => prev.map(emp =>
      emp._id === selectedEmployee._id
        ? { ...emp, baseSalary: salaryForm.baseSalary }
        : emp
    ));

    setShowEditSalaryModal(false);
    alert('✅ Base salary updated successfully!');
  };

  const getStatusInfo = (status) => {
    return paymentStatuses.find(s => s.value === status) || paymentStatuses[0];
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatMonth = (month) => {
    return new Date(month + '-01').toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getStats = () => {
    const monthRecords = salaryRecords.filter(r => r.month === filterMonth);
    const totalProcessed = monthRecords.length;
    const totalPaid = monthRecords.filter(r => r.status === 'paid').length;
    const totalPending = monthRecords.filter(r => r.status === 'pending').length;
    const totalAmount = monthRecords.reduce((sum, r) => sum + r.netSalary, 0);
    const paidAmount = monthRecords
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + r.netSalary, 0);

    return {
      totalProcessed,
      totalPaid,
      totalPending,
      totalAmount,
      paidAmount,
      pendingAmount: totalAmount - paidAmount
    };
  };

  const stats = getStats();

  return (
    <div className="salary-management">
      {/* Header */}
      <div className="salary-header">
        <div className="salary-header-left">
          <h2>
            <i className="fas fa-dollar-sign"></i>
            Salary Management
          </h2>
          <p>Manage employee payroll and salary processing</p>
        </div>
        <div className="salary-header-right">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="month-selector"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const monthStr = date.toISOString().slice(0, 7);
              return (
                <option key={monthStr} value={monthStr}>
                  {formatMonth(monthStr)}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="salary-stats-grid">
        <div className="salary-stat-card total">
          <div className="salary-stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="salary-stat-content">
            <div className="salary-stat-value">{stats.totalProcessed}</div>
            <div className="salary-stat-label">Processed</div>
          </div>
        </div>

        <div className="salary-stat-card paid">
          <div className="salary-stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="salary-stat-content">
            <div className="salary-stat-value">{stats.totalPaid}</div>
            <div className="salary-stat-label">Paid</div>
          </div>
        </div>

        <div className="salary-stat-card pending">
          <div className="salary-stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="salary-stat-content">
            <div className="salary-stat-value">{stats.totalPending}</div>
            <div className="salary-stat-label">Pending</div>
          </div>
        </div>

        <div className="salary-stat-card amount">
          <div className="salary-stat-icon">
            <i className="fas fa-money-bill-wave"></i>
          </div>
          <div className="salary-stat-content">
            <div className="salary-stat-value">{formatCurrency(stats.totalAmount)}</div>
            <div className="salary-stat-label">Total Amount</div>
          </div>
        </div>

        <div className="salary-stat-card paid-amount">
          <div className="salary-stat-icon">
            <i className="fas fa-hand-holding-usd"></i>
          </div>
          <div className="salary-stat-content">
            <div className="salary-stat-value">{formatCurrency(stats.paidAmount)}</div>
            <div className="salary-stat-label">Paid Amount</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="salary-filters">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input-salary"
        />
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="filter-select-salary"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Employees Table */}
      <div className="salary-table-container">
        <table className="salary-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Base Salary</th>
              <th>Net Salary</th>
              <th>Status</th>
              <th>Payment Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(employee => {
              const record = employee.salaryRecord;
              const statusInfo = record ? getStatusInfo(record.status) : null;

              return (
                <tr key={employee._id}>
                  <td>
                    <div className="employee-cell-salary">
                      <div className="employee-avatar-salary">
                        {employee.name.charAt(0)}
                      </div>
                      <div>
                        <div className="employee-name-salary">{employee.name}</div>
                        <div className="employee-id-salary">{employee._id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td>{employee.department}</td>
                  <td>
                    <span className="salary-amount">
                      {formatCurrency(employee.baseSalary)}
                    </span>
                  </td>
                  <td>
                    {record ? (
                      <span className="salary-amount highlight">
                        {formatCurrency(record.netSalary)}
                      </span>
                    ) : (
                      <span className="not-processed">Not Processed</span>
                    )}
                  </td>
                  <td>
                    {statusInfo ? (
                      <span
                        className="status-badge-salary"
                        style={{ background: `${statusInfo.color}20`, color: statusInfo.color }}
                      >
                        <i className={`fas ${statusInfo.icon}`}></i>
                        {statusInfo.label}
                      </span>
                    ) : (
                      <span className="status-badge-salary" style={{ background: '#f5f5f5', color: '#757575' }}>
                        <i className="fas fa-minus"></i>
                        Not Processed
                      </span>
                    )}
                  </td>
                  <td>
                    {record && record.paymentDate ? (
                      <span className="payment-date">{formatDate(record.paymentDate)}</span>
                    ) : (
                      <span className="not-processed">-</span>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      {!record ? (
                        <button
                          className="action-btn-salary process"
                          onClick={() => openProcessModal(employee)}
                        >
                          <i className="fas fa-calculator"></i>
                          Process
                        </button>
                      ) : record.status === 'pending' || record.status === 'processing' ? (
                        <>
                          <button
                            className="action-btn-salary paid"
                            onClick={() => markAsPaid(record.id)}
                          >
                            <i className="fas fa-check"></i>
                            Pay
                          </button>
                          <button
                            className="action-btn-salary view"
                            onClick={() => viewDetails(employee)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </>
                      ) : (
                        <button
                          className="action-btn-salary view"
                          onClick={() => viewDetails(employee)}
                        >
                          <i className="fas fa-eye"></i>
                          View
                        </button>
                      )}
                      <button
                        className="action-btn-salary edit"
                        onClick={() => openEditSalary(employee)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Process Salary Modal */}
      {showProcessModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowProcessModal(false)}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-calculator"></i>
                Process Salary - {selectedEmployee.name}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowProcessModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={processSalary}>
              <div className="modal-body">
                <div className="salary-form-grid">
                  <div className="form-group">
                    <label>Base Salary</label>
                    <input
                      type="number"
                      name="baseSalary"
                      value={salaryForm.baseSalary}
                      onChange={handleInputChange}
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Allowances</label>
                    <input
                      type="number"
                      name="allowances"
                      value={salaryForm.allowances}
                      onChange={handleInputChange}
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label>Bonus</label>
                    <input
                      type="number"
                      name="bonus"
                      value={salaryForm.bonus}
                      onChange={handleInputChange}
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label>Deductions</label>
                    <input
                      type="number"
                      name="deductions"
                      value={salaryForm.deductions}
                      onChange={handleInputChange}
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label>Overtime Hours</label>
                    <input
                      type="number"
                      name="overtimeHours"
                      value={salaryForm.overtimeHours}
                      onChange={handleInputChange}
                      step="0.5"
                    />
                  </div>

                  <div className="form-group">
                    <label>Overtime Rate (per hour)</label>
                    <input
                      type="number"
                      name="overtimeRate"
                      value={salaryForm.overtimeRate}
                      onChange={handleInputChange}
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="salary-calculation">
                  <h4>Salary Breakdown</h4>
                  <div className="calculation-grid">
                    <div className="calc-item">
                      <span className="calc-label">Base Salary:</span>
                      <span className="calc-value">{formatCurrency(salaryForm.baseSalary)}</span>
                    </div>
                    <div className="calc-item">
                      <span className="calc-label">Allowances:</span>
                      <span className="calc-value">{formatCurrency(salaryForm.allowances)}</span>
                    </div>
                    <div className="calc-item">
                      <span className="calc-label">Bonus:</span>
                      <span className="calc-value">{formatCurrency(salaryForm.bonus)}</span>
                    </div>
                    <div className="calc-item">
                      <span className="calc-label">Overtime Pay:</span>
                      <span className="calc-value">
                        {formatCurrency(calculateSalary().overtimePay)}
                      </span>
                    </div>
                    <div className="calc-item total">
                      <span className="calc-label">Gross Salary:</span>
                      <span className="calc-value">
                        {formatCurrency(calculateSalary().grossSalary)}
                      </span>
                    </div>
                    <div className="calc-item deduction">
                      <span className="calc-label">Deductions:</span>
                      <span className="calc-value">
                        -{formatCurrency(salaryForm.deductions)}
                      </span>
                    </div>
                    <div className="calc-item deduction">
                      <span className="calc-label">Tax (15%):</span>
                      <span className="calc-value">
                        -{formatCurrency(calculateSalary().taxAmount)}
                      </span>
                    </div>
                    <div className="calc-item final">
                      <span className="calc-label">Net Salary:</span>
                      <span className="calc-value">
                        {formatCurrency(calculateSalary().netSalary)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Payment Month</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    max={new Date().toISOString().slice(0, 7)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowProcessModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-check"></i>
                  Process Salary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedEmployee && selectedEmployee.salaryRecord && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-file-invoice-dollar"></i>
                Salary Details - {selectedEmployee.name}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowDetailsModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="details-header-salary">
                <div className="employee-info-details">
                  <div className="employee-avatar-details">
                    {selectedEmployee.name.charAt(0)}
                  </div>
                  <div>
                    <h3>{selectedEmployee.name}</h3>
                    <p>{selectedEmployee.department}</p>
                    <p className="account-info">
                      {selectedEmployee.accountNumber} - {selectedEmployee.bankName}
                    </p>
                  </div>
                </div>
                <div className="status-info-details">
                  <span
                    className="status-badge-large"
                    style={{
                      background: `${getStatusInfo(selectedEmployee.salaryRecord.status).color}20`,
                      color: getStatusInfo(selectedEmployee.salaryRecord.status).color
                    }}
                  >
                    <i className={`fas ${getStatusInfo(selectedEmployee.salaryRecord.status).icon}`}></i>
                    {getStatusInfo(selectedEmployee.salaryRecord.status).label}
                  </span>
                </div>
              </div>

              <div className="salary-details-grid">
                <div className="detail-section">
                  <h4>Earnings</h4>
                  <div className="detail-items">
                    <div className="detail-row">
                      <span>Base Salary</span>
                      <span className="amount">
                        {formatCurrency(selectedEmployee.salaryRecord.baseSalary)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Allowances</span>
                      <span className="amount">
                        {formatCurrency(selectedEmployee.salaryRecord.allowances)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Bonus</span>
                      <span className="amount">
                        {formatCurrency(selectedEmployee.salaryRecord.bonus)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>
                        Overtime ({selectedEmployee.salaryRecord.overtimeHours}h @ {formatCurrency(selectedEmployee.salaryRecord.overtimeRate)}/h)
                      </span>
                      <span className="amount">
                        {formatCurrency(selectedEmployee.salaryRecord.overtimePay)}
                      </span>
                    </div>
                    <div className="detail-row total">
                      <span>Gross Salary</span>
                      <span className="amount">
                        {formatCurrency(selectedEmployee.salaryRecord.grossSalary)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Deductions</h4>
                  <div className="detail-items">
                    <div className="detail-row">
                      <span>Deductions</span>
                      <span className="amount deduction">
                        -{formatCurrency(selectedEmployee.salaryRecord.deductions)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Tax (15%)</span>
                      <span className="amount deduction">
                        -{formatCurrency(selectedEmployee.salaryRecord.taxAmount)}
                      </span>
                    </div>
                    <div className="detail-row total">
                      <span>Total Deductions</span>
                      <span className="amount deduction">
                        -{formatCurrency(selectedEmployee.salaryRecord.deductions + selectedEmployee.salaryRecord.taxAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="net-salary-display">
                <span className="net-label">Net Salary</span>
                <span className="net-amount">
                  {formatCurrency(selectedEmployee.salaryRecord.netSalary)}
                </span>
              </div>

              <div className="payment-info-grid">
                <div className="info-item-salary">
                  <i className="far fa-calendar"></i>
                  <div>
                    <div className="info-label">Payment Month</div>
                    <div className="info-value">{formatMonth(selectedEmployee.salaryRecord.month)}</div>
                  </div>
                </div>
                {selectedEmployee.salaryRecord.paymentDate && (
                  <div className="info-item-salary">
                    <i className="far fa-calendar-check"></i>
                    <div>
                      <div className="info-label">Payment Date</div>
                      <div className="info-value">{formatDate(selectedEmployee.salaryRecord.paymentDate)}</div>
                    </div>
                  </div>
                )}
                {selectedEmployee.salaryRecord.processedBy && (
                  <div className="info-item-salary">
                    <i className="fas fa-user-tie"></i>
                    <div>
                      <div className="info-label">Processed By</div>
                      <div className="info-value">{selectedEmployee.salaryRecord.processedBy}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => window.print()}
              >
                <i className="fas fa-print"></i>
                Print Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Salary Modal */}
      {showEditSalaryModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowEditSalaryModal(false)}>
          <div className="modal-container modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-edit"></i>
                Edit Base Salary - {selectedEmployee.name}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowEditSalaryModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={updateBaseSalary}>
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    Base Salary <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="baseSalary"
                    value={salaryForm.baseSalary}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="info-box">
                  <i className="fas fa-info-circle"></i>
                  <div>
                    This will update the employee's base salary for future payroll processing.
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEditSalaryModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-save"></i>
                  Update Salary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryManagement;