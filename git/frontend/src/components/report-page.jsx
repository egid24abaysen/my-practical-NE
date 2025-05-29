import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/reports');
      setReportData(response.data);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-gray-400 text-xl">Loading reports...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-red-500 text-xl">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl">
        <h2 className="text-4xl font-extrabold text-emerald-400 mb-8 text-center">System Overview Reports</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-emerald-700 p-6 rounded-xl shadow-lg border border-emerald-600 transform hover:scale-105 transition duration-300 ease-in-out">
            <h3 className="text-xl font-semibold text-white mb-2">Total Services Rendered</h3>
            <p className="text-5xl font-bold text-emerald-100">
              {reportData?.services?.totalServices ?? 0}
            </p>
          </div>

          <div className="bg-sky-700 p-6 rounded-xl shadow-lg border border-sky-600 transform hover:scale-105 transition duration-300 ease-in-out">
            <h3 className="text-xl font-semibold text-white mb-2">Total Revenue Generated</h3>
            <p className="text-5xl font-bold text-sky-100">
              {(reportData?.services?.totalRevenue ?? 0)}RWF
            </p>
          </div>

          <div className="bg-purple-700 p-6 rounded-xl shadow-lg border border-purple-600 transform hover:scale-105 transition duration-300 ease-in-out">
            <h3 className="text-xl font-semibold text-white mb-2">Total Payments Recorded</h3>
            <p className="text-5xl font-bold text-purple-100">
              {reportData?.payments?.totalPayments ?? 0}
            </p>
          </div>
        </div>

        {/* Most Popular Packages Table */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-2xl font-semibold text-emerald-400 mb-6 text-center">Most Popular Packages</h3>
          {reportData?.popularPackages?.length === 0 ? (
            <p className="text-center text-gray-400">No popular packages data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider rounded-tl-lg">
                      Package Name
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider rounded-tr-lg">
                      Number of Services
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData?.popularPackages?.map((pkg, index) => (
                    <tr key={index} className="hover:bg-gray-750 transition duration-150 ease-in-out">
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {pkg.PackageName}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {pkg.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="text-center">
          <button
            onClick={()=> window.print()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold ml-1 py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-75"
        
          >
            Generate report
          </button>
          <button
            onClick={fetchReportData}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-75"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;