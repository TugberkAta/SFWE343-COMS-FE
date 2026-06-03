import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormMessage,
} from "@/components/ui/form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import LoginPage from "@/app/(auth)/login/page";
import Authentication from "@/services/auth/authentication";

const authentication = new Authentication();

const magicLinkFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type MagicLinkFormValues = z.infer<typeof magicLinkFormSchema>;

function MagicLinkSignInPage({
  shortcode,
  emailFromUrl,
}: {
  shortcode: string;
  emailFromUrl: string;
}) {
  const navigate = useNavigate();

  const form = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: emailFromUrl,
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit(
    async ({ firstName, lastName, email, password }) => {
      try {
        await authentication.register({
          firstName,
          lastName,
          email,
          password,
          shortcode,
        });
        toast.success("You're signed in.");
        navigate("/admin", { replace: true });
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const message = err.response?.data
          toast.error(message);
        } else {
          toast.error("An error occurred while signing in.");
        }
      }
    },
  );

  return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 bg-white dark:bg-[var(--layer-0)]">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className={cn("flex flex-col gap-6")}>
          <Card className="dark:bg-[var(--layer-1)] dark:border-[var(--layer-2-border)]">
            <CardHeader className="text-center p-6">
              <div className="flex flex-col items-center gap-3 mb-2">
                <img 
                  src="https://study-more.com/wp-content/uploads/2024/04/fiu-unv-logo.png" 
                  alt="FIU Logo"
                  className="h-24 w-auto"
                />
                <div>
                  <h2 className="text-lg font-bold text-[#111827] dark:text-[var(--text-main)]">
                    Final International University
                  </h2>
                  <p className="text-sm text-[#6b7280] dark:text-[var(--text-secondary)]">
                    Course Outline Management System
                  </p>
                </div>
              </div>
              <CardTitle className="text-xl text-[#111827] dark:text-[var(--text-main)] mt-4">Sign in</CardTitle>
            </CardHeader>
            <CardContent className="px-8">
              <Form {...form}>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <div className="grid gap-2">
                          <Label htmlFor="firstName" className="text-[#111827] dark:text-[var(--text-main)]">First name</Label>
                          <FormControl>
                            <Input
                              {...field}
                              id="firstName"
                              autoComplete="given-name"
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <div className="grid gap-2">
                          <Label htmlFor="lastName" className="text-[#111827] dark:text-[var(--text-main)]">Last name</Label>
                          <FormControl>
                            <Input
                              {...field}
                              id="lastName"
                              autoComplete="family-name"
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <div className="grid gap-2">
                          <Label htmlFor="email" className="text-[#111827] dark:text-[var(--text-main)]">Email</Label>
                          <FormControl>
                            <Input
                              {...field}
                              id="email"
                              type="email"
                              autoComplete="email"
                              disabled
                              className="bg-muted"
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <div className="grid gap-2">
                          <Label htmlFor="password" className="text-[#111827] dark:text-[var(--text-main)]">Password</Label>
                          <FormControl>
                            <Input
                              {...field}
                              id="password"
                              type="password"
                              autoComplete="new-password"
                              placeholder="********"
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
                    </Button>
                  </div>

                  <div className="text-center mt-4">
                    <p className="text-[#111827] dark:text-[var(--text-secondary)]">
                      Wrong link?{" "}
                      <Link
                        to="/email-auth"
                        className="text-[#ef233c] hover:text-[#e60012] font-medium dark:text-[var(--text-main)] dark:hover:text-[var(--text-secondary)]"
                      >
                        Start over
                      </Link>
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  const shortcode = searchParams.get("shortcode")?.trim() ?? "";
  const email = searchParams.get("email")?.trim() ?? "";

  if (shortcode && email) {
    return <MagicLinkSignInPage shortcode={shortcode} emailFromUrl={email} />;
  }

  return <LoginPage />;
}
