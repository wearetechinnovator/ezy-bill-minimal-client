import {Icons} from '../helper/icons'

function NotFound() {
  return (
    <div className="min-h-screen shadow flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-gray-950 rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-700">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 text-right">
            <div className="text-gray-500 text-sm mb-2">ERROR</div>
            <div className="text-white text-5xl font-bold tracking-wider mb-2">404</div>
            <div className="text-gray-400 text-lg">PAGE NOT FOUND</div>
          </div>

          <div className="p-6 grid grid-cols-4 gap-3">
            <button className="col-span-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-lg transition-colors cursor-not-allowed opacity-50">
              7
            </button>
            <button className="col-span-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-lg transition-colors cursor-not-allowed opacity-50">
              8
            </button>
            <button className="col-span-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-lg transition-colors cursor-not-allowed opacity-50">
              9
            </button>
            <button className="col-span-1 bg-orange-600 hover:bg-orange-500 text-white font-semibold py-4 rounded-lg transition-colors cursor-not-allowed opacity-50">
              ÷
            </button>

            <button className="col-span-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-lg transition-colors cursor-not-allowed opacity-50">
              4
            </button>
            <button className="col-span-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-lg transition-colors cursor-not-allowed opacity-50">
              5
            </button>
            <button className="col-span-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-lg transition-colors cursor-not-allowed opacity-50">
              6
            </button>
            <button className="col-span-1 bg-orange-600 hover:bg-orange-500 text-white font-semibold py-4 rounded-lg transition-colors cursor-not-allowed opacity-50">
              ×
            </button>

            <button className="col-span-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-lg transition-colors cursor-not-allowed opacity-50">
              1
            </button>
            <button className="col-span-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-lg transition-colors cursor-not-allowed opacity-50">
              2
            </button>
            <button className="col-span-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-lg transition-colors cursor-not-allowed opacity-50">
              3
            </button>
            <button className="col-span-1 bg-orange-600 hover:bg-orange-500 text-white font-semibold py-4 rounded-lg transition-colors cursor-not-allowed opacity-50">
              −
            </button>

            <button className="col-span-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-lg transition-colors cursor-not-allowed opacity-50">
              0
            </button>
            <button className="col-span-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-lg transition-colors cursor-not-allowed opacity-50">
              .
            </button>
            <button className="col-span-1 bg-orange-600 hover:bg-orange-500 text-white font-semibold py-4 rounded-lg transition-colors cursor-not-allowed opacity-50">
              +
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="col-span-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Icons.HOME size={20}/>
              GO TO DASHBOARD
            </button>
          </div>
        </div>

        <p className="text-center text-gray-400 mt-6 text-sm">
          The page you're looking for doesn't exist
        </p>
      </div>
    </div>
  );
}

export default NotFound;
