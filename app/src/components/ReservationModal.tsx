import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Users, CheckCircle2 } from 'lucide-react';

interface ReservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReservationModal({ open, onOpenChange }: ReservationModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    guests: '',
    experience: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', phone: '', date: '', guests: '', experience: '' });
      onOpenChange(false);
    }, 2500);
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-casino-charcoal border-casino-ivory/10 text-casino-ivory sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-casino-ivory uppercase tracking-tight">
            Reserve Your Evening
          </DialogTitle>
          <DialogDescription className="text-casino-muted font-mono text-xs">
            We keep the room small and the energy high. Book early.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <CheckCircle2 className="w-12 h-12 text-casino-ember" />
            <p className="font-serif text-xl text-casino-ivory">Request Received</p>
            <p className="text-casino-muted text-sm text-center max-w-xs">
              We will contact you shortly to confirm your reservation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-casino-muted text-xs font-mono uppercase tracking-wide">
                Full Name
              </Label>
              <Input
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Your name"
                className="bg-casino-ink border-casino-ivory/10 text-casino-ivory placeholder:text-casino-muted/50 focus-visible:ring-casino-ember"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-casino-muted text-xs font-mono uppercase tracking-wide">
                  Email
                </Label>
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="you@email.com"
                  className="bg-casino-ink border-casino-ivory/10 text-casino-ivory placeholder:text-casino-muted/50 focus-visible:ring-casino-ember"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-casino-muted text-xs font-mono uppercase tracking-wide">
                  Phone
                </Label>
                <Input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="bg-casino-ink border-casino-ivory/10 text-casino-ivory placeholder:text-casino-muted/50 focus-visible:ring-casino-ember"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-casino-muted text-xs font-mono uppercase tracking-wide flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Date
                </Label>
                <Input
                  required
                  type="date"
                  value={form.date}
                  onChange={(e) => update('date', e.target.value)}
                  className="bg-casino-ink border-casino-ivory/10 text-casino-ivory placeholder:text-casino-muted/50 focus-visible:ring-casino-ember"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-casino-muted text-xs font-mono uppercase tracking-wide flex items-center gap-1">
                  <Users className="w-3 h-3" /> Guests
                </Label>
                <Select value={form.guests} onValueChange={(v) => update('guests', v)} required>
                  <SelectTrigger className="bg-casino-ink border-casino-ivory/10 text-casino-ivory focus:ring-casino-ember">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-casino-charcoal border-casino-ivory/10 text-casino-ivory">
                    <SelectItem value="1">1 Guest</SelectItem>
                    <SelectItem value="2">2 Guests</SelectItem>
                    <SelectItem value="3">3 Guests</SelectItem>
                    <SelectItem value="4">4 Guests</SelectItem>
                    <SelectItem value="5+">5+ Guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-casino-muted text-xs font-mono uppercase tracking-wide">
                Experience
              </Label>
              <Select value={form.experience} onValueChange={(v) => update('experience', v)} required>
                <SelectTrigger className="bg-casino-ink border-casino-ivory/10 text-casino-ivory focus:ring-casino-ember">
                  <SelectValue placeholder="Choose your evening" />
                </SelectTrigger>
                <SelectContent className="bg-casino-charcoal border-casino-ivory/10 text-casino-ivory">
                  <SelectItem value="roulette">Roulette Night</SelectItem>
                  <SelectItem value="poker">Poker Room</SelectItem>
                  <SelectItem value="lounge">Late Lounge</SelectItem>
                  <SelectItem value="private">Private Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full mt-2 bg-casino-ember hover:bg-casino-ember/90 text-casino-ivory rounded-full font-mono text-sm uppercase tracking-wide"
            >
              Request a table
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
