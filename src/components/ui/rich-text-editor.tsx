"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeightClassName?: string;
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  minHeightClassName = "min-h-24",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      BulletList,
      OrderedList,
      ListItem,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "max-w-none rounded-b-md border border-t-0 border-white/10 bg-[#101010] px-3 py-2 text-sm text-white focus:outline-none [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    if (value === editor.getHTML()) return;

    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center gap-1 rounded-t-md border border-white/10 bg-[#0f0f0f] p-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor}
        >
          <Bold className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor}
        >
          <Italic className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          disabled={!editor}
        >
          <List className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          disabled={!editor}
        >
          <ListOrdered className="size-4" />
        </Button>
        {placeholder ? <span className="ml-2 text-xs text-gray-400">{placeholder}</span> : null}
      </div>
      <EditorContent editor={editor} className={cn("[&_div[contenteditable='true']]:rounded-t-none", minHeightClassName)} />
    </div>
  );
}
