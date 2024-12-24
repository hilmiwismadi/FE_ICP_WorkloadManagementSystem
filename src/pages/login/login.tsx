export default function LoginPage() {
    return (
      <div className="w-[1920px] h-[1080px] bg-white flex justify-center items-center">
        <div className="w-[80%] h-[600px] flex justify-between items-center">
          {/* Left Image Placeholder */}
          <div className="relative w-[400px] h-[400px] border-4 border-black">
            <div className="absolute top-0 left-0 w-full h-[4px] bg-black rotate-45"></div>
            <div className="absolute top-0 left-0 w-full h-[4px] bg-black -rotate-45"></div>
          </div>
  
          {/* Login Form */}
          <div className="w-[400px] h-[400px]">
            <form className="flex flex-col">
              <label htmlFor="username" className="mb-2 text-sm">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                className="w-full h-10 mb-4 px-3 border border-gray-300 rounded"
              />
  
              <label htmlFor="password" className="mb-2 text-sm">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                className="w-full h-10 mb-4 px-3 border border-gray-300 rounded"
              />
  
              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  className="mr-2"
                />
                <label htmlFor="remember" className="text-sm">
                  Remember Me
                </label>
              </div>
  
              <button
                type="submit"
                className="w-full h-10 bg-blue-800 text-white rounded hover:bg-blue-900"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
  