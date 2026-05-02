import { useState, useMemo } from 'react';
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
import { Gift, Mail, Lock, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BONUS_LABELS: Record<string, string> = {
  spins: '10 Arcade Free Spins Added',
  credits: '+1,000 Free Credits Added',
  match: '3 Multiplier Passes Added',
};

export default function ReservationModal({ open, onOpenChange }: SignUpModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [awardedBonus, setAwardedBonus] = useState('');
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    bonus: '',
  });

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (touched.username && form.username.length < 3) {
      e.username = 'Username must be at least 3 characters';
    }
    if (touched.email && form.email) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(form.email)) e.email = 'Please enter a valid email';
    }
    if (touched.password && form.password.length < 6) {
      e.password = 'Password must be at least 6 characters';
    }
    if (touched.bonus && !form.bonus) {
      e.bonus = 'Please select a bonus';
    }
    return e;
  }, [form, touched]);

  const isValid =
    form.username.length >= 3 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.password.length >= 6 &&
    !!form.bonus;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, email: true, password: true, bonus: true });
    if (!isValid) return;

    setSubmitted(true);
    setAwardedBonus(form.bonus);

    try {
      const saved = localStorage.getItem('casino_credits');
      const parsed = parseInt(saved || '1000', 10);
      const currentCredits = !isNaN(parsed) && parsed >= 0 ? parsed : 1000;

      const savedBonus = localStorage.getItem('casino_bonus_state');
      const bonusState = savedBonus ? JSON.parse(savedBonus) : {};

      if (form.bonus === 'credits') {
        localStorage.setItem('casino_credits', (currentCredits + 1000).toString());
      } else if (form.bonus === 'spins') {
        localStorage.setItem('casino_bonus_state', JSON.stringify({
          ...bonusState,
          freeSpinTickets: Math.max(0, Number(bonusState.freeSpinTickets) || 0) + 10,
        }));
      } else if (form.bonus === 'match') {
        localStorage.setItem('casino_bonus_state', JSON.stringify({
          ...bonusState,
          multiplierPasses: Math.max(0, Number(bonusState.multiplierPasses) || 0) + 3,
        }));
      }

      window.dispatchEvent(new CustomEvent('casino:bonus-awarded', { detail: { bonus: form.bonus } }));
    } catch {
      // localStorage unavailable
    }

    setTimeout(() => {
      setSubmitted(false);
      setForm({ username: '', email: '', password: '', bonus: '' });
      setTouched({});
      onOpenChange(false);
    }, 2500);
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const inputClass = (field: string) =>
    `bg-casino-ink/50 border-casino-ivory/10 text-casino-ivory placeholder:text-casino-muted/30 focus-visible:ring-casino-neon ${
      touched[field] && errors[field] ? 'border-casino-ember focus-visible:ring-casino-ember' : ''
    }`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-casino-charcoal border border-casino-neon/30 text-casino-ivory sm:max-w-md shadow-[0_0_50px_rgba(0,243,255,0.15)]">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl text-casino-ivory uppercase tracking-tight [text-shadow:0_0_15px_rgba(0,243,255,0.5)]">
            Join Cyber Slots
          </DialogTitle>
          <DialogDescription className="text-casino-muted font-mono text-xs">
            Create an account today and claim your welcome bonus.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <CheckCircle2 className="w-16 h-16 text-casino-neon animate-pulse [filter:drop-shadow(0_0_10px_#00f3ff)]" />
            <p className="font-serif text-2xl text-casino-ivory [text-shadow:0_0_10px_rgba(255,255,255,0.5)]">Account Created!</p>
            <p className="text-casino-gold font-mono text-sm text-center max-w-xs animate-bounce mt-2">
              {BONUS_LABELS[awardedBonus] || 'Welcome Bonus Added'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4" noValidate>

            <div className="space-y-1.5">
              <Label className="text-casino-muted text-xs font-mono uppercase tracking-wide flex items-center gap-1">
                <User className="w-3 h-3 text-casino-neon" /> Username
              </Label>
              <Input
                required
                minLength={3}
                value={form.username}
                onChange={(e) => update('username', e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, username: true }))}
                placeholder="cyber_spinner_99"
                className={inputClass('username')}
              />
              {touched.username && errors.username && (
                <p className="text-casino-ember text-xs font-mono flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {errors.username}
                </p>
              )}
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
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                placeholder="you@example.com"
                className={inputClass('email')}
              />
              {touched.email && errors.email && (
                <p className="text-casino-ember text-xs font-mono flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-casino-muted text-xs font-mono uppercase tracking-wide flex items-center gap-1">
                <Lock className="w-3 h-3 text-casino-neon" /> Password
              </Label>
              <Input
                required
                type="password"
                minLength={6}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                placeholder="••••••••"
                className={inputClass('password')}
              />
              {touched.password && errors.password && (
                <p className="text-casino-ember text-xs font-mono flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-1.5 pt-2">
              <Label className="text-casino-muted text-xs font-mono uppercase tracking-wide flex items-center gap-1">
                <Gift className="w-3 h-3 text-casino-gold" /> Select Welcome Bonus
              </Label>
              <Select value={form.bonus} onValueChange={(v) => update('bonus', v)} required>
                <SelectTrigger className={`bg-casino-ink/50 border-casino-ivory/10 text-casino-ivory focus:ring-casino-neon ${touched.bonus && errors.bonus ? 'border-casino-ember' : ''}`}>
                  <SelectValue placeholder="Choose your bonus" />
                </SelectTrigger>
                <SelectContent className="bg-casino-charcoal border-casino-neon/30 text-casino-ivory">
                  <SelectItem value="spins" className="focus:bg-casino-neon/20 focus:text-casino-neon">10 Arcade Free Spins</SelectItem>
                  <SelectItem value="credits" className="focus:bg-casino-neon/20 focus:text-casino-neon">1,000 Free Credits</SelectItem>
                  <SelectItem value="match" className="focus:bg-casino-neon/20 focus:text-casino-neon">3 Multiplier Passes</SelectItem>
                </SelectContent>
              </Select>
              {touched.bonus && errors.bonus && (
                <p className="text-casino-ember text-xs font-mono flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {errors.bonus}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isValid}
              className="w-full mt-6 bg-casino-neon/20 border border-casino-neon hover:bg-casino-neon hover:text-casino-ink hover:shadow-[0_0_20px_rgba(0,243,255,0.6)] text-casino-neon rounded-full font-mono text-sm uppercase tracking-widest transition-all duration-300 h-12 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Claim Bonus & Play
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
