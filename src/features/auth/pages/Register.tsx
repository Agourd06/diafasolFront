import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";
import { useRegister } from "../hooks/useRegister";
import { isValidEmail, isValidUrl, getErrorMessage } from "../../../utils/validation";

const Register: React.FC = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [groupTitle, setGroupTitle] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const registerMutation = useRegister();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username || !email || !password || !companyName || !companyEmail || !groupTitle) return;
    registerMutation.mutate({
      username,
      email,
      password,
      companyName,
      companyEmail,
      groupTitle,
      companyLogo: companyLogo || undefined,
      companyPhone: companyPhone || undefined,
      companyWebsite: companyWebsite || undefined
    });
  };

  const hasInvalidOptionalUrl = useMemo(() => {
    if (companyLogo && !isValidUrl(companyLogo)) return true;
    if (companyWebsite && !isValidUrl(companyWebsite)) return true;
    return false;
  }, [companyLogo, companyWebsite]);

  const passwordStrength = useMemo(() => {
    if (!password) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 1, label: t("auth.register.passwordStrengthWeak"), color: "bg-red-500" },
      { strength: 2, label: t("auth.register.passwordStrengthMedium"), color: "bg-orange-500" },
      { strength: 3, label: t("auth.register.passwordStrengthGood"), color: "bg-yellow-500" },
      { strength: 4, label: t("auth.register.passwordStrengthStrong"), color: "bg-green-500" },
      { strength: 5, label: t("auth.register.passwordStrengthVeryStrong"), color: "bg-green-600" }
    ];

    return levels.find(l => l.strength === strength) || levels[0];
  }, [password, t]);

  const isDisabled =
    !username ||
    !companyName ||
    !groupTitle ||
    !isValidEmail(email) ||
    !isValidEmail(companyEmail) ||
    password.length < 6 ||
    hasInvalidOptionalUrl;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-0 h-72 w-72 animate-pulse rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute -right-4 bottom-0 h-96 w-96 animate-pulse rounded-full bg-indigo-200/30 blur-3xl" style={{ animationDelay: "1s" }} />
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

        {/* Right side - Register form */}
        <div className="flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
          <div className="w-full max-w-xl animate-slide-up">
            {/* Mobile logo */}
            <div className="mb-6 flex items-center justify-center lg:hidden">
              <img 
                src="/diafasol_logo.png" 
                alt="DiafaSol" 
                className="h-14 w-auto object-contain"
              />
            </div>

            <div className="rounded-3xl bg-white/80 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-slate-200/50">
              {/* Header */}
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-slate-900">{t("auth.register.title")}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {t("auth.register.subtitle")}
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* User Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <svg className="h-5 w-5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-sm font-semibold text-slate-900">{t("auth.register.userInfoTitle")}</h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-slate-700">
                        {t("auth.register.usernameLabel")} <span className="text-red-500">{t("common.required")}</span>
                      </Label>
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder={t("auth.register.usernamePlaceholder")}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700">
                        {t("auth.register.emailLabel")} <span className="text-red-500">{t("common.required")}</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t("auth.register.emailPlaceholder")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700">
                      {t("auth.register.passwordLabel")} <span className="text-red-500">{t("common.required")}</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("auth.register.passwordPlaceholder")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10"
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
                    {password && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-all ${
                                level <= passwordStrength.strength
                                  ? passwordStrength.color
                                  : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600">
                          {t("auth.register.passwordStrength")}: <span className="font-medium">{passwordStrength.label}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <svg className="h-5 w-5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-sm font-semibold text-slate-900">{t("auth.register.companyInfoTitle")}</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-slate-700">
                      {t("auth.register.companyNameLabel")} <span className="text-red-500">{t("common.required")}</span>
                    </Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      type="text"
                      placeholder={t("auth.register.companyNamePlaceholder")}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyEmail" className="text-slate-700">
                      {t("auth.register.companyEmailLabel")} <span className="text-red-500">{t("common.required")}</span>
                    </Label>
                    <Input
                      id="companyEmail"
                      name="companyEmail"
                      type="email"
                      placeholder={t("auth.register.companyEmailPlaceholder")}
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="groupTitle" className="text-slate-700">
                      {t("auth.register.groupTitleLabel")} <span className="text-red-500">{t("common.required")}</span>
                    </Label>
                    <Input
                      id="groupTitle"
                      name="groupTitle"
                      type="text"
                      placeholder={t("auth.register.groupTitlePlaceholder")}
                      value={groupTitle}
                      onChange={(e) => setGroupTitle(e.target.value)}
                      required
                    />
                    <p className="text-xs text-slate-500">{t("auth.register.groupTitleHelp")}</p>
                  </div>

                  {/* Optional fields toggle */}
                  <button
                    type="button"
                    onClick={() => setShowOptionalFields(!showOptionalFields)}
                    className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    <span>{t("auth.register.optionalFields")}</span>
                    <svg
                      className={`h-5 w-5 transition-transform ${showOptionalFields ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showOptionalFields && (
                    <div className="space-y-4 animate-slide-down rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyLogo" className="text-slate-700">
                          {t("auth.register.logoLabel")}
                        </Label>
                        <Input
                          id="companyLogo"
                          name="companyLogo"
                          type="url"
                          placeholder={t("auth.register.logoPlaceholder")}
                          value={companyLogo}
                          onChange={(e) => setCompanyLogo(e.target.value)}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="companyPhone" className="text-slate-700">
                            {t("auth.register.phoneLabel")}
                          </Label>
                          <Input
                            id="companyPhone"
                            name="companyPhone"
                            type="tel"
                            placeholder={t("auth.register.phonePlaceholder")}
                            value={companyPhone}
                            onChange={(e) => setCompanyPhone(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="companyWebsite" className="text-slate-700">
                            {t("auth.register.websiteLabel")}
                          </Label>
                          <Input
                            id="companyWebsite"
                            name="companyWebsite"
                            type="url"
                            placeholder={t("auth.register.websitePlaceholder")}
                            value={companyWebsite}
                            onChange={(e) => setCompanyWebsite(e.target.value)}
                          />
                        </div>
                      </div>

                      {hasInvalidOptionalUrl && (
                        <p className="text-sm text-red-600">{t("auth.register.invalidUrl")}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Error message */}
                {registerMutation.isError && (
                  <div className="animate-shake rounded-lg bg-red-50 p-4 ring-1 ring-red-200">
                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 flex-shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-red-800">{t("auth.register.errorTitle")}</h3>
                        <p className="mt-1 text-sm text-red-700">{getErrorMessage(registerMutation.error)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full transform py-3 text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isDisabled}
                  isLoading={registerMutation.isPending}
                >
                  {registerMutation.isPending ? t("auth.register.submitting") : t("auth.register.submitButton")}
                </Button>

                {/* Terms */}
                <p className="text-center text-xs text-slate-500">
                  {t("auth.register.terms")}{" "}
                  <a href="#" className="text-brand-600 hover:underline">
                    {t("auth.register.termsLink")}
                  </a>{" "}
                  {t("auth.register.and")}{" "}
                  <a href="#" className="text-brand-600 hover:underline">
                    {t("auth.register.privacyLink")}
                  </a>
                </p>
              </form>

              {/* Footer */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-slate-500">{t("auth.register.hasAccount")}</span>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="mt-4 block w-full rounded-lg border-2 border-slate-300 bg-white py-3 text-center text-sm font-semibold text-slate-700 transition-all hover:border-brand-600 hover:text-brand-600"
                >
                  {t("auth.register.loginLink")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
