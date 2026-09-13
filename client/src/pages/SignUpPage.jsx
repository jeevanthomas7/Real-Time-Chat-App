import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';
import { Loader2, Lock, Mail, User, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import toast from 'react-hot-toast';

const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number");

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const SignUpPage = () => {
  const { signup, googleLogin, isSigningUp } = useAuthStore();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange"
  });

  const passwordValue = watch('password', '');

  const passwordStrength = {
    hasLength: passwordValue.length >= 8,
    hasUpper: /[A-Z]/.test(passwordValue),
    hasLower: /[a-z]/.test(passwordValue),
    hasNumber: /[0-9]/.test(passwordValue),
  };

  const onSubmit = async (data) => {
    signup({
      username: data.username,
      email: data.email,
      password: data.password
    });
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      googleLogin({
        email: user.email,
        username: user.displayName || user.email?.split('@')[0] || 'User',
        googleId: user.uid,
        profilePic: user.photoURL || '',
      });
    } catch (error) {
      console.error('Google Auth Error:', error);
      toast.error(error.message || 'Google Sign-In Failed');
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 sm:p-12">
      <div className="w-full max-w-md space-y-6 bg-cards p-8 sm:p-10 rounded-3xl shadow-xl border border-borders mt-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="flex flex-col items-center gap-2 group">
              <div className="flex items-center mb-2">
                <span className="text-3xl font-black uppercase tracking-[0.2em] text-primary drop-shadow-md">CHATIFY</span>
              </div>
              <h1 className="text-2xl font-bold mt-2 text-text-main">Create Account</h1>
              <p className="text-muted">Get started with your free account</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-5"
          >
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 bg-cards border border-borders text-text-main rounded-lg font-medium hover:bg-elevated-cards shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Sign up with Google
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-borders"></div>
              <span className="flex-shrink-0 mx-4 text-muted text-xs font-semibold tracking-wider uppercase">OR CONTINUE WITH EMAIL</span>
              <div className="flex-grow border-t border-borders"></div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="form-control">
                <label className="block text-sm font-medium text-text-secondary mb-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    type="text"
                    {...register('username')}
                    className={`w-full pl-10 pr-4 py-2 bg-cards border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm ${errors.username ? 'border-danger focus:ring-danger' : 'border-borders'}`}
                    placeholder="johndoe"
                  />
                </div>
                {errors.username && <p className="text-danger text-xs mt-1.5 font-medium">{errors.username.message}</p>}
              </div>

              <div className="form-control">
                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    type="email"
                    {...register('email')}
                    className={`w-full pl-10 pr-4 py-2 bg-cards border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm ${errors.email ? 'border-danger focus:ring-danger' : 'border-borders'}`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="text-danger text-xs mt-1.5 font-medium">{errors.email.message}</p>}
              </div>

              <div className="form-control">
                <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    type="password"
                    {...register('password')}
                    className={`w-full pl-10 pr-4 py-2 bg-cards border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm ${errors.password ? 'border-danger focus:ring-danger' : 'border-borders'}`}
                    placeholder="••••••••"
                  />
                </div>
                {/* Password Strength Indicator */}
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1 ${passwordStrength.hasLength ? 'text-success' : 'text-muted'}`}>
                    {passwordStrength.hasLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 8+ characters
                  </div>
                  <div className={`flex items-center gap-1 ${passwordStrength.hasUpper ? 'text-success' : 'text-muted'}`}>
                    {passwordStrength.hasUpper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Uppercase
                  </div>
                  <div className={`flex items-center gap-1 ${passwordStrength.hasLower ? 'text-success' : 'text-muted'}`}>
                    {passwordStrength.hasLower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Lowercase
                  </div>
                  <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-success' : 'text-muted'}`}>
                    {passwordStrength.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Number
                  </div>
                </div>
              </div>

              <div className="form-control">
                <label className="block text-sm font-medium text-text-secondary mb-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    type="password"
                    {...register('confirmPassword')}
                    className={`w-full pl-10 pr-4 py-2 bg-cards border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm ${errors.confirmPassword ? 'border-danger focus:ring-danger' : 'border-borders'}`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="text-danger text-xs mt-1.5 font-medium">{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 shadow-md hover:shadow-lg transition-all flex items-center justify-center cursor-pointer mt-4"
                disabled={isSigningUp}
              >
                {isSigningUp ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign up'}
              </button>
            </form>
          </motion.div>

          <div className="text-center">
            <p className="text-muted text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
      </div>
    </div>
  );
};

export default SignUpPage;
