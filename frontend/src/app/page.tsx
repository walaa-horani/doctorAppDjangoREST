"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Activity, Heart, Stethoscope, User, Clock, MapPin, Star, Phone } from "lucide-react";
import { BookingModal } from "@/components/booking-modal";
import api from "@/lib/api";

interface Provider {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  provider_profile?: {
    business_name: string;
    is_verified: boolean;
    bio?: string;
    profile_image?: string;
  };
}

export default function Home() {
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    api.get("/auth/providers/") // Endpoint created earlier
      .then(res => setProviders(res.data))
      // Fallback to empty if endpoint fails or auth required (which it shouldn't be)
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="flex flex-col  min-h-screen font-sans">
      {/* Navigation */}
      <header className="fixed w-full z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link className="flex items-center gap-2 font-bold text-2xl text-teal-600" href="#">
            <Activity className="h-8 w-8" />
            <span>MediCare</span>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-700">
            <Link className="hover:text-teal-600 transition-colors" href="#">Home</Link>
            <Link className="hover:text-teal-600 transition-colors" href="#services">Services</Link>
            <Link className="hover:text-teal-600 transition-colors" href="#doctors">Doctors</Link>
            <Link className="hover:text-teal-600 transition-colors" href="#contact">Contact</Link>
          </nav>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-700 hover:text-teal-600">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=2940"
            alt="Medical Background"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6 animate-in slide-in-from-left duration-700">
              <div className="inline-block rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-teal-800">
                #1 Healthcare Solution
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Your Health, <br />
                <span className="text-teal-600">Our Priority</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-[600px] leading-relaxed">
                Connect with top-tier medical professionals and specialized care providers.
                Experience seamless appointment booking and comprehensive health management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="#doctors">
                  <Button size="lg" className="bg-teal-600 hover:bg-teal-700 h-12 px-8 text-lg">
                    Book Appointment
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50 h-12 px-8 text-lg">
                    Join as Provider
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 relative animate-in slide-in-from-right duration-700">
              {/* Hero Image */}
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=1000"
                alt="Doctor"
                className="relative rounded-3xl shadow-2xl border-4 border-white object-cover h-[500px] w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Our Medical Services</h2>
            <p className="mt-4 text-lg text-slate-600">Comprehensive care for you and your family</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Heart, title: "Cardiology", desc: "Expert care for your heart health." },
              { icon: Stethoscope, title: "General Practice", desc: "Routine checkups and primary care." },
              { icon: Activity, title: "Neurology", desc: "Specialized treatment for neurological conditions." },
              { icon: User, title: "Pediatrics", desc: "Dedicated care for children." },
              { icon: MapPin, title: "Dermatology", desc: "Advanced skin care treatments." },
              { icon: Clock, title: "Emergency Care", desc: "Immediate medical attention." },
            ].map((service, i) => (
              <Card key={i} className="hover:shadow-lg transition-all duration-300 border-none shadow-sm">
                <CardHeader>
                  <service.icon className="h-10 w-10 text-teal-600 mb-2" />
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{service.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Meet Our Specialists</h2>
            <p className="mt-4 text-lg text-slate-600">Top-rated doctors ready to help you.</p>
          </div>

          {providers.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 rounded-lg">
              <p className="text-slate-500">Loading Doctors or No Providers Found...</p>
              <Link href="/register"><Button variant="link">Are you a doctor? Join us!</Button></Link>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {providers.map((provider) => (
                <Card key={provider.id} className="overflow-hidden group">
                  <div className="h-64 bg-slate-200 relative">
                    {/* Provider image from backend or fallback */}
                    <img
                      src={
                        provider.provider_profile?.profile_image
                          ? (provider.provider_profile.profile_image.startsWith('http')
                            ? provider.provider_profile.profile_image
                            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${provider.provider_profile.profile_image}`)
                          : `https://images.unsplash.com/photo-${1537368910025 + provider.id}?auto=format&fit=crop&q=80&w=800`
                      }
                      alt={provider.first_name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800" }}
                    />
                  </div>
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg">{provider.provider_profile?.business_name || `Dr. ${provider.last_name}`}</CardTitle>
                    <p className="text-sm text-teal-600 font-medium">{provider.first_name} {provider.last_name}</p>
                  </CardHeader>
                  <CardContent className="text-center text-sm text-slate-500 line-clamp-2 px-4">
                    {provider.provider_profile?.bio || "Experienced specialist dedicated to patient care."}
                  </CardContent>
                  <CardFooter className="pt-0 justify-center pb-6">
                    <BookingModal
                      providerId={provider.id}
                      providerName={`Dr. ${provider.last_name}`}
                    />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-teal-600 text-white py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold">10k+</h3>
              <p className="text-teal-100">Happy Patients</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold">500+</h3>
              <p className="text-teal-100">Expert Doctors</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold">24/7</h3>
              <p className="text-teal-100">Support Available</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold">50+</h3>
              <p className="text-teal-100">Specialties</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-slate-600">Get medical care in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto text-teal-600 text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold">Search for a Doctor</h3>
              <p className="text-slate-600">Browse our extensive list of specialist doctors and filter by your specific needs.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto text-teal-600 text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold">Book an Appointment</h3>
              <p className="text-slate-600">Choose a time slot that works best for you and book instantly.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto text-teal-600 text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold">Get Treated</h3>
              <p className="text-slate-600">Visit the doctor or have an online consultation to get the care you need.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">What Our Patients Say</h2>
            <p className="mt-4 text-lg text-slate-600">Real stories from people we've helped</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Johnson", role: "Patient", quote: "The booking process was so easy. I found a great cardiologist within minutes!" },
              { name: "Michael Chen", role: "Patient", quote: "Dr. Smith was incredibly professional. Highly recommend this platform." },
              { name: "Emily Davis", role: "Patient", quote: "Excellent service! The reminders helped me not to miss my appointment." }
            ].map((testimonial, i) => (
              <Card key={i} className="bg-white border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex gap-1 text-yellow-400 mb-4">
                    <Star className="fill-current w-5 h-5" />
                    <Star className="fill-current w-5 h-5" />
                    <Star className="fill-current w-5 h-5" />
                    <Star className="fill-current w-5 h-5" />
                    <Star className="fill-current w-5 h-5" />
                  </div>
                  <p className="text-slate-700 italic mb-4">"{testimonial.quote}"</p>
                  <div className="font-semibold text-slate-900">{testimonial.name}</div>
                  <div className="text-sm text-slate-500">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "How do I book an appointment?", a: "Simply search for a doctor, select a time slot on their profile, and click 'Book Appointment'." },
              { q: "Is the service free?", a: "Yes, searching for doctors and booking appointments is completely free for patients." },
              { q: "Can I cancel my appointment?", a: "Yes, you can manage your appointments from your dashboard." }
            ].map((faq, i) => (
              <div key={i} className="border rounded-lg p-6 hover:border-teal-500 transition-colors cursor-pointer">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-teal-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]"></div>
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">Ready to Prioritize Your Health?</h2>
          <p className="mb-8 opacity-90 text-lg max-w-2xl mx-auto">Join thousands of satisfied patients who have found their perfect doctor. It's time to take control of your well-being.</p>
          <div className="flex justify-center gap-4">
            <Link href="#doctors">
              <Button variant="secondary" size="lg" className="bg-white text-teal-600 hover:bg-slate-100">Find a Doctor</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-teal-700 bg-transparent">Sign Up Now</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
                <Activity className="h-6 w-6 text-teal-500" />
                <span>MediCare</span>
              </div>
              <p className="text-sm text-slate-400">Your trusted partner in health. Connecting you with the best care, when you need it most.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-teal-400">Home</Link></li>
                <li><Link href="#services" className="hover:text-teal-400">Services</Link></li>
                <li><Link href="#doctors" className="hover:text-teal-400">Doctors</Link></li>
                <li><Link href="/login" className="hover:text-teal-400">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-teal-400">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-teal-400">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-teal-400">Cookie Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> 1-800-MEDICARE</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> 123 Health Dr, Wellness City</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>© 2026 MediCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
