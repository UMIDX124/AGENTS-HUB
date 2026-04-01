"use client";

import { PERMISSIONS, getAllPermissions } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import type { RoleName } from "@/types";

export function PermissionMatrix() {
  const allPerms = getAllPermissions();
  const roles: RoleName[] = ["OWNER", "MANAGER", "SPECIALIST", "CLIENT"];

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[180px]">Permission</TableHead>
            {roles.map((role) => (
              <TableHead key={role} className="text-center">
                <Badge
                  variant="outline"
                  className="font-semibold"
                  style={{
                    borderColor: `${PERMISSIONS[role].color}30`,
                    color: PERMISSIONS[role].color,
                  }}
                >
                  {PERMISSIONS[role].icon} {PERMISSIONS[role].label}
                </Badge>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {allPerms.map((perm) => (
            <TableRow key={perm}>
              <TableCell className="text-muted-foreground text-xs capitalize">
                {perm.replace(/_/g, " ")}
              </TableCell>
              {roles.map((role) => (
                <TableCell key={role} className="text-center">
                  {PERMISSIONS[role].can.includes(perm) ? (
                    <Check className="mx-auto size-4 text-emerald-400" />
                  ) : (
                    <X className="mx-auto size-4 text-muted-foreground/30" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
