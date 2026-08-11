import {
  Button,
  Description,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  TextField,
} from "@/core/components/ui";

import { Variant, VariantGrid } from "../variant";

export const DialogShowcase = () => (
  <VariantGrid>
    <Variant label="dialog">
      <Modal>
        <Button intent="outline">Edit profile</Button>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Edit profile</ModalTitle>
            <ModalDescription>
              Update your details, then save your changes.
            </ModalDescription>
          </ModalHeader>
          <ModalBody className="space-y-4">
            <TextField>
              <Label>Name</Label>
              <Input defaultValue="Ava Thompson" />
              <Description>Shown on your public profile.</Description>
            </TextField>
          </ModalBody>
          <ModalFooter>
            <ModalClose>Cancel</ModalClose>
            <ModalClose intent="primary">Save</ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Variant>

    <Variant label="alertdialog">
      <Modal>
        <Button intent="danger">Delete account</Button>
        <ModalContent role="alertdialog" size="sm">
          <ModalHeader>
            <ModalTitle>Delete account?</ModalTitle>
            <ModalDescription>
              This permanently removes your account and data. This cannot be
              undone.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <ModalClose>Cancel</ModalClose>
            <ModalClose intent="danger">Delete</ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Variant>
  </VariantGrid>
);
