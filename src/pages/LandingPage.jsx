import { Link } from "react-router-dom";
import { Flower2, Users, UserCircle, ArrowRight, CheckCircle2 } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary-50 p-2 rounded-xl">
                <Flower2 className="w-8 h-8 text-primary-600" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
                Garden MS
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                <Users className="w-4 h-4" />
                Staff Portal
              </Link>
              <Link
                to="/client-login"
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-lg hover:shadow-primary-200 transform hover:-translate-y-0.5"
              >
                <UserCircle className="w-4 h-4" />
                Client Area
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] rounded-full bg-primary-50/50 blur-3xl" />
          <div className="absolute top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-blue-50/50 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <span className="inline-block py-1 px-3 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-6 border border-primary-100">
              Professional Landscaping & Maintenance
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-gray-900 leading-tight">
              Transforming Spaces <br />
              <span className="bg-gradient-to-r from-primary-600 to-teal-500 bg-clip-text text-transparent">
                Creating Life
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              We specialize in creating and maintaining breathtaking green spaces. 
              Our expert team ensures your gardens and landscapes remain vibrant 
              and healthy year-round.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                to="/client-login"
                className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg shadow-xl hover:bg-primary-700 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <UserCircle className="w-5 h-5" />
                Client Login
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border-2 border-gray-100 rounded-xl font-bold text-lg hover:border-primary-100 hover:bg-primary-50 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                Staff Access
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 text-left">
            {[
              {
                title: "Expert Design",
                desc: "Custom landscape designs tailored to your vision and environment.",
                delay: "0ms"
              },
              {
                title: "Regular Maintenance",
                desc: "Scheduled care to keep your green spaces thriving in all seasons.",
                delay: "100ms"
              },
              {
                title: "Smart Solutions",
                desc: "Innovative irrigation and sustainable planting strategies.",
                delay: "200ms"
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                style={{ animationDelay: feature.delay }}
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6 text-primary-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Flower2 className="w-6 h-6 text-gray-400" />
            <span className="text-xl font-bold text-gray-500">Garden MS</span>
          </div>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Kingdom Telal Company (KTC). All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
