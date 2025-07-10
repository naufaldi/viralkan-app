import { Shield, Users, Megaphone } from "lucide-react";

const valueProps = [
  {
    icon: <Megaphone className="h-12 w-12" />,
    title: "Kebijakan Berbasis Viral",
    description:
      "Di Indonesia, suara netizen punya kekuatan. Laporan yang viral lebih cepat mendapat perhatian.",
    gradient: "from-red-500 to-orange-500",
  },
  {
    icon: <Shield className="h-12 w-12" />,
    title: "Informasi Untuk Keselamatan",
    description:
      "Ketahui rute mana yang harus dihindari. Rencanakan perjalanan Anda dengan lebih aman.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: <Users className="h-12 w-12" />,
    title: "Kekuatan Komunitas",
    description:
      "Data dari masyarakat, oleh masyarakat. Bersama kita ciptakan transparansi infrastruktur.",
    gradient: "from-green-500 to-emerald-500",
  },
];

const ValuePropSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Mengapa Memilih{" "}
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Viralkan?
            </span>
          </h2>
          <p className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
            Platform kami memberdayakan Anda untuk membuat perubahan nyata melalui kesadaran sosial 
            dan kekuatan komunitas yang terorganisir.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {valueProps.map((prop, index) => (
            <div
              key={prop.title}
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200 hover:shadow-xl transition-all duration-300"
            >
              <div className={`inline-flex rounded-xl bg-gradient-to-r ${prop.gradient} p-3 text-white shadow-lg`}>
                {prop.icon}
              </div>
              
              <h3 className="mt-6 text-xl font-semibold leading-8 tracking-tight text-gray-900">
                {prop.title}
              </h3>
              
              <p className="mt-4 text-base leading-7 text-gray-600">
                {prop.description}
              </p>

              {/* Decorative element */}
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuePropSection; 