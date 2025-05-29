// frontend/src/components/PackageForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PackageForm = () => {
  const [formData, setFormData] = useState({
    PackageName: '',
    PackageDescription: '',
    PackagePrice: ''
  });

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingPackageNumber, setEditingPackageNumber] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/packages');
      setPackages(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch packages. Please try again.');
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingPackageNumber) {
        await axios.put(`http://localhost:5000/api/packages/${editingPackageNumber}`, {
          ...formData,
          PackagePrice: parseFloat(formData.PackagePrice)
        });
        setSuccess('Package updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/packages', {
          ...formData,
          PackagePrice: parseFloat(formData.PackagePrice)
        });
        setSuccess('Package added successfully!');
      }

      setFormData({
        PackageName: '',
        PackageDescription: '',
        PackagePrice: ''
      });
      setEditingPackageNumber(null);
      setError(null);
      fetchPackages(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save package.');
      console.error('Error saving package:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl space-y-8">
        {/* Form Section */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-teal-400 mb-6 text-center">
            {editingPackageNumber ? 'Edit Package Details' : 'Add New Package'}
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
                <label htmlFor="PackageName" className="block text-sm font-medium text-gray-300 mb-1">
                  Package Name
                </label>
                <input
                  type="text"
                  name="PackageName"
                  id="PackageName"
                  value={formData.PackageName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                  required
                />
              </div>
              <div>
                <label htmlFor="PackagePrice" className="block text-sm font-medium text-gray-300 mb-1">
                  Package Price (RWF)
                </label>
                <input
                  type="number"
                  name="PackagePrice"
                  id="PackagePrice"
                  value={formData.PackagePrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                  step="0.01"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="PackageDescription" className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="PackageDescription"
                  id="PackageDescription"
                  value={formData.PackageDescription}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 h-24 resize-y"
                  rows="3"
                  required
                ></textarea>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingPackageNumber ? 'Update Package' : 'Add Package'}
            </button>
            {editingPackageNumber && (
              <button
                type="button"
                onClick={() => {
                  setEditingPackageNumber(null);
                  setFormData({ PackageName: '', PackageDescription: '', PackagePrice: '' });
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

        {/* Packages List Section */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-teal-400 mb-6 text-center">Available Packages</h2>
          {loading && <p className="text-center text-gray-400">Loading packages...</p>}
          {packages.length === 0 && !loading && (
            <p className="text-center text-gray-400">No packages found.</p>
          )}

          {packages.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider rounded-tl-lg">
                      Name
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                   
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => (
                    <tr key={pkg.PackageNumber} className="hover:bg-gray-750 transition duration-150 ease-in-out">
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {pkg.PackageName}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {pkg.PackageDescription}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {pkg.PackagePrice}RWF
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

export default PackageForm;