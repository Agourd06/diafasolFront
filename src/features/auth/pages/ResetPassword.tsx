import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import { resetPasswordRequest } from "../../../api/auth.api";
import { getErrorMessage } from "../../../utils/validation";

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const resetPasswordMutation = useMutation({
    mutationFn: resetPasswordRequest,
    onSuccess: () => {
      setResetSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    },
  });

  useEffect(() => {
    // If no token in URL, redirect to forgot password
    if (!token) {
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !password || password.length < 6 || password !== confirmPassword) return;
    resetPasswordMutation.mutate({ token, password });
  };

  const isFormValid = password.length >= 6 && password === confirmPassword;

  if (resetSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 px-4 py-12">
        <div className="w-full max-w-md">
          {/* Language Switcher */}
          <div className="mb-6 flex justify-end">
            <LanguageSwitcher />
          </div>

          {/* Success Card */}
          <div className="animate-slide-up rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="mb-4 text-center text-2xl font-bold text-slate-900">
              {t("auth.resetPassword.success")}
            </h2>
            <p className="mb-6 text-center text-slate-600">
              {t("auth.resetPassword.successMessage")}
            </p>

            <Link to="/login">
              <Button className="w-full">{t("auth.resetPassword.goToLogin")}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Language Switcher */}
        <div className="mb-6 flex justify-end">
          <LanguageSwitcher />
        </div>

        {/* Form Card */}
        <div className="animate-slide-up rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
                <svg className="h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{t("auth.resetPassword.title")}</h2>
            <p className="mt-2 text-sm text-slate-600">{t("auth.resetPassword.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.resetPassword.newPassword")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.resetPassword.passwordPlaceholder")}
                  minLength={6}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
              {password && password.length < 6 && (
                <p className="text-xs text-red-600">{t("auth.validation.passwordTooShort")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("auth.resetPassword.confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("auth.resetPassword.confirmPasswordPlaceholder")}
                minLength={6}
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-600">{t("auth.validation.passwordMismatch")}</p>
              )}
            </div>

            {resetPasswordMutation.isError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {getErrorMessage(resetPasswordMutation.error)}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid}
              isLoading={resetPasswordMutation.isPending}
            >
              {t("auth.resetPassword.resetButton")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/forgot-password" className="text-sm text-brand-600 hover:text-brand-700">
              ← {t("auth.resetPassword.backToForgot")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

