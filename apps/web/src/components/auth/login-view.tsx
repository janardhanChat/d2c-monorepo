"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import { http } from "@/lib/http";
import { createSupabaseBrowserClient } from "@/lib/supabase";

function normalizePhoneNumber(countryCode: string, digits: string): string {
  const cleanDigits = digits.replace(/[^0-9]/g, "");
  const cleanCode = countryCode.startsWith("+") ? countryCode : `+${countryCode}`;
  return `${cleanCode}${cleanDigits}`;
}

function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 6) return phone;
  const prefix = phone.slice(0, 6);
  const suffix = phone.slice(-2);
  return `${prefix}****${suffix}`;
}

const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳", length: 10 },
  { code: "+1", country: "United States", flag: "🇺🇸", length: 10 },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧", length: 10 },
  { code: "+971", country: "United Arab Emirates", flag: "🇦🇪", length: 9 },
  { code: "+65", country: "Singapore", flag: "🇸🇬", length: 8 },
  { code: "+61", country: "Australia", flag: "🇦🇺", length: 9 },
  { code: "+49", country: "Germany", flag: "🇩🇪", length: 10 },
  { code: "+1", country: "Canada", flag: "🇨🇦", length: 10 },
];

export function LoginView() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  // Screen state: "phone" | "otp"
  const [step, setStep] = useState<"phone" | "otp">("phone");

  // Phone inputs
  const [selectedCountry, setSelectedCountry] = useState("+91");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [fullNormalizedPhone, setFullNormalizedPhone] = useState("");

  // OTP inputs
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  function addLog(type: "info" | "error" | "warn", message: string, data?: unknown) {
    const time = new Date().toLocaleTimeString();
    if (type === "error") {
      console.error(`[Auth ${time}] ${message}`, data ?? "");
    } else {
      console.warn(`[Auth ${time}] ${message}`, data ?? "");
    }
  }

  // Check if session already exists on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        router.push("/dashboard/onboarding");
      }
    });
  }, [router, supabase]);

  // Resend OTP countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  // Handle phone submission (Send OTP)
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setErrorDetails(null);

    const activeCountry = COUNTRY_CODES.find((c) => c.code === selectedCountry) ?? {
      code: "+91",
      country: "India",
      flag: "🇮🇳",
      length: 10,
    };
    const cleanedDigits = phoneRaw.replace(/[^0-9]/g, "");

    if (cleanedDigits.length < activeCountry.length) {
      const err = `Please enter a valid ${activeCountry.length}-digit mobile number for ${activeCountry.country}.`;
      setErrorMessage(err);
      addLog("warn", err);
      return;
    }

    const normalized = normalizePhoneNumber(selectedCountry, cleanedDigits);
    setFullNormalizedPhone(normalized);
    setLoading(true);

    addLog("info", `Initiating OTP request to Supabase for ${normalized}...`);

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: normalized,
        options: { channel: "sms" },
      });

      if (error) {
        addLog(
          "error",
          `Supabase signInWithOtp error (${error.status ?? "failed"}): ${error.message}`,
          error,
        );
        setErrorMessage(error.message);
        setErrorDetails(
          JSON.stringify(
            {
              name: error.name,
              message: error.message,
              status: error.status,
              code: (error as { code?: string }).code,
            },
            null,
            2,
          ),
        );

        // If local dev sandbox without SMS provider configured, warn and allow testing OTP
        if (
          error.message.includes("SMS provider") ||
          error.message.includes("not enabled") ||
          error.message.includes("not supported")
        ) {
          addLog("warn", "Local environment note: proceeding to OTP verification.", error.message);
          setStep("otp");
          setResendCooldown(30);
          setCanResend(false);
        }
      } else {
        addLog("info", "Supabase accepted OTP request and dispatched to Twilio.", data);
        setStep("otp");
        setResendCooldown(30);
        setCanResend(false);
      }
    } catch (err: unknown) {
      addLog("error", "Exception calling signInWithOtp:", err);
      const msg =
        err instanceof Error ? err.message : "Failed to send verification code. Please try again.";
      setErrorMessage(msg);
      setErrorDetails(String(err));
    } finally {
      setLoading(false);
    }
  }

  // Handle OTP digit changes
  function handleDigitChange(index: number, value: string) {
    // Only accept numeric
    const cleanValue = value.replace(/[^0-9]/g, "");
    if (!cleanValue) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      return;
    }

    // If pasted multiple digits
    if (cleanValue.length > 1) {
      const pasted = cleanValue.slice(0, 6).split("");
      const next = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) next[i] = char;
      });
      setOtpDigits(next);
      const targetIndex = Math.min(pasted.length, 5);
      inputRefs.current[targetIndex]?.focus();
      return;
    }

    // Single digit
    const next = [...otpDigits];
    next[index] = cleanValue;
    setOtpDigits(next);

    // Auto-advance
    if (index < 5 && cleanValue) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);
    if (!pasted) return;

    const next = [...otpDigits];
    pasted.split("").forEach((char, i) => {
      if (i < 6) next[i] = char;
    });
    setOtpDigits(next);
    const targetIndex = Math.min(pasted.length, 5);
    inputRefs.current[targetIndex]?.focus();
  }

  // Handle OTP verification
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setErrorDetails(null);

    const token = otpDigits.join("");
    if (token.length !== 6) {
      const msg = "Please enter all 6 digits of the verification code.";
      setErrorMessage(msg);
      addLog("warn", msg);
      return;
    }

    setLoading(true);
    addLog("info", `Verifying 6-digit OTP token for ${fullNormalizedPhone}...`);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: fullNormalizedPhone,
        token,
        type: "sms",
      });

      if (error) {
        addLog(
          "error",
          `Supabase verifyOtp error: ${error.message} (status: ${error.status})`,
          error,
        );
        // Fallback for demo/dev if Supabase SMS OTP verification is simulated
        if (
          error.message.includes("SMS provider") ||
          error.message.includes("Invalid token") ||
          error.message.includes("Token has expired")
        ) {
          // If in local dev and token is 123456 or 000000, allow demo sign in
          if (
            process.env.NODE_ENV === "development" &&
            (token === "123456" || token === "000000")
          ) {
            addLog("warn", "Dev mode: accepted test token. Proceeding to onboarding.");
            try {
              const demoPhone = fullNormalizedPhone || "+919875248929";
              await http.post("/api/auth/otp-sync", {
                userId: "usr_dev_demo",
                phone: demoPhone,
                email: "demo@adsplatform.com",
              });
              await http.post("/api/workspaces/assign-default", {
                userId: "usr_dev_demo",
                phone: demoPhone,
                email: "demo@adsplatform.com",
              });
            } catch {
              // ignore
            }
            router.push("/dashboard/onboarding");
            return;
          }
        }
        setErrorMessage(error.message);
        setErrorDetails(
          JSON.stringify(
            {
              name: error.name,
              message: error.message,
              status: error.status,
              code: (error as { code?: string }).code,
            },
            null,
            2,
          ),
        );
        return;
      }

      const user = data?.user ?? data?.session?.user;
      if (user) {
        addLog("info", `Successfully verified! User ID: ${user.id}`);
        addLog("info", "Saving verified record in core.profiles table...");

        const verifiedAt = user.phone_confirmed_at || new Date().toISOString();
        const userPhone = user.phone || fullNormalizedPhone;
        const userEmail = user.email || `${userPhone.replace(/[^0-9]/g, "")}@phone.user`;

        try {
          const profileRecord = {
            user_id: user.id,
            email: userEmail,
            phone: userPhone,
            phone_verified_at: verifiedAt,
            updated_at: new Date().toISOString(),
          };

          // 1. PostgREST schema call: supabase.schema("core").from("profiles")
          let { error: profileError } = await supabase
            .schema("core")
            .from("profiles")
            .upsert(profileRecord, { onConflict: "user_id" });

          if (profileError) {
            if (
              profileError.code === "42501" ||
              profileError.message?.includes("row-level security")
            ) {
              addLog(
                "error",
                "Supabase Row-Level Security (RLS) blocked insert into core.profiles. An INSERT policy is required.",
              );
            } else {
              // Schema fallback if custom schema routing is disabled
              const resDot = await supabase
                .from("core.profiles")
                .upsert(profileRecord, { onConflict: "user_id" });
              profileError = resDot.error;
            }
          }

          if (profileError) {
            addLog(
              "warn",
              `Profile upsert notice: ${profileError.message || "Completed with fallback"}`,
            );
          } else {
            addLog("info", "Profile record saved successfully in core.profiles!");
          }
        } catch (profileCatchErr) {
          addLog("warn", "Profile upsert exception:", profileCatchErr);
        }

        try {
          const syncJson = await http.post<{ success: boolean; profileError?: string }>(
            "/api/auth/otp-sync",
            {
              userId: user.id,
              phone: userPhone,
              email: userEmail,
              phoneVerifiedAt: verifiedAt,
              phoneConfirmedAt: verifiedAt,
            },
            {
              headers: data?.session?.access_token
                ? { Authorization: `Bearer ${data.session.access_token}` }
                : undefined,
            },
          );

          if (syncJson.profileError) {
            addLog("error", `Server profile sync notice: ${syncJson.profileError}`);
          } else {
            addLog("info", "Server profile sync completed successfully!");
          }
        } catch (e) {
          console.warn("Could not sync user profile via API:", e);
        }

        // Automatically provision or assign user to Default Workspace
        try {
          addLog("info", "Assigning user to Default Workspace...");
          await http.post(
            "/api/workspaces/assign-default",
            {
              userId: user.id,
              phone: userPhone,
              email: userEmail,
            },
            {
              headers: data?.session?.access_token
                ? { Authorization: `Bearer ${data.session.access_token}` }
                : undefined,
            },
          );
          addLog("info", "Default Workspace assigned successfully!");
        } catch (wsErr) {
          console.warn("Could not auto-assign default workspace:", wsErr);
        }

        addLog("info", "Verification complete. Redirecting to onboarding flow...");
        router.push("/dashboard/onboarding");
      } else {
        addLog("info", "Verification complete. Redirecting to onboarding...");
        router.push("/dashboard/onboarding");
      }
    } catch (err: unknown) {
      addLog("error", "Exception thrown in handleVerifyOtp:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to verify code. Please check and try again.",
      );
      setErrorDetails(String(err));
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP action
  async function handleResendOtp() {
    if (!canResend || loading) return;
    setErrorMessage(null);
    setErrorDetails(null);
    setLoading(true);

    addLog("info", `Requesting resend of OTP to ${fullNormalizedPhone}...`);

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: fullNormalizedPhone,
        options: { channel: "sms" },
      });

      if (error) {
        addLog("error", `Resend OTP failed: ${error.message} (status: ${error.status})`, error);
        setErrorMessage(error.message);
        setErrorDetails(
          JSON.stringify(
            {
              name: error.name,
              message: error.message,
              status: error.status,
              code: (error as { code?: string }).code,
            },
            null,
            2,
          ),
        );
      } else {
        addLog("info", "Resend OTP dispatched to Twilio by Supabase.", data);
        setResendCooldown(30);
        setCanResend(false);
      }
    } catch (err: unknown) {
      addLog("error", "Exception in handleResendOtp:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to resend code. Please try again.",
      );
      setErrorDetails(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen w-full bg-white text-slate-900 lg:grid-cols-12">
      {/* Left Column: Visual Showcase & Brand Messaging */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-blue-100 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white p-10 lg:col-span-7 lg:flex xl:p-14">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-indigo-300/10 blur-3xl" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900">Ads Manager</span>
            <span className="text-xs font-medium text-slate-500">Autonomous Growth Engine</span>
          </div>
        </div>

        {/* Center Promotional Content */}
        <div className="relative z-10 my-auto max-w-xl space-y-8 py-8">
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
              Next-Gen Performance Marketing
            </span>
          </div>

          <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Turn Meta Ads into Predictable,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Profitable Revenue
            </span>
          </h1>

          <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
            Connect your Facebook Page and Ad Account in minutes. Automate audience targeting,
            creative testing, and ROAS optimization 24/7.
          </p>

          {/* Visual Showcase Metrics Card */}
          <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3">
            <div className="rounded-xl border border-blue-100 bg-white/95 p-4 shadow-sm backdrop-blur-md">
              <div className="text-2xl font-bold text-blue-600">4.8x</div>
              <div className="text-xs font-medium text-slate-500">Average Meta ROAS</div>
            </div>
            <div className="rounded-xl border border-blue-100 bg-white/95 p-4 shadow-sm backdrop-blur-md">
              <div className="text-2xl font-bold text-emerald-600">-64%</div>
              <div className="text-xs font-medium text-slate-500">Customer Acquisition Cost</div>
            </div>
            <div className="col-span-2 rounded-xl border border-blue-100 bg-white/95 p-4 shadow-sm backdrop-blur-md sm:col-span-1">
              <div className="text-2xl font-bold text-indigo-600">100%</div>
              <div className="text-xs font-medium text-slate-500">Autonomous Bidding</div>
            </div>
          </div>
        </div>

        {/* Bottom Security Note */}
        <div className="relative z-10 flex items-center gap-2 text-xs font-medium text-slate-500">
          <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z"
              clipRule="evenodd"
            />
          </svg>
          Official Meta Business Partner Architecture · End-to-End Encryption
        </div>
      </div>

      {/* Right Column: Clean White Authentication Card */}
      <div className="flex flex-col items-center justify-center bg-white p-6 text-slate-900 sm:p-10 lg:col-span-5">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Brand Logo */}
          <div className="mb-2 flex items-center gap-2.5 lg:hidden">
            <div className="from-primary to-accent flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr text-white shadow">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">Ads Manager</span>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {step === "phone" ? "Welcome to Ads Manager" : "Verify Your Mobile Number"}
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              {step === "phone"
                ? "Your Ad Team is Just One Login Away."
                : `Enter the 6-digit code sent to ${maskPhoneNumber(fullNormalizedPhone)}`}
            </p>
          </div>

          {/* Error Banner with Intelligent Diagnosis */}
          {errorMessage && (
            <div
              role="alert"
              className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm"
            >
              <div className="flex items-start gap-2.5">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1 space-y-1.5">
                  <span className="font-semibold">{errorMessage}</span>

                  {/* Contextual Twilio / Carrier guidance */}
                  {errorMessage.toLowerCase().includes("unverified") && (
                    <div className="space-y-1 rounded-lg bg-red-100/80 p-2 text-xs text-red-900">
                      <p className="font-bold">Twilio Trial Account Restriction:</p>
                      <p>
                        Twilio trial accounts can only send SMS to numbers added to your Twilio
                        Console under <strong>Phone Numbers → Manage → Verified Caller IDs</strong>.
                      </p>
                    </div>
                  )}

                  {errorMessage.toLowerCase().includes("permission") && (
                    <div className="space-y-1 rounded-lg bg-red-100/80 p-2 text-xs text-red-900">
                      <p className="font-bold">Twilio Geo-Permissions Disabled:</p>
                      <p>
                        Enable SMS to India (+91) under Twilio Console:{" "}
                        <strong>Messaging → Settings → Geo-Permissions</strong>.
                      </p>
                    </div>
                  )}

                  {errorMessage.toLowerCase().includes("rate limit") && (
                    <div className="rounded-lg bg-red-100/80 p-2 text-xs text-red-900">
                      <strong>Rate limit reached:</strong> Please wait 60 seconds before retrying.
                    </div>
                  )}

                  {errorDetails && (
                    <details className="mt-1 cursor-pointer text-[11px] text-red-700/90">
                      <summary className="font-semibold underline">
                        View technical error details
                      </summary>
                      <pre className="mt-1 max-h-28 overflow-x-auto rounded bg-red-950/10 p-1.5 font-mono text-[10px] text-red-900">
                        {errorDetails}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 1: Phone Login Form */}
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="mobile-input"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Mobile Number
                </label>
                <div className="flex rounded-lg border border-slate-300 bg-slate-50 transition-all focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
                  {/* Country Selector */}
                  <div className="relative border-r border-slate-300">
                    <select
                      id="country-selector"
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="h-full cursor-pointer appearance-none bg-transparent py-2.5 pr-8 pl-3 text-sm font-medium text-slate-800 focus:outline-none"
                      aria-label="Select country code"
                    >
                      {COUNTRY_CODES.map((item) => (
                        <option
                          key={`${item.country}-${item.code}`}
                          value={item.code}
                          className="bg-white text-slate-900"
                        >
                          {item.flag} {item.code}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-400">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Phone Number Input */}
                  <input
                    id="mobile-input"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    required
                    placeholder="Enter 10-digit number"
                    value={phoneRaw}
                    onChange={(e) => setPhoneRaw(e.target.value)}
                    className="w-full bg-transparent px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Continue</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </button>

              {/* Login Problems Link */}
              <div className="pt-2 text-center">
                <a
                  href="mailto:support@adsplatform.com?subject=Login%20Assistance"
                  className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-800"
                >
                  Having problems logging in? Contact Support
                </a>
              </div>
            </form>
          )}

          {/* SCREEN 2: OTP Verification Form */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    Enter Verification Code
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setOtpDigits(["", "", "", "", "", ""]);
                      setErrorMessage(null);
                    }}
                    className="cursor-pointer text-xs font-medium text-blue-600 transition-colors hover:text-blue-800"
                  >
                    Change number
                  </button>
                </div>

                {/* 6-Digit Auto-Focus Inputs */}
                <div className="flex justify-between gap-2" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="h-12 w-12 rounded-lg border border-slate-300 bg-slate-50 text-center text-xl font-bold text-slate-900 transition-all focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none"
                      aria-label={`Digit ${idx + 1} of verification code`}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Verify OTP Button */}
              <button
                type="submit"
                disabled={loading || otpDigits.join("").length < 6}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <span>Verify & Continue</span>
                )}
              </button>

              {/* Resend OTP Action & Timer */}
              <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
                <span>Didn&apos;t receive the code?</span>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="cursor-pointer font-semibold text-blue-600 transition-colors hover:text-blue-800"
                  >
                    Resend Code
                  </button>
                ) : (
                  <span className="font-medium text-slate-400">
                    Resend in 00:{resendCooldown.toString().padStart(2, "0")}
                  </span>
                )}
              </div>
            </form>
          )}

          {/* Footer Terms */}
          <div className="border-t border-slate-200 pt-4 text-center text-[11px] text-slate-500">
            By continuing, you agree to the{" "}
            <Link href="/terms" className="underline hover:text-slate-800">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-slate-800">
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
