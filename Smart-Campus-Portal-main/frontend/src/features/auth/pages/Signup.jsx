import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { registerUser } from "../services/authService";

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    department: "1",
    rollNumber: "",
    semester: 1
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.fullName || !form.email || !form.phone || !form.password) {
      return "Please fill in all required fields.";
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      return "Enter a valid institutional email address.";
    }
    if (form.password.length < 6) {
      return "Password must be at least 6 characters.";
    }
    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        department: form.department,
        rollNumber: form.rollNumber,
        semester: form.semester
      };
      await registerUser(payload);
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "rounded-lg px-3 py-1.5 bg-white text-black text-sm outline-none focus:ring-2 focus:ring-black/40";

  return (
    <div className="min-h-screen w-full bg-graphite flex justify-center items-center px-4 py-8">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-yellow-200 rounded-3xl shadow-3xl px-6 py-5">
        <Link
          to="/login"
          className="absolute top-5 left-5 text-black transition-all duration-900 hover:rotate-30 hover:opacity-60 cursor-pointer"
        >
          <BiArrowBack size={22} />
        </Link>

        <h1 className="text-xl font-bold text-center text-black tracking-tight mt-5">
          Create Account
        </h1>
        <p className="text-carbon-black-600 text-xs font-semibold text-center mb-4">
          Enter your details to create a student account.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="text"
              name="fullName"
              placeholder="Full name"
              value={form.fullName}
              onChange={handleChange}
              className={`col-span-2 ${inputClass}`}
            />
            <input
              type="email"
              name="email"
              placeholder="name@campus.edu"
              value={form.email}
              onChange={handleChange}
              className={`col-span-2 ${inputClass}`}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone number"
              value={form.phone}
              onChange={handleChange}
              className={`col-span-2 ${inputClass}`}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="border-t border-black/10 pt-2.5 mt-0.5">
            <p className="text-xs font-semibold text-carbon-black-600 mb-2">
              Student details
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="text"
                name="rollNumber"
                placeholder="Roll Number (e.g. 2024CSB1001)"
                value={form.rollNumber}
                onChange={handleChange}
                className={`col-span-2 ${inputClass}`}
              />
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="1">Computer Science & Engg</option>
                <option value="2">Electronics & Comm Engg</option>
                <option value="3">Mechanical Engg</option>
                <option value="4">Civil Engg</option>
                <option value="5">Information Technology</option>
              </select>
              <select
                name="semester"
                value={form.semester}
                onChange={handleChange}
                className={inputClass}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-red-700 text-xs font-semibold text-center mt-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-yellow-300 font-bold py-2 rounded-full mt-2 hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-carbon-black-600 font-semibold mt-3 mb-1">
          Already have an account?{" "}
          <Link to="/login" className="text-black underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;