"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster, toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Invitation = {
  _id?: string;
  name: string;
  address: string;
  area: string;
  phone: string;
  people: number;
};

type Area = {
  _id: string;
  name: string;
};

export default function Home() {
  const { register, handleSubmit, reset, setValue, formState } =
    useForm<Invitation>();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [totalInvitations, setTotalInvitations] = useState(0);
  const [totalPeople, setTotalPeople] = useState(0);
  const [filters, setFilters] = useState({ name: "", area: "", sort: "desc" });
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [newArea, setNewArea] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  // dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Invitation | null>(null);

  const fetchInvitations = async () => {
    const params = new URLSearchParams(filters);
    const res = await fetch(`/api/invitations?${params.toString()}`);
    const data = await res.json();
    setInvitations(data.data);
    setTotalInvitations(data.totalInvitations);
    setTotalPeople(data.totalPeople);
  };

  useEffect(() => {
    fetchInvitations();
  }, [filters]);

  const fetchAreas = async () => {
    const res = await fetch("/api/areas");
    const data = await res.json();
    setAreas(data);
  };

  useEffect(() => {
    fetchInvitations();
    fetchAreas();
  }, []);

  const onSubmit = async (values: Invitation) => {
    setLoading(true);
    const method = editId ? "PUT" : "POST";
    const body = editId ? { ...values, _id: editId } : values;

    const res = await fetch("/api/invitations", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(editId ? "Invitation updated!" : "Invitation saved!");
      await fetchInvitations();
      reset();
      setEditId(null);
      setEditDialogOpen(false);
    } else {
      toast.error("Failed to save invitation");
    }
    setLoading(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem?._id) return;
    await fetch(`/api/invitations?id=${selectedItem._id}`, {
      method: "DELETE",
    });
    toast.success("Invitation deleted!");
    setDeleteDialogOpen(false);
    fetchInvitations();
  };

  const handleEdit = (item: Invitation) => {
    setValue("name", item.name);
    setValue("address", item.address);
    setValue("area", item.area);
    setValue("phone", item.phone);
    setValue("people", item.people);
    setEditId(item._id!);
    setEditDialogOpen(true);
  };

  const addArea = async () => {
    if (!newArea.trim()) {
      toast.error("Please enter area name");
      return;
    }
    const res = await fetch("/api/areas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newArea }),
    });
    if (res.ok) {
      toast.success("Area added successfully");
      setNewArea("");
      fetchAreas();
    } else toast.error("Failed to add area");
  };

  return (
    <div className="min-h-screen p-2 bg-white text-black">
      <Toaster position="top-right" richColors />

      <main className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold mb-4">🎉 Invitation Form</h1>

        {/* Main Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 rounded-lg shadow space-y-4 bg-gray-50"
        >
          <div>
            <label className="block text-sm font-medium">Name *</label>
            <input
              {...register("name", { required: true })}
              className="mt-1 w-full border rounded px-3 py-2 outline"
            />
          </div>

          <div className="hidden">
            <label className="block text-sm font-medium">Address</label>
            <textarea
              {...register("address")}
              className="mt-1 w-full border rounded px-2 py-2 outline"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium">Area *</label>
              <select
                {...register("area", { required: true })}
                className="mt-1 w-full border rounded px-3 py-2 outline"
              >
                <option value="">Select area</option>
                {areas.map((a) => (
                  <option key={a._id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>

              <div className="flex mt-2 gap-2">
                <input
                  type="text"
                  placeholder="Add new area"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                />
                <Button
                  type="button"
                  onClick={addArea}
                  className="bg-green-600"
                >
                  Add
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input
                {...register("phone")}
                className="mt-1 w-full border rounded px-3 py-2 outline"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">People *</label>
              <input
                type="number"
                {...register("people", { required: true })}
                className="mt-1 w-full border rounded px-3 py-2 outline"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 outline rounded disabled:opacity-60"
          >
            {loading
              ? "Saving..."
              : editId
              ? "Update Invitation"
              : "Save Invitation"}
          </Button>
        </form>

        {/* Invitations List */}
        {/* <section className="mt-6">
          <h2 className="text-xl font-medium mb-3">📋 Invitations List</h2>
          <div className="space-y-3">
            {list.map((item) => (
              <div
                key={item._id}
                className="bg-white p-4 rounded shadow-sm flex justify-between items-center"
              >
                <div>
                  <div className="text-lg font-semibold">{item.name}</div>
                  <div className="text-sm">{item.address}</div>
                  <div className="text-sm">Area: {item.area}</div>
                  <div className="text-sm">Phone: {item.phone}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{item.people}</div>
                  <div className="text-xs text-gray-500">people</div>
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section> */}

    {/* Summary */}
    <div className="text-center flex gap-5 items-center text-lg font-semibold bg-white p-4 rounded shadow">
          <p className="p-1 px-2 bg-gray-100">Invites: {totalInvitations}</p>
          <p className="p-1 px-2 bg-gray-100">Peoples: {totalPeople}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-4 rounded shadow">
          <input
            type="text"
            placeholder="Search by name"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            className="border p-2 rounded w-48 outline"
          />
          <select
            value={filters.area}
            onChange={(e) => setFilters({ ...filters, area: e.target.value })}
            className="border p-2 rounded outline"
          >
            <option value="">All Areas</option>
            {areas.map((a) => (
              <option key={a._id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="border p-2 rounded outline"
          >
            <option value="desc">Sort by People (High → Low)</option>
            <option value="asc">Sort by People (Low → High)</option>
          </select>
        </div>

    

        {/* List */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Invitation List</h2>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Area</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">People</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv) => (
                <tr key={inv._id} className="text-center">
                  <td className="p-2 border">{inv.name}</td>
                  <td className="p-2 border">{inv.area}</td>
                  <td className="p-2 border">{inv.phone}</td>
                  <td className="p-2 border text-center">{inv.people}</td>
                  <td>
                    <div className="mt-2 flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(inv)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(inv);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        Del
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invitation</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this invitation?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Invitation</DialogTitle>
          </DialogHeader>
          <p>
            Editing mode is active. Update your details above and click “Update
            Invitation”.
          </p>
          <DialogFooter>
            <Button onClick={() => setEditDialogOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
