"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { MessageCircle, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!form.email.trim()) newErrors.email = "Email is required";
        if (!form.password.trim()) newErrors.password = "Password is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const loginMutation = useMutation({
        mutationFn: async () => {
            const res = await authClient.signIn.email({
                email: form.email,
                password: form.password,
            });

            if (res.error) throw new Error(res.error.message);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Login successful");
            router.replace("/chat");
        },
        onError: (error) => {
            toast.error(error.message || "Login failed");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        loginMutation.mutate();
    };

    return (
        <main className="min-h-screen bg-[#F5F7FA] px-4 py-8">
            <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl items-center justify-center">
                <div className="grid w-full overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-sm lg:grid-cols-2">
                    <section className="hidden bg-[#0F172A] p-10 text-white lg:flex lg:flex-col lg:justify-between">
                        <div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB]">
                                <MessageCircle className="h-6 w-6" />
                            </div>

                            <h1 className="mt-8 max-w-md text-4xl font-semibold leading-tight">
                                Simple, secure realtime messaging.
                            </h1>

                            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                                Manage conversations, send messages instantly, and stay connected with a clean modern chat experience.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <p className="text-sm text-slate-300">
                                Built with Next.js, shadcn/ui, Better Auth, Supabase and realtime WebSocket flow.
                            </p>
                        </div>
                    </section>

                    <section className="p-6 sm:p-10">
                        <div className="mb-8">
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF1FF] text-[#2563EB] lg:hidden">
                                <MessageCircle className="h-6 w-6" />
                            </div>

                            <h2 className="text-3xl font-semibold text-[#0F172A]">
                                Welcome back
                            </h2>
                            <p className="mt-2 text-sm text-[#64748B]">
                                Sign in to continue to your chat dashboard.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <Label className="text-[#0F172A]">Email</Label>
                                <div className="relative mt-2">
                                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94A3B8]" />
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={form.email}
                                        onChange={(e) => {
                                            setForm({ ...form, email: e.target.value });
                                            setErrors({ ...errors, email: "" });
                                        }}
                                        className={`h-12 rounded-xl border-[#E2E8F0] pl-10 ${errors.email ? "border-[#EF4444]" : ""
                                            }`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-[#EF4444]">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <Label className="text-[#0F172A]">Password</Label>
                                <div className="relative mt-2">
                                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94A3B8]" />
                                    <Input
                                        type="password"
                                        placeholder="Enter your password"
                                        value={form.password}
                                        onChange={(e) => {
                                            setForm({ ...form, password: e.target.value });
                                            setErrors({ ...errors, password: "" });
                                        }}
                                        className={`h-12 rounded-xl border-[#E2E8F0] pl-10 ${errors.password ? "border-[#EF4444]" : ""
                                            }`}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-[#EF4444]">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={loginMutation.isPending}
                                className="h-12 w-full rounded-xl bg-[#2563EB] text-base font-medium hover:bg-[#1D4ED8]"
                            >
                                {loginMutation.isPending ? "Signing in..." : "Sign in"}
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-[#64748B]">
                            Don&apos;t have an account?{" "}
                            <Link href="/signup" className="font-medium text-[#2563EB]">
                                Create account
                            </Link>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}