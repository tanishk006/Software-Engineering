import { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import ClickSpark from '../../../Components/ui/ClickSpark';
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useAuth } from '../../../context/AuthContext';
import { getCurrentUser } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginGoogle, setSession } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle URL redirect query parameters from backend OAuth callback
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setErrorMsg(urlError);
    }

    const urlToken = searchParams.get('token');
    if (urlToken) {
      localStorage.setItem('token', urlToken);
      getCurrentUser()
        .then((data) => {
          if (data && data.user) {
            setSession(urlToken, data.user);
            navigate('/dashboard');
          }
        })
        .catch(() => {
          setErrorMsg('Failed to initialize session from authentication callback.');
        });
    }
  }, [searchParams, navigate, setSession]);

  const handleLoginSuccess = async (credentialResponse) => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginGoogle(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Google authentication was rejected by the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = () => {
    setErrorMsg('The Google authentication popup handshake was aborted.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const content = (
    <ClickSpark
      sparkColor="#e51919"
      sparkSize={10}
      sparkRadius={15}
      sparkCount={10}
      duration={400}
    >
      <div className="h-full bg-carbon-black flex justify-center md:justify-end items-center p-8 min-h-screen">
        {/* Animation on the left */}
        <div className="hidden md:flex w-full md:w-1/2 justify-center items-center p-10">
          <DotLottieReact
            src="/LoginAnimation.lottie"
            loop
            autoplay
            className="w-full max-w-[700px] h-[450px]"
          />
        </div>

        <div className="w-full max-w-md p-10 md:mr-10 bg-yellow-200 rounded-3xl shadow-2xl">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center mt-1 text-black tracking-tight">Welcome Back</h2>
            <p className="text-sm text-center font-bold text-carbon-black-600 mt-1">Please enter your credentials to connect.</p>
            {errorMsg && (
              <div className="mt-3 p-2.5 rounded-xl bg-red-100 border border-red-400 text-red-800 text-xs font-semibold text-center">
                {errorMsg}
              </div>
            )}
          </div>

          {googleClientId ? (
            <div className="flex flex-col items-center justify-center my-auto">
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={handleLoginError}
                theme="filled_black"
                shape="pill"
                width="320"
              />
            </div>
          ) : (
            <div className="text-center p-2 rounded-xl bg-yellow-300/40 border border-yellow-400/50 text-[11px] font-medium text-black">
              Institutional Google Sign-In available when configured.
            </div>
          )}

            {/* Form */}
            <div className="flex flex-col w-full mt-4">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-[11px] font-bold text-carbon-black-600 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@campus.edu"
                    required
                    className="w-full bg-white text-carbon-black-100 px-4 py-3 text-sm rounded-xl border border-carbon-black-400 focus:outline-none focus:border-bright-amber transition-colors"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-carbon-black-600 uppercase tracking-wider">
                      Password
                    </label>
                    <Link
                      to="/forgotpassword"
                      className="text-xs text-carbon-black-600 font-semibold hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white text-carbon-black-100 px-4 py-3 text-sm rounded-xl border border-carbon-black-400 focus:outline-none focus:border-bright-amber transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-carbon-black hover:bg-carbon-black-100 text-bright-lemon font-bold py-3 px-4 rounded-xl text-sm transition-all duration-200 shadow-md transform hover:scale-[1.01] active:scale-[0.99] mt-1 cursor-pointer disabled:opacity-60"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>

                <Link
                  to="/signup"
                  className="font-bold text-xs mb-1 flex justify-center items-center hover:underline text-black"
                >
                  Dont have an account ? Sign Up
                </Link>
              </form>
            </div>
        </div>
      </div>
    </ClickSpark>
  );

  if (googleClientId) {
    return <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>;
  }

  return content;
};

export default Login;