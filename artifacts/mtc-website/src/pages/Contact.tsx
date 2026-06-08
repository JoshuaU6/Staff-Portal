import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Globe } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  company: z.string().optional(),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message is required (min 10 characters)"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSuccess(true);
    toast({
      title: "Inquiry Submitted Successfully",
      description: "Thank you for reaching out. Our team will contact you shortly.",
    });
    
    form.reset();
    setIsSubmitting(false);
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <Layout>
      <div className="bg-mtc-charcoal pt-40 pb-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-serif text-white font-bold mb-6">Contact Us</h1>
            <div className="h-1 w-24 bg-mtc-red mx-auto mb-8" />
            <p className="text-xl text-white/80 max-w-2xl mx-auto font-light">
              We welcome strategic partnerships and investment inquiries.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-24 bg-mtc-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16">
            
            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-[60%]"
            >
              <div className="bg-white p-10 md:p-12 shadow-xl border-t-4 border-mtc-red">
                <h3 className="text-3xl font-serif font-bold text-mtc-charcoal mb-8">Send an Inquiry</h3>
                
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-5 bg-green-50 text-green-800 border-l-4 border-green-500 rounded flex items-start gap-3"
                    role="alert"
                    aria-live="polite"
                  >
                    <svg className="w-6 h-6 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-bold text-green-800 mb-1">Inquiry Submitted Successfully!</p>
                      <p className="text-green-700 text-sm">Thank you for reaching out. Our team will contact you shortly at your provided email address.</p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-mtc-charcoal uppercase tracking-wider">Full Name *</label>
                      <Input 
                        placeholder="John Doe" 
                        {...form.register("name")} 
                        className={`bg-gray-50 border-gray-200 focus-visible:ring-mtc-red ${form.formState.errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {form.formState.errors.name && (
                        <p className="text-xs text-red-500 font-medium">{form.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-mtc-charcoal uppercase tracking-wider">Company</label>
                      <Input 
                        placeholder="Organization Name" 
                        {...form.register("company")}
                        className="bg-gray-50 border-gray-200 focus-visible:ring-mtc-red"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-mtc-charcoal uppercase tracking-wider">Email Address *</label>
                      <Input 
                        placeholder="john@example.com" 
                        {...form.register("email")}
                        className={`bg-gray-50 border-gray-200 focus-visible:ring-mtc-red ${form.formState.errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {form.formState.errors.email && (
                        <p className="text-xs text-red-500 font-medium">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-mtc-charcoal uppercase tracking-wider">Phone</label>
                      <Input 
                        placeholder="+1 (555) 000-0000" 
                        {...form.register("phone")}
                        className="bg-gray-50 border-gray-200 focus-visible:ring-mtc-red"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-mtc-charcoal uppercase tracking-wider">Subject *</label>
                    <select 
                      {...form.register("subject")}
                      className={`flex h-10 w-full rounded-md border bg-gray-50 border-gray-200 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mtc-red ${form.formState.errors.subject ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    >
                      <option value="">Select a subject...</option>
                      <option value="Partnership Inquiry">Partnership Inquiry</option>
                      <option value="Energy Trading">Energy Trading</option>
                      <option value="Investment">Investment</option>
                      <option value="General">General</option>
                    </select>
                    {form.formState.errors.subject && (
                      <p className="text-xs text-red-500 font-medium">{form.formState.errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-mtc-charcoal uppercase tracking-wider">Message *</label>
                    <Textarea 
                      placeholder="How can we help you?" 
                      className={`min-h-[150px] bg-gray-50 border-gray-200 focus-visible:ring-mtc-red ${form.formState.errors.message ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      {...form.register("message")}
                    />
                    {form.formState.errors.message && (
                      <p className="text-xs text-red-500 font-medium">{form.formState.errors.message.message}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-mtc-red hover:bg-red-800 text-white text-lg py-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Contact Info Sidebar */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:w-[40%]"
            >
              <div className="bg-mtc-charcoal text-white p-10 md:p-12 shadow-xl h-full flex flex-col justify-center">
                <h3 className="text-3xl font-serif font-bold text-white mb-8">Corporate Offices</h3>
                
                <div className="space-y-8 font-light text-lg">
                  <div className="flex items-start border-b border-white/10 pb-6">
                    <Mail className="w-6 h-6 mr-4 text-mtc-red mt-1 shrink-0" />
                    <div>
                      <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-sm">Email</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-white/50 text-xs uppercase tracking-wider mb-0.5">Primary Contact</p>
                          <a href="mailto:contact@mtc-groups.com" className="text-white/80 hover:text-white transition-colors">contact@mtc-groups.com</a>
                        </div>
                        <div>
                          <p className="text-white/50 text-xs uppercase tracking-wider mb-0.5">Business &amp; Partnerships</p>
                          <a href="mailto:partnerships@mtc-groups.com" className="text-white/80 hover:text-white transition-colors">partnerships@mtc-groups.com</a>
                        </div>
                        <div>
                          <p className="text-white/50 text-xs uppercase tracking-wider mb-0.5">Trading Desk</p>
                          <a href="mailto:trading@mtc-groups.com" className="text-white/80 hover:text-white transition-colors">trading@mtc-groups.com</a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start border-b border-white/10 pb-6">
                    <Globe className="w-6 h-6 mr-4 text-mtc-red mt-1" />
                    <div>
                      <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-sm">Website</h4>
                      <p className="text-white/80">www.mtc-groups.com</p>
                    </div>
                  </div>

                  <div className="flex items-start border-b border-white/10 pb-6">
                    <MapPin className="w-6 h-6 mr-4 text-mtc-red mt-1" />
                    <div>
                      <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-sm">Headquarters</h4>
                      <p className="text-white/80 leading-relaxed">Washington Business District<br/>Washington, DC 20001, USA</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="w-6 h-6 mr-4 text-mtc-red mt-1" />
                    <div>
                      <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-sm">Direct Lines</h4>
                      <p className="text-white/80 mb-1"><span className="font-medium text-white">Global Line:</span> +1 771 240 1273</p>
                      <p className="text-white/80"><span className="font-medium text-white">Lagos Line:</span> 0700 311 7444</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </Layout>
  );
}
