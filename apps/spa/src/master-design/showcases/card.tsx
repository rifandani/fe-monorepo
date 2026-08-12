import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";

export const CardShowcase = () => (
  <div className="grid gap-6 sm:grid-cols-2">
    <Card>
      <CardHeader
        description="Manage who has access to this project."
        title="Team members"
      />
      <CardContent className="text-muted-fg text-sm/6">
        Invite collaborators and control their permissions from one place.
      </CardContent>
      <CardFooter className="gap-2">
        <Button intent="outline" size="sm">
          Cancel
        </Button>
        <Button size="sm">Invite</Button>
      </CardFooter>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Current plan</CardTitle>
        <CardDescription>Renews on Aug 30, 2026</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <Badge intent="success">Active</Badge>
        <span className="text-muted-fg text-sm/6">Pro · $29/mo</span>
      </CardContent>
    </Card>
  </div>
);
