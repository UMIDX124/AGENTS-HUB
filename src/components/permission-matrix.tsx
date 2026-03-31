"use client";

import { PERMISSIONS, getAllPermissions } from "@/lib/permissions";
import { Check, X } from "lucide-react";
import type { RoleName } from "@/types";

export function PermissionMatrix() {
  const allPerms = getAllPermissions();
  const roles: RoleName[] = ["OWNER", "MANAGER", "SPECIALIST", "CLIENT"];

  return (
    <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
            <th className="px-4 py-3 text-left font-medium text-[#94a3b8]">Permission</th>
            {roles.map((role) => (
              <th key={role} className="px-4 py-3 text-center font-medium" style={{ color: PERMISSIONS[role].color }}>
                {PERMISSIONS[role].icon} {PERMISSIONS[role].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allPerms.map((perm) => (
            <tr key={perm} className="border-b border-[rgba(255,255,255,0.04)]">
              <td className="px-4 py-2.5 text-[#94a3b8]">{perm.replace(/_/g, " ")}</td>
              {roles.map((role) => (
                <td key={role} className="px-4 py-2.5 text-center">
                  {PERMISSIONS[role].can.includes(perm) ? (
                    <Check className="mx-auto h-4 w-4 text-green-400" />
                  ) : (
                    <X className="mx-auto h-4 w-4 text-[#475569]" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
