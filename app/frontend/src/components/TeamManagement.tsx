/**
 * Team Management
 * Team members, roles, and permissions management
 */

import React, { useState, useEffect } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { Loading } from "./Loading";

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface RoleDescription {
  name: string;
  description: string;
  level: number;
}

export const TeamManagement: React.FC<{ businessId: string }> = ({
  businessId,
}) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<{ [key: string]: RoleDescription }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [businessId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, rolesRes] = await Promise.all([
        fetch(`/api/businesses/${businessId}/team/members`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch("/api/team/role-descriptions", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ]);

      if (!membersRes.ok || !rolesRes.ok)
        throw new Error("Failed to fetch data");

      const membersData = await membersRes.json();
      const rolesData = await rolesRes.json();

      setMembers(membersData.data);
      setRoles(rolesData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(
        `/api/businesses/${businessId}/team/members/${memberId}/role`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        },
      );

      if (!response.ok) throw new Error("Failed to update role");

      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      const response = await fetch(
        `/api/businesses/${businessId}/team/members/${memberId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to remove member");

      setMembers(members.filter((m) => m.id !== memberId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    }
  };

  if (loading)
    return <Loading isLoading={true} message="Loading team data..." />;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Team Management</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage team members and their roles and permissions
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Team Members ({members.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 font-semibold">Name</th>
                <th className="text-left py-2 px-4 font-semibold">Email</th>
                <th className="text-left py-2 px-4 font-semibold">Role</th>
                <th className="text-left py-2 px-4 font-semibold">Joined</th>
                <th className="text-left py-2 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="border-b hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-3 px-4">{member.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {member.email}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member.id, e.target.value)
                      }
                      className="px-2 py-1 border rounded text-sm"
                    >
                      <option value="admin">Admin</option>
                      <option value="content-manager">Content Manager</option>
                      <option value="approver">Approver</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      onClick={() => handleRemove(member.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <RolesInfo roles={roles} />
      <PermissionsMatrix />
    </div>
  );
};

const RolesInfo: React.FC<{ roles: { [key: string]: RoleDescription } }> = ({
  roles,
}) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Role Descriptions</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(roles).map(([key, role]) => (
        <div
          key={key}
          className="border rounded p-4 bg-gray-50 dark:bg-gray-800"
        >
          <h4 className="font-semibold mb-2">{role.name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {role.description}
          </p>
        </div>
      ))}
    </div>
  </Card>
);

const PermissionsMatrix: React.FC = () => {
  const [matrix, setMatrix] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const response = await fetch("/api/team/permissions-matrix", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const result = await response.json();
        setMatrix(result.data);
      } finally {
        setLoading(false);
      }
    };

    fetchMatrix();
  }, []);

  if (loading || !matrix) return null;

  return (
    <Card className="p-6 overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Permissions Matrix</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-2 font-semibold">Permission</th>
            {matrix.roles.map((role: string) => (
              <th
                key={role}
                className="text-center py-2 px-2 font-semibold capitalize"
              >
                {role}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.permissions.map((permission: string) => (
            <tr key={permission} className="border-b">
              <td className="py-2 px-2">
                {permission.replace(/([A-Z])/g, " $1").trim()}
              </td>
              {matrix.roles.map((role: string) => (
                <td
                  key={`${role}-${permission}`}
                  className="text-center py-2 px-2"
                >
                  {matrix.matrix[role][permission] ? (
                    <span className="text-green-600 font-bold">✓</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};
