import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import { forgotPasswordRequest } from "../../../api/auth.api";
import { isValidEmail } from "../../../utils/validation";

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPasswordRequest,
    onSuccess: () => {
      setEmailSent(true);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !isValidEmail(email)) return;
    forgotPasswordMutation.mutate({ email });
  };

  const isFormValid = email && isValidEmail(email);

  if (emailSent) {
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <h2 className="mb-4 text-center text-2xl font-bold text-slate-900">
              {t("auth.forgotPassword.emailSent")}
            </h2>
            <p className="mb-6 text-center text-slate-600">
              {t("auth.forgotPassword.checkEmail")}
            </p>

            <div className="space-y-3">
              <Link to="/login" className="block">
                <Button className="w-full">{t("auth.forgotPassword.backToLogin")}</Button>
              </Link>
              <button
                onClick={() => setEmailSent(false)}
                className="w-full text-sm text-slate-600 hover:text-slate-900"
              >
                {t("auth.forgotPassword.tryAgain")}
              </button>
            </div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{t("auth.forgotPassword.title")}</h2>
            <p className="mt-2 text-sm text-slate-600">{t("auth.forgotPassword.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.login.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.login.emailPlaceholder")}
                required
                autoFocus
              />
              {email && !isValidEmail(email) && (
                <p className="text-xs text-red-600">{t("auth.validation.invalidEmail")}</p>
              )}
            </div>

            {forgotPasswordMutation.isError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {t("auth.forgotPassword.error")}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid}
              isLoading={forgotPasswordMutation.isPending}
            >
              {t("auth.forgotPassword.sendLink")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-brand-600 hover:text-brand-700">
              ← {t("auth.forgotPassword.backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

