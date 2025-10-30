import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Users,
  Calendar,
  Paintbrush,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Star,
  Award,
  Heart,
  Shield,
  BookOpen,
  Video,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

const LandingPage = () => {
  const [activeFAQ, setActiveFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "University Student",
      content:
        "MindEase helped me manage my anxiety during finals. The mandala coloring feature is incredibly relaxing!",
      avatar: "SJ",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Graduate Student",
      content:
        "Scheduling sessions with my counselor has never been easier. The platform is intuitive and professional.",
      avatar: "MC",
      rating: 5,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "College Freshman",
      content:
        "The wellness tools gave me insights into my mental health patterns. Highly recommend for any student!",
      avatar: "ER",
      rating: 4,
    },
  ];

  const faqs = [
    {
      question: "Is MindEase free to use?",
      answer:
        "Yes, MindEase is completely free for students. We believe mental health support should be accessible to everyone.",
    },
    {
      question: "How do I book a session with a counselor?",
      answer:
        "After creating an account, you can browse available counselors, view their specialties, and book sessions directly through the platform.",
    },
    {
      question: "Are the counseling sessions confidential?",
      answer:
        "Absolutely. We adhere to strict privacy policies and all sessions are encrypted to ensure your complete confidentiality.",
    },
    {
      question: "Can I use MindEase on my mobile device?",
      answer:
        "Yes, MindEase is fully responsive and works seamlessly on smartphones, tablets, and desktop computers.",
    },
  ];

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Confidential",
      description:
        "All your data and conversations are encrypted and protected.",
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Resources Library",
      description:
        "Access articles, videos, and exercises for mental wellness.",
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "Video Sessions",
      description: "Connect with counselors through secure video calls.",
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "24/7 Support",
      description: "Reach out to our support team anytime you need assistance.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Enhanced Hero Section */}
      <header className="relative bg-gradient-to-br from-indigo-900 via-blue-800 to-sky-600 text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10% left-5% w-72 h-72 bg-purple-300 rounded-full mix-blend-soft-light"></div>
          <div className="absolute top-5% right-10% w-96 h-96 bg-blue-300 rounded-full mix-blend-soft-light"></div>
          <div className="absolute bottom-10% left-15% w-80 h-80 bg-cyan-300 rounded-full mix-blend-soft-light"></div>
        </div>

        <div className="absolute inset-0 bg-black opacity-5"></div>

        <div className="max-w-7xl mx-auto px-6 py-16 md:py-32">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left mb-12 md:mb-0">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  Supporting student mental wellness
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Your Journey to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                  Mental Wellness
                </span>{" "}
                Starts Here
              </h1>

              <p className="text-lg md:text-xl mb-8 max-w-2xl opacity-90">
                A safe space for students to connect with counselors, explore
                resources, track progress, and use creative tools like mandala
                coloring to relax.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  to="/login"
                  className="px-8 py-4 border-2 border-white/30 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                >
                  Login
                </Link>
              </div>
            </div>

            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -top-6 -left-6 w-64 h-64 bg-cyan-400/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-blue-400/20 rounded-full blur-xl"></div>

                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-2xl">
                      <Brain className="mx-auto text-cyan-300 w-8 h-8 mb-2" />
                      <p className="text-sm">Wellness Tools</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl">
                      <Users className="mx-auto text-cyan-300 w-8 h-8 mb-2" />
                      <p className="text-sm">Counselor Support</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl">
                      <Calendar className="mx-auto text-cyan-300 w-8 h-8 mb-2" />
                      <p className="text-sm">Session Tracking</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl">
                      <Paintbrush className="mx-auto text-cyan-300 w-8 h-8 mb-2" />
                      <p className="text-sm">Relaxation</p>
                    </div>
                  </div>

                  <div className="mt-6 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                      <p className="text-sm">Counselors available now</p>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400/30 w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            className="fill-current text-white"
          >
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </header>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                5,000+
              </div>
              <div className="text-gray-600">Students Helped</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">200+</div>
              <div className="text-gray-600">Certified Counselors</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
          <Brain className="mx-auto text-blue-500 w-12 h-12 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Well-being Tools</h3>
          <p className="text-gray-600">
            Take self-assessments, track progress, and get personalized
            insights.
          </p>
        </div>
        <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
          <Users className="mx-auto text-blue-500 w-12 h-12 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Counselor Support</h3>
          <p className="text-gray-600">
            Book sessions, chat securely, and get guidance from professionals.
          </p>
        </div>
        <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
          <Calendar className="mx-auto text-blue-500 w-12 h-12 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Session Management</h3>
          <p className="text-gray-600">
            Manage appointments, reminders, and view your calendar easily.
          </p>
        </div>
        <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
          <Paintbrush className="mx-auto text-blue-500 w-12 h-12 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Relaxation Activities</h3>
          <p className="text-gray-600">
            Reduce stress with tools like mandala coloring and mindfulness
            games.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-indigo-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-black mb-4">
            How MindEase Works
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Getting started with MindEase is simple. Follow these steps to begin
            your mental wellness journey.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-md text-center">
              <div className="w-12 h-12 bg-indigo-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create an Account</h3>
              <p className="text-gray-600">
                Sign up with your student email and complete your profile in
                minutes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md text-center">
              <div className="w-12 h-12 bg-indigo-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Explore Resources</h3>
              <p className="text-gray-600">
                Take assessments, browse counselors, or try relaxation
                activities.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md text-center">
              <div className="w-12 h-12 bg-indigo-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Your Journey</h3>
              <p className="text-gray-600">
                Book sessions, track progress, and develop healthy habits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-16 bg-indigo-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Why Choose MindEase
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Our platform is designed specifically for students with unique needs
            and challenges.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-md text-center"
              >
                <div className="w-14 h-14 bg-indigo-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-black mb-4">
            What Students Say
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Hear from students who have benefited from using MindEase.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-indigo-50 p-6 rounded-2xl shadow-md"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-indigo-100 text-blue-600 rounded-full flex items-center justify-center font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Find answers to common questions about MindEase.
          </p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-2xl overflow-hidden"
              >
                <button
                  className="flex justify-between items-center w-full p-6 text-left font-semibold bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  onClick={() => toggleFAQ(index)}
                >
                  <span>{faq.question}</span>
                  {activeFAQ === index ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                {activeFAQ === index && (
                  <div className="p-6 bg-white">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-600 to-sky-400 py-16 text-center text-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">
            Start Your Mental Wellness Journey Today
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have taken control of their mental
            health with MindEase.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold shadow hover:bg-gray-100 transition"
            >
              Create Account
            </Link>
            <Link
              to="/about"
              className="px-8 py-3 border border-white rounded-xl font-semibold hover:bg-white hover:text-indigo-600 transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">
                MindEase
              </h3>
              <p className="mb-4">
                Supporting student mental wellness through accessible resources
                and professional counseling.
              </p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-white transition">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-white transition">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="hover:text-white transition">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Counselors
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Resources
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-4">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-4">
                Contact Us
              </h3>
              <ul className="space-y-2">
                <li>Email: support@mindease.com</li>
                <li>Phone: (800) 123-4567</li>
                <li>Hours: 24/7 Support</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} MindEase. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">
                Privacy
              </a>
              <a href="#" className="hover:text-white">
                Terms
              </a>
              <a href="#" className="hover:text-white">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
