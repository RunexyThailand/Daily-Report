import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogOverlay,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
type DialogConfirmProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
};

export default function DialogConfirm({
  isOpen,
  onClose,
  onConfirm,
}: DialogConfirmProps) {
  const t = useTranslations();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/50" />
      <DialogContent className="fixed top-1/2 left-1/2 max-h-[85vh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-4 shadow-lg focus:outline-none">
        <DialogTitle>{t("Common.Confirm_action")}</DialogTitle>
        <DialogDescription>{t("Common.Confirm_description")}</DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">
              {t("Common.cancel")}
            </Button>
          </DialogClose>
          <Button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-700 text-white cursor-pointer"
          >
            {t("Common.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
