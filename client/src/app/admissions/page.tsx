'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FileText, Download, CheckCircle, Upload, 
  GraduationCap, Clock, AlertCircle 
} from 'lucide-react';
import api from '@/lib/axios';

const admissionSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  level: z.enum(['olevel', 'alevel'], { required_error: 'Please select a level' }),
  gender: z.enum(['M', 'F']).optional(),
  parent_name: z.string().optional(),
  parent_phone: z.string().optional(),
  address: z.string().optional(),
  previous_school: z.string().optional(),
});

type AdmissionFormData = z.infer<typeof admissionSchema>;

const requirements = [
  'Completed application form',
  'Birth certificate or equivalent',
  'Previous school report/cards',
  'Passport size photographs (4)',
  'Medical examination report',
  'Parent/Guardian ID copy',
];

const feeStructure = [
  { level: "O'Level", term: 1, tuition: 500000, other: 150000 },
  { level: "O'Level", term: 2, tuition: 450000, other: 100000 },
  { level: "O'Level", term: 3, tuition: 400000, other: 100000 },
  { level: "A'Level", term: 1, tuition: 750000, other: 200000 },
  { level: "A'Level", term: 2, tuition: 700000, other: 150000 },
  { level: "A'Level", term: 3, tuition: 650000, other: 150000 },
];

const steps = [
  { step: 1, title: 'Select Level', description: 'Choose O-Level or A-Level' },
  { step: 2, title: 'Fill Application', description: 'Complete the form' },
  { step: 3, title: 'Upload Documents', description: 'Attach required files' },
  { step: 4, title: 'Submit', description: 'Review and submit' },
];

export default function AdmissionsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AdmissionFormData>({
    resolver: zodResolver(admissionSchema),
  });

  const onSubmit = async (data: AdmissionFormData) => {
    setIsSubmitting(true);
    try {
      setSubmitError('');

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      if (selectedFile) {
        formData.append('documents', selectedFile);
      }

      await api.post('/admissions/applications/', formData);
      setSubmitSuccess(true);
      reset();
      setSelectedFile(null);
    } catch (error: any) {
      console.error('Submission error:', error);
      const details = error?.response?.data;
      const firstFieldError =
        details && typeof details === 'object'
          ? (Object.values(details)[0] as string[] | string | undefined)
          : undefined;
      setSubmitError(
        (Array.isArray(firstFieldError) ? firstFieldError[0] : firstFieldError) ||
          'We could not send your application. Please check the form and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main id="main-content">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-navy-700 to-primary-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Admissions</h1>
          <p className="text-xl text-gray-200">
            Begin your journey to academic excellence at Lycée de Nyanza.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        {/* Application Process */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-navy-700 mb-8 text-center">Application Process</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {steps.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-navy-700 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-navy-700 mb-6 flex items-center">
                <FileText className="h-6 w-6 mr-2 text-primary-600" />
                Requirements
              </h2>
              <ul className="space-y-3">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-black mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{req}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <h3 className="font-semibold text-navy-700 mb-4">Download Forms</h3>
                <div className="space-y-2">
                  <a
                    href="/forms/admission-form.pdf"
                    className="flex items-center text-primary-600 hover:text-primary-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Admission Application Form
                  </a>
                  <a
                    href="/forms/medical-form.pdf"
                    className="flex items-center text-primary-600 hover:text-primary-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Medical Examination Form
                  </a>
                </div>
              </div>
            </div>

            {/* Application Form */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-navy-700 mb-6 flex items-center">
                <GraduationCap className="h-6 w-6 mr-2 text-primary-600" />
                Apply Online
              </h2>

              {submitSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-black mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-navy-700 mb-2">Application Submitted!</h3>
                  <p className="text-gray-600 mb-4">
                    Thank you for your application. We will review it and contact you soon.
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="text-primary-600 font-semibold hover:text-primary-700"
                  >
                    Submit Another Application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        {...register('first_name')}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter first name"
                      />
                      {errors.first_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        {...register('last_name')}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter last name"
                      />
                      {errors.last_name && (
                        <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      {...register('phone')}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter phone number"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      {...register('date_of_birth')}
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.date_of_birth && (
                      <p className="text-red-500 text-sm mt-1">{errors.date_of_birth.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level *
                    </label>
                    <select
                      {...register('level')}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select Level</option>
                      <option value="olevel">O&apos; Level (S1-S3)</option>
                      <option value="alevel">A&apos; Level (S4-S6)</option>
                    </select>
                    {errors.level && (
                      <p className="text-red-500 text-sm mt-1">{errors.level.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        {...register('gender')}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent / Guardian Name
                      </label>
                      <input
                        {...register('parent_name')}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Guardian full name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent / Guardian Phone
                      </label>
                      <input
                        {...register('parent_phone')}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="07XX XXX XXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        {...register('address')}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Sector, District"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Previous School
                    </label>
                    <input
                      {...register('previous_school')}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter previous school name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Documents
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                  </div>

                  {submitError && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Fee Structure */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-navy-700 mb-8 text-center">Fee Structure</h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
                <thead className="bg-primary-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Level</th>
                    <th className="px-6 py-4 text-left">Term</th>
                    <th className="px-6 py-4 text-right">Tuition Fee</th>
                    <th className="px-6 py-4 text-right">Other Fees</th>
                    <th className="px-6 py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {feeStructure.map((fee, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 font-medium text-navy-700">{fee.level}</td>
                      <td className="px-6 py-4 text-gray-600">Term {fee.term}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{formatCurrency(fee.tuition)}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{formatCurrency(fee.other)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-navy-700">
                        {formatCurrency(fee.tuition + fee.other)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Fees are subject to change. Contact the school for the most current fee structure.
            </p>
          </div>
        </section>
      </div>

      </main>

      <Footer />
    </div>
  );
}
