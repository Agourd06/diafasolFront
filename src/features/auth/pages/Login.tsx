import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";
import { useLogin } from "../hooks/useLogin";
import { getErrorMessage } from "../../../utils/validation";

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!identifier || !password) return;
    loginMutation.mutate({ email: identifier, password });
  };

  const isDisabled = !identifier || password.length < 6;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-0 h-72 w-72 animate-pulse rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute -right-4 bottom-0 h-96 w-96 animate-pulse rounded-full bg-indigo-200/30 blur-3xl" style={{ animationDelay: "1s" }} />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-blue-200/20 blur-3xl" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative flex min-h-screen">
        {/* Left side - Logo only */}
        <div className="hidden w-1/2 items-center justify-center p-12 lg:flex">
          <div className="flex items-center justify-center animate-fade-in">
            <img 
              src="/diafasol_logo.png" 
              alt="DiafaSol" 
              className="h-32 w-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
          <div className="w-full max-w-md animate-slide-up">
            {/* Mobile logo */}
            <div className="mb-8 flex items-center justify-center lg:hidden">
              <img 
                src="/diafasol_logo.png" 
                alt="DiafaSol" 
                className="h-14 w-auto object-contain"
              />
            </div>

            <div className="rounded-3xl bg-white/80 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-slate-200/50">
              {/* Header */}
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-slate-900">{t("auth.login.title")}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {t("auth.login.subtitle")}
                </p>
              </div>

              {/* Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Identifier field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">
                    {t("auth.login.emailLabel")}
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="text"
                      placeholder={t("auth.login.emailPlaceholder")}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">
                    {t("auth.login.passwordLabel")}
                  </Label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("auth.login.passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {loginMutation.isError && (
                  <div className="animate-shake rounded-lg bg-red-50 p-4 ring-1 ring-red-200">
                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 flex-shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-red-800">{t("auth.login.errorTitle")}</h3>
                        <p className="mt-1 text-sm text-red-700">{getErrorMessage(loginMutation.error)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full transform py-3 text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isDisabled}
                  isLoading={loginMutation.isPending}
                >
                  {loginMutation.isPending ? t("auth.login.submitting") : t("auth.login.submitButton")}
                </Button>
              </form>

              {/* Forgot password link */}
              <div className="mt-4 text-center">
                <Link to="/forgot-password" className="text-sm text-brand-600 hover:text-brand-700">
                  {t("auth.login.forgotPassword")}
                </Link>
              </div>

              {/* Footer */}
              <div className="mt-8 space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-slate-500">{t("auth.login.noAccount")}</span>
                  </div>
                </div>

                <Link
                  to="/register"
                  className="block w-full rounded-lg border-2 border-brand-600 bg-white py-3 text-center text-sm font-semibold text-brand-600 transition-all hover:bg-brand-50"
                >
                  {t("auth.login.createAccount")}
                </Link>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{t("trust.ssl")}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>{t("trust.support")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
