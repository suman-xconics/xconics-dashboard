import { useState } from "react";
import { loginUser } from "../api/authApi";
import "./CreateUser.css";

export default function CreateUser() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ EXACT payload as Swagger
    const payload = {
      email: formData.email.trim(),
      password: formData.password,
    };

    console.log("LOGIN PAYLOAD:", payload); // 🔍 debug

    try {
      setLoading(true);

      const res = await loginUser(payload);

      // ✅ Swagger: token is directly in data
      const token = res.data.data;

      localStorage.setItem("token", token);

      alert("Login successful");
      console.log("JWT TOKEN:", token);

    } catch (err) {
      console.error("LOGIN FAILED:", err.response?.data || err.message);
      alert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-user-container">
      <h1>Sign In</h1>

      <form className="create-user-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="user@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
