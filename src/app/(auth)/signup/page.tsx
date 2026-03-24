import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold">Email Sign Up</h1>
        <p className="mb-6 text-sm text-gray-600">
          Enter your email address to continue.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...form.register("email")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black text-black"
            />

            {form.formState.errors.email && (
              <p className="mt-2 text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-2 text-white"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}