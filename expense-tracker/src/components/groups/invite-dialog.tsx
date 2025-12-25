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
import { useToast } from "@/hooks/use-toast"
import { inviteSchema, type InviteInput } from "@/lib/validators"

interface InviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
}

export function InviteDialog({ open, onOpenChange, groupId }: InviteDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
  })

  const onSubmit = async (data: InviteInput) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        toast({
          title: "Greška",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Uspešno",
        description: result.message,
      })
      reset()
      onOpenChange(false)
    } catch {
      toast({
        title: "Greška",
        description: "Nije moguće poslati pozivnicu",
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
          <DialogTitle>Pozovi člana</DialogTitle>
          <DialogDescription>
            Unesite email adresu osobe koju želite da pozovete u grupu
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email adresa</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Odustani
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Slanje..." : "Pošalji pozivnicu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
