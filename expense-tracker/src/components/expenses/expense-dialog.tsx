"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { expenseSchema, type ExpenseInput } from "@/lib/validators"
import { CATEGORY_LABELS, SPLIT_TYPE_LABELS } from "@/types"

interface ExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  members: { id: string; name: string | null; email: string }[]
  onSuccess: () => void
}

export function ExpenseDialog({ open, onOpenChange, groupId, members, onSuccess }: ExpenseDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "OTHER",
      splitType: "EQUAL",
      date: new Date().toISOString().split("T")[0],
    },
  })

  const onSubmit = async (data: ExpenseInput) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create expense")
      }

      toast({
        title: "Uspešno",
        description: "Trošak je dodat",
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch {
      toast({
        title: "Greška",
        description: "Nije moguće dodati trošak",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novi trošak</DialogTitle>
          <DialogDescription>Dodajte novi trošak u grupu</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Naziv</Label>
              <Input
                id="title"
                placeholder="npr. Večera, Gorivo..."
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Iznos</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategorija</Label>
              <Select
                onValueChange={(value) => setValue("category", value as ExpenseInput["category"])}
                defaultValue="OTHER"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite kategoriju" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="splitType">Podela</Label>
              <Select
                onValueChange={(value) => setValue("splitType", value as ExpenseInput["splitType"])}
                defaultValue="EQUAL"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite tip podele" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SPLIT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Odustani
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Dodavanje..." : "Dodaj"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
