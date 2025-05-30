// frontend/src/components/ServiceForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ServiceForm = () => {
  const [formData, setFormData] = useState({
    PlateNumber: '',
    PackageNumber: ''
  });

  const [cars, setCars] = useState([]);
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editServiceId, setEditServiceId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [carRes, packageRes, serviceRes] = await Promise.all([
          axios.get('https://octopus-wash-api.onrender.com/api/cars'),
          axios.get('https://octopus-wash-api.onrender.com/api/packages'),
          axios.get('https://octopus-wash-api.onrender.com/api/services'),
        ]);
        setCars(carRes.data);
        setPackages(packageRes.data);
        setServices(serviceRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load cars or packages data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      if (editMode) {
        // Update existing service
        await axios.put(`https://octopus-wash-api.onrender.com/api/services/${editServiceId}`, formData);
        setSuccess('Service updated successfully!');
      } else {
        // Add new service
        await axios.post('https://octopus-wash-api.onrender.com/api/services', formData);
        setSuccess('Service recorded successfully!');
      }
      setFormData({ PlateNumber: '', PackageNumber: '' });
      setEditMode(false);
      setEditServiceId(null);

      // Refresh service list after submission
      const res = await axios.get('https://octopus-wash-api.onrender.com/api/services');
      setServices(res.data);
    } catch (err) {
      setError(err.response?.data?.error || (editMode ? 'Failed to update service.' : 'Failed to add service.'));
      console.error('Error adding/updating service:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditMode(true);
    setEditServiceId(service.RecordNumber);
    setFormData({
      PlateNumber: service.PlateNumber,
      PackageNumber: service.PackageNumber || '',
    });
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await axios.delete(`https://octopus-wash-api.onrender.com/api/services/${serviceId}`);
      setSuccess('Service deleted successfully!');
      // Refresh service list after deletion
      const res = await axios.get('https://octopus-wash-api.onrender.com/api/services');
      setServices(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete service.');
      console.error('Error deleting service:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditServiceId(null);
    setFormData({ PlateNumber: '', PackageNumber: '' });
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl space-y-8">
        {/* Record New Service Section */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-amber-400 mb-6 text-center">{editMode ? 'Edit Service' : 'Service Chamber'}</h2>

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
                <label htmlFor="PlateNumber" className="block text-sm font-medium text-gray-300 mb-1">
                  Car Plate Number
                </label>
                <select
                  name="PlateNumber"
                  id="PlateNumber"
                  value={formData.PlateNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-200"
                  required
                  disabled={editMode}
                >
                  <option value="">Select Car</option>
                  {cars.map((car) => (
                    <option key={car.PlateNumber} value={car.PlateNumber}>
                      {car.PlateNumber} - {car.DriverName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="PackageNumber" className="block text-sm font-medium text-gray-300 mb-1">
                  Service Package
                </label>
                <select
                  name="PackageNumber"
                  id="PackageNumber"
                  value={formData.PackageNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-200"
                  required
                >
                  <option value="">Select Package</option>
                  {packages.map((pkg) => (
                    <option key={pkg.PackageNumber} value={pkg.PackageNumber}>
                      {pkg.PackageName} ({pkg.PackagePrice}$)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-75"
              disabled={loading}
            >
              {loading ? (editMode ? 'Updating Service...' : 'Adding Service...') : (editMode ? 'Update Service' : 'Service Chamber')}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={cancelEdit}
                className="w-full mt-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-75"
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* Service History Section */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-amber-400 mb-6 text-center">Recent Services</h2>
          {loading && <p className="text-center text-gray-400">Loading services...</p>}
          {services.length === 0 && !loading && (
            <p className="text-center text-gray-400">No services recorded yet.</p>
          )}

          {services.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider rounded-tl-lg">
                      Service Date
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Car Plate
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Package
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider rounded-tr-lg">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.RecordNumber} className="hover:bg-gray-750 transition duration-150 ease-in-out">
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {new Date(service.ServiceDate).toLocaleString()}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {service.PlateNumber}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {service.DriverName}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {service.PackageName}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {service.PackagePrice || 'N/A'}$
                      </td>
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(service.RecordNumber)}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded"
                        >
                          Delete
                        </button>
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

export default ServiceForm;
