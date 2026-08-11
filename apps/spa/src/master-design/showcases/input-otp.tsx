import {
  InputOTP,
  InputOTPGroup,
  InputOTPLabel,
  InputOTPSlot,
} from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const InputOtpShowcase = () => (
  <VariantGrid>
    <Variant label="default">
      <div className="space-y-2">
        <InputOTPLabel>One-time code</InputOTPLabel>
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
    </Variant>

    <Variant label="disabled">
      <div className="space-y-2">
        <InputOTPLabel>One-time code</InputOTPLabel>
        <InputOTP disabled maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
    </Variant>
  </VariantGrid>
);
