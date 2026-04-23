import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Shield, User, Mail, Phone, Fingerprint, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  middleName: z.string().min(2, 'Middle name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  faydaId: z.string().min(10, 'Fayda ID is required'),
  otpCode: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [showOtpField, setShowOtpField] = React.useState(false);
  const [isOtpSent, setIsOtpSent] = React.useState(false);
  const [isOtpVerified, setIsOtpVerified] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const faydaIdValue = watch('faydaId');
  const otpCodeValue = watch('otpCode');
  const passwordValue = watch('password') || '';
  const confirmPasswordValue = watch('confirmPassword') || '';

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const strength = getPasswordStrength(passwordValue);
  const confirmStrength = getPasswordStrength(confirmPasswordValue);

  const getStrengthColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-gray-200';
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const getStrengthText = (level: number) => {
    if (!passwordValue) return '';
    switch (level) {
      case 1: return 'Very Weak';
      case 2: return 'Weak';
      case 3: return 'Medium';
      case 4: return 'Strong';
      default: return '';
    }
  };

  const handleSendOtp = async () => {
    if (!faydaIdValue || faydaIdValue.length < 5) return;
    setIsOtpSent(true);
    setShowOtpField(true);
    // Simulate SMS sending
    alert("SMS verification code sent to the phone number linked to your Fayda ID.");
  };

  const handleVerifyOtp = async () => {
    if (!otpCodeValue || otpCodeValue.length !== 6) return;
    // Simulate verification
    setIsOtpVerified(true);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    if (!isOtpVerified) {
      alert("Please verify your Fayda ID via SMS first.");
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Register data:', data);
    setIsSuccess(true);
    setTimeout(() => navigate('/login'), 3000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white p-12 rounded-[40px] shadow-2xl text-center space-y-6 border border-gray-100"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-primary">{t.register.success}</h2>
          <p className="text-gray-500">
            {t.register.successSub}
          </p>
          <div className="pt-4">
            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3 }}
                className="h-full bg-green-500"
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-5 bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
        {/* Left Side - Info */}
        <div className="lg:col-span-2 bg-primary p-12 text-white space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <Shield className="w-16 h-16 text-secondary" />
          <h2 className="text-4xl font-bold leading-tight">{t.register.joinNetwork}</h2>
          <p className="text-blue-100 text-lg">
            {t.register.joinNetworkSub}
          </p>
          
          <div className="space-y-6 pt-8">
            {t.register.features.map((item: any, i: number) => (
              <div key={i} className="flex space-x-4">
                <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{item.title}</h4>
                  <p className="text-sm text-blue-200">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="lg:col-span-3 p-8 md:p-16 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-primary">{t.register.title}</h1>
              <p className="text-gray-500">{t.register.subtitle}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">{t.register.firstName}</label>
                <input 
                  {...register('firstName')}
                  placeholder="First"
                  className={`w-full px-4 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all ${
                    errors.firstName ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.firstName && <p className="text-xs text-red-500 ml-1">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">{t.register.middleName}</label>
                <input 
                  {...register('middleName')}
                  placeholder="Middle"
                  className={`w-full px-4 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all ${
                    errors.middleName ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.middleName && <p className="text-xs text-red-500 ml-1">{errors.middleName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">{t.register.lastName}</label>
                <input 
                  {...register('lastName')}
                  placeholder="Last"
                  className={`w-full px-4 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all ${
                    errors.lastName ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.lastName && <p className="text-xs text-red-500 ml-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">{t.register.username}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    {...register('username')}
                    placeholder="Choose username"
                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all ${
                      errors.username ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.username && <p className="text-xs text-red-500 ml-1">{errors.username.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">{t.register.email}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    {...register('email')}
                    type="email"
                    placeholder="email@example.com"
                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all ${
                      errors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">{t.register.phone}</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  {...register('phone')}
                  placeholder="+251 9XX XXX XXX"
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all ${
                    errors.phone ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 ml-1">{errors.phone.message}</p>}
            </div>

            <div className="space-y-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">{t.register.faydaId}</label>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      {...register('faydaId')}
                      disabled={isOtpVerified}
                      placeholder="ET-XXXX-XXXX-XXXX"
                      className={`w-full pl-12 pr-4 py-4 bg-white border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all ${
                        errors.faydaId ? 'border-red-500' : 'border-gray-200'
                      } ${isOtpVerified ? 'bg-green-50' : ''}`}
                    />
                  </div>
                  {!isOtpVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={!faydaIdValue || isOtpSent}
                      className="px-6 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
                    >
                      {isOtpSent ? "Sent" : t.register.sendOtp}
                    </button>
                  )}
                  {isOtpVerified && (
                    <div className="flex items-center space-x-2 text-green-600 font-bold px-4">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
                {errors.faydaId && <p className="text-xs text-red-500 ml-1">{errors.faydaId.message}</p>}
              </div>

              {showOtpField && !isOtpVerified && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 pt-2"
                >
                  <label className="text-xs font-bold text-gray-500 ml-1">{t.register.otpPlaceholder}</label>
                  <div className="flex gap-3">
                    <input 
                      {...register('otpCode')}
                      maxLength={6}
                      className="flex-1 p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary text-center tracking-[1em] font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="px-6 py-4 bg-secondary text-primary rounded-2xl font-bold text-sm shadow-md"
                    >
                      Verify
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">{t.register.password}</label>
                <div className="relative">
                  <input 
                    {...register('password')}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all pr-12 ${
                      errors.password ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {passwordValue && (
                  <div className="space-y-1.5 px-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Security Strength</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        strength === 1 ? 'text-red-500' : 
                        strength === 2 ? 'text-orange-500' : 
                        strength === 3 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {getStrengthText(strength)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div 
                          key={step} 
                          className={`h-full flex-1 transition-all duration-500 ${
                            strength >= step ? getStrengthColor(strength) : 'bg-gray-100'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">{t.register.confirmPassword}</label>
                <div className="relative">
                  <input 
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all pr-12 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {confirmPasswordValue && (
                  <div className="space-y-1.5 px-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Match Accuracy</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        confirmPasswordValue === passwordValue ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {confirmPasswordValue === passwordValue ? 'MATCHED' : 'MISMATCH'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={false}
                        animate={{ 
                          width: confirmPasswordValue === passwordValue ? '100%' : '30%',
                          backgroundColor: confirmPasswordValue === passwordValue ? '#10b981' : '#ef4444'
                        }}
                        className="h-full rounded-full"
                      />
                    </div>
                  </div>
                )}

                {errors.confirmPassword && <p className="text-xs text-red-500 ml-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button 
                type="submit"
                disabled={isSubmitting}
                className={`w-full blue-gradient text-white font-bold py-5 rounded-2xl hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center space-x-2 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <span>{isSubmitting ? t.register.submitting : t.register.submit}</span>
                {!isSubmitting && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              {t.register.alreadyAccount} <Link to="/login" className="text-accent font-bold hover:underline">{t.auth.signIn}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
