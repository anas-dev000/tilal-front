import { Link } from "react-router-dom";
import {
  Users,
  UserCircle,
  ArrowRight,
  Leaf,
  Sprout,
  Trees,
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const LandingPage = () => {


  const leafSizes = [
    "w-4 h-4",
    "w-8 h-8",
    "w-16 h-16",
    "w-20 h-20",
    "w-22 h-22",
    "w-26 h-26",
    "w-30 h-30",
  ];

  // زيادة عدد الأوراق إلى 50 لتغطية أكبر وكثافة أعلى
  const leaves = [...Array(30)].map((_, i) => ({
    x: `${Math.random() * 100}vw`,
    startRotate: Math.random() * 360,
    endRotate: Math.random() * 1080 + 720,
    // تقليل المدة لتسريع السقوط (15-30 ثانية بدلاً من 30-70)
    duration: 15 + Math.random() * 15,
    // تقليل التأخير الأقصى إلى 5 ثواني فقط لتظهر الأوراق بسرعة أكبر
    delay: Math.random() * 5,
    sizeIndex: i % 7,
    opacity: 0.6 + Math.random() * 0.3, // opacity أعلى قليلاً للوضوح
  }));

  return (
    <>


      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 font-sans text-gray-900 overflow-x-hidden relative">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Floating Leaves - أكثر كثافة وأسرع ظهور */}
          {leaves.map((leaf, i) => (
            <motion.div
              key={i}
              className="absolute text-emerald-600"
              initial={{
                y: "110vh",
                x: leaf.x,
                rotate: leaf.startRotate,
                opacity: 0,
              }}
              animate={{
                y: "-110vh",
                rotate: leaf.endRotate,
                opacity: [0, leaf.opacity, leaf.opacity, 0],
              }}
              transition={{
                duration: leaf.duration,
                repeat: Infinity,
                ease: "linear",
                delay: leaf.delay,
              }}
            >
              <Leaf
                className={`${leafSizes[leaf.sizeIndex]} drop-shadow-xl`}
                strokeWidth={1.8}
              />
            </motion.div>
          ))}

          {/* Moving Gradient Blobs */}
          <motion.div
            className="absolute top-0 left-0 w-[1000px] h-[1000px] rounded-full bg-gradient-to-br from-emerald-200/30 to-transparent blur-3xl"
            animate={{ x: [0, 500, 0], y: [0, -500, 0] }}
            transition={{ duration: 90, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-[1200px] h-[1200px] rounded-full bg-gradient-to-tl from-teal-200/30 to-transparent blur-3xl"
            animate={{ x: [0, -600, 0], y: [0, 500, 0] }}
            transition={{ duration: 100, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Navigation */}
        <nav className="fixed top-0 w-full z-40 bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <div className="flex items-center gap-4">
                <motion.img
                  src="/logo.PNG"
                  alt="Tilal Logo"
                  className="h-12 w-12 rounded-lg object-contain bg-white shadow-md"
                  whileHover={{ scale: 1.15, rotate: 15 }}
                  transition={{ type: "spring", stiffness: 400 }}
                />
                <motion.span
                  className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.1 }}
                >
                  Tilal
                </motion.span>
              </div>
              <div className="flex items-center gap-6">
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-2 text-gray-700 hover:text-emerald-600 font-medium transition-colors"
                >
                  <Users className="w-5 h-5" />
                  Staff Portal
                </Link>
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/client-login"
                    className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white px-7 py-3.5 rounded-full font-bold shadow-2xl hover:shadow-emerald-300/60 transition-all"
                  >
                    <UserCircle className="w-6 h-6" />
                    Client Area
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-24 pb-20 lg:pt-48 lg:pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <motion.span
                className="inline-block py-2 px-6 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold mb-8 border border-emerald-300"
                whileHover={{ scale: 1.1 }}
              >
                Professional Landscaping & Maintenance
              </motion.span>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                Transforming Spaces <br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  Creating Life
                </span>
              </h1>

              <p className="text-xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
                We specialize in creating and maintaining breathtaking green
                spaces. Our expert team ensures your gardens and landscapes
                remain vibrant and healthy year-round.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-20">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/client-login"
                    className="px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-emerald-400/50 transition-all flex items-center gap-4"
                  >
                    <UserCircle className="w-7 h-7" />
                    Client Login
                    <ArrowRight className="w-6 h-6" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="px-10 py-5 bg-white text-emerald-700 border-2 border-emerald-300 rounded-2xl font-bold text-xl hover:bg-emerald-50 hover:border-emerald-500 transition-all flex items-center gap-4"
                  >
                    <Users className="w-7 h-7" />
                    Staff Access
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-32">
              {[
                {
                  title: "Expert Design",
                  desc: "Custom landscape designs tailored to your vision and environment.",
                  icon: <Sprout className="w-10 h-10" />,
                },
                {
                  title: "Regular Maintenance",
                  desc: "Scheduled care to keep your green spaces thriving in all seasons.",
                  icon: <Leaf className="w-10 h-10" />,
                },
                {
                  title: "Smart Solutions",
                  desc: "Innovative irrigation and sustainable planting strategies.",
                  icon: <Trees className="w-10 h-10" />,
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: idx * 0.2 }}
                  whileHover={{ y: -15, scale: 1.05 }}
                  className="p-10 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 hover:border-emerald-300 transition-all duration-500"
                >
                  <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mb-8 text-emerald-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-t from-gray-100/80 to-transparent border-t border-gray-200 py-16 mt-32">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <motion.div
              className="flex justify-center items-center gap-4 mb-6"
              whileHover={{ scale: 1.1 }}
            >
              <img
                src="/logo.PNG"
                alt="Tilal Logo"
                className="h-12 w-12 rounded-lg object-contain shadow-lg"
              />
              <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Tilal
              </span>
            </motion.div>
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Tilal Garden Management System. All
              rights reserved.
            </p>
          </div>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Kingdom Telal Company (KTC). All rights reserved.
          </p>
      </footer>
    </div>
    </>
  );
};

export default LandingPage;
