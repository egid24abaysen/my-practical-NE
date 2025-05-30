import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CarForm = () => {
  const [formData, setFormData] = useState({
    PlateNumber: '',
    CarType: '',
    CarSize: '',
    DriverName: '',
    PhoneNumber: '',
  });
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingCarPlate, setEditingCarPlate] = useState(null); // To store the plate number of the car being edited

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://octopus-wash-api.onrender.com/api/cars');
      setCars(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cars. Please try again.');
      console.error('Error fetching cars:', err);
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
      if (editingCarPlate) {
        // Update existing car
        await axios.put(`https://octopus-wash-api.onrender.com/api/cars/${editingCarPlate}`, formData);
        setSuccess('Car updated successfully!');
      } else {
        // Create new car
        await axios.post('https://octopus-wash-api.onrender.com/api/cars', formData);
        setSuccess('Car added successfully!');
      }
      setFormData({
        PlateNumber: '',
        CarType: '',
        CarSize: '',
        DriverName: '',
        PhoneNumber: '',
      });
      setEditingCarPlate(null);
      setError(null);
      fetchCars(); // Refresh the cars list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save car details.');
      console.error('Error saving car:', err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl space-y-8">
        {/* Car Form Section */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-sky-400 mb-6 text-center">
            {editingCarPlate ? 'Edit Car Details' : 'Add New Car'}
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
                <label htmlFor="PlateNumber" className="block text-sm font-medium text-gray-300 mb-1">
                  Plate Number
                </label>
                <input
                  type="text"
                  name="PlateNumber"
                  id="PlateNumber"
                  value={formData.PlateNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
                  required
                  disabled={!!editingCarPlate}
                />
              </div>
              <div>
                <label htmlFor="CarType" className="block text-sm font-medium text-gray-300 mb-1">
                  Car Type
                </label>
                <input
                  type="text"
                  name="CarType"
                  id="CarType"
                  value={formData.CarType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
                  required
                />
              </div>
              <div>
                <label htmlFor="CarSize" className="block text-sm font-medium text-gray-300 mb-1">
                  Car Size
                </label>
                <input
                  type="text"
                  name="CarSize"
                  id="CarSize"
                  value={formData.CarSize}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
                  required
                />
              </div>
              <div>
                <label htmlFor="DriverName" className="block text-sm font-medium text-gray-300 mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  name="DriverName"
                  id="DriverName"
                  value={formData.DriverName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="PhoneNumber" className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="PhoneNumber"
                  id="PhoneNumber"
                  value={formData.PhoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingCarPlate ? 'Update Car' : 'Add Car'}
            </button>
            {editingCarPlate && (
              <button
                type="button"
                onClick={() => {
                  setEditingCarPlate(null);
                  setFormData({
                    PlateNumber: '', CarType: '', CarSize: '', DriverName: '', PhoneNumber: '',
                  });
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

        {/* Cars List Section */}
        <div className="bg-gray-700 p-6 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-sky-400 mb-6 text-center">Registered Cars</h2>
          {loading && <p className="text-center text-gray-400">Loading cars...</p>}
          {cars.length === 0 && !loading && (
            <p className="text-center text-gray-400">No cars found.</p>
          )}

          {cars.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider rounded-tl-lg">
                      Plate Number
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Car Type
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Car Size
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-600 bg-gray-800 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Phone
                    </th>
                   
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car.PlateNumber} className="hover:bg-gray-750 transition duration-150 ease-in-out">
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {car.PlateNumber}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {car.CarType}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {car.CarSize}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {car.DriverName}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-600 bg-gray-700 text-sm text-gray-200">
                        {car.PhoneNumber}
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

export default CarForm;
