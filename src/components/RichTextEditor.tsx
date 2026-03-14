import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Heading1, Heading2, Heading3, Undo, Redo, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  className?: string;
}

const MenuButton = ({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title: string }) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    title={title}
    className={cn("h-8 w-8 p-0", active && "bg-primary/20 text-primary")}
  >
    {children}
  </Button>
);

const RichTextEditor = ({ content, onChange, className }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content]);

  if (!editor) return null;

  return (
    <div className={cn("border border-input rounded-lg overflow-hidden bg-background", className)}>
      <div className="flex flex-wrap gap-0.5 p-2 border-b border-input bg-muted/30">
        <MenuButton active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">
          <Heading1 className="w-4 h-4" />
        </MenuButton>
        <MenuButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
          <Heading2 className="w-4 h-4" />
        </MenuButton>
        <MenuButton active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
          <Heading3 className="w-4 h-4" />
        </MenuButton>
        <div className="w-px h-8 bg-border mx-1" />
        <MenuButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
          <Bold className="w-4 h-4" />
        </MenuButton>
        <MenuButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <Italic className="w-4 h-4" />
        </MenuButton>
        <MenuButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <UnderlineIcon className="w-4 h-4" />
        </MenuButton>
        <div className="w-px h-8 bg-border mx-1" />
        <MenuButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List">
          <List className="w-4 h-4" />
        </MenuButton>
        <MenuButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List">
          <ListOrdered className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          <Minus className="w-4 h-4" />
        </MenuButton>
        <div className="w-px h-8 bg-border mx-1" />
        <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="w-4 h-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="w-4 h-4" />
        </MenuButton>
      </div>
      <EditorContent editor={editor} className="prose prose-sm max-w-none p-4 min-h-[300px] text-foreground [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px] [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_p]:text-foreground [&_li]:text-foreground [&_strong]:text-foreground" />
    </div>
  );
};

export default RichTextEditor;
