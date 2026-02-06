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
import { CATEGORY_LABELS, SPLIT_TYPE_LABELS, CURRENCY_LABELS } from "@/types"

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
  const [splitAmounts, setSplitAmounts] = useState<Record<string, number>>({})

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "OTHER",
      splitType: "EQUAL",
      currency: "RSD",
      date: new Date().toISOString().split("T")[0],
    },
  })

  const selectedSplitType = watch("splitType")
  const totalAmount = watch("amount")

  const splitTotal = Object.values(splitAmounts).reduce((sum, val) => sum + (val || 0), 0)
  const isValidSplit = totalAmount > 0 && Math.abs(splitTotal - totalAmount) < 0.01

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      reset()
      setSplitAmounts({})
    }
    onOpenChange(isOpen)
  }

  const onSubmit = async (data: ExpenseInput) => {
    if (data.splitType === "UNEQUAL") {
      const splits = members.map(m => ({
        userId: m.id,
        amount: splitAmounts[m.id] || 0,
      }))
      const total = splits.reduce((s, x) => s + x.amount, 0)
      if (Math.abs(total - data.amount) >= 0.01) {
        toast({
          title: "Greška",
          description: "Zbir podela mora biti jednak ukupnom iznosu",
          variant: "destructive",
        })
        return
      }
      data.splits = splits
    }

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
      setSplitAmounts({})
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
    <Dialog open={open} onOpenChange={handleClose}>
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

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
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
                <Label>Valuta</Label>
                <Select
                  onValueChange={(value) => setValue("currency", value as ExpenseInput["currency"])}
                  defaultValue="RSD"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CURRENCY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                onValueChange={(value) => {
                  setValue("splitType", value as ExpenseInput["splitType"])
                  if (value === "EQUAL") {
                    setSplitAmounts({})
                  }
                }}
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

            {selectedSplitType === "UNEQUAL" && (
              <div className="space-y-3 rounded-lg border p-3">
                <Label>Podela po članovima</Label>
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium flex-1 truncate">
                      {member.name || member.email}
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="w-28"
                      value={splitAmounts[member.id] || ""}
                      onChange={(e) => {
                        setSplitAmounts(prev => ({
                          ...prev,
                          [member.id]: parseFloat(e.target.value) || 0,
                        }))
                      }}
                    />
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-slate-500">Ukupno podeljeno:</span>
                  <span className={isValidSplit ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                    {splitTotal.toFixed(2)} / {(totalAmount || 0).toFixed(2)}
                  </span>
                </div>
                {!isValidSplit && totalAmount > 0 && splitTotal > 0 && (
                  <p className="text-sm text-red-500">
                    Zbir podela mora biti jednak ukupnom iznosu
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
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
