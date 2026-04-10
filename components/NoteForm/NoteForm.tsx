import css from "./NoteForm.module.css";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "../../lib/api";
import { useNoteDraftStore } from "@/lib/store/noteStore";
import { useRouter } from "next/router";
import { NewNoteData } from "@/lib/store/noteStore";

interface NoteFormProps {
  onClose: () => void;
}

interface FormValues {
  title: string;
  content: string;
  tag: "Todo" | "Work" | "Personal" | "Meeting" | "Shopping";
}

const initialValues: FormValues = {
  title: "",
  content: "",
  tag: "Todo",
};

export default function NoteForm({ onClose }: NoteFormProps) {
  const router = useRouter();
  const { draft, setDraft, clearDraft } = useNoteDraftStore();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<FormValues>>({});

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      clearDraft();
      router.push("/notes/filter/all");
    },
  });

  const validate = () => {
    const newErrors: Partial<FormValues> = {};

    if (!values.title) {
      newErrors.title = "Title is required";
    } else if (values.title.length < 3) {
      newErrors.title = "Minimum 3 characters";
    } else if (values.title.length > 50) {
      newErrors.title = "Maximum 50 characters";
    }

    if (values.content.length > 500) {
      newErrors.content = "Maximum 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setValues({
      ...draft,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (formData: FormData) => {
    const values = Object.fromEntries(formData) as NewNoteData;

    mutation.mutate(values);
  };

  return (
    <form className={css.form} action={handleSubmit}>
      <label>
        Title
        <input
          name="title"
          type="text"
          value={values.title}
          onChange={handleChange}
        />
        {errors.title && <span>{errors.title}</span>}
      </label>

      <label>
        Content
        <textarea
          name="content"
          value={values.content}
          onChange={handleChange}
        />
        {errors.content && <span>{errors.content}</span>}
      </label>

      <label>
        Tag
        <select name="tag" value={values.tag} onChange={handleChange}>
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
        {errors.tag && <span>{errors.tag}</span>}
      </label>

      <div className={css.actions}>
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating..." : "Create"}
        </button>

        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}
