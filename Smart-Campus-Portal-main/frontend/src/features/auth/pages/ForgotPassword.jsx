import { Link } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";


const ForgotPassword = () => {
  return (
   
         

    <div className="min-h-screen flex bg-graphite justify-center items-center p-2">
      
      <div className="relative w-full max-w-md min-h-[400px] p-10 bg-yellow-200 rounded-3xl shadow-2xl flex flex-col justify-center">
        
        <Link 
          to="/login"
          className="transition-all duration-900 hover:rotate-30 absolute top-6 left-6 text-black hover:opacity-60 transition-opacity cursor-pointer"
        > 
          <BiArrowBack size={24} />
        </Link>

        <div className="mb-6 pt-6">
          <h2 className="text-2xl font-bold text-center mt-1 text-black tracking-tight">
            Forgot Password ?
          </h2>
          <p className="text-sm text-center font-bold text-carbon-black-600 mt-1">
            Please enter your recovery email
          </p>
        </div>

        <div className="flex flex-col w-full mt-4">
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-[11px] font-bold text-carbon-black-600 uppercase tracking-wiber mb-2">
                Recovery Email Address
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full bg-white text-carbon-black-100 px-4 py-3 text-sm rounded-xl border border-carbon-black-400 focus:outline-none focus:border-bright-amber transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-carbon-black hover:bg-carbon-black-100 text-bright-lemon font-bold py-3 px-4 rounded-xl text-sm transition-all duration-200 shadow-md transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              Send Reset Link
            </button>
          </form>
        </div>
      </div>
    </div>
   
  );
};

export default ForgotPassword;
