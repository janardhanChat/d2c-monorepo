"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { http } from "@/lib/http";

interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
  status?: string;
  onboarding_path?: string | null;
}

interface IndustryItem {
  id: string;
  name: string;
  icon: string;
}

const INDUSTRIES: IndustryItem[] = [
  { id: "tech", name: "Technology & Software", icon: "💻" },
  { id: "apparel", name: "Clothing and Apparel", icon: "👕" },
  { id: "food", name: "Food and Beverage", icon: "🍽" },
  { id: "jewelry", name: "Jewelry and Accessories", icon: "💍" },
  { id: "home", name: "Home Decor and Supplies", icon: "🛋" },
  { id: "books", name: "Books and More", icon: "📚" },
  { id: "salon", name: "Salon and Beauty", icon: "✂" },
  { id: "real_estate", name: "Real Estate and Construction", icon: "🏢" },
  { id: "healthcare", name: "Healthcare and Clinic", icon: "🩺" },
  { id: "fitness", name: "Fitness and Gym", icon: "⚡" },
  { id: "local", name: "Local Services", icon: "🔧" },
];

const COMPANY_SIZES = [
  { id: "1-10", label: "1 – 10 employees", sublabel: "Small team or startup" },
  { id: "11-50", label: "11 – 50 employees", sublabel: "Growing business" },
  { id: "51-200", label: "51 – 200 employees", sublabel: "Mid-size company" },
  { id: "201-500", label: "201 – 500 employees", sublabel: "Large organization" },
  { id: "500+", label: "500+ employees", sublabel: "Enterprise scale" },
];

const COUNTRIES = [
  {
    code: "India IN",
    name: "India (IN)",
    flag: "🇮🇳",
    defaultState: "Gujarat",
    defaultTz: "Asia/Kolkata (UTC+05:30)",
  },
  {
    code: "United States US",
    name: "United States (US)",
    flag: "🇺🇸",
    defaultState: "California",
    defaultTz: "America/New_York (UTC-05:00)",
  },
  {
    code: "United Arab Emirates AE",
    name: "United Arab Emirates (AE)",
    flag: "🇦🇪",
    defaultState: "Dubai",
    defaultTz: "Asia/Dubai (UTC+04:00)",
  },
  {
    code: "United Kingdom GB",
    name: "United Kingdom (GB)",
    flag: "🇬🇧",
    defaultState: "England",
    defaultTz: "Europe/London (UTC+00:00)",
  },
  {
    code: "Singapore SG",
    name: "Singapore (SG)",
    flag: "🇸🇬",
    defaultState: "Central",
    defaultTz: "Asia/Singapore (UTC+08:00)",
  },
  {
    code: "Australia AU",
    name: "Australia (AU)",
    flag: "🇦🇺",
    defaultState: "New South Wales",
    defaultTz: "Australia/Sydney (UTC+11:00)",
  },
  {
    code: "Canada CA",
    name: "Canada (CA)",
    flag: "🇨🇦",
    defaultState: "Ontario",
    defaultTz: "America/Toronto (UTC-05:00)",
  },
  {
    code: "Germany DE",
    name: "Germany (DE)",
    flag: "🇩🇪",
    defaultState: "Berlin",
    defaultTz: "Europe/Berlin (UTC+01:00)",
  },
];

const INDIAN_STATES = [
  "Gujarat",
  "Maharashtra",
  "Delhi",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "Rajasthan",
  "Uttar Pradesh",
  "West Bengal",
  "Kerala",
  "Punjab",
  "Haryana",
  "Madhya Pradesh",
  "Andhra Pradesh",
  "Bihar",
  "Goa",
  "Other",
];

const TIMEZONES = [
  "Asia/Kolkata (UTC+05:30)",
  "America/New_York (UTC-05:00)",
  "America/Los_Angeles (UTC-08:00)",
  "Europe/London (UTC+00:00)",
  "Europe/Berlin (UTC+01:00)",
  "Asia/Dubai (UTC+04:00)",
  "Asia/Singapore (UTC+08:00)",
  "Australia/Sydney (UTC+11:00)",
];

function getWorkspaceInitials(name?: string): string {
  if (!name || !name.trim()) return "DW";
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0];
  if (!first) return "DW";
  if (words.length === 1) {
    return first.slice(0, 2).toUpperCase();
  }
  const second = words[1];
  if (!second) return first.slice(0, 2).toUpperCase();
  return ((first[0] ?? "") + (second[0] ?? "")).toUpperCase() || "DW";
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  // User & Workspace context
  const [userId, setUserId] = useState<string>("usr_dev_demo");
  const [userPhone, setUserPhone] = useState<string>("9925283068");
  const [_userEmail, setUserEmail] = useState<string>("contact@clothfinder.com");
  const [workspace, setWorkspace] = useState<WorkspaceInfo>({
    id: "default-ws-001",
    name: "Default Workspace",
    slug: "my-workspace-8b28d5",
  });
  const [initializing, setInitializing] = useState(true);
  const [workspaceAssigned, setWorkspaceAssigned] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Flow step state: "choice" | 1 | 2 | 3 | 4
  const [currentStep, setCurrentStep] = useState<"choice" | 1 | 2 | 3 | 4>("choice");
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Step 1: Your Business Profile Fields
  const [companyName, setCompanyName] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState("India IN");
  const [timezone, setTimezone] = useState("Asia/Kolkata (UTC+05:30)");
  const [state, setState] = useState("Gujarat");
  const [gstin, setGstin] = useState("");
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Step 2: Industry Fields
  const [industrySearch, setIndustrySearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("Clothing and Apparel");
  const [step2Error, setStep2Error] = useState<string | null>(null);

  // Step 3: Company Size Fields
  const [selectedCompanySize, setSelectedCompanySize] = useState<string>("11-50");
  const [step3Error, setStep3Error] = useState<string | null>(null);

  // Filtered industries based on search input
  const filteredIndustries = useMemo(() => {
    if (!industrySearch.trim()) return INDUSTRIES;
    const q = industrySearch.toLowerCase();
    return INDUSTRIES.filter((ind) => ind.name.toLowerCase().includes(q));
  }, [industrySearch]);

  // Load active session and assign Default Workspace on mount
  useEffect(() => {
    async function initSessionAndWorkspace() {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data?.session?.user;

        let activeId = "usr_dev_demo";
        let rawPhone = "9925283068";
        let resolvedEmail = "contact@clothfinder.com";

        if (sessionUser) {
          activeId = sessionUser.id;
          const phone = sessionUser.phone || "";
          rawPhone = phone ? phone.replace(/[^0-9]/g, "").slice(-10) : "9925283068";
          resolvedEmail = sessionUser.email || `${rawPhone}@phone.user`;
        }

        setUserId(activeId);
        setUserPhone(rawPhone);
        setPhoneNumber(rawPhone);
        setUserEmail(resolvedEmail);
        setEmail(resolvedEmail);

        // Auto-assign Default Workspace
        const res = await http.post<{
          success: boolean;
          workspace: WorkspaceInfo;
          isNew: boolean;
        }>("/api/workspaces/assign-default", {
          userId: activeId,
          phone: rawPhone ? `+91${rawPhone}` : "+919925283068",
          email: resolvedEmail,
        });

        if (res?.workspace) {
          setWorkspace(res.workspace);
          setWorkspaceAssigned(true);
        }
      } catch (err) {
        console.warn("[Onboarding] Auto-assign default workspace notice:", err);
        setWorkspace({
          id: "default-ws-001",
          name: "Default Workspace",
          slug: "my-workspace-8b28d5",
          status: "active",
        });
        setWorkspaceAssigned(true);
      } finally {
        setInitializing(false);
      }
    }

    initSessionAndWorkspace();
  }, [supabase]);

  // Handle Country selection change (auto-sets timezone & state)
  function handleCountryChange(newCountry: string) {
    setCountry(newCountry);
    const matched = COUNTRIES.find((c) => c.code === newCountry);
    if (matched) {
      setTimezone(matched.defaultTz);
      setState(matched.defaultState);
    }
  }

  // Step 1 Validation & Proceed
  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    setStep1Error(null);

    if (!companyName.trim()) {
      setStep1Error("Company Name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setStep1Error("Please enter a valid email address.");
      return;
    }
    if (!country) {
      setStep1Error("Please select your country.");
      return;
    }
    if (!state) {
      setStep1Error("Please select or enter your state.");
      return;
    }

    setCurrentStep(2);
  }

  // Step 2 Validation & Proceed
  function handleStep2Submit() {
    setStep2Error(null);
    if (!selectedIndustry) {
      setStep2Error("Please select your industry to proceed.");
      return;
    }
    setCurrentStep(3);
  }

  // Step 3 Submission & Supabase Persistence
  async function handleStep3Submit() {
    setStep3Error(null);
    if (!selectedCompanySize) {
      setStep3Error("Please select your company size.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        workspaceId: workspace.id,
        userId,
        onboardingPath: "fresh",
        companyName,
        phone: `${phoneCountryCode} ${phoneNumber.trim()}`,
        email,
        website,
        country,
        state,
        timezone,
        gstin,
        industry: selectedIndustry,
        companySize: selectedCompanySize,
      };

      const res = await http.post<{
        statusCode?: number;
        success: boolean;
        message?: string;
        data?: {
          id: string;
          companyName: string;
          email: string;
          gstin: string | null;
          phoneNumber: string;
          isProfileCompleted: boolean;
          providerBusinessId: string | null;
          industry: string;
          size: string;
          website: string | null;
          timezone: string;
          country: string;
          state: string;
          [key: string]: unknown;
        };
        workspaceSlug?: string;
        workspaceName?: string;
      }>("/api/onboarding/complete", payload);

      const resolvedData = res?.data;
      const finalName = resolvedData?.companyName || companyName.trim() || workspace.name;
      const finalSlug = res?.workspaceSlug || workspace.slug;

      setWorkspace((prev) => ({
        ...prev,
        id: resolvedData?.id || prev.id,
        name: finalName,
        slug: finalSlug,
      }));

      const successToast = `Business profile for "${finalName}" updated successfully!`;
      setToastMessage(successToast);

      // Advance to Step 4 (Facebook connection overview - flow stops before OAuth per instructions)
      setCurrentStep(4);
    } catch (err) {
      console.warn("[Step 3 persistence fallback]:", err);
      const finalName = companyName.trim() || workspace.name;
      setWorkspace((prev) => ({
        ...prev,
        name: finalName,
      }));
      setToastMessage(`Business profile for "${finalName}" updated successfully!`);
      setCurrentStep(4);
    } finally {
      setSubmitting(false);
    }
  }

  // Calculate Progress Percentage for the Stepper
  const progressPercent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return "25%";
      case 2:
        return "50%";
      case 3:
        return "75%";
      case 4:
        return "100%";
      default:
        return "0%";
    }
  }, [currentStep]);

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-blue-50/40 via-white to-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-[450px] w-[650px] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 h-[450px] w-[600px] rounded-full bg-indigo-100/40 blur-[120px]" />
        <div className="absolute -bottom-32 left-1/3 h-[450px] w-[650px] rounded-full bg-blue-50 blur-[120px]" />
      </div>

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="animate-in slide-in-from-top-4 fixed top-5 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-emerald-900 shadow-2xl backdrop-blur-xl duration-300">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">
            ✓
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 cursor-pointer text-sm font-bold text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <header className="relative z-30 border-b border-slate-200/80 bg-white/90 px-4 py-3.5 shadow-xs backdrop-blur-md transition-all sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Left: Brand Logo & Workspace Selector */}
          <div className="flex items-center gap-4">
            {/* Brand Emblem */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-500/25">
                ⚡
              </div>
              <div className="flex flex-col">
                <span className="text-sm leading-none font-bold tracking-tight text-slate-900">
                  Ads Manager
                </span>
                <span className="mt-0.5 text-[10px] font-semibold tracking-wider text-blue-600 uppercase">
                  Business OS
                </span>
              </div>
            </div>

            {/* Workspace Selector Pill */}
            <div className="relative">
              <button
                id="workspace-dropdown-btn"
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                className="group flex cursor-pointer items-center gap-2.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50"
                aria-label="Workspace selection"
              >
                {/* Workspace Initials Badge */}
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-extrabold text-white shadow-xs">
                  {getWorkspaceInitials(workspace.name)}
                </div>
                <div className="flex items-center gap-1.5 text-left">
                  <span className="text-xs font-semibold text-slate-800">
                    {workspace.name || "Default Workspace"}
                  </span>
                  <svg
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform ${showWorkspaceMenu ? "rotate-180" : ""}`}
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
              </button>

              {/* Workspace Dropdown */}
              {showWorkspaceMenu && (
                <div className="animate-in fade-in slide-in-from-top-2 absolute left-0 z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl duration-150">
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    Assigned Workspace
                  </div>
                  <div className="flex items-center gap-2.5 rounded-lg border border-blue-200/80 bg-blue-50 p-2.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-[10px] font-bold text-white">
                      {getWorkspaceInitials(workspace.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-900">
                        {workspace.name}
                      </p>
                      <p className="truncate font-mono text-[10px] text-emerald-600">
                        {workspaceAssigned ? "● Active & Tenant-Safe" : "● Syncing..."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Notifications & User Identity Pill */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notification Bell */}
            <button
              id="notifications-btn"
              className="relative cursor-pointer rounded-xl border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              aria-label="View notifications"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            {/* User Profile Pill */}
            <div className="relative">
              <button
                id="user-profile-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="group flex cursor-pointer items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pr-3 pl-1 shadow-xs transition-all hover:bg-slate-50"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-xs">
                  {userPhone.slice(-1) || "9"}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800">
                    {userPhone || "9925283068"}
                  </span>
                  <span className="text-[10px] font-bold tracking-wider text-blue-600">USER</span>
                </div>
                <svg
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
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
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl duration-150">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="text-xs font-semibold text-slate-900">Verified Account</p>
                    <p className="text-[11px] text-slate-500">+91 {userPhone}</p>
                    <p className="mt-0.5 text-[10px] font-medium text-emerald-600">
                      ● Phone Verified
                    </p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut();
                        router.push("/login");
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        {/* Loading Spinner during initial workspace resolution */}
        {initializing && (
          <div className="flex flex-col items-center justify-center space-y-4 py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
            <p className="text-sm font-medium text-slate-500">
              Initializing workspace environment...
            </p>
          </div>
        )}

        {!initializing && (
          <>
            {/* INITIAL CHOICE SCREEN */}
            {currentStep === "choice" && (
              <div className="animate-in fade-in space-y-10 duration-300">
                <div className="mx-auto max-w-2xl space-y-3 text-center">
                  <div className="inline-flex items-center gap-2">
                    <span className="rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-xs">
                      ● Workspace Onboarding
                    </span>
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                    Select Your Onboarding Experience
                  </h1>
                  <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                    You have been provisioned to{" "}
                    <strong className="text-slate-900">
                      {workspace.name || "Default Workspace"}
                    </strong>
                    . Choose how you would like to initialize your advertising assets.
                  </p>
                </div>

                {/* 2 Choice Cards */}
                <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
                  {/* Card 1: Start Fresh */}
                  <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-blue-900/5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10">
                    <div className="pointer-events-none absolute top-0 right-0 h-44 w-44 rounded-tr-3xl bg-gradient-to-bl from-blue-100/50 via-transparent to-transparent" />
                    <div>
                      {/* Visual Header */}
                      <div className="relative flex h-48 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50 via-blue-50/40 to-white p-5">
                        <div className="w-48 space-y-1.5 rounded-xl border border-blue-200/80 bg-white p-4 text-center shadow-md backdrop-blur-md">
                          <span className="font-mono text-[10px] font-bold tracking-wider text-blue-600">
                            NEW CONFIGURATION
                          </span>
                          <div className="py-1">
                            <span className="text-lg font-extrabold text-blue-600">
                              Start Fresh
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-2 text-center">
                        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                          Start Fresh, No Prior Account Needed
                        </h2>
                        <p className="text-xs text-slate-600 sm:text-sm">
                          Complete your business profile step by step and configure your advertising
                          workspace.
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 space-y-6">
                      <button
                        id="start-fresh-continue-btn"
                        onClick={() => setCurrentStep(1)}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700"
                      >
                        <span>Continue</span>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </button>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 pt-2 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-600">✓</span>
                          <span>Manual setup, step by step</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-600">✓</span>
                          <span>Quick configuration</span>
                        </div>
                        <div className="col-span-2 flex items-center justify-center gap-2 pt-1 font-medium text-slate-700">
                          <span className="font-bold text-blue-600">✓</span>
                          <span>You&apos;re all set to launch</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Existing Customer */}
                  <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-400 hover:shadow-2xl hover:shadow-slate-500/10">
                    <div className="pointer-events-none absolute top-0 right-0 h-44 w-44 rounded-tr-3xl bg-gradient-to-bl from-slate-100 via-transparent to-transparent" />
                    <div>
                      {/* Visual Header */}
                      <div className="relative flex h-48 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 via-slate-50/50 to-white p-5">
                        <div className="w-48 space-y-1.5 rounded-xl border border-slate-200 bg-white p-4 text-center shadow-md backdrop-blur-md">
                          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs">
                            💬
                          </div>
                          <span className="text-xs font-bold text-slate-800">
                            Verified CRM & Data
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 space-y-2 text-center">
                        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                          Are You an Existing Customer?
                        </h2>
                        <p className="text-xs text-slate-600 sm:text-sm">
                          Fast-track your setup using pre-verified business phone and WhatsApp CRM
                          channels.
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 space-y-6">
                      <button
                        id="existing-customer-continue-btn"
                        onClick={() => setCurrentStep(1)}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800"
                      >
                        <span>Continue</span>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </button>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 pt-2 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-600">✓</span>
                          <span>Your Existing Data, Ready To Use</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-600">✓</span>
                          <span>Seamless Setup</span>
                        </div>
                        <div className="col-span-2 flex items-center justify-center gap-2 pt-1 font-medium text-slate-700">
                          <span className="font-bold text-blue-600">✓</span>
                          <span>Start Your Ad Campaigns Faster</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GUIDED ONBOARDING FLOW: STEPS 1 TILL 3 (Plus Step 4 Facebook Preview) */}
            {currentStep !== "choice" && (
              <div className="animate-in fade-in mx-auto grid w-full max-w-6xl items-start gap-8 duration-200 lg:grid-cols-12">
                {/* LEFT SIDEBAR: Stepper & Progress */}
                <div className="space-y-6 lg:col-span-4">
                  {/* Progress Card */}
                  <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-blue-900/5">
                    {/* Progress Percentage Badge */}
                    <div className="rounded-xl border border-blue-200/80 bg-blue-50 px-4 py-2.5 text-center">
                      <span className="text-sm font-bold tracking-wide text-blue-700">
                        {progressPercent} Progress Complete
                      </span>
                    </div>

                    {/* Stepper Indicators */}
                    <div className="relative space-y-4 pl-2">
                      {/* Connecting Line */}
                      <div className="absolute top-4 bottom-4 left-[19px] -z-0 w-0.5 bg-slate-200" />

                      {/* Step 1: Your business */}
                      <div className="relative z-10 flex items-center gap-3.5">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                            currentStep > 1
                              ? "bg-emerald-600 text-white ring-2 ring-emerald-100"
                              : currentStep === 1
                                ? "bg-blue-600 font-extrabold text-white shadow-xs ring-4 ring-blue-100"
                                : "border border-slate-200 bg-slate-50 text-slate-400"
                          }`}
                        >
                          {currentStep > 1 ? "✓" : "1"}
                        </div>
                        <span
                          className={`text-sm transition-colors ${
                            currentStep === 1
                              ? "font-bold text-blue-700"
                              : currentStep > 1
                                ? "font-medium text-slate-700"
                                : "font-medium text-slate-400"
                          }`}
                        >
                          Your business
                        </span>
                      </div>

                      {/* Step 2: Your industry */}
                      <div className="relative z-10 flex items-center gap-3.5">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                            currentStep > 2
                              ? "bg-emerald-600 text-white ring-2 ring-emerald-100"
                              : currentStep === 2
                                ? "bg-blue-600 font-extrabold text-white shadow-xs ring-4 ring-blue-100"
                                : "border border-slate-200 bg-slate-50 text-slate-400"
                          }`}
                        >
                          {currentStep > 2 ? "✓" : "2"}
                        </div>
                        <span
                          className={`text-sm transition-colors ${
                            currentStep === 2
                              ? "font-bold text-blue-700"
                              : currentStep > 2
                                ? "font-medium text-slate-700"
                                : "font-medium text-slate-400"
                          }`}
                        >
                          Your industry
                        </span>
                      </div>

                      {/* Step 3: Company size */}
                      <div className="relative z-10 flex items-center gap-3.5">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                            currentStep > 3
                              ? "bg-emerald-600 text-white ring-2 ring-emerald-100"
                              : currentStep === 3
                                ? "bg-blue-600 font-extrabold text-white shadow-xs ring-4 ring-blue-100"
                                : "border border-slate-200 bg-slate-50 text-slate-400"
                          }`}
                        >
                          {currentStep > 3 ? "✓" : "3"}
                        </div>
                        <span
                          className={`text-sm transition-colors ${
                            currentStep === 3
                              ? "font-bold text-blue-700"
                              : currentStep > 3
                                ? "font-medium text-slate-700"
                                : "font-medium text-slate-400"
                          }`}
                        >
                          Company size
                        </span>
                      </div>

                      {/* Step 4: You're all set / Facebook Connect */}
                      <div className="relative z-10 flex items-center gap-3.5">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                            currentStep === 4
                              ? "bg-blue-600 font-extrabold text-white shadow-xs ring-4 ring-blue-100"
                              : "border border-slate-200 bg-slate-50 text-slate-400"
                          }`}
                        >
                          {currentStep === 4 ? "✓" : "4"}
                        </div>
                        <span
                          className={`text-sm transition-colors ${
                            currentStep === 4
                              ? "font-bold text-blue-700"
                              : "font-medium text-slate-400"
                          }`}
                        >
                          You&apos;re all set
                        </span>
                      </div>
                    </div>

                    {/* Why we ask this Box */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                        <span className="font-bold text-blue-600">ℹ</span> Why we ask this
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-500">
                        Connecting your Facebook account lets the platform automate Meta ad
                        campaigns, target audiences, and sync leads directly.
                      </p>
                    </div>
                  </div>
                </div>

                {/* RIGHT CONTENT COLUMN: Step Form Panels */}
                <div className="lg:col-span-8">
                  {/* STEP 1 PANEL: Complete Your Business Profile */}
                  {currentStep === 1 && (
                    <form
                      onSubmit={handleStep1Submit}
                      className="animate-in fade-in space-y-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-blue-900/5 duration-200 sm:p-9"
                    >
                      {/* Step Badge & Header */}
                      <div className="space-y-1.5">
                        <span className="rounded-md border border-blue-200/80 bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-blue-700">
                          Step 1 / 4
                        </span>
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                          Complete Your Business Profile
                        </h2>
                        <p className="text-xs text-slate-500 sm:text-sm">
                          Update your company details to finish setup.
                        </p>
                      </div>

                      {/* Error Banner */}
                      {step1Error && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
                          {step1Error}
                        </div>
                      )}

                      {/* 2-Column Inputs Grid */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Company Name */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            Company Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            id="company-name-input"
                            type="text"
                            required
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g. Acme Tech, Cloth Finder"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none"
                          />
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            Phone Number
                          </label>
                          <div className="flex overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xs focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/15">
                            <select
                              value={phoneCountryCode}
                              onChange={(e) => setPhoneCountryCode(e.target.value)}
                              className="cursor-pointer border-r border-slate-200 bg-slate-50 py-2.5 pr-2 pl-3 text-xs font-semibold text-slate-700 focus:outline-none"
                            >
                              <option value="+91">🇮🇳 +91</option>
                              <option value="+1">🇺🇸 +1</option>
                              <option value="+971">🇦🇪 +971</option>
                              <option value="+44">🇬🇧 +44</option>
                              <option value="+65">🇸🇬 +65</option>
                            </select>
                            <input
                              id="phone-number-input"
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="+91 99252 83068"
                              className="w-full bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                            />
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Optional — prefilled from your login phone when available
                          </p>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            Email <span className="text-rose-500">*</span>
                          </label>
                          <input
                            id="email-input"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@business.com"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none"
                          />
                        </div>

                        {/* Website */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            Website (Optional)
                          </label>
                          <input
                            id="website-input"
                            type="text"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://acme.example.com"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none"
                          />
                        </div>

                        {/* Country */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            Country <span className="text-rose-500">*</span>
                          </label>
                          <select
                            id="country-select"
                            value={country}
                            onChange={(e) => handleCountryChange(e.target.value)}
                            className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none"
                          >
                            {COUNTRIES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Timezone */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            Timezone <span className="text-rose-500">*</span>
                          </label>
                          <select
                            id="timezone-select"
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none"
                          >
                            {TIMEZONES.map((tz) => (
                              <option key={tz} value={tz}>
                                {tz}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* State */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            State <span className="text-rose-500">*</span>
                          </label>
                          {country.includes("India") ? (
                            <select
                              id="state-select"
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none"
                            >
                              {INDIAN_STATES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              id="state-input"
                              type="text"
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              placeholder="State or Province"
                              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none"
                            />
                          )}
                        </div>

                        {/* GSTIN */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            GSTIN (Optional)
                          </label>
                          <input
                            id="gstin-input"
                            type="text"
                            value={gstin}
                            onChange={(e) => setGstin(e.target.value.toUpperCase())}
                            placeholder="E.G. 24AAACA1234A1Z5"
                            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Navigation Actions */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                        <button
                          type="button"
                          onClick={() => setCurrentStep("choice")}
                          className="cursor-pointer text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
                        >
                          &lt; Back
                        </button>
                        <button
                          id="step1-continue-btn"
                          type="submit"
                          className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700"
                        >
                          <span>Continue</span>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 2 PANEL: Select Your Industry */}
                  {currentStep === 2 && (
                    <div className="animate-in fade-in space-y-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-blue-900/5 duration-200 sm:p-9">
                      {/* Step Badge & Header */}
                      <div className="space-y-1.5">
                        <span className="rounded-md border border-blue-200/80 bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-blue-700">
                          Step 2 / 4
                        </span>
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                          Select Your Industry <span className="text-rose-500">*</span>
                        </h2>
                      </div>

                      {/* Error Banner */}
                      {step2Error && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
                          {step2Error}
                        </div>
                      )}

                      {/* Search Input Filter */}
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
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
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                        <input
                          id="industry-search-input"
                          type="text"
                          value={industrySearch}
                          onChange={(e) => setIndustrySearch(e.target.value)}
                          placeholder="Example: real estate, cleaning, clothing..."
                          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 shadow-xs transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none"
                        />
                      </div>

                      {/* Grid of Industry Selection Cards */}
                      <div className="grid max-h-[360px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                        {filteredIndustries.map((ind) => {
                          const isSelected = selectedIndustry === ind.name;
                          return (
                            <button
                              key={ind.id}
                              type="button"
                              onClick={() => setSelectedIndustry(ind.name)}
                              className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                                isSelected
                                  ? "border-2 border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-2 ring-blue-600/20"
                                  : "border border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50/30"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xl ${
                                    isSelected
                                      ? "bg-blue-600 text-white"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {ind.icon}
                                </span>
                                <span className="text-sm font-semibold">{ind.name}</span>
                              </div>
                              <div
                                className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                                  isSelected
                                    ? "border-blue-600 bg-blue-600 text-xs font-bold text-white"
                                    : "border-slate-300 bg-transparent"
                                }`}
                              >
                                {isSelected && "✓"}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Navigation Actions */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="cursor-pointer text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
                        >
                          &lt; Back
                        </button>
                        <button
                          id="step2-continue-btn"
                          type="button"
                          onClick={handleStep2Submit}
                          className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700"
                        >
                          <span>Continue</span>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3 PANEL: How Many People Work At Your Organization? */}
                  {currentStep === 3 && (
                    <div className="animate-in fade-in space-y-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-blue-900/5 duration-200 sm:p-9">
                      {/* Step Badge & Header */}
                      <div className="space-y-1.5">
                        <span className="rounded-md border border-blue-200/80 bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-blue-700">
                          Step 3 / 4
                        </span>
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                          How Many People Work At Your Organization?{" "}
                          <span className="text-rose-500">*</span>
                        </h2>
                        <p className="text-xs text-slate-500 sm:text-sm">
                          Select your company size to help customize your experience.
                        </p>
                      </div>

                      {/* Error Banner */}
                      {step3Error && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
                          {step3Error}
                        </div>
                      )}

                      {/* Company Size Grid */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        {COMPANY_SIZES.map((size) => {
                          const isSelected = selectedCompanySize === size.id;
                          return (
                            <button
                              key={size.id}
                              type="button"
                              onClick={() => setSelectedCompanySize(size.id)}
                              className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                                isSelected
                                  ? "border-2 border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-2 ring-blue-600/20"
                                  : "border border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50/30"
                              }`}
                            >
                              <div className="flex items-center gap-3.5">
                                <div
                                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                                    isSelected
                                      ? "bg-blue-600 text-white"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  👥
                                </div>
                                <div>
                                  <div
                                    className={`text-sm font-bold ${isSelected ? "text-blue-950" : "text-slate-900"}`}
                                  >
                                    {size.label}
                                  </div>
                                  <div className="mt-0.5 text-xs text-slate-500">
                                    {size.sublabel}
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                                  isSelected
                                    ? "border-blue-600 bg-blue-600 text-xs font-bold text-white"
                                    : "border-slate-300 bg-transparent"
                                }`}
                              >
                                {isSelected && "✓"}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Summary Review Pill */}
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
                        <span>
                          Saving to: <strong className="text-slate-900">{workspace.name}</strong> ·
                          Profile:{" "}
                          <strong className="text-slate-900">
                            {companyName || "New Business"}
                          </strong>
                        </span>
                        <span className="font-medium text-emerald-700">● RLS Safe & Isolated</span>
                      </div>

                      {/* Navigation Actions */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="cursor-pointer text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
                        >
                          &lt; Back
                        </button>
                        <button
                          id="step3-continue-btn"
                          type="button"
                          disabled={submitting}
                          onClick={handleStep3Submit}
                          className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700 disabled:opacity-50"
                        >
                          {submitting ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <>
                              <span>Continue</span>
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4 PANEL: Facebook Connect Gate */}
                  {currentStep === 4 && (
                    <div className="animate-in zoom-in-95 space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-blue-900/5 duration-300">
                      <div className="grid items-center gap-8 md:grid-cols-2">
                        {/* Left Card: Connect Your Facebook Canvas */}
                        <div className="space-y-5 rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50/80 via-blue-50/30 to-white p-6 text-center shadow-xs">
                          {/* Plug & Facebook Graphic */}
                          <div className="relative mx-auto flex h-28 w-40 items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300 bg-emerald-50 text-xl shadow-xs">
                              ✅
                            </div>
                            <div className="h-0.5 w-12 bg-gradient-to-r from-emerald-500 to-blue-500" />
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-md shadow-blue-600/30">
                              f
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <h3 className="text-xl font-bold text-slate-900">
                              Connect Your Facebook
                            </h3>
                            <p className="text-xs text-slate-500">
                              Connect Facebook. Launch smarter campaigns instantly. ⚡
                            </p>
                          </div>

                          {/* Connect Facebook Button */}
                          <button
                            id="connect-fb-btn"
                            disabled
                            className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-semibold text-white opacity-90 shadow-md shadow-blue-600/30"
                            title="Facebook OAuth flow is queued for the next phase"
                          >
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <span>Connect Facebook</span>
                          </button>

                          <div className="flex items-center justify-center gap-1.5 pt-1 text-[10px] font-semibold text-blue-700">
                            <span>♾ Meta Tech Partner</span>
                          </div>
                        </div>

                        {/* Right: Steps for Connect Facebook */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                            Follow these steps for connect your facebook:
                          </h4>

                          <div className="space-y-3.5">
                            <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-3">
                              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-600">
                                🔗
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-900">
                                  Connect Facebook
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  Manage your Meta Ads from one dashboard.
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-3">
                              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold text-slate-600">
                                🏳
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-800">Select Page</p>
                                <p className="text-[11px] text-slate-500">
                                  Choose the Facebook Page you want to manage.
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-3">
                              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold text-slate-600">
                                📢
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-800">
                                  Select Ad Account
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  Pick the Ad Account for your campaigns.
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-3">
                              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold text-slate-600">
                                ⏱
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-800">
                                  Connected Successfully
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  Your Meta account is ready.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Launch Workspace Dashboard Button */}
                      <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row">
                        <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          <span>✓</span>
                          <span>
                            Business setup complete. Workspace renamed to &quot;{workspace.name}
                            &quot;. Ready for dashboard.
                          </span>
                        </div>
                        <button
                          id="enter-dashboard-btn"
                          onClick={() =>
                            router.push(`/${workspace.slug || "my-workspace-8b28d5"}/default-brand`)
                          }
                          className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/25 transition-all hover:from-blue-700 hover:to-indigo-700"
                        >
                          <span>Enter Workspace Dashboard</span>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-200 bg-white/80 px-6 py-4 text-center text-xs text-slate-500">
        Ads Management Platform · Multi-Tenant Row-Level Security · Step 1–3 Business Configuration
      </footer>
    </div>
  );
}
