import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Papa from 'papaparse';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const TNAReport = () => {
  const [trainingRequests, setTrainingRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsRes, usersRes] = await Promise.all([
        API.get('/training-request/all'),
        API.get('/auth/users')
      ]);
      
      setTrainingRequests(requestsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError('Failed to fetch data for TNA report');
      console.error('Error fetching TNA data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on selected filters
  const filteredRequests = useMemo(() => {
    let filtered = trainingRequests;

    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter(req => req.user?.department === selectedDepartment);
    }

    // Filter by time range
    if (selectedTimeRange !== 'all') {
      const now = new Date();
      const timeRanges = {
        '30days': 30,
        '90days': 90,
        '6months': 180,
        '1year': 365
      };
      
      const daysBack = timeRanges[selectedTimeRange];
      const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
      
      filtered = filtered.filter(req => new Date(req.createdAt) >= cutoffDate);
    }

    return filtered;
  }, [trainingRequests, selectedDepartment, selectedTimeRange]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const departments = [...new Set(users.map(u => u.department))];
    
    // Department-wise training requests
    const departmentData = departments.map(dept => {
      const deptRequests = filteredRequests.filter(req => req.user?.department === dept);
      return {
        department: dept,
        requests: deptRequests.length,
        approved: deptRequests.filter(req => req.status.includes('Approved')).length,
        pending: deptRequests.filter(req => req.status.includes('Pending')).length,
        rejected: deptRequests.filter(req => req.status.includes('Rejected')).length
      };
    }).filter(item => item.requests > 0);

    // Training categories analysis
    const trainingCategories = {
      'Technical Skills': 0,
      'Soft Skills': 0,
      'Tools & Software': 0,
      'Leadership': 0,
      'Communication': 0,
      'Data Analysis': 0,
      'Certifications': 0,
      'Other': 0
    };

    filteredRequests.forEach(req => {
      if (req.technicalSkills) trainingCategories['Technical Skills']++;
      if (req.softSkills) trainingCategories['Soft Skills']++;
      if (req.toolsTraining) trainingCategories['Tools & Software']++;
      if (req.softSkills?.toLowerCase().includes('leadership')) trainingCategories['Leadership']++;
      if (req.softSkills?.toLowerCase().includes('communication')) trainingCategories['Communication']++;
      if (req.dataTraining) trainingCategories['Data Analysis']++;
      if (req.certifications) trainingCategories['Certifications']++;
    });

    const categoryData = Object.entries(trainingCategories)
      .map(([category, count]) => ({ category, count }))
      .filter(item => item.count > 0);

    // Training format preferences
    const formatPreferences = {};
    filteredRequests.forEach(req => {
      if (req.trainingFormat) {
        formatPreferences[req.trainingFormat] = (formatPreferences[req.trainingFormat] || 0) + 1;
      }
    });

    const formatData = Object.entries(formatPreferences)
      .map(([format, count]) => ({ format, count }));

    // Monthly trend analysis
    const monthlyData = {};
    filteredRequests.forEach(req => {
      const month = new Date(req.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    const trendData = Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));

    // Priority areas analysis
    const priorityAreas = {};
    filteredRequests.forEach(req => {
      if (req.areaNeed) {
        priorityAreas[req.areaNeed] = (priorityAreas[req.areaNeed] || 0) + 1;
      }
    });

    const priorityData = Object.entries(priorityAreas)
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalRequests: filteredRequests.length,
      approvedRequests: filteredRequests.filter(req => req.status.includes('Approved')).length,
      pendingRequests: filteredRequests.filter(req => req.status.includes('Pending')).length,
      rejectedRequests: filteredRequests.filter(req => req.status.includes('Rejected')).length,
      departmentData,
      categoryData,
      formatData,
      trendData,
      priorityData,
      departments
    };
  }, [filteredRequests, users]);

  const exportToCSV = () => {
    const csvData = filteredRequests.map(req => ({
      'Request ID': req.requestNumber,
      'Employee Name': req.user?.name || 'N/A',
      'Department': req.user?.department || 'N/A',
      'Role': req.user?.role || 'N/A',
      'Location': req.user?.location || 'N/A',
      'Status': req.status,
      'Submitted Date': new Date(req.createdAt).toLocaleDateString(),
      'General Skills': req.generalSkills || '',
      'Tools Training': req.toolsTraining || '',
      'Soft Skills': req.softSkills || '',
      'Technical Skills': req.technicalSkills || '',
      'Certifications': req.certifications || '',
      'Training Format': req.trainingFormat || '',
      'Training Duration': req.trainingDuration || '',
      'Priority Area': req.areaNeed || '',
      'Career Goals': req.careerGoals || ''
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TNA_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDFReport = () => {
    // Create a comprehensive report content
    const reportContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #2563eb; text-align: center;">Training Needs Analysis Report</h1>
        <p style="text-align: center; color: #666;">Generated on ${new Date().toLocaleDateString()}</p>
        
        <h2>Executive Summary</h2>
        <ul>
          <li>Total Training Requests: ${analytics.totalRequests}</li>
          <li>Approved Requests: ${analytics.approvedRequests}</li>
          <li>Pending Requests: ${analytics.pendingRequests}</li>
          <li>Rejected Requests: ${analytics.rejectedRequests}</li>
        </ul>

        <h2>Department-wise Analysis</h2>
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <tr>
            <th>Department</th>
            <th>Total Requests</th>
            <th>Approved</th>
            <th>Pending</th>
            <th>Rejected</th>
          </tr>
          ${analytics.departmentData.map(dept => `
            <tr>
              <td>${dept.department}</td>
              <td>${dept.requests}</td>
              <td>${dept.approved}</td>
              <td>${dept.pending}</td>
              <td>${dept.rejected}</td>
            </tr>
          `).join('')}
        </table>

        <h2>Top Priority Training Areas</h2>
        <ol>
          ${analytics.priorityData.slice(0, 5).map(item => `
            <li>${item.area}: ${item.count} requests</li>
          `).join('')}
        </ol>

        <h2>Recommendations</h2>
        <ul>
          <li>Focus on high-demand training areas identified in the priority analysis</li>
          <li>Consider department-specific training programs for departments with high request volumes</li>
          <li>Implement preferred training formats to improve engagement</li>
          <li>Address pending requests to improve employee satisfaction</li>
        </ul>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(reportContent);
    printWindow.document.close();
    printWindow.print();
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium">Generating TNA Report...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Report</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5K42hVGPlbGNM1cnJt7_vKICraUbzYmmlcA&s" 
                  alt="IGL Logo" 
                  className="h-12 w-auto rounded-lg shadow-md" 
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Training Needs Analysis Report
                </h1>
                <p className="text-blue-200 text-sm">Comprehensive Training Requirements Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="flex items-center gap-2">
                  📊 Export CSV
                </span>
              </button>
              
              <button
                onClick={generatePDFReport}
                className="group relative bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="flex items-center gap-2">
                  📄 Print Report
                </span>
              </button>
              
              <button
                onClick={() => navigate(-1)}
                className="group relative bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="flex items-center gap-2">
                  ← Back
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            Filters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">All Departments</option>
                {analytics.departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">All Time</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'Total Requests', value: analytics.totalRequests, icon: '📋', color: 'blue' },
            { title: 'Approved', value: analytics.approvedRequests, icon: '✅', color: 'green' },
            { title: 'Pending', value: analytics.pendingRequests, icon: '⏳', color: 'yellow' },
            { title: 'Rejected', value: analytics.rejectedRequests, icon: '❌', color: 'red' }
          ].map((card, index) => (
            <div key={index} className={`bg-white rounded-2xl shadow-xl p-6 border border-gray-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-${card.color}-100`}>
                  <span className="text-2xl">{card.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Department Analysis */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🏢</span>
              Department-wise Training Requests
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="requests" fill="#3B82F6" name="Total Requests" />
                <Bar dataKey="approved" fill="#10B981" name="Approved" />
                <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Training Categories */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📚</span>
              Training Categories Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Training Format Preferences */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Training Format Preferences
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.formatData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="format" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trend */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📈</span>
              Monthly Request Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#EF4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Areas Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Top Priority Training Areas
          </h3>
          
          {analytics.priorityData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training Area</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.priorityData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.area}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {((item.count / analytics.totalRequests) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-500">No priority area data available</p>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Key Recommendations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-800 mb-2">High-Demand Areas</h4>
                <p className="text-blue-700 text-sm">
                  Focus training budget on the top 3 priority areas: {analytics.priorityData.slice(0, 3).map(item => item.area).join(', ')}
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <h4 className="font-semibold text-green-800 mb-2">Department Focus</h4>
                <p className="text-green-700 text-sm">
                  {analytics.departmentData.length > 0 && 
                    `${analytics.departmentData.sort((a, b) => b.requests - a.requests)[0]?.department} has the highest training demand with ${analytics.departmentData.sort((a, b) => b.requests - a.requests)[0]?.requests} requests`
                  }
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <h4 className="font-semibold text-yellow-800 mb-2">Format Optimization</h4>
                <p className="text-yellow-700 text-sm">
                  {analytics.formatData.length > 0 && 
                    `Most preferred format: ${analytics.formatData.sort((a, b) => b.count - a.count)[0]?.format}. Consider this for maximum engagement.`
                  }
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-semibold text-purple-800 mb-2">Approval Rate</h4>
                <p className="text-purple-700 text-sm">
                  Current approval rate: {analytics.totalRequests > 0 ? ((analytics.approvedRequests / analytics.totalRequests) * 100).toFixed(1) : 0}%. 
                  Consider reviewing pending requests to improve employee satisfaction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TNAReport;