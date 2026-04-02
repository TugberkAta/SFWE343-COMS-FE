import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function AccountPage() {
  return (
    <Card className="border-border bg-background">
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-lg">Account Information</CardTitle>
      </CardHeader>

      <CardContent className="p-6 pt-4">
        <div className="grid gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value="Gaye" readOnly />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value="İleri" readOnly />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value="gaye.ileri@example.com" readOnly />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}