import { TrendingUp, Users, MapPin } from "lucide-react";

const stats = [
  { 
    value: "1,247", 
    label: "Laporan Terkumpul",
    icon: <MapPin className="h-8 w-8" />,
    color: "from-red-500 to-pink-500",
    bgColor: "bg-red-50"
  },
  { 
    value: "5,890", 
    label: "Kali Dibagikan",
    icon: <TrendingUp className="h-8 w-8" />,
    color: "from-blue-500 to-purple-500",
    bgColor: "bg-blue-50"
  },
  { 
    value: "23", 
    label: "Kota di Indonesia",
    icon: <Users className="h-8 w-8" />,
    color: "from-green-500 to-teal-500",
    bgColor: "bg-green-50"
  },
];

const StatsSection = () => {
  return (
    <section id="statistics" className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Dampak{" "}
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Komunitas
            </span>
          </h2>
          <p className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
            Angka-angka yang menunjukkan kekuatan bersama dalam membangun kesadaran infrastruktur.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`group relative overflow-hidden rounded-2xl ${stat.bgColor} p-8 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
            >
              <div className="relative z-10">
                <div className={`inline-flex rounded-xl bg-gradient-to-r ${stat.color} p-3 text-white shadow-lg mb-6`}>
                  {stat.icon}
                </div>
                
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-gray-900 lg:text-5xl">
                    {stat.value}
                    <span className="text-2xl text-gray-500">+</span>
                  </div>
                  <div className="text-lg font-medium text-gray-600">
                    {stat.label}
                  </div>
                </div>
              </div>

              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Animated circle */}
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-white/20 to-white/5 group-hover:scale-110 transition-transform duration-500"></div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            Data diperbarui secara real-time • Terakhir diperbarui: Hari ini
          </p>
        </div>
      </div>
    </section>
  );
};

export default StatsSection; 