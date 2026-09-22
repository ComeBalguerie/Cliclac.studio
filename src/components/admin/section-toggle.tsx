import { Switch } from "@/components/ui/switch";

type Props = {
  label: string;
  visible: boolean;
  onChange: (visible: boolean) => void;
};

/** Toggle qui contrôle l'affichage d'une section sur le site public. */
export function SectionToggle({ label, visible, onChange }: Props) {
  return (
    <div className="flex items-center justify-between gap-4 border border-[var(--line)] px-4 py-3">
      <span className="nav-caps text-[11px]">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-[12px] text-[color:var(--muted-foreground)]">
          {visible ? "Visible" : "Masquée"}
        </span>
        <Switch checked={visible} onCheckedChange={onChange} />
      </div>
    </div>
  );
}
