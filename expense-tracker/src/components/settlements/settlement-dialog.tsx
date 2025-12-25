"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
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
import { settlementSchema, type SettlementInput } from "@/lib/validators"

interface SettlementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  members: { id: string; name: string | null; email: string }[]
  onSuccess: () => void
}

export function SettlementDialog({ open, onOpenChange, groupId, members, onSuccess }: SettlementDialogProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<SettlementInput>({
    resolver: zodResolver(settlementSchema),
  })

  // Filter out current user from receivers
  const otherMembers = members.filter(m => m.id !== session?.user?.id)

  const onSubmit = async (data: SettlementInput) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/settlements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create settlement")
      }

      toast({
        title: "Uspešno",
        description: "Uplata je evidentirana. Čeka se potvrda.",
      })
      reset()
      onOpenChange(false)
      onSuccess()
    } catch {
      toast({
        title: "Greška",
        description: "Nije moguće evidentirati uplatu",
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
          <DialogTitle>Evidentiraj uplatu</DialogTitle>
          <DialogDescription>
            Zabeležite da ste platili nekom članu grupe
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="receiverId">Primalac</Label>
              <Select onValueChange={(value) => setValue("receiverId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite primaoca" />
                </SelectTrigger>
                <SelectContent>
                  {otherMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.receiverId && (
                <p className="text-sm text-red-500">{errors.receiverId.message}</p>
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Odustani
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Evidentiranje..." : "Evidentiraj"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
