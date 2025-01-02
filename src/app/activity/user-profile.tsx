export default function UserProfile() {
    return (
      <div className="bg-[#15234A] rounded-[0.8vw] text-white mb-[1vw] py-[1vw] w-full mx-auto">
        <div className="flex items-center mx-[2vw] mb-[1vw]">
          <div className="flex items-center gap-[2vw]">
            <img
              src="/img/sidebar/UserProfile.png"
              alt="User Avatar"
              className="rounded-full w-[7vw] h-[7vw]"
            />
            <div>
              <h2 className="text-[2vw] font-semibold">
                Varick Zahir Sarjiman
              </h2>
              <p className="text-[1vw] text-gray-300">ID-12003</p>
            </div>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[1vw] text-gray-300">
              varickzahirsarjiman@mail.ugm.ac.id
            </p>
            <p className="text-[1vw] text-gray-300">+62 812-1212-1212</p>
          </div>
        </div>
  
        <div className="flex mx-[2vw] gap-[2vw] text-[1.1vw]">
          <div className="flex justify-center items-center w-[8/12] gap-[0.3vw]">
            <p className="text-gray-400 text-[1vw]">Team :</p>
            <p className="text-[1vw]">
              Aplikasi Penanganan Pengaduan Keluhan dan Gangguan Pelanggan
            </p>
          </div>
          <div className="flex justify-center items-center w-[4/12] gap-[0.3vw]">
            <p className="text-gray-400 text-[1vw]">Role :</p>
            <p className="text-[1vw]">Backend Engineer</p>
          </div>
        </div>
      </div>
    );
  }
  