import { Camera, Share2, Map, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <Camera className="h-8 w-8" />,
    title: "Laporkan",
    description: "Ambil foto, tandai lokasi, dan unggah dalam hitungan detik. Proses pelaporan yang mudah dan cepat.",
    color: "from-red-500 to-pink-500",
    bgColor: "bg-red-50",
  },
  {
    number: "02",
    icon: <Share2 className="h-8 w-8" />,
    title: "Viralkan",
    description: "Bagikan laporanmu langsung ke Twitter, Facebook & Instagram dengan satu klik. Perbesar dampak sosial.",
    color: "from-blue-500 to-purple-500",
    bgColor: "bg-blue-50",
  },
  {
    number: "03",
    icon: <Map className="h-8 w-8" />,
    title: "Waspada",
    description: "Gunakan peta interaktif kami untuk melihat kondisi jalan dan merencanakan perjalanan yang aman.",
    color: "from-green-500 to-teal-500",
    bgColor: "bg-green-50",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Cara Kerja{" "}
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Platform
            </span>
          </h2>
          <p className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
            Tiga langkah mudah untuk membuat dampak nyata dalam memperbaiki infrastruktur jalan Indonesia.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="group">
                  <div className={`rounded-2xl ${step.bgColor} p-8 transition-all duration-300 hover:shadow-lg`}>
                    <div className="flex items-center justify-between mb-6">
                      <div className={`inline-flex rounded-xl bg-gradient-to-r ${step.color} p-3 text-white shadow-lg`}>
                        {step.icon}
                      </div>
                      <div className="text-right">
                        <span className="text-4xl font-bold text-gray-200 group-hover:text-gray-300 transition-colors">
                          {step.number}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Arrow connector - only show between steps */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                    <div className="bg-white rounded-full p-2 shadow-lg">
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Visual flow indicator for mobile */}
        <div className="mt-16 lg:hidden">
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                {index < steps.length - 1 && (
                  <div className="h-px w-8 bg-gray-300 mx-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection; 