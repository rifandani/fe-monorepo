import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { demoUsers } from "../fixtures";

const statusIntent = {
  Active: "success",
  Invited: "info",
  Suspended: "danger",
} as const;

export const TableShowcase = () => (
  <Table aria-label="Team members">
    <TableHeader>
      <TableColumn isRowHeader>Name</TableColumn>
      <TableColumn>Email</TableColumn>
      <TableColumn>Role</TableColumn>
      <TableColumn>Status</TableColumn>
    </TableHeader>
    <TableBody items={demoUsers}>
      {(user) => (
        <TableRow id={user.id}>
          <TableCell className="font-medium">{user.name}</TableCell>
          <TableCell className="text-muted-foreground">{user.email}</TableCell>
          <TableCell>{user.role}</TableCell>
          <TableCell>
            <Badge intent={statusIntent[user.status]}>{user.status}</Badge>
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);
