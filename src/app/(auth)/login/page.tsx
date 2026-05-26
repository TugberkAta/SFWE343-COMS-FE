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
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import Authentication from "@/services/auth/authentication";

const authentication = new Authentication();

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default function LoginPage() {
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
  });

  const handleSubmit = form.handleSubmit(async ({ email, password }) => {
    try {
      await authentication.login({ email, password });
      toast.success("You're signed in.");
      navigate("/admin", { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data
        toast.error(message);
      } else {
        toast.error("Something went wrong");
      }
    }
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 bg-white dark:bg-black">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className={cn("flex flex-col gap-6")}>
          <Card className="dark:bg-[#1a1a1a] dark:border-[#333]">
            <CardHeader className="text-center p-6">
              <div className="flex flex-col items-center gap-3 mb-2">
                <img 
                  src="https://study-more.com/wp-content/uploads/2024/04/fiu-unv-logo.png" 
                  alt="FIU Logo"
                  className="h-24 w-auto"
                />
                <div>
                  <h2 className="text-lg font-bold text-[#111827] dark:text-white">
                    Final International University
                  </h2>
                  <p className="text-sm text-[#6b7280] dark:text-[#888]">
                    Course Outline Management System
                  </p>
                </div>
              </div>
              <CardTitle className="text-xl text-[#111827] dark:text-white mt-4">Login</CardTitle>
            </CardHeader>
            <CardContent className="px-8">
              <Form {...form}>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <div className="grid gap-2">
                          <Label htmlFor="email" className="text-[#111827] dark:text-white">Email</Label>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="m@example.com"
                              required
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
                          <Label htmlFor="password" className="text-[#111827] dark:text-white">Password</Label>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="********"
                              type="password"
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
                      {form.formState.isSubmitting ? "Logging in…" : "Login"}
                    </Button>
                  </div>

                  <div className="text-center mt-4">
                    <p className="text-[#111827] dark:text-[#888]">Don't have an account? <Link to="/email-auth" className="text-[#ef233c] hover:text-[#e60012] font-medium">Create an account</Link></p>
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
