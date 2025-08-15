import { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    qualification: '',
    dob: ''
  });

  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await axios.post('http://localhost:5000/api/auth/register', formData);

    // auto-login after registration
    dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form 
        onSubmit={handleRegister} 
        className="bg-white p-6 rounded-lg shadow-lg w-96"
      >
        <h1 className="text-2xl font-bold mb-4">Register</h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="border p-2 w-full mb-4"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border p-2 w-full mb-4"
          value={formData.password}
          onChange={handleChange}
        />

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          className="border p-2 w-full mb-4"
          value={formData.fullName}
          onChange={handleChange}
        />

        <input
          type="text"
          name="qualification"
          placeholder="Qualification"
          className="border p-2 w-full mb-4"
          value={formData.qualification}
          onChange={handleChange}
        />

        <input
          type="date"
          name="dob"
          placeholder="Date of Birth"
          className="border p-2 w-full mb-4"
          value={formData.dob}
          onChange={handleChange}
        />

        <button className="bg-green-500 text-white px-4 py-2 rounded w-full">
          Register
        </button>
      </form>
    </div>
  );
}
