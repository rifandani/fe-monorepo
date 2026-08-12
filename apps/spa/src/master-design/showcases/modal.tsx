import { Button } from "@/core/components/ui/button";
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/core/components/ui/modal";

import { Variant, VariantGrid } from "../variant";

export const ModalShowcase = () => (
  <VariantGrid>
    <Variant label="sm">
      <Modal>
        <Button intent="outline">Open sm</Button>
        <ModalContent size="sm">
          <ModalHeader>
            <ModalTitle>Small modal</ModalTitle>
            <ModalDescription>Compact dialog for short copy.</ModalDescription>
          </ModalHeader>
          <ModalBody>Keep this one brief.</ModalBody>
          <ModalFooter>
            <ModalClose>Close</ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Variant>

    <Variant label="default">
      <Modal>
        <Button intent="outline">Open default</Button>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Default modal</ModalTitle>
            <ModalDescription>Default size is md.</ModalDescription>
          </ModalHeader>
          <ModalBody>Use this for typical forms and confirmations.</ModalBody>
          <ModalFooter>
            <ModalClose>Close</ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Variant>
  </VariantGrid>
);
