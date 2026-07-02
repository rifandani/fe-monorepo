"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Key, Selection } from "react-aria-components/TagGroup";
import type { TextFieldProps } from "react-aria-components/TextField";
import { twMerge } from "tailwind-merge";

import { FieldError } from "@/core/components/ui/field";
import { Tag, TagGroup, TagList } from "@/core/components/ui/tag-group";
import { TextField } from "@/core/components/ui/text-field";

const splitPatternRegex = /[,;]/u;
const whitespaceRegex = /\s{2,}/gu;
const tabRegex = /[\t\r\n]|\\t|\\r|\\n/gu;
const EMPTY_DEFAULT_TAGS: string[] = [];

interface TagInputProps extends Pick<
  TextFieldProps,
  "isDisabled" | "isReadOnly" | "children" | "aria-label" | "aria-labelledby"
> {
  value?: Selection;
  onChange?: (next: Selection) => void;
  defaultValue?: string[];
  splitPattern?: RegExp;
  className?: string;
  inputValue?: string;
  onInputValueChange?: (v: string) => void;
  isRequired?: boolean;
  requiredMessage?: string;
  name?: string;
}

export const TagField = ({
  value,
  onChange,
  defaultValue = EMPTY_DEFAULT_TAGS,
  splitPattern = splitPatternRegex,
  className,
  inputValue: controlledInput,
  onInputValueChange,
  isRequired,
  requiredMessage,
  name = "tags",
  children,
  ...props
}: TagInputProps) => {
  const [internalSelection, setInternalSelection] = useState<Selection>(
    new Set(defaultValue)
  );
  const [uncontrolledInput, setUncontrolledInput] = useState("");
  const [touched, setTouched] = useState(false);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const selection: Selection = value ?? internalSelection;
  const inputValue = controlledInput ?? uncontrolledInput;
  const setInputValue = onInputValueChange ?? setUncontrolledInput;
  const applySelection = (next: Selection) =>
    (onChange ?? setInternalSelection)(next as Selection);
  const list = useMemo(
    () => (selection === "all" ? [] : [...selection].map(String)),
    [selection]
  );
  const isInvalid = Boolean(isRequired && list.length === 0 && touched);
  const errorText = requiredMessage ?? "At least one item is required";

  const addTag = () => {
    if (selection === "all") {
      return;
    }
    const next = new Set<Key>(selection);
    for (const raw of inputValue.split(splitPattern)) {
      const formatted = raw
        .trim()
        .replace(whitespaceRegex, " ")
        .replace(tabRegex, "");
      if (formatted === "") {
        continue;
      }
      const exists = [...next].some(
        (id) => String(id).toLocaleLowerCase() === formatted.toLocaleLowerCase()
      );
      if (!exists) {
        next.add(formatted);
      }
    }
    applySelection(next);
    setInputValue("");
    setTouched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      addTag();
    }
  };

  const removeKeys = (keys: Selection) => {
    if (selection === "all") {
      return;
    }
    const next = new Set<Key>(selection);
    if (keys !== "all") {
      for (const k of keys) {
        next.delete(k);
      }
    }
    applySelection(next);
    setTouched(true);
  };

  useEffect(() => {
    const input = hiddenRef.current;
    const form = input?.form;
    if (!form || !input) {
      return;
    }
    const onSubmit = (e: Event) => {
      if (isRequired && list.length === 0) {
        e.preventDefault();
        setTouched(true);
        input.setCustomValidity(errorText);
        form.reportValidity();
      } else {
        input.setCustomValidity("");
      }
    };
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [isRequired, list.length, errorText]);

  return (
    <div className={twMerge("flex flex-col gap-y-1", className)}>
      <TextField
        value={inputValue}
        onChange={setInputValue}
        onKeyDown={handleKeyDown}
        onBlur={() => setTouched(true)}
        isInvalid={isInvalid}
        {...props}
      >
        {(values) => (
          <>
            {typeof children === "function" ? children(values) : children}
            <FieldError>{isInvalid ? errorText : undefined}</FieldError>
          </>
        )}
      </TextField>
      {selection ? (
        <TagGroup
          disabledKeys={props.isDisabled ? new Set(list) : undefined}
          className="mt-1"
          aria-label="Selected tags"
          {...(!props.isReadOnly && !props.isDisabled
            ? { onRemove: removeKeys }
            : {})}
        >
          <TagList>
            {list.map((id) => (
              <Tag key={id} id={id}>
                {id}
              </Tag>
            ))}
          </TagList>
        </TagGroup>
      ) : null}
      <input
        ref={hiddenRef}
        name={name}
        value={list.join(",")}
        required={Boolean(isRequired)}
        readOnly
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only absolute -z-10 size-0 opacity-0"
      />
    </div>
  );
};
