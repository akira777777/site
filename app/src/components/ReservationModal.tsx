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
import { Gift, Mail, Lock, User, CheckCircle2 } from 'lucide-react';

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReservationModal({ open, onOpenChange }: SignUpModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    bonus: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Simulate API call and add bonus credits
    const currentCredits = parseInt(localStorage.getItem('casino_credits') || '1000', 10);
    localStorage.setItem('casino_credits', (currentCredits + 1000).toString());

    setTimeout(() => {
      setSubmitted(false);
      setForm({ username: '', email: '', password: '', bonus: '' });
      onOpenChange(false);
      // We could trigger an event here to refresh credits in the slot machine,
      // but for this demo, reloading or spinning will resync.
    }, 2500);
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-casino-charcoal border border-casino-neon/30 text-casino-ivory sm:max-w-md shadow-[0_0_50px_rgba(0,243,255,0.15)]">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl text-casino-ivory uppercase tracking-tight" style={{ textShadow: '0 0 15px rgba(0,243,255,0.5)' }}>
            Join Cyber Slots
          </DialogTitle>
          <DialogDescription className="text-casino-muted font-mono text-xs">
            Create an account today and claim your welcome bonus.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <CheckCircle2 className="w-16 h-16 text-casino-neon animate-pulse" style={{ filter: 'drop-shadow(0 0 10px #00f3ff)' }} />
            <p className="font-serif text-2xl text-casino-ivory" style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>Account Created!</p>
            <p className="text-casino-gold font-mono text-sm text-center max-w-xs animate-bounce mt-2">
              +1,000 Free Credits Added
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            
            <div className="space-y-1.5">
              <Label className="text-casino-muted text-xs font-mono uppercase tracking-wide flex items-center gap-1">
                <User className="w-3 h-3 text-casino-neon" /> Username
              </Label>
              <Input
                required
                value={form.username}
                onChange={(e) => update('username', e.target.value)}
                placeholder="cyber_spinner_99"
                className="bg-casino-ink/50 border-casino-ivory/10 text-casino-ivory placeholder:text-casino-muted/30 focus-visible:ring-casino-neon"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-casino-muted text-xs font-mono uppercase tracking-wide flex items-center gap-1">
                <Mail className="w-3 h-3 text-casino-neon" /> Email Address
              </Label>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@example.com"
                className="bg-casino-ink/50 border-casino-ivory/10 text-casino-ivory placeholder:text-casino-muted/30 focus-visible:ring-casino-neon"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-casino-muted text-xs font-mono uppercase tracking-wide flex items-center gap-1">
                <Lock className="w-3 h-3 text-casino-neon" /> Password
              </Label>
              <Input
                required
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="••••••••"
                className="bg-casino-ink/50 border-casino-ivory/10 text-casino-ivory placeholder:text-casino-muted/30 focus-visible:ring-casino-neon"
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <Label className="text-casino-muted text-xs font-mono uppercase tracking-wide flex items-center gap-1">
                <Gift className="w-3 h-3 text-casino-gold" /> Select Welcome Bonus
              </Label>
              <Select value={form.bonus} onValueChange={(v) => update('bonus', v)} required>
                <SelectTrigger className="bg-casino-ink/50 border-casino-ivory/10 text-casino-ivory focus:ring-casino-neon">
                  <SelectValue placeholder="Choose your bonus" />
                </SelectTrigger>
                <SelectContent className="bg-casino-charcoal border-casino-neon/30 text-casino-ivory">
                  <SelectItem value="spins" className="focus:bg-casino-neon/20 focus:text-casino-neon">100 Free Spins</SelectItem>
                  <SelectItem value="credits" className="focus:bg-casino-neon/20 focus:text-casino-neon">1,000 Free Credits</SelectItem>
                  <SelectItem value="match" className="focus:bg-casino-neon/20 focus:text-casino-neon">200% Deposit Match</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full mt-6 bg-casino-neon/20 border border-casino-neon hover:bg-casino-neon hover:text-casino-ink hover:shadow-[0_0_20px_rgba(0,243,255,0.6)] text-casino-neon rounded-full font-mono text-sm uppercase tracking-widest transition-all duration-300 h-12"
            >
              Claim Bonus & Play
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
