import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    RecordNumber: '',
    AmountPaid: ''
  });
  const [payments, setPayments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingPaymentId, setEditingPaymentId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesRes, paymentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/services'),
        axios.get('http://localhost:5000/api/payments')
      ]);
      setServices(servicesRes.data);
      setPayments(paymentsRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.RecordNumber || !formData.AmountPaid) {
      setError('Please select a service and enter amount paid');
      return;
    }

    try {
      setLoading(true);
      if (editingPaymentId) {
        // Update existing payment
        await axios.put(`http://localhost:5000/api/payments/${editingPaymentId}`, {
          RecordNumber: formData.RecordNumber,
          AmountPaid: parseFloat(formData.AmountPaid)
        });
        setSuccess('Payment updated successfully!');
      } else {
        // Create new payment
        await axios.post('http://localhost:5000/api/payments', {
          RecordNumber: formData.RecordNumber,
          AmountPaid: parseFloat(formData.AmountPaid)
        });
        setSuccess('Payment recorded successfully!');
      }
      setFormData({
        RecordNumber: '',
        AmountPaid: ''
      });
      setEditingPaymentId(null);
      setError(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record payment');
      console.error('Error recording payment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl space-y-8">
        {/* Payment Form Section */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-indigo-400 mb-6 text-center">
            {editingPaymentId ? 'Edit Payment' : 'Record New Payment'}
          </h2>

          {error && (
            <div className="bg-red-600 text-white p-3 rounded-md mb-4 text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-600 text-white p-3 rounded-md mb-4 text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="RecordNumber" className="block text-sm font-medium text-gray-300 mb-1">
                  Service*
                </label>
                <select
                  name="RecordNumber"
                  id="RecordNumber"
                  value={formData.RecordNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  required
                >
                  <option value="">Select Service</option>
                  {services.map((service) => (
                    <option key={service.RecordNumber} value={service.RecordNumber}>
                      {new Date(service.ServiceDate).toLocaleDateString()} - {service.PlateNumber} - {service.PackageName} (${service.PackagePrice})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="AmountPaid" className="block text-sm font-medium text-gray-300 mb-1">
                  Amount Paid* (RWF)
                </label>
                <input
                  type="number"
                  name="AmountPaid"
                  id="AmountPaid"
                  value={formData.AmountPaid}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingPaymentId ? 'Update Payment' : 'Record Payment'}
            </button>
            {editingPaymentId && (
              <button
                type="button"
                onClick={() => {
                  setEditingPaymentId(null);
                  setFormData({ RecordNumber: '', AmountPaid: '' });
                  setError(null);
                  setSuccess(null);
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 mt-4"
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        {/* Payments List Section */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-indigo-400 mb-6 text-center">Payment History</h2>
          {loading && <p className="text-center text-gray-400">Loading payments...</p>}
          {payments.length === 0 && !loading && (
            <p className="text-center text-gray-400">No payments found.</p>
          )}

          {payments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider rounded-tl-lg">
                      Payment Date
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Plate Number
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Package Name
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Package Price
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Amount Paid
                    </th>
                    
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.PaymentNumber} className="hover:bg-gray-750 transition duration-150 ease-in-out">
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {new Date(payment.PaymentDate).toLocaleString()}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {payment.PlateNumber}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {payment.PackageName}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {payment.PackagePrice || 'N/A'}RWF
                      </td>
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {payment.AmountPaid}RWF
                      </td>
                     
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;