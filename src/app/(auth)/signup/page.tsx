import { useForm } from "react-hook-form";
import { email, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const emailSignupSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type EmailSignupFormData = z.infer<typeof emailSignupSchema>;

export default function EmailSignupPage() {
  const form = useForm<EmailSignupFormData>({
    resolver: zodResolver(emailSignupSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: EmailSignupFormData) => {
    console.log("Submitted email:", data.email);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">

    <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-lg">

      <h1 className="mb-6 text-center text-2xl font-bold text-white">
        Course Outline Management System
      </h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        <div>
          <label className="text-sm text-slate-400">
            Email
          </label>

          <Input
            type="email"
            placeholder="Enter your email"
            value={form.getValues("email")}
            onChange={(e) => form.setValue("email", e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Sign Up
        </Button>

      </form>
    </div>

  </main>
  );
}