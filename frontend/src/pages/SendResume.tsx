import { useState } from "react";
import { Upload, Send, User, Mail, Phone, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";

const SendResume = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    message: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please upload your resume.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("subject", `Job Application - ${formData.position}`);
    formDataToSend.append("message", formData.message);
    formDataToSend.append("resume", selectedFile);
    formDataToSend.append("type", "resume");

    try {
      await api.post("/contact/submit", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: "Success!",
        description: "Your resume has been submitted successfully. We'll review it and get back to you soon.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        position: "",
        message: "",
      });
      setSelectedFile(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, DOC, or DOCX file.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Send Your <span className="text-primary">Resume</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Ready to join our team? Upload your resume and tell us about yourself. We're always looking for talented individuals.
            </p>
          </div>
        </div>
      </section>

      {/* Resume Upload Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="p-8 md:p-12 bg-card/50 backdrop-blur-sm border-border">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-primary" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Apply Now</h2>
                <p className="text-muted-foreground">Upload your resume and share your details with us</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <User size={16} className="inline mr-2" />
                      Full Name *
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="bg-background/50 border-border focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Mail size={16} className="inline mr-2" />
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                      className="bg-background/50 border-border focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Phone size={16} className="inline mr-2" />
                      Phone Number *
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+91 1234567890"
                      className="bg-background/50 border-border focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Position Applying For *
                    </label>
                    <Input
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Senior Developer"
                      className="bg-background/50 border-border focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Upload size={16} className="inline mr-2" />
                    Upload Resume *
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <Upload className="mx-auto mb-2 text-muted-foreground" size={32} />
                      <p className="text-muted-foreground mb-1">
                        {selectedFile ? selectedFile.name : "Click to upload your resume"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PDF, DOC, DOCX (Max 5MB)
                      </p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Cover Letter / Message
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about yourself, your experience, and why you want to join our team..."
                    rows={6}
                    className="bg-background/50 border-border focus:border-primary"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isUploading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  {isUploading ? (
                    "Uploading..."
                  ) : (
                    <>
                      Send Resume
                      <Send size={18} className="ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SendResume;